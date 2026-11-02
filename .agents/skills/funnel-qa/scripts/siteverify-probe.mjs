// Official public dummy secrets only. Never reads a production secret.
import {mkdir,writeFile} from 'node:fs/promises';
const cases=[['pass','1x0000000000000000000000000000000AA',true],['fail','2x0000000000000000000000000000000AA',false],['spent','3x0000000000000000000000000000000AA',false]],results=[];
for(const[name,secret,expected]of cases){
  try{const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret,response:'XXXX.DUMMY.TOKEN.XXXX'}),signal:AbortSignal.timeout(10000)});
    const data=await response.json();results.push({name,status:response.ok&&data.success===expected?'PASS':'FAIL',httpStatus:response.status,success:data.success,errorCodes:data['error-codes']||[]});
  }catch(error){results.push({name,status:'NOT_RUN',reason:error.cause?.code||error.message});}
}
const report={type:'official dummy-key Siteverify network probe; not production widget verification',results};
await mkdir(new URL('../reports/',import.meta.url),{recursive:true});await writeFile(new URL('../reports/siteverify-network.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
