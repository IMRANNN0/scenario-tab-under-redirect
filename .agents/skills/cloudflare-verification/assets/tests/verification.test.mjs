import test from 'node:test';import assert from 'node:assert/strict';
import {createVerificationService,memorySessionStore} from '../verification-server.mjs';
import {mountVerification} from '../turnstile-client.mjs';
function setup(extra={}){let time=1000;const options={secret:'UNIT_TEST_ONLY',hostnames:['example.test'],allowedOrigins:['https://example.test'],action:'offer',store:memorySessionStore({now:()=>time}),now:()=>time,sessionTtlSeconds:30,fetchImpl:async()=>new Response(JSON.stringify({success:true,hostname:'example.test',action:'offer'})),...extra};return {service:createVerificationService(options),advance:ms=>{time+=ms;}};}
const request={token:'unit-token',origin:'https://example.test'};
test('validated status is server-side; q=yes or forged IDs grant nothing',async()=>{const{service}=setup();assert.equal((await service.status('q=yes')).verified,false);assert.equal((await service.status(`__Host-aff_verified=${'a'.repeat(64)}`)).verified,false);const result=await service.verify(request);assert.equal(result.verified,true);assert.match(result.setCookie,/Secure/);assert.match(result.setCookie,/HttpOnly/);assert.equal((await service.status(result.setCookie)).verified,true);});
test('server expiry and logout invalidate sessions',async()=>{const{service,advance}=setup();let result=await service.verify(request);advance(31000);assert.equal((await service.status(result.setCookie)).verified,false);result=await service.verify(request);await service.revoke(result.setCookie);assert.equal((await service.status(result.setCookie)).verified,false);});
test('successful re-verification rotates the session ID',async()=>{const{service}=setup();const first=await service.verify(request),second=await service.verify({...request,cookieHeader:first.setCookie});assert.notEqual(first.setCookie,second.setCookie);assert.equal((await service.status(first.setCookie)).verified,false);assert.equal((await service.status(second.setCookie)).verified,true);});
test('origin and invalid tokens are rejected before Siteverify',async()=>{let calls=0;const{service}=setup({fetchImpl:async()=>{calls++;throw Error();}});for(const token of ['',null,'x'.repeat(2049)])assert.equal((await service.verify({...request,token})).verified,false);assert.equal((await service.verify({...request,origin:'https://evil.test'})).verified,false);assert.equal(calls,0);});
for(const data of [{success:false},{success:'true',hostname:'example.test',action:'offer'},{success:true,hostname:'evil.test',action:'offer'},{success:true,hostname:'example.test',action:'wrong'}])test(`rejects Siteverify mismatch ${JSON.stringify(data)}`,async()=>{const{service}=setup({fetchImpl:async()=>new Response(JSON.stringify(data))});assert.equal((await service.verify(request)).verified,false);});
test('network retry is bounded and uses the same idempotency key',async()=>{const ids=[];const{service}=setup({fetchImpl:async(_url,opts)=>{ids.push(opts.body.get('idempotency_key'));throw Error('network');}});assert.equal((await service.verify(request)).verified,false);assert.equal(ids.length,2);assert.equal(ids[0],ids[1]);});
test('timeout fails closed and is bounded',async()=>{const{service}=setup({timeoutMs:5,attempts:1,fetchImpl:async(_url,opts)=>new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}))});const keepAlive=setTimeout(()=>{},100);assert.equal((await service.verify(request)).verified,false);clearTimeout(keepAlive);});
test('replayed token rejected by Siteverify cannot create another session',async()=>{let used=false;const{service}=setup({fetchImpl:async()=>{const success=!used;used=true;return new Response(JSON.stringify({success,hostname:'example.test',action:'offer'}));}});assert.equal((await service.verify(request)).verified,true);assert.equal((await service.verify(request)).verified,false);});
test('malformed response, store failure and duplicate session cookies fail closed',async()=>{const{service}=setup({fetchImpl:async()=>new Response('not-json')});assert.equal((await service.verify(request)).verified,false);const broken=setup({store:{get:async()=>{throw Error();},set:async()=>{throw Error();},delete:async()=>{}}}).service;assert.equal((await broken.status(`__Host-aff_verified=${'a'.repeat(64)}`)).verified,false);assert.equal((await broken.verify(request)).verified,false);assert.equal((await service.status(`__Host-aff_verified=${'a'.repeat(64)}; __Host-aff_verified=${'b'.repeat(64)}`)).verified,false);});
test('client verification lifecycle confirms session, resets and handles retry/expired/timeout',async()=>{
  const previous=globalThis.location;globalThis.location=new URL('https://example.test/');
  let callbacks,resets=0,removed=0;const states=[];
  const api={render:(_node,options)=>{callbacks=options;return 'widget-1';},reset:id=>{assert.equal(id,'widget-1');resets++;},remove:()=>removed++};
  try{
    const client=await mountVerification({}, {sitekey:'TEST_ONLY',action:'offer',api,onState:s=>states.push(s.state),fetchImpl:async()=>new Response(JSON.stringify({verified:true,expiresAt:30000}))});
    await callbacks.callback('fixture');assert.ok(states.includes('verified'));assert.equal(resets,1);
    callbacks['expired-callback']();callbacks['timeout-callback']();callbacks['error-callback']();client.retry();
    assert.deepEqual(states.slice(-4),['expired','timeout','failure','retrying']);client.destroy();assert.equal(removed,1);
  }finally{globalThis.location=previous;}
});
test('client rejects server pass without a cookie round trip',async()=>{
  const previous=globalThis.location;globalThis.location=new URL('https://example.test/');let callbacks,calls=0;const states=[];
  try{await mountVerification({}, {sitekey:'TEST_ONLY',action:'offer',api:{render:(_n,c)=>{callbacks=c;return 'id';},reset:()=>{}},onState:s=>states.push(s.state),fetchImpl:async()=>new Response(JSON.stringify({verified:++calls===1}))});
    await callbacks.callback('fixture');assert.ok(states.includes('failure'));assert.equal(states.includes('verified'),false);
  }finally{globalThis.location=previous;}
});
