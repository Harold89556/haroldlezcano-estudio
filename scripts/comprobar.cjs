const fs=require('node:fs'),{execFileSync}=require('node:child_process');
for(const file of fs.readdirSync('.').filter(f=>f.endsWith('.js'))) execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
for(const file of ['firebase.json','galeria-seed.json','firestore.indexes.json']) JSON.parse(fs.readFileSync(file,'utf8'));
console.log('Sintaxis JavaScript y JSON: OK');
