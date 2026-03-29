function cSyntax(textarea){
  if(!textarea)return;
  let code=textarea.value;
  const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  
  // Comments first
  code=code.replace(/\/\*[\s\S]*?\*\//g,m=>`<span class="token-com">${esc(m)}</span>`);
  code=code.replace(/\/\/.*$/gm,m=>`<span class="token-com">${esc(m)}</span>`);
  
  // Strings
  code=code.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g,m=>`<span class="token-str">${esc(m)}</span>`);
  
  // Preprocessor
  code=code.replace(/^\s*#\s*\w+/gm,m=>`<span class="token-pre">${esc(m)}</span>`);
  
  // Keywords
  const kw=['auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','inline','int','long','register','restrict','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while','_Alignas','_Alignof','_Atomic','_Bool','_Complex','_Generic','_Imaginary','_Noreturn','_Static_assert','_Thread_local'];
  code=code.replace(new RegExp(`\\b(${kw.join('|')})\\b`,'g'),`<span class="token-kw">$1</span>`);
  
  // Types
  const types=['int8_t','int16_t','int32_t','int64_t','uint8_t','uint16_t','uint32_t','uint64_t','size_t','ssize_t','ptrdiff_t','intptr_t','uintptr_t','FILE','NULL','EXIT_SUCCESS','EXIT_FAILURE'];
  code=code.replace(new RegExp(`\\b(${types.join('|')})\\b`,'g'),`<span class="token-type">$1</span>`);
  
  // Functions
  code=code.replace(/\b([a-zA-Z_]\w*)(?=\s*\()/g,`<span class="token-fun">$1</span>`);
  
  // Numbers
  code=code.replace(/\b0[xX][0-9a-fA-F]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?[fFlL]?\b/g,`<span class="token-num">$&</span>`);
  
  // Operators
  code=code.replace(/[+\-*/%=<>!&|^~]+/g,`<span class="token-op">$&</span>`);
  
  // Delimiters
  code=code.replace(/[{}()[\];,.]/g,`<span class="token-del">$&</span>`);
  
  return code.replace(/\t/g,'  ');
}