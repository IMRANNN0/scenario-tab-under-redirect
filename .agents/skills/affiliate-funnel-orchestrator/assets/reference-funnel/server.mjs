// Local integration harness. Never a production session store or approved creative.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createVerificationService, memorySessionStore } from '../../../cloudflare-verification/assets/verification-server.mjs';
export async function startDemo({ port = 0, testing = false, offerUrl, bPath = '/b',
  sitekey = process.env.TURNSTILE_SITEKEY, secret = process.env.TURNSTILE_SECRET,
  fetchImpl, now = Date.now, sessionTtlSeconds = 1800, eventSink = [],
} = {}) {
  if (!testing && (!sitekey || !secret)) throw new Error('Set TURNSTILE_SITEKEY and TURNSTILE_SECRET');
  if (testing) {
    sitekey = 'LOCAL_FIXTURE_NOT_A_SITEKEY'; secret = 'LOCAL_FIXTURE_NOT_A_SECRET';
    const spent = new Set();
    fetchImpl ??= async (_url, options) => {
      const token = options.body.get('response');
      const valid = token.startsWith('fixture-pass-') && !spent.has(token); spent.add(token);
      return new Response(JSON.stringify({ success: valid, hostname:'127.0.0.1', action:'affiliate_offer' }));
    };
  }
  const store = memorySessionStore({ now });
  let service, origin;
  const fixtureDir = new URL('./', import.meta.url), skillsDir = new URL('../../../', import.meta.url);
  const modules = new Map([
    ['cookies.mjs','cookie-manager/assets/cookies.mjs'], ['tracking.mjs','gotooffer-tracking/assets/tracking.mjs'],
    ['router.mjs','offer-tab-router/assets/router.mjs'], ['swipe.mjs','swipe-interaction/assets/swipe.mjs'],
    ['swipe.css','swipe-interaction/assets/swipe.css'], ['turnstile-client.mjs','cloudflare-verification/assets/turnstile-client.mjs'],
  ].map(([name,path])=>[name,new URL(path,skillsDir)]));
  const recorded = new Set();
  const server = http.createServer(async (req,res) => {
    res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
    const send = (status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
    try {
      const url = new URL(req.url,origin), header = req.headers.cookie || '';
      if (req.method === 'POST' && req.headers.origin !== origin) return send(403,{error:'origin'});
      if (url.pathname === '/api/config' && req.method === 'GET') return send(200,{ testing,sitekey,action:'affiliate_offer',offerUrl:offerUrl || `${origin}/offer`,bUrl:bPath });
      if (url.pathname === '/api/session' && req.method === 'GET') return send(200,await service.status(header));
      if (req.method === 'POST') {
        if (!String(req.headers['content-type']).startsWith('application/json')) return send(415,{error:'json-required'});
        let body=''; for await (const chunk of req) { body+=chunk; if(body.length>8192)return send(413,{error:'too-large'}); }
        let data; try { data=JSON.parse(body); } catch { return send(400,{error:'invalid-json'}); }
        if(!data || typeof data!=='object' || Array.isArray(data))return send(400,{error:'invalid-body'});
        if(url.pathname === '/api/verify') {
          const result=await service.verify({token:data.token,cookieHeader:header,origin:req.headers.origin});
          if(result.setCookie)res.setHeader('Set-Cookie',result.setCookie);
          return send(result.verified?200:403,{verified:result.verified,expiresAt:result.expiresAt});
        }
        if(url.pathname === '/api/logout') {res.setHeader('Set-Cookie',await service.revoke(header));return send(200,{verified:false});}
        if(url.pathname === '/api/local-event') {
          if(!(await service.status(header)).verified)return send(403,{error:'session'});
          if(!/^[a-f0-9-]{36}$/.test(data.event_id||'') || data.event!=='Go2Offer')return send(400,{error:'event'});
          const duplicate=recorded.has(data.event_id);
          if(!duplicate){recorded.add(data.event_id);eventSink.push({...data,source:'local-test-sink'});}
          return send(200,{accepted:true,duplicate});
        }
        return send(404,{error:'not-found'});
      }
      if(req.method !== 'GET')return send(405,{error:'method'});
      if(url.pathname === '/offer') {res.writeHead(200,{'Content-Type':'text/html'});return res.end('<!doctype html><title>Local test offer</title><h1>Local test offer</h1><p>No affiliate campaign connected.</p>');}
      if(url.pathname === '/broken-offer')return send(404,{error:'broken-local-offer'});
      if(url.pathname === '/b') {res.writeHead(200,{'Content-Type':'text/html'});return res.end('<!doctype html><title>Prelander B fixture</title><h1>Prelander B fixture</h1><p>B load does not dispatch Go2Offer.</p>');}
      let file;
      if(url.pathname === '/')file=new URL('index.html',fixtureDir);
      else if(['/app.mjs','/demo.css'].includes(url.pathname))file=new URL(url.pathname.slice(1),fixtureDir);
      else if(url.pathname.startsWith('/modules/'))file=modules.get(url.pathname.slice(9));
      if(!file)return send(404,{error:'not-found'});
      const content=await readFile(file);
      res.writeHead(200,{'Content-Type':file.pathname.endsWith('.mjs')?'text/javascript':file.pathname.endsWith('.css')?'text/css':'text/html'});res.end(content);
    } catch {if(!res.headersSent)send(500,{error:'server'});else res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  origin=`http://127.0.0.1:${server.address().port}`;
  service=createVerificationService({secret,hostnames:['127.0.0.1'],action:'affiliate_offer',allowedOrigins:[origin],store,
    cookieName:'local_verified_session',secure:false,fetchImpl,now,sessionTtlSeconds});
  return {origin,server,service,store,eventSink,close:()=>new Promise(resolve=>server.close(resolve))};
}
if(process.argv[1] === fileURLToPath(import.meta.url)) {
  if(!process.env.OFFER_URL && process.env.LOCAL_DEMO !== '1')throw new Error('Set OFFER_URL or LOCAL_DEMO=1');
  const demo=await startDemo({port:Number(process.env.PORT||8787),offerUrl:process.env.OFFER_URL});
  console.log(`Local reference: ${demo.origin} (memory sessions; not for production)`);
}
