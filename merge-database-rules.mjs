import fs from 'node:fs';
const input=process.argv[2];
if(!input){console.error('Usage: node merge-database-rules.mjs existing-rules.json');process.exit(1);}
const existing=JSON.parse(fs.readFileSync(input,'utf8'));
if(!existing.rules||typeof existing.rules!=='object')throw new Error('Expected a JSON object containing rules.');
for(const key of ['.read','.write']){
 if(existing.rules[key]!==undefined&&existing.rules[key]!==false&&existing.rules[key]!=='false')throw new Error('Root '+key+' grants access that child rules cannot restrict. Review and scope existing access before adding private download emails.');
}
const fragment=JSON.parse(fs.readFileSync(new URL('./database.rules.fragment.json',import.meta.url),'utf8'));
for(const [key,value] of Object.entries(fragment))existing.rules[key]=value;
const output='database.rules.merged.json';if(fs.existsSync(output))throw new Error(output+' already exists; rename it first to keep your previous copy.');
fs.writeFileSync(output,JSON.stringify(existing,null,2)+'\n');
console.log('Created '+output+'. Review it and paste it in the Realtime Database Rules tab. No live rules were changed.');
