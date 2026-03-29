function jsSyntax(textarea){
  if(!textarea)return;
  let code=textarea.value;
  const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  
  // Comments
  code=code.replace(/\/\*[\s\S]*?\*\//g,m=>`<span class="token-com">${esc(m)}</span>`);
  code=code.replace(/\/\/.*$/gm,m=>`<span class="token-com">${esc(m)}</span>`);
  
  // Template strings
  code=code.replace(/`(?:\\.|[^`\\])*`/g,m=>`<span class="token-str">${esc(m)}</span>`);
  
  // Regular strings
  code=code.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g,m=>`<span class="token-str">${esc(m)}</span>`);
  
  // Regex literals
  code=code.replace(/\/(?![/*])(?:\\.|[^\\\n/])+\/[gimuy]*/g,`<span class="token-str">$&</span>`);
  
  // Keywords
  const kw=['break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','finally','for','function','if','import','in','instanceof','new','return','super','switch','this','throw','try','typeof','var','void','while','with','yield','let','static','await','async','of','from','as'];
  code=code.replace(new RegExp(`\\b(${kw.join('|')})\\b`,'g'),`<span class="token-kw">$1</span>`);
  
  // Constants
  const pre=['true','false','null','undefined','NaN','Infinity','-Infinity'];
  code=code.replace(new RegExp(`\\b(${pre.join('|')})\\b`,'g'),`<span class="token-pre">$1</span>`);
  
  // Built-ins
  const builtins=['console','document','window','Math','JSON','Promise','