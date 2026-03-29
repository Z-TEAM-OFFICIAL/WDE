function cssSyntax(textarea){
  if(!textarea)return;
  let code=textarea.value;
  const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  
  // Comments
  code=code.replace(/\/\*[\s\S]*?\*\//g,m=>`<span class="token-com">${esc(m)}</span>`);
  
  // Strings
  code=code.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g,m=>`<span class="token-str">${esc(m)}</span>`);
  
  // At-rules
  code=code.replace(/@\w+(?:\s+[\w-]+)?/g,`<span class="token-pre">$&</span>`);
  
  // Selectors (IDs and Classes)
  code=code.replace(/([.#][\w-]+)/g,`<span class="token-tag">$1</span>`);
  
  // Properties
  code=code.replace(/([\w-]+)(?=\s*:)/g,`<span class="token-key">$1</span>`);
  
  // Values with units
  code=code.replace(/\b(-?\d*\.?\d+)(px|em|rem|vh|vw|vmin|vmax|%|pt|pc|cm|mm|in|ex|ch|deg|rad|grad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx|fr)\b/g,`<span class="token-num">$1$2</span>`);
  
  // Colors (hex)
  code=code.replace(/#[0-9a-fA-F]{3,8}\b/g,`<span class="token-num">$&</span>`);
  
  // Functions
  code=code.replace(/([\w-]+)(?=\()/g,`<span class="token-fun">$1</span>`);
  
  // Numbers
  code=code.replace(/\b\d+\b/g,`<span class="token-num">$&</span>`);
  
  // Operators
  code=code.replace(/[>+~^|$*]=?/g,`<span class="token-op">$&</span>`);
  
  // Delimiters
  code=code.replace(/;|:|,|\.|\?[\{\}\(\)\[\]]/g,`<span class="token-del">$&</span>`);
  
  textarea.innerHTML=code;
}

/[{}()