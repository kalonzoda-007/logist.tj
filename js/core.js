/* FATIRLOGIST — ядро: состояние, коды, утилиты, справочники, иконки, меню */
let orderFilter='';let clientFilter='';
let state=loadState();
let currentPage='dashboard'; let draggedOrder=null;
function clone(o){return JSON.parse(JSON.stringify(o))}
function loadState(){try{const s=localStorage.getItem(stateKey);return s?Object.assign(clone(defaults),JSON.parse(s)):clone(defaults)}catch(e){return clone(defaults)}}
function save(){localStorage.setItem(stateKey,JSON.stringify(state))}
function pad(n,l){return String(n).padStart(l,'0')}
function ymd(){const d=new Date();return d.getFullYear()+pad(d.getMonth()+1,2)+pad(d.getDate(),2)}
function genCode(type){state.counters=state.counters||{};state.counters[type]=(state.counters[type]||0)+1;const n=state.counters[type],y=new Date().getFullYear();const F={client:()=>'C-'+pad(n,6),sku:()=>'SKU-'+pad(n,6),lot:()=>'LOT-'+ymd()+'-'+pad(n,3),order:()=>'ORD-'+y+'-'+pad(n,6),shp:()=>'SHP-'+y+'-'+pad(n,6),wt:()=>'WT-'+y+'-'+pad(n,7),load:()=>'LOAD-'+y+'-'+pad(n,6),trf:()=>'TRF-'+y+'-'+pad(n,6),veh:()=>'VEH-'+pad(n,6),drv:()=>'DRV-'+pad(n,6)};return(F[type]||(()=>type.toUpperCase()+'-'+pad(n,6)))()}
const WH_CODE={'Альянс':'WH1','Агро':'WH2','Гулистан':'WH3'};
function cellCode(factory,zone,rack,shelf){return(WH_CODE[factory]||'WH0')+'-'+zone+'-'+pad(rack,2)+'-'+pad(shelf,2)}
function ensureCodes(){let ch=false;state.products.forEach(p=>{if(!p.code){p.code=genCode('sku');ch=true}});state.vehicles.forEach(v=>{if(!v.code){v.code=genCode('veh');ch=true}});state.driverCodes=state.driverCodes||{};state.vehicles.forEach(v=>{if(v.driver&&!state.driverCodes[v.driver]){state.driverCodes[v.driver]=genCode('drv');ch=true}});state.clientCodes=state.clientCodes||{};(state.clients||[]).forEach(c=>{if(!c.code){c.code=c.id;ch=true}});state.orders.forEach(o=>{const key=(o.client||'')+'|'+(o.tg||'');if(!state.clientCodes[key]){state.clientCodes[key]=genCode('client');ch=true}if(!o.code){o.code=genCode('order');ch=true}});if(ch)save()}
function clientCode(o){if(o.clientId)return o.clientId;const c=(state.clients||[]).find(x=>x.name&&o.client&&x.name.toLowerCase()===String(o.client).toLowerCase());if(c)return c.id;const key=(o.client||'')+'|'+(o.tg||'');return(state.clientCodes&&state.clientCodes[key])||'—'}
function driverCode(name){return(state.driverCodes&&state.driverCodes[name])||'—'}
function codeFor(obj,field,type){if(!obj[field]){obj[field]=genCode(type);save()}return obj[field]}
function u(qty,p){if(!p)return Math.round(qty)+' меш';const kg=qty*(p.packKg||0);return `${Math.round(qty)} меш · ${kg.toLocaleString('ru-RU')} кг${p.grade?(' · '+p.grade):''}`}
function bg(qty){return Math.round(qty)+' меш'}
const TJ_REGIONS=[
 {code:'REG-01',name:'Согдийская область (Согд)',short:'Согд',districts:['г. Худжанд','г. Бустон','г. Кайракум','г. Табошар','Айнинский район','Аштский район','Бободжон-Гафуровский район','Деваштичский район','Горно-Матчинский район','Джаббар-Расуловский район','Зафарабадский район','Истаравшанский район','Исфаринский район','Канибадамский район','Матчинский район','Пенджикентский район','Спитаменский район','Шахристанский район']},
 {code:'REG-02',name:'Душанбе и районы республиканского подчинения',short:'Душанбе',districts:['район Сино','район Фирдавсӣ','район Исмоили Сомонӣ','район Шоҳмансур','Варзобский район (РРП)','Вахдатский район (РРП)','Гиссарский район (РРП)','Лахшский район (РРП)','Нурабадский район (РРП)','Раштский район (РРП)','Рогунский район (РРП)','Рудакинский район (РРП)','Сангворский район (РРП)','Таджикабадский район (РРП)','Турсунзадевский район (РРП)','Файзабадский район (РРП)','Шахринавский район (РРП)']},
 {code:'REG-03',name:'Хатлонская область (Хатлон)',short:'Хатлон',districts:['г. Бохтар','г. Куляб','район Абдурахмана Джами','Бальджуванский район','Кушониёнский район','Вахшский район','Восейский район','Дангаринский район','район Джалолиддина Балхи','Джайхунский район','район Дусти','Кубодиёнский район','Кулябский район','район Мир Сайид Алии Хамадони','Муминабадский район','Носири-Хусравский район','Нурекский район','Пянджский район','Левакандский район','Темурмаликский район','Фархорский район','Ховалингский район','Хуросонский район','Шахритусский район','район Шамсиддин Шохин','Яванский район']},
 {code:'REG-04',name:'Горно-Бадахшанская автономная область (Бадахшан)',short:'Бадахшан',districts:['г. Хорог','Ванчский район','Дарвазский район','Ишкашимский район','Мургабский район','Рошткалинский район','Рушанский район','Шугнанский район']}
];
function pTitle(p){return p?esc(String(p.name||''))+(p.grade?' · сорт '+esc(p.grade):''):''}
function pMeta(p){return p?esc(p.sku)+' · '+p.packKg+' кг · сорт '+(esc(p.grade)||'—'):''}
function regionOptions(sel){return TJ_REGIONS.map(r=>`<option value="${r.short}" ${sel===r.short?'selected':''}>${r.name}</option>`).join('')}
function districtOptions(reg,sel){const r=TJ_REGIONS.find(x=>x.short===reg)||TJ_REGIONS[0];return `<option value="">— весь регион —</option>`+r.districts.map(d=>`<option ${sel===d?'selected':''}>${d}</option>`).join('')}
function onRegionChange(pfx){const reg=document.getElementById(pfx+'Region')?.value;const ds=document.getElementById(pfx+'District');if(ds)ds.innerHTML=districtOptions(reg,'')}
function parseRoute(r){r=String(r||'').trim();const out={reg:'Душанбе',d:'',p:''};if(!r)return out;let parts=r.includes('·')?r.split('·').map(s=>s.trim()):r.includes('→')?r.split('→').map(s=>s.trim()):[r];parts=parts.filter(Boolean);let reg=parts.find(x=>TJ_REGIONS.some(t=>t.short===x))||'';if(!reg){if(/согд|худжанд|хучанд|пенджикент|исфара|конибодом|кайракум|устра/i.test(r))reg='Согд';else if(/хатлон|кулоб|бохтар|курган|ватан|шартуз/i.test(r))reg='Хатлон';else if(/бадахшан|гбао|хорог|мургаб/i.test(r))reg='Бадахшан';else reg='Душанбе'}const rgn=TJ_REGIONS.find(t=>t.short===reg);const rest=parts.filter(x=>x!==reg);let d='',dRaw='';if(rgn){for(const v of rest){const hit=rgn.districts.find(dn=>v===dn||dn.endsWith(' '+v)||dn.startsWith(v)||v.startsWith(dn));if(hit){d=hit;dRaw=v;break}}}const p=rest.filter(x=>x!==dRaw&&x!==reg).join(' · ');return{reg,d,p}}
function deliveryFields(pfx,route){const pr=parseRoute(route);return `<div class="field"><label>Регион доставки</label><select id="${pfx}Region" onchange="onRegionChange('${pfx}')">${regionOptions(pr.reg)}</select></div><div class="field"><label>Район / город доставки</label><select id="${pfx}District">${districtOptions(pr.reg,pr.d)}</select></div><div class="field full"><label>Адрес / точка доставки (необязательно)</label><input id="${pfx}Point" value="${esc(pr.p)}" placeholder="Микрорайон, рынок, магазин, улица..."></div>`}
function routeFrom(pfx){const reg=document.getElementById(pfx+'Region')?.value||'Душанбе',d=document.getElementById(pfx+'District')?.value||'',p=document.getElementById(pfx+'Point')?.value||'';return reg+(d?' · '+d:'')+(p?' · '+p:'')}
function fillFromClient(pfx){const sel=document.getElementById(pfx+'ClientPick');const c=(state.clients||[]).find(x=>sel&&x.id===sel.value);if(!c)return;const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v};if(pfx==='wf'){set('wfBuyer',c.name);set('wfPhone',c.phone)}else{set(pfx+'Client',c.name);set(pfx+'Phone',c.phone);set(pfx+'Tg',c.messenger)}if(pfx==='f')updateAutoMass();toast('Клиент '+c.id+' подставлен из базы')}
function clientStats(){const all=state.clients||[];return{total:all.length,active:all.filter(c=>c.status==='active').length,dup:all.filter(c=>c.dup==='duplicate').length,noaddr:all.filter(c=>!c.address).length}}

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function productBy(id){return state.products.find(p=>p.id===+id)||state.products[0]}
function vehicleBy(id){return state.vehicles.find(v=>v.id===+id)}
function statusText(s){return({NEW:'Новый',PROCESSING:'В обработке',CONFIRMED:'Подтверждён',RESERVED:'Зарезервирован',READY:'Готов к погрузке',LOADING:'Погрузка',LOADED:'Погружен',SHIPPED:'Отгружен',COMPLETED:'Завершён',WAITING_STOCK:'Ожидание остатка',WAITING_PRODUCTION:'Ожидание производства',WAITING_VEHICLE:'Ожидание машины',DELAYED:'Задержка',CANCELLED:'Отменён'}[s]||s)}
function statusBadge(s){let cls=['WAITING_STOCK','DELAYED','WAITING_VEHICLE','WAITING_PRODUCTION'].includes(s)?'danger':['HIGH','URGENT','CRITICAL'].includes(s)?'warn':s==='LOADING'?'info':s==='CANCELLED'?'danger':'ok';return `<span class="badge ${cls==='ok'?'':cls}">${esc(statusText(s))}</span>`}
function priorityBadge(p){return `<span class="badge ${p==='URGENT'||p==='CRITICAL'?'danger':p==='HIGH'?'warn':''}">${esc(p)}</span>`}
function ico(name,size=22){const paths={
 grid:`<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>`,
 inbox:`<path d="M4 5.5h16v13H4z"/><path d="M4 14h4l1.6 2h4.8L16 14h4"/>`,
 orders:`<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>`,
 merge:`<path d="M8 5v4c0 2 2 4 4 4s4 2 4 4v2"/><path d="m13 17 3 3 3-3"/><path d="m8 5 3 3-3 3"/>`,
 board:`<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16"/>`,
 truck:`<path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>`,
 stock:`<path d="M4 6h16v12H4z"/><path d="M4 10h16M9 6v12"/>`,
 warehouse:`<path d="m3 10 9-6 9 6v9H3z"/><path d="M8 19v-5h8v5"/>`,
 product:`<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>`,
 users:`<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c.6-3.2 2.7-5 6-5s5.4 1.8 6 5M14 15c2.2-.1 4.1 1.2 4.8 4"/>`,
 factory:`<path d="M4 20V9l6 3V8l6 3V6l4 2v12z"/><path d="M7 20v-4M11 20v-3M15 20v-5"/>`,
 chart:`<path d="M4 19V5M4 19h16"/><path d="m7 16 3-4 3 2 5-7"/>`,
 report:`<path d="M5 3h11l3 3v15H5z"/><path d="M16 3v4h4M8 11h8M8 15h8M8 19h5"/>`,
 bell:`<path d="M6 16h12l-1.2-2.2V10a4.8 4.8 0 0 0-9.6 0v3.8Z"/><path d="M9 18c.6 1.2 1.4 1.8 3 1.8s2.4-.6 3-1.8"/>`,
 audit:`<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 1.5M12 4v2M4 12h2"/>`,
 settings:`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-1.8 1.8-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.64V20h-2.6v-.08A1.8 1.8 0 0 0 11.16 18a1.8 1.8 0 0 0-2 .36l-.06.06-1.8-1.8.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 6.08 13H6v-2h.08a1.8 1.8 0 0 0 1.64-1.16 1.8 1.8 0 0 0-.36-2l-.06-.06 1.8-1.8.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 12.24 4.8V4h2.52v.08A1.8 1.8 0 0 0 15.92 5.92a1.8 1.8 0 0 0 2-.36l.06-.06 1.8 1.8-.06.06a1.8 1.8 0 0 0-.36 2A1.8 1.8 0 0 0 21 11h.08v2H21a1.8 1.8 0 0 0-1.6 1.99Z"/>`,
}
;const d=paths[name]||paths.grid;return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`}
const navGroups=[
 ['Основное',[['dashboard','Dashboard','grid'],['telegram','Telegram Inbox','inbox'],['orders','Заказы','orders'],['clients','Клиентская база','users'],['consolidated','Сводные заказы','merge'],['board','Logistics Board','board'],['loading','Очередь погрузки','truck']]],
 ['Склад и товары',[['stock','Остатки','stock'],['warehouse','Задания складу','warehouse'],['products','Товары фирмы','product']]],
 ['Транспорт и команда',[['vehicles','Автомобили фирмы','truck'],['logisticians','Логисты','users'],['warehouseManagers','Завскладов','factory']]],
 ['Производство и контроль',[['analytics','Analytics','chart'],['reports','Reports','report'],['notifications','Уведомления','bell'],['audit','Audit Log','audit'],['codes','Система кодов','report'],['settings','Settings','settings']]]
];

/* ===== Резервирование по заводам =====
   p.factories[f] — физический остаток, p.resBy[f] — резерв на заводе f, p.reserved — сумма резервов (для старых страниц).
   o.resMap — из каких заводов заказ зарезервирован: {Альянс:10}. */
const FACTORIES=['Альянс','Агро','Гулистан'];
function ensureRes(p){
  if(!p.resBy){p.resBy={};let left=Math.max(0,+p.reserved||0);FACTORIES.forEach(f=>{const t=Math.min(left,p.factories[f]||0);p.resBy[f]=t;left-=t});if(left>0)p.resBy[FACTORIES[FACTORIES.length-1]]+=left}
  FACTORIES.forEach(f=>{if(typeof p.resBy[f]!=='number')p.resBy[f]=0});
  p.reserved=FACTORIES.reduce((a,f)=>a+p.resBy[f],0);
  return p.resBy;
}
function fRes(p,f){return ensureRes(p)[f]||0}
function fAvail(p,f){return Math.max(0,(p.factories[f]||0)-fRes(p,f))}
function totalAvail(p){return FACTORIES.reduce((a,f)=>a+fAvail(p,f),0)}
function resText(map){return Object.entries(map||{}).map(([f,q])=>f+' '+Math.round(q)+' меш').join(' + ')}
/* план резерва: сначала один завод (выбранный, затем по порядку), если ни на одном не хватает — делим между заводами */
function planReserve(p,qty,pref){
  ensureRes(p);
  const order=FACTORIES.includes(pref)?[pref].concat(FACTORIES.filter(f=>f!==pref)):FACTORIES.slice();
  for(const f of order){if(fAvail(p,f)>=qty)return{ok:true,split:false,map:{[f]:qty}}}
  const total=totalAvail(p);
  if(total<qty)return{ok:false,split:false,map:{},short:qty-total};
  const map={};let left=qty;
  order.slice().sort((a,b)=>fAvail(p,b)-fAvail(p,a)).forEach(f=>{const t=Math.min(left,fAvail(p,f));if(t>0){map[f]=t;left-=t}});
  return{ok:true,split:true,map};
}
function releaseOrder(o){
  if(!o||!o.resMap)return;
  const p=state.products.find(x=>x.id===(o.resProductId!=null?o.resProductId:o.productId));
  if(p){ensureRes(p);Object.entries(o.resMap).forEach(([f,q])=>{p.resBy[f]=Math.max(0,(p.resBy[f]||0)-q)});ensureRes(p)}
  o.resMap=null;o.resProductId=null;
}
function reserveOrderStock(o,pref,keepOldOnFail){
  const oldMap=o.resMap,oldPid=o.resProductId;
  releaseOrder(o);
  const p=state.products.find(x=>x.id===+o.productId);
  if(!p)return{ok:false,map:{},short:o.qty};
  const r=planReserve(p,o.qty,pref);
  if(r.ok){Object.entries(r.map).forEach(([f,q])=>{p.resBy[f]+=q});ensureRes(p);o.resMap=r.map;o.resProductId=p.id}
  else if(keepOldOnFail&&oldMap){const op=state.products.find(x=>x.id===oldPid);if(op){ensureRes(op);Object.entries(oldMap).forEach(([f,q])=>{op.resBy[f]+=q});ensureRes(op);o.resMap=oldMap;o.resProductId=oldPid}}
  return r;
}
/* отгрузка: снимаем резерв и списываем физический остаток с тех же заводов */
function commitShipment(o){
  if(!o||!o.resMap)return;
  const p=state.products.find(x=>x.id===(o.resProductId!=null?o.resProductId:o.productId));
  if(p){ensureRes(p);Object.entries(o.resMap).forEach(([f,q])=>{p.resBy[f]=Math.max(0,(p.resBy[f]||0)-q);p.factories[f]=Math.max(0,(p.factories[f]||0)-q)});ensureRes(p)}
  o.resMap=null;o.resProductId=null;
}
/* вызывается после ручной смены статуса / количества / товара */
function syncOrderStock(o,from,oldQty,oldPid){
  const st=o.status,done=['SHIPPED','COMPLETED'];
  if(st==='CANCELLED'){releaseOrder(o);return}
  if(done.includes(st)){if(!done.includes(from))commitShipment(o);return}
  if(o.resMap&&(o.qty!==oldQty||o.productId!==oldPid)){if(!reserveOrderStock(o,null).ok)o.status='WAITING_STOCK';return}
  if(st==='RESERVED'&&!o.resMap){if(!reserveOrderStock(o,null).ok)o.status='WAITING_STOCK'}
}
