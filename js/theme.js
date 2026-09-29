/* Тема: светлая / тёмная. Сохраняется в localStorage, по умолчанию — как в системе. */
(function(){
  function saved(){try{return localStorage.getItem('fatir_theme')}catch(e){return null}}
  function sys(){return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
  window.applyTheme=function(t){document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='dark'?'#141a15':'#2E3A2F')};
  window.toggleTheme=function(){var n=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';try{localStorage.setItem('fatir_theme',n)}catch(e){}applyTheme(n)};
  applyTheme(saved()||sys());
})();
