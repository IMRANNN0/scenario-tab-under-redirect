import test from 'node:test';import assert from 'node:assert/strict';
import {createTracker,windowsDesktop} from '../tracking.mjs';
import {loadMetaPixel,loadGtm} from '../analytics-loader.mjs';
const event={at:'offer_navigation_requested',eventId:'journey-1',parameters:{offer_category:'fixture'}};
test('one dispatch per action, wrong trigger and distinct action',()=>{const target={};const t=createTracker({transport:'gtm',target,hasConsent:()=>true});assert.equal(t.dispatch({...event,at:'b_load'}).status,'wrong-trigger');assert.equal(t.dispatch(event).status,'dispatched');assert.equal(t.dispatch(event).status,'duplicate');t.dispatch({...event,eventId:'journey-2'});assert.equal(target.dataLayer.length,2);assert.equal(target.dataLayer[0].event,'Go2Offer');});
test('consent denial, revocation and eligibility suppress dispatch',()=>{let consent=false;const target={},t=createTracker({transport:'gtm',target,hasConsent:()=>consent});assert.equal(t.dispatch(event).status,'not-consented');consent=true;t.dispatch(event);consent=false;assert.equal(t.dispatch({...event,eventId:'new'}).status,'not-consented');assert.equal(target.dataLayer.length,1);assert.equal(createTracker({transport:'gtm',hasConsent:()=>true,eligible:()=>false}).dispatch(event).status,'ineligible');});
test('Meta custom event uses specific Pixel and stable eventID',()=>{const calls=[],t=createTracker({transport:'meta',pixelId:'123',target:{fbq:(...args)=>calls.push(args)},hasConsent:()=>true});t.dispatch(event);assert.deepEqual(calls[0],['trackSingleCustom','123','Go2Offer',{offer_category:'fixture'},{eventID:'journey-1'}]);assert.equal(t.dispatch(event).status,'duplicate');});
test('missing or failing SDK permits a retry of same action ID',()=>{const target={},t=createTracker({transport:'meta',pixelId:'123',target,hasConsent:()=>true,onError:()=>{throw Error('logging failed');}});assert.equal(t.dispatch(event).status,'dispatch-failed');target.fbq=()=>{};assert.equal(t.dispatch(event).status,'dispatched');});
test('event payload cannot override reserved event or ID',()=>{const target={},t=createTracker({transport:'gtm',target,hasConsent:()=>true});t.dispatch({...event,parameters:{event:'Purchase',event_id:'wrong'}});assert.equal(target.dataLayer[0].event,'Go2Offer');assert.equal(target.dataLayer[0].event_id,'journey-1');});
test('reentrant dispatch cannot double-send',()=>{let t,count=0;t=createTracker({transport:'meta',pixelId:'123',hasConsent:()=>true,target:{fbq:()=>{count++;t.dispatch(event);}}});t.dispatch(event);assert.equal(count,1);});
test('failing consent/eligibility callbacks fail closed without throwing',()=>{
  for(const field of ['hasConsent','eligible']){const target={},t=createTracker({transport:'gtm',target,hasConsent:()=>true,[field]:()=>{throw Error('adapter unavailable');}});assert.equal(t.dispatch(event).status,'gate-failed');assert.equal(target.dataLayer,undefined);}
});
test('browser OS eligibility fails closed on unknown/conflicting signals',()=>{assert.equal(windowsDesktop({userAgentData:{platform:'Windows',mobile:false}}),true);for(const nav of [{},{userAgentData:{platform:'macOS',mobile:false}},{userAgent:'Windows NT',platform:'MacIntel'},{userAgent:'Windows NT Mobile',platform:'Win32'}])assert.equal(windowsDesktop(nav),false);});
test('disabled transport and required configuration',()=>{assert.equal(createTracker({hasConsent:()=>true}).dispatch(event).status,'disabled');assert.throws(()=>createTracker({transport:'both'}));assert.throws(()=>createTracker({transport:'meta'}));assert.throws(()=>createTracker({eventName:'bad name'}));assert.throws(()=>createTracker({hasConsent:()=>true}).dispatch({at:'offer_navigation_requested'}));});
test('base SDK loaders send nothing without consent and initialize once when configured',()=>{
  const scripts=[],win={},doc={createElement:()=>({}),head:{append:s=>scripts.push(s)}};
  assert.equal(loadMetaPixel({pixelId:'123',win,doc}).status,'not-consented');
  assert.equal(loadGtm({containerId:'GTM-TEST123',win,doc}).status,'not-consented');assert.equal(scripts.length,0);
  loadMetaPixel({pixelId:'123',win,doc,hasConsent:()=>true});loadMetaPixel({pixelId:'123',win,doc,hasConsent:()=>true});
  assert.equal(scripts.length,1);assert.deepEqual(win.fbq.queue,[['init','123']]);
  loadGtm({containerId:'GTM-TEST123',dataLayerName:'customLayer',win,doc,hasConsent:()=>true});
  loadGtm({containerId:'GTM-TEST123',dataLayerName:'customLayer',win,doc,hasConsent:()=>true});
  assert.equal(scripts.length,2);assert.match(scripts[1].src,/l=customLayer/);assert.equal(win.customLayer.length,1);
});
