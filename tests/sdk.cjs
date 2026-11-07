const { chromium }=require('@playwright/test'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let browser;
const server=http.createServer((request,response)=>{
 const route=new URL(request.url,'http://localhost').pathname;
 if(route==='/') { response.setHeader('Content-Type','text/html');response.end('<!doctype html><title>SDK local test</title>');return; }
 if(!['/firebase-client.js','/firebase-config.js','/supabase-config.js'].includes(route)){response.writeHead(404);response.end();return;}
 response.setHeader('Content-Type','text/javascript');response.end(fs.readFileSync(path.join(root,route)));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true,args:['--no-sandbox']});const context=await browser.newContext({serviceWorkers:'block'});
 // Only the local source and public Google CDN are allowed. No project API calls.
 await context.route('**/*',route=>{const host=new URL(route.request().url()).hostname;return host==='127.0.0.1'||host==='www.gstatic.com'?route.continue():route.abort();});
 const page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
 const result=await page.evaluate(async()=>{const module=await import('./firebase-client.js');const s=await module.getServices();return {project:s.db.app.options.projectId,storageAbsent:!s.storage && !s.storageSDK,batch:typeof s.dbSDK.writeBatch,upload:typeof module.uploadImage,login:typeof s.authSDK.signInWithEmailAndPassword,admin:module.isAdmin(null)};});
 assert.deepEqual(result,{project:'harold-lezcano-estudio',storageAbsent:true,batch:'function',upload:'function',login:'function',admin:false});console.log('Inicialización real del SDK CDN y APIs modulares: OK (sin operaciones de proyecto)');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
