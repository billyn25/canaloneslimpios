import {spawnSync} from 'node:child_process';
const isolated=['deploy-preview','branch-deploy'].includes(process.env.CONTEXT);
const production=!isolated&&(process.env.CONTEXT==='production'||process.argv.includes('--production')||process.env.BUILD_MODE==='production');
const env={...process.env,BUILD_MODE:production?'production':'preview'};
for(const script of ['fetch-municipalities.mjs','build.mjs','refine.mjs','contact-visibility.mjs','home-town-links.mjs','audit.mjs','audit-final.mjs']){
  const run=spawnSync(process.execPath,['scripts/'+script],{stdio:'inherit',env});
  if(run.error){console.error(run.error);process.exit(1)}
  if(run.status!==0)process.exit(run.status||1);
}
