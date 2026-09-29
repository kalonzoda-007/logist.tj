/* FATIRLOGIST — каркас: меню, роутер, ленивая загрузка страниц */
function navHTML(target){return navGroups.map(g=>`<div class="nav-section">${g[0]}</div><div class="side-nav">${g[1].map(n=>`<button class="${currentPage===n[0]?'active':''}" onclick="go('${n[0]}')"><span class="icon">${ico(n[2],22)}</span><span>${n[1]}</span></button>`).join('')}</div>`).join('')}
function renderNav(){document.getElementById('sideNav').innerHTML=navHTML('side');document.getElementById('drawerNav').innerHTML=navGroups.flatMap(g=>g[1]).map(n=>`<button class="${currentPage===n[0]?'active':''}" onclick="go('${n[0]}');closeDrawer()"><span class="icon">${ico(n[2],22)}</span>${n[1]}</button>`).join('');document.getElementById('mobileBottom').innerHTML=[['dashboard','Главная','grid'],['telegram','Telegram','inbox'],['orders','Заказы','orders'],['loading','Погрузка','truck'],['products','Ещё','product']].map(n=>`<button class="${currentPage===n[0]?'active':''}" onclick="go('${n[0]}')">${ico(n[2],22)}<span>${n[1]}</span></button>`).join('')}
function pageHead(title,sub,actions=''){return `<div class="hero-row"><div class="hero"><h1>${title}</h1><p>${sub}</p></div><div class="hero-actions">${actions}</div></div>`}

/* ===== Роутер: страницы грузятся по требованию (pages/<id>.js) ===== */
const PAGE_FN={dashboard:'dashboard', telegram:'telegramPage', orders:'ordersPage', clients:'clientsPage', consolidated:'consolidatedPage', board:'boardPage', loading:'loadingPage', stock:'stockPage', warehouse:'warehousePage', products:'productsPage', vehicles:'vehiclesPage', logisticians:'logisticiansPage', warehouseManagers:'managersPage', analytics:'analyticsPage', reports:'simpleReports', notifications:'notificationsPage', audit:'auditPage', codes:'codesPage', settings:'settingsPage'};
const PAGE_LOADED={};
function loadPage(p,cb){
  if(PAGE_LOADED[p]===true)return cb();
  if(PAGE_LOADED[p]){PAGE_LOADED[p].push(cb);return}
  PAGE_LOADED[p]=[cb];
  const s=document.createElement('script');s.src='pages/'+p+'.js';
  s.onload=()=>{const q=PAGE_LOADED[p];PAGE_LOADED[p]=true;q.forEach(f=>f())};
  s.onerror=()=>{PAGE_LOADED[p]=null;toast('Не удалось загрузить страницу: '+p)};
  document.head.appendChild(s);
}
/* заглушки: первый вызов функции страницы подгружает её файл, затем вызывает уже настоящую функцию */
Object.entries(PAGE_FN).forEach(([p,fn])=>{const stub=function(){const a=arguments;loadPage(p,()=>{if(window[fn]!==stub)window[fn].apply(null,a)})};window[fn]=stub});
['renderOrdersTable','renderClientsTable'].forEach(fn=>{const p=fn==='renderOrdersTable'?'orders':'clients';const stub=function(){const a=arguments;loadPage(p,()=>{if(window[fn]!==stub)window[fn].apply(null,a)})};window[fn]=stub});
function renderPage(p){
  try{ensureCodes()}catch(e){}
  const sec=document.getElementById(p);
  if(sec&&PAGE_LOADED[p]!==true&&!sec.innerHTML.trim())sec.innerHTML='<div class="page-loading">…</div>';
  window[PAGE_FN[p]]();
}
function refreshAll(){renderPage(currentPage);renderNav()}
function refreshAllPagesLight(){renderPage(currentPage)}
function go(page){
  if(!PAGE_FN[page])page='dashboard';
  currentPage=page;
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById(page)?.classList.add('active');
  if(location.hash!=='#/'+page)location.hash='#/'+page;
  refreshAllPagesLight();window.scrollTo({top:0,behavior:'smooth'});renderNav();
}
(function init(){
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand()}if(e.key==='Escape'){closeModal();closeDrawer()}});
  if(localStorage.getItem('fatir_auth'))document.getElementById('loginLayer').style.display='none';
  const fromHash=()=>{const m=location.hash.match(/^#\/?(\w+)/);return m&&PAGE_FN[m[1]]?m[1]:null};
  window.addEventListener('hashchange',()=>{const p=fromHash();if(p&&p!==currentPage)go(p)});
  window.addEventListener('storage',()=>{state=loadState();refreshAllPagesLight();renderNav()});
  currentPage=fromHash()||'dashboard';
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===currentPage));
  renderNav();refreshAllPagesLight();
})();
