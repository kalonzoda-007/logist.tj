/* Локализация RU / TG. Русский текст в коде — это «ключ»; в режиме TG точные совпадения подменяются по словарю i18n/tg.js.
   Работает и для динамически отрисованных страниц (MutationObserver). Непереведённое остаётся по-русски. */
(function(){
  var lang='ru';try{lang=localStorage.getItem('fatir_lang')||'ru'}catch(e){}
  var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1};
  function look(s){var d=window.I18N_TG||{};return Object.prototype.hasOwnProperty.call(d,s)?d[s]:null}
  function text(n){
    var v=n.nodeValue;if(!v||!v.trim())return;
    if(!(n.__set!==undefined&&v===n.__set)){n.__orig=v;n.__set=undefined}
    var o=n.__orig,core=o.trim();
    if(lang==='tg'){var t=look(core);if(t){var nv=o.replace(core,t);if(nv!==n.nodeValue){n.__set=nv;n.nodeValue=nv}return}}
    if(n.__set!==undefined){n.nodeValue=o;n.__set=undefined}
  }
  function attrs(el){
    if(!el.getAttribute)return;
    ['placeholder','title'].forEach(function(a){
      var v=el.getAttribute(a);if(v==null)return;var k='__a_'+a;
      if(!el[k]||el[k].set!==v)el[k]={orig:v,set:undefined};
      var s=el[k];
      if(lang==='tg'){var t=look(s.orig.trim());if(t){s.set=t;if(el.getAttribute(a)!==t)el.setAttribute(a,t);return}}
      if(s.set!==undefined){if(el.getAttribute(a)!==s.orig)el.setAttribute(a,s.orig);s.set=undefined}
    });
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){if(!(root.parentNode&&SKIP[root.parentNode.tagName]))text(root);return}
    if(root.nodeType!==1||SKIP[root.tagName])return;
    attrs(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,null),n;
    while((n=w.nextNode())){
      if(n.nodeType===3){if(!SKIP[n.parentNode.tagName])text(n)}else if(!SKIP[n.tagName])attrs(n);
    }
  }
  function buttons(){document.querySelectorAll('[data-lang]').forEach(function(b){b.classList.toggle('on',b.dataset.lang===lang)})}
  window.setLang=function(l){
    lang=l==='tg'?'tg':'ru';try{localStorage.setItem('fatir_lang',lang)}catch(e){}
    document.documentElement.lang=lang;walk(document.body);buttons();
  };
  window.t=function(ru){return lang==='tg'?(look(ru)||ru):ru};
  function start(){
    document.documentElement.lang=lang;walk(document.body);buttons();
    new MutationObserver(function(recs){
      recs.forEach(function(r){
        if(r.type==='childList')r.addedNodes.forEach(walk);
        else if(r.type==='characterData')text(r.target);
        else if(r.type==='attributes')attrs(r.target);
      });
    }).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
