import {browserCookies} from '/modules/cookies.mjs';
import {createTracker} from '/modules/tracking.mjs';
import {createOfferRouter} from '/modules/router.mjs';
import {mountSwipe} from '/modules/swipe.mjs';
import {mountVerification} from '/modules/turnstile-client.mjs';
const config=await(await fetch('/api/config')).json(),$=s=>document.querySelector(s),dialog=$('#verification'),consent=$('#consent');
const cookies=browserCookies(document,{secure:location.protocol==='https:',path:'/'});
let expiresAt=0,widget,checking=false,eventId,swipe;
const debug=[],log=record=>{debug.push(record);$('#debug').textContent=JSON.stringify(debug,null,2);};
const tracker=createTracker({transport:'gtm',hasConsent:()=>consent.checked});
const router=createOfferRouter({offerUrl:config.offerUrl,bUrl:config.bUrl,originalTab:config.bUrl?'replace-with-b':'keep-a',
  allowedBUrls:config.allowedBUrls || [],allowHttp:location.hostname==='127.0.0.1',
  onRequested:({eventId,outcome})=>{
    const result=tracker.dispatch({at:'offer_navigation_requested',eventId,parameters:{navigation_mode:outcome}});log({event:'Go2Offer',...result});
    if(result.status==='dispatched')fetch('/api/local-event',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',keepalive:true,
      body:JSON.stringify({event:'Go2Offer',event_id:eventId})}).catch(()=>{});
  },onResult:result=>{$('#route-status').textContent=result.status;log(result);
    if(result.status==='navigation-failed'){ $('#fallback-offer').href=config.offerUrl;$('#fallback-offer').hidden=false; }
    if(result.status==='b-navigation-failed')dialog.close();
  }});
function visitor(){const r=cookies.visitor({consent:consent.checked});$('#visitor').textContent=r.status==='not-consented'?'Optional recognition is off':r.persisted?(r.isReturning?'Returning browser':'New browser'):'Cookies unavailable';}
consent.addEventListener('change',()=>{if(!consent.checked)cookies.remove('affiliate_visitor');visitor();});visitor();
function ready(state){expiresAt=state.expiresAt;eventId=crypto.randomUUID();$('[data-swipe]').hidden=false;
  $('#turnstile').hidden=true;$('#retry').hidden=true;$('#mode').hidden=true;
  $('#verify-title').textContent='Ready to continue';$('#close').hidden=true;
  $('#verification-status').textContent='Session verified. Choose how to continue.';swipe?.reset();}
function onState(result){$('#verification-status').textContent=result.state;
  if(result.state==='verified'){log({event:'VerificationSuccess'});ready(result);}
  else if(['failure','expired','timeout'].includes(result.state)&&Date.now()>=expiresAt)$('[data-swipe]').hidden=true;}
swipe=mountSwipe($('[data-swipe]'),{onSuccess:({event})=>{
  if(Date.now()>=expiresAt){$('[data-swipe]').hidden=true;$('#verification-status').textContent='Session expired. Verify again.';swipe.reset();return;}
  const r=router.route(event,{eventId});if(['navigation-failed','not-handled'].includes(r.status))swipe.reset();
},onCancel:()=>dialog.close()});
$('#cta').addEventListener('click',async event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!event.isTrusted)return;
  event.preventDefault();if(checking)return;checking=true;log({event:'CTA_Click'});dialog.showModal();$('[data-swipe]').hidden=true;
  try{
    const session=await(await fetch('/api/session',{cache:'no-store'})).json();if(session.verified){ready(session);return;}expiresAt=0;
    $('#turnstile').hidden=false;$('#retry').hidden=false;$('#mode').hidden=false;
    $('#verify-title').textContent='Verification before continuing';$('#close').hidden=false;
    if(config.testing){
      $('#mode').textContent='TEST FIXTURE: simulated widget, not Cloudflare verification';
      if(!$('#fixture-pass'))for(const[id,text,token]of[['fixture-pass','Simulate verification pass','fixture-pass-'],['fixture-fail','Simulate verification failure','fixture-fail-']]){
        const button=document.createElement('button');button.id=id;button.textContent=text;
        button.onclick=async()=>{const response=await fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:token+crypto.randomUUID()})});
          const result=await response.json(),check=await(await fetch('/api/session')).json();onState(result.verified&&check.verified?{state:'verified',expiresAt:result.expiresAt}:{state:'failure'});};
        $('#turnstile').append(button);
      }
      $('#verification-status').textContent='Not verified';
    }else{ $('#mode').textContent='Cloudflare Turnstile';if(!widget)widget=await mountVerification($('#turnstile'),{sitekey:config.sitekey,action:config.action,onState});else widget.retry(); }
  }catch{$('#verification-status').textContent='Verification unavailable. Retry.';}finally{checking=false;}
});
$('#retry').addEventListener('click',()=>widget?.retry());$('#close').addEventListener('click',()=>dialog.close());
