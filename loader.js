(function(){
  const scripts=[
    'themes.js',
    'js.syntax.js',
    'css.syntax.js',
    'html.syntax.js',
    'py.syntax.js',
    'c.syntax.js',
    'cpp.syntax.js',
    'editor.main.js',
    'preview.js'
  ];

  function loadScript(src,callback){
    const s=document.createElement('script');
    s.src=src;
    s.onload=()=>callback&&callback();
    s.onerror=()=>console.error('Failed to load',src);
    document.head.appendChild(s);
  }

  function loadAll(scripts,cb){
    if(scripts.length===0){cb&&cb();return;}
    const next=scripts.shift();
    loadScript(next,()=>loadAll(scripts,cb));
  }

  loadAll([...scripts],()=>{
    if(typeof applyTheme==='function') applyTheme('dark');
    if(typeof updatePreview==='function') updatePreview();
    if(typeof applySyntaxHighlighting==='function') applySyntaxHighlighting();
  });

  window.changeTheme=function(name){
    if(typeof applyTheme==='function') applyTheme(name);
  };
})();