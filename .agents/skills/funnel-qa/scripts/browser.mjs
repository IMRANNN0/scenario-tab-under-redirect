import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {startDemo} from '../../affiliate-funnel-orchestrator/assets/reference-funnel/server.mjs';
const require=createRequire(import.meta.url);
export async function runBrowser({reportDir=new URL('../reports/',import.meta.url)}={}) {
  const directory=reportDir instanceof URL?fileURLToPath(reportDir):path.resolve(reportDir);
  await mkdir(directory,{recursive:true});
  const results=[],errors=[];let browser;
  try {
    const playwright=process.env.PLAYWRIGHT_MODULE?require(process.env.PLAYWRIGHT_MODULE):require('playwright');
    browser=await playwright.chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
  } catch(error) {
    const report={status:'NOT_RUN',reason:'Playwright/Chromium unavailable',detail:error.message,results};
    await writeFile(path.join(directory,'browser.json'),JSON.stringify(report,null,2));return report;
  }
  async function scenario(name,options,fn){
    let clockOffset=0;
    const demo=await startDemo({testing:true,now:()=>Date.now()+clockOffset,...options.server});
    const context=await browser.newContext({viewport:options.viewport||(options.mobile?{width:390,height:844}:{width:1366,height:900}),isMobile:Boolean(options.mobile),hasTouch:Boolean(options.mobile),reducedMotion:'reduce'});
    const pageErrors=[];context.on('page',p=>p.on('pageerror',error=>pageErrors.push(error.message)));
    await context.route('**/*',route=>route.request().url().startsWith(demo.origin)?route.continue():route.abort());
    const page=await context.newPage();
    try {
      if(options.blocked)await context.addInitScript(()=>{window.open=()=>null;});
      if(options.cookiesDisabled){
        await context.addInitScript(()=>Object.defineProperty(document,'cookie',{get:()=>'',set:()=>{},configurable:true}));
        await context.route('**/api/verify',async route=>{
          // Use an isolated Node request: route.fetch would populate the browser cookie jar.
          const request=route.request();
          const response=await fetch(request.url(),{method:request.method(),headers:request.headers(),body:request.postData()});
          const headers=Object.fromEntries(response.headers);delete headers['set-cookie'];
          await route.fulfill({status:response.status,headers,body:await response.text()});
        });
      }
      await page.goto(demo.origin);
      await page.locator('#visitor').filter({hasText:'Optional recognition is off'}).waitFor();
      await fn({page,context,demo,advance:ms=>{clockOffset+=ms;}});
      assert.deepEqual(pageErrors,[]);
      results.push({name,status:'PASS'});
    }catch(error){results.push({name,status:'FAIL',error:error.message});errors.push(error.message);}
    finally {
      const filename=name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.png';
      try{await page.screenshot({path:path.join(directory,filename),fullPage:true});results.at(-1).screenshot=filename;}catch{}
      await context.close();await demo.close();
    }
  }
  async function begin(page,{consent=true,pass=true}={}){
    if(consent)await page.locator('#consent').check();
    await page.locator('#cta').click();
    if(pass){await page.locator('#fixture-pass').click();await page.locator('[data-swipe]').waitFor({state:'visible'});}
  }
  async function eventually(check){for(let i=0;i<100;i++){if(check())return;await new Promise(r=>setTimeout(r,20));}assert.ok(check(),'Timed out waiting for local evidence');}
  async function finish({page,context,demo},activation){
    const popupPromise=context.waitForEvent('page');await activation();const offer=await popupPromise;
    await offer.waitForURL(demo.origin+'/offer');await page.waitForURL(demo.origin+'/b');
    assert.equal(await offer.evaluate(()=>window.opener),null);assert.equal(context.pages().length,2);
    await eventually(()=>demo.eventSink.length===1);
    await page.reload();assert.equal(demo.eventSink.length,1);
    const direct=await context.newPage();await direct.goto(demo.origin+'/b');assert.equal(demo.eventSink.length,1);await direct.close();
  }
  try{
    await scenario('desktop button new tab B and no reload duplicates',{},async t=>{await begin(t.page);await finish(t,()=>t.page.locator('[data-swipe-continue]').click());});
    await scenario('desktop completed pointer swipe',{},async t=>{await begin(t.page);const box=await t.page.locator('[data-swipe-range]').boundingBox();await finish(t,async()=>{await t.page.mouse.move(box.x+8,box.y+box.height/2);await t.page.mouse.down();await t.page.mouse.move(box.x+box.width-6,box.y+box.height/2,{steps:12});await t.page.mouse.up();});});
    await scenario('keyboard range and offer navigation',{},async t=>{await begin(t.page);await t.page.locator('[data-swipe-range]').focus();await finish(t,()=>t.page.keyboard.press('End'));});
    await scenario('keyboard arrow increments accumulate',{},async t=>{await begin(t.page);await t.page.locator('[data-swipe-range]').focus();await t.page.keyboard.press('ArrowRight');await t.page.keyboard.press('ArrowRight');assert.equal(await t.page.locator('[data-swipe-range]').inputValue(),'2');assert.equal(t.demo.eventSink.length,0);});
    await scenario('mobile touch swipe and responsive layout',{mobile:true},async t=>{
      await begin(t.page);assert.equal(await t.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await t.page.screenshot({path:path.join(directory,'mobile-ready.png'),fullPage:true});
      for(const selector of ['[data-swipe-continue]','[data-swipe-cancel]']){
        const rect=await t.page.locator(selector).boundingBox();assert.ok(rect.y>=0&&rect.y+rect.height<=844,'Mobile ready actions must fit vertically');
      }
      const range=t.page.locator('[data-swipe-range]'),box=await range.boundingBox(),cdp=await t.context.newCDPSession(t.page);
      await finish(t,async()=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+8,y:box.y+box.height/2}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-6,y:box.y+box.height/2}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});});
    });
    await scenario('partial swipe cancel Escape and focus restoration',{},async t=>{
      await begin(t.page);await t.page.locator('[data-swipe-range]').focus();await t.page.keyboard.press('ArrowRight');
      assert.equal(t.context.pages().length,1);assert.equal(t.demo.eventSink.length,0);
      await t.page.keyboard.press('Escape');assert.equal(await t.page.locator('#verification').isVisible(),false);assert.equal(await t.page.locator('#cta').evaluate(el=>el===document.activeElement),true);
      await t.page.locator('#cta').click();await t.page.locator('[data-swipe-cancel]').click();assert.equal(await t.page.locator('#verification').isVisible(),false);
    });
    await scenario('small mobile ready actions fit the dialog',{mobile:true,viewport:{width:360,height:740}},async t=>{
      await begin(t.page);const dialog=await t.page.locator('#verification').boundingBox();
      for(const selector of ['[data-swipe-continue]','[data-swipe-cancel]']){
        const rect=await t.page.locator(selector).boundingBox();assert.ok(rect.y>=dialog.y&&rect.y+rect.height<=dialog.y+dialog.height,'Action clipped by dialog');
      }
      await t.page.locator('[data-swipe-cancel]').click();assert.equal(await t.page.locator('#verification').isVisible(),false);
    });
    await scenario('popup blocked standard same tab fallback',{blocked:true},async t=>{await begin(t.page);await t.page.locator('[data-swipe-continue]').click();await t.page.waitForURL(t.demo.origin+'/offer');assert.equal(t.context.pages().length,1);await eventually(()=>t.demo.eventSink.length===1);});
    await scenario('optional B absent preserves original tab',{server:{bPath:null}},async t=>{await begin(t.page);const promise=t.context.waitForEvent('page');await t.page.locator('[data-swipe-continue]').click();const offer=await promise;await offer.waitForURL(t.demo.origin+'/offer');assert.equal(t.page.url(),t.demo.origin+'/');await eventually(()=>t.demo.eventSink.length===1);});
    await scenario('no B allows a second distinct explicit action',{server:{bPath:null}},async t=>{
      await begin(t.page);
      for(let i=0;i<2;i++){
        if(i){await t.page.locator('[data-swipe-cancel]').click();await t.page.locator('#cta').click();await t.page.locator('[data-swipe]').waitFor({state:'visible'});}
        const promise=t.context.waitForEvent('page');await t.page.locator('[data-swipe-continue]').click();await(await promise).waitForURL(t.demo.origin+'/offer');await eventually(()=>t.demo.eventSink.length===i+1);
      }
      assert.equal(t.context.pages().length,3);assert.notEqual(t.demo.eventSink[0].event_id,t.demo.eventSink[1].event_id);
    });
    await scenario('consent denial allows navigation without analytics',{},async t=>{await begin(t.page,{consent:false});const promise=t.context.waitForEvent('page');await t.page.locator('[data-swipe-continue]').click();await(await promise).waitForURL(t.demo.origin+'/offer');await t.page.waitForURL(t.demo.origin+'/b');assert.equal(t.demo.eventSink.length,0);assert.equal((await t.context.cookies()).some(c=>c.name==='affiliate_visitor'),false);});
    await scenario('verification failure then successful retry',{},async t=>{await begin(t.page,{pass:false});await t.page.locator('#fixture-fail').click();await t.page.locator('#verification-status').filter({hasText:'failure'}).waitFor();assert.equal(await t.page.locator('[data-swipe]').isVisible(),false);await t.page.locator('#fixture-pass').click();await t.page.locator('[data-swipe]').waitFor({state:'visible'});});
    await scenario('returning session skips unnecessary challenge',{},async t=>{
      await begin(t.page);const session=(await t.context.cookies()).find(c=>c.name==='local_verified_session');assert.equal(session.httpOnly,true);
      assert.equal(await t.page.evaluate(()=>document.cookie.includes('local_verified_session')),false);
      await t.page.reload();await t.page.locator('#cta').click();await t.page.locator('[data-swipe]').waitFor({state:'visible'});assert.equal(await t.page.locator('#fixture-pass').count(),0);
    });
    await scenario('visitor cookie existing expired and deleted',{},async t=>{
      await t.page.locator('#consent').check();assert.equal(await t.page.locator('#visitor').textContent(),'New browser');
      const first=(await t.context.cookies()).find(c=>c.name==='affiliate_visitor');
      await t.page.reload();await t.page.locator('#consent').check();assert.equal(await t.page.locator('#visitor').textContent(),'Returning browser');
      assert.equal((await t.context.cookies()).find(c=>c.name==='affiliate_visitor').value,first.value);
      await t.context.addCookies([{name:'affiliate_visitor',value:first.value,url:t.demo.origin,expires:Math.floor(Date.now()/1000)-1}]);
      await t.page.reload();await t.page.locator('#consent').check();assert.equal(await t.page.locator('#visitor').textContent(),'New browser');
      await t.context.clearCookies();await t.page.reload();await t.page.locator('#consent').check();assert.equal(await t.page.locator('#visitor').textContent(),'New browser');
    });
    await scenario('expired server session requires re-verification',{},async t=>{await begin(t.page);t.advance(1900000);await t.page.reload();await t.page.locator('#cta').click();await t.page.locator('#fixture-pass').waitFor();assert.equal(await t.page.locator('[data-swipe]').isVisible(),false);});
    await scenario('forged q yes and invalid session do not authorize',{},async t=>{await t.context.addCookies([{name:'q',value:'yes',url:t.demo.origin},{name:'local_verified_session',value:'a'.repeat(64),url:t.demo.origin}]);await t.page.locator('#cta').click();await t.page.locator('#fixture-pass').waitFor();assert.equal(await t.page.locator('[data-swipe]').isVisible(),false);});
    await scenario('simulated cookie rejection fails closed',{cookiesDisabled:true},async t=>{await begin(t.page,{pass:false});await t.page.locator('#fixture-pass').click();await t.page.locator('#verification-status').filter({hasText:'failure'}).waitFor();assert.equal(await t.page.locator('[data-swipe]').isVisible(),false);assert.equal(t.demo.eventSink.length,0);});
    await scenario('broken offer is observed as HTTP 404',{server:{offerUrl:'/broken-offer',bPath:null}},async t=>{await begin(t.page);const promise=t.context.waitForEvent('page');await t.page.locator('[data-swipe-continue]').click();const offer=await promise;await offer.waitForURL(t.demo.origin+'/broken-offer');const response=await offer.reload();assert.equal(response.status(),404);assert.equal(t.page.url(),t.demo.origin+'/');});
  }finally{await browser.close();}
  const report={status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',engine:'Chromium',verification:'local mock; no real challenge',cases:results.length,passed:results.filter(r=>r.status==='PASS').length,results,
    notRun:['Firefox','WebKit/Safari','production Turnstile widget','Meta Events Manager receipt','GTM published container','real advertiser conversion','real browser cookie-blocking policy (rejection was simulated)']};
  await writeFile(path.join(directory,'browser.json'),JSON.stringify(report,null,2));
  await writeFile(path.join(directory,'browser.md'),`# Browser validation\n\n${report.status}: ${report.passed}/${report.cases}\n\n`+results.map(r=>`- ${r.status}: ${r.name}${r.error?' — '+r.error:''}`).join('\n')+'\n\nNOT_RUN: '+report.notRun.join('; ')+'\n');
  return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const result=await runBrowser();console.log(`${result.status}: ${result.passed||0}/${result.cases||0} browser cases`);if(result.status!=='PASS')process.exitCode=1;}
