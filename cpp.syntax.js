function cppSyntax(textarea){
  if(!textarea)return;
  let code=textarea.value;
  const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  
  // Comments
  code=code.replace(/\/\*[\s\S]*?\*\//g,m=>`<span class="token-com">${esc(m)}</span>`);
  code=code.replace(/\/\/.*$/gm,m=>`<span class="token-com">${esc(m)}</span>`);
  
  // Strings
  code=code.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g,m=>`<span class="token-str">${esc(m)}</span>`);
  code=code.replace(/R"(\([^)]*\))[\s\S]*?\1"/g,m=>`<span class="token-str">${esc(m)}</span>`);
  
  // Preprocessor
  code=code.replace(/^\s*#\s*\w+/gm,m=>`<span class="token-pre">${esc(m)}</span>`);
  
  // Keywords
  const kw=['alignas','alignof','and','and_eq','asm','auto','bitand','bitor','bool','break','case','catch','char','char8_t','char16_t','char32_t','class','compl','concept','const','consteval','constexpr','constinit','const_cast','continue','co_await','co_return','co_yield','decltype','default','delete','do','double','dynamic_cast','else','enum','explicit','export','extern','false','float','for','friend','goto','if','inline','int','long','mutable','namespace','new','noexcept','not','not_eq','nullptr','operator','or','or_eq','private','protected','public','register','reinterpret_cast','requires','return','short','signed','sizeof','static','static_assert','static_cast','struct','switch','template','this','thread_local','throw','true','try','typedef','typeid','typename','union','unsigned','using','virtual','void','volatile','wchar_t','while','xor','xor_eq'];
  code=code.replace(new RegExp(`\\b(${kw.join('|')})\\b`,'g'),`<span class="token-kw">$1</span>`);
  
  // Types from std
  const types=['string','vector','map','set','array','tuple','pair','optional','variant','unique_ptr','shared_ptr','weak_ptr','make_unique','make_shared','move','forward','cin','cout','cerr','endl','std'];
  code=code.replace(new RegExp(`\\b(${types.join('|')})\\b`,'g'),`<span class="token-type">$1</span>`);
  
  // Functions
  code=code.replace(/\b([a-zA-Z_]\w*)(?=\s*(?:<[^>]*>)?\s*\()/g,`<span class="token-fun">$1</span>`);
  
  // Numbers
  code=code.replace(/\b0[xX][0-9a-fA-F]+(?:[uUlL]*)\b|\b\d+(\.\d+)?([eE][+-]?\d+)?[fFlL]?\b/g,`<span class="token-num">$&</span>`);
  
  // Operators
  code=code.replace/(\?:<<|>>|->|->\*|\+\+|--|&&|\|\||::|[+\-*/%=<>!&|^~]+)/g,`<span class="token-op">$&</span>`);
  
  // Delimiters
  code=code.replace(/[{}()[\];,.]/g,`<span class="token-del">$&</span>`);
  
  return code.replace(/\t/g,'  ');
}