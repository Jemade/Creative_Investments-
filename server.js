/**
 * Creative Wing Investments — Production Server & Inventory REST API
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 5500;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const MIME_TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true});
function readJson(filename,fallback=[]){const p=path.join(DATA_DIR,filename);try{if(fs.existsSync(p))return JSON.parse(fs.readFileSync(p,'utf8'));}catch(e){console.error(`Error reading ${filename}:`,e.message);}return fallback;}
function writeJson(filename,data){fs.writeFileSync(path.join(DATA_DIR,filename),JSON.stringify(data,null,2),'utf8');}
function parseBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',chunk=>{body+=chunk;if(body.length>25*1024*1024){req.destroy();reject(new Error('Payload too large'));}});req.on('end',()=>{if(!body)return resolve({});try{resolve(JSON.parse(body));}catch(e){resolve({});}});req.on('error',reject);});}

const ADMIN_USERNAME=process.env.ADMIN_USERNAME||'owner';
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||'';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'';
const sessions=new Map();

function authenticate(req){const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();if(!token)return null;const session=sessions.get(token);if(session&&session.expires>Date.now())return{token,...session};if(session)sessions.delete(token);return null;}
function sendJson(res,statusCode,data){res.writeHead(statusCode,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS'});res.end(JSON.stringify(data));}

const server=http.createServer(async(req,res)=>{
 try {
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS'});return res.end();}
  const parsedUrl=new URL(req.url,`http://${req.headers.host||'127.0.0.1'}`);let pathname=parsedUrl.pathname;
  if(pathname.startsWith('/creative-wing'))pathname=pathname.replace(/^\/creative-wing/,'')||'/';

  if(pathname==='/api/auth/login'&&req.method==='POST'){
   const{username,password}=await parseBody(req);
   if(!ADMIN_PASSWORD||!password)return sendJson(res,401,{error:'Invalid credentials'});
   const isValidUser=username===ADMIN_USERNAME||(ADMIN_EMAIL&&username===ADMIN_EMAIL);
   const supplied=Buffer.from(String(password)),expected=Buffer.from(ADMIN_PASSWORD);
   const isValidPassword=supplied.length===expected.length&&crypto.timingSafeEqual(supplied,expected);
   if(isValidUser&&isValidPassword){const token=crypto.randomBytes(32).toString('hex');const session={username:ADMIN_USERNAME,role:'OWNER',displayName:'Owner Administration',expires:Date.now()+8*3600*1000};sessions.set(token,session);return sendJson(res,200,{success:true,token,user:{username:session.username,displayName:session.displayName,role:session.role}});}
   return sendJson(res,401,{error:'Invalid username or password'});
  }
  if(pathname==='/api/auth/verify'&&req.method==='GET'){const user=authenticate(req);return user?sendJson(res,200,{authenticated:true,user}):sendJson(res,401,{authenticated:false,error:'Unauthorized'});}
  if(pathname==='/api/auth/logout'&&req.method==='POST'){const user=authenticate(req);if(user)sessions.delete(user.token);return sendJson(res,200,{success:true});}

  if((pathname==='/api/inventory/vehicles'||pathname==='/api/vehicles')&&req.method==='GET')return sendJson(res,200,readJson('vehicles.json',[]));
  if(pathname==='/api/inventory/vehicles'&&req.method==='POST'){
   if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});
   const data=await parseBody(req);if(!data.name||data.price===undefined)return sendJson(res,400,{error:'Vehicle name and price are required'});
   const vehicles=readJson('vehicles.json',[]),now=new Date().toISOString();
   const vehicle={id:'C'+String(Date.now()).slice(-8),name:data.name,price:Number(data.price)||0,currency:'USD',year:Number(data.year)||new Date().getFullYear(),category:data.category||'SUV',body:data.category||'SUV',mileage:data.mileage||'0 km',transmission:data.transmission||'Automatic',fuel:data.fuel||'Petrol',drivetrain:data.drivetrain||'2WD',color:data.color||'Standard',inStock:data.status!=='Sold',status:data.status||'Available',image:data.image||(data.gallery&&data.gallery[0])||'images/cars/01.jpeg',gallery:data.gallery&&data.gallery.length?data.gallery:[data.image||'images/cars/01.jpeg'],description:data.description||'',features:Array.isArray(data.features)?data.features:[],createdAt:now,updatedAt:now};
   vehicles.unshift(vehicle);writeJson('vehicles.json',vehicles);return sendJson(res,201,{success:true,vehicle});
  }
  if(pathname.startsWith('/api/inventory/vehicles/')&&req.method==='PUT'){
   if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const id=pathname.split('/').pop(),data=await parseBody(req),vehicles=readJson('vehicles.json',[]),i=vehicles.findIndex(v=>v.id===id);if(i<0)return sendJson(res,404,{error:'Vehicle not found'});const c=vehicles[i];vehicles[i]={...c,...data,id:c.id,price:data.price!==undefined?Number(data.price):c.price,year:data.year!==undefined?Number(data.year):c.year,inStock:(data.status!==undefined?data.status:c.status)!=='Sold',updatedAt:new Date().toISOString()};writeJson('vehicles.json',vehicles);return sendJson(res,200,{success:true,vehicle:vehicles[i]});
  }
  if(pathname.startsWith('/api/inventory/vehicles/')&&req.method==='DELETE'){if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const id=pathname.split('/').pop(),vehicles=readJson('vehicles.json',[]),next=vehicles.filter(v=>v.id!==id);if(next.length===vehicles.length)return sendJson(res,404,{error:'Vehicle not found'});writeJson('vehicles.json',next);return sendJson(res,200,{success:true,deletedId:id});}

  if((pathname==='/api/inventory/sportswear'||pathname==='/api/sportswear')&&req.method==='GET')return sendJson(res,200,readJson('sportswear.json',[]));
  if(pathname==='/api/inventory/sportswear'&&req.method==='POST'){
   if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const data=await parseBody(req);if(!data.name||data.price===undefined)return sendJson(res,400,{error:'Sportswear product name and price are required'});const items=readJson('sportswear.json',[]),now=new Date().toISOString();const product={id:'S'+String(Date.now()).slice(-8),name:data.name,price:Number(data.price)||0,currency:'USD',pricingUnit:data.pricingUnit||'Per Full Set',category:data.category||'Match Set',colorway:data.colorway||'Custom',material:data.material||'100% micro-polyester',sizes:Array.isArray(data.sizes)&&data.sizes.length?data.sizes:['S','M','L','XL','XXL'],customizationOptions:Array.isArray(data.customizationOptions)?data.customizationOptions:['Custom Name & Number Printing'],status:data.status||'Available',inStock:data.status!=='Unavailable',image:data.image||(data.gallery&&data.gallery[0])||'images/sportswear/01.jpeg',gallery:data.gallery&&data.gallery.length?data.gallery:[data.image||'images/sportswear/01.jpeg'],description:data.description||'',createdAt:now,updatedAt:now};items.unshift(product);writeJson('sportswear.json',items);return sendJson(res,201,{success:true,product});
  }
  if(pathname.startsWith('/api/inventory/sportswear/')&&req.method==='PUT'){if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const id=pathname.split('/').pop(),data=await parseBody(req),items=readJson('sportswear.json',[]),i=items.findIndex(x=>x.id===id);if(i<0)return sendJson(res,404,{error:'Sportswear product not found'});const c=items[i];items[i]={...c,...data,id:c.id,price:data.price!==undefined?Number(data.price):c.price,inStock:(data.status!==undefined?data.status:c.status)!=='Unavailable',updatedAt:new Date().toISOString()};writeJson('sportswear.json',items);return sendJson(res,200,{success:true,product:items[i]});}
  if(pathname.startsWith('/api/inventory/sportswear/')&&req.method==='DELETE'){if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const id=pathname.split('/').pop(),items=readJson('sportswear.json',[]),next=items.filter(x=>x.id!==id);if(next.length===items.length)return sendJson(res,404,{error:'Sportswear product not found'});writeJson('sportswear.json',next);return sendJson(res,200,{success:true,deletedId:id});}

  if(pathname==='/api/upload'&&req.method==='POST'){
   if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const{dataUrl,folder='cars',filename}=await parseBody(req);const matches=dataUrl&&dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);if(!matches)return sendJson(res,400,{error:'Valid PNG, JPEG or WebP image required'});const ext=matches[1].includes('png')?'.png':matches[1].includes('webp')?'.webp':'.jpeg',cleanFolder=folder==='sportswear'?'sportswear':'cars',safeName=(filename?filename.replace(/[^a-zA-Z0-9_-]/g,''):`upload_${Date.now()}`)+ext,targetDir=path.join(ROOT_DIR,'images',cleanFolder);if(!fs.existsSync(targetDir))fs.mkdirSync(targetDir,{recursive:true});const buffer=Buffer.from(matches[2],'base64');if(buffer.length>10*1024*1024)return sendJson(res,413,{error:'Image too large'});fs.writeFileSync(path.join(targetDir,safeName),buffer);return sendJson(res,200,{success:true,url:`images/${cleanFolder}/${safeName}`});
  }

  if(pathname==='/api/settings'&&req.method==='GET'){const config=readJson('admin-config.json',{});return sendJson(res,200,config.settings||{});}
  if(pathname==='/api/settings'&&req.method==='PUT'){if(!authenticate(req))return sendJson(res,401,{error:'Unauthorized owner action required'});const newSettings=await parseBody(req),config=readJson('admin-config.json',{});config.settings={...config.settings,...newSettings};writeJson('admin-config.json',config);return sendJson(res,200,{success:true,settings:config.settings});}

  if(pathname==='/'||pathname==='')pathname='/index.html';
  const decoded=decodeURIComponent(pathname);const filePath=path.resolve(ROOT_DIR,'.'+decoded);if(!filePath.startsWith(ROOT_DIR+path.sep))return res.writeHead(403).end('Forbidden');
  fs.stat(filePath,(err,stats)=>{if(err||!stats.isFile()){res.statusCode=404;res.setHeader('Content-Type','text/plain; charset=utf-8');return res.end('File not found');}const ext=path.extname(filePath).toLowerCase();res.writeHead(200,{'Content-Type':MIME_TYPES[ext]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin'});fs.createReadStream(filePath).pipe(res);});
 } catch(err){console.error(err);if(!res.headersSent)sendJson(res,500,{error:'Server error'});else res.end();}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Creative Wing server running on port ${PORT}`));
