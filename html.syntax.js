function htmlSyntax(textarea){
  if(!textarea)return;
  let code=textarea.value;
  const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  
  // Comments
  code=code.replace(/&lt;!--[\s\S]*?--&gt;/g,m=>`<span class="token-com">${m}</span>`);
  
  // DOCTYPE
  code=code.replace(/&lt;!DOCTYPE[^&]*&gt;/gi,m=>`<span class="token-pre">${m}</span>`);
  
  // Tags (opening, closing, self-closing)
  code=code.replace(/(&lt;\/?)([a-zA-Z][\w:-]*)/g,`$1<span class="token-tag">$2</span>`);
  
  // Attributes
  code=code.replace(/\s([a-zA-Z_:][\w:.-]*)(?=\s*=)/g,` <span class="token-attr">$1</span>`);
  
  // Attribute values (quoted)
  code=code.replace(/(=)(["'])(?:\\.|(?!\2)[^\\])*\2/g,`$1<span class="token-str">$2$3$2</span>`);
  
  // Numbers in attributes
  code=code.replace(/\b\d+\b/g,`<span class="token-num">$&</span>`);
  
  // Tag brackets
  code=code.replace(/(&lt;\/?|&gt;|\/&gt;)/g,`<span class="token-del">$1</span>`);
  
  return code.replace(/\t/g,'  ');
}