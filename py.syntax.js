function pySyntax(textarea){
  if(!textarea)return;
  let code=textarea.value;
  const esc=s=>s.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  
  // Comments
  code=code.replace(/#.*$/gm,m=>`<span class="token-com">${esc(m)}</span>`);
  
  // Docstrings (triple quotes)
  code=code.replace(/("""|''')[\s\S]*?\1/g,m=>`<span class="token-str">${esc(m)}</span>`);
  
  // Strings
  code=code.replace(/([frbu]*)((["'])(?:\\.|(?!\3)[^\\])*\3)/gi,(m,p1,p2)=>`${p1}<span class="token-str">${esc(p2)}</span>`);
  
  // Decorators
  code=code.replace(/@\w+(?:\.\w+)*/g,`<span class="token-pre">$&</span>`);
  
  // Keywords
  const kw=['and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield','None','True','False'];
  code=code.replace(new RegExp(`\\b(${kw.join('|')})\\b`,'g'),`<span class="token-kw">$1</span>`);
  
  // Built-ins
  const builtins=['print','len','range','enumerate','zip','map','filter','reduce','sum','min','max','abs','round','int','str','float','list','dict','tuple','set','frozenset','bool','type','isinstance','hasattr','getattr','setattr','delattr','super','self','cls','object','Exception','BaseException','TypeError','ValueError','KeyError','IndexError','AttributeError','IOError','FileNotFoundError','ZeroDivisionError','ImportError','ModuleNotFoundError','SyntaxError','NameError','RuntimeError','StopIteration','GeneratorExit','SystemExit','KeyboardInterrupt','__name__','__main__','__init__','__file__','__doc__','__class__','__dict__'];
  code=code.replace(new RegExp(`\\b(${builtins.join('|')})\\b`,'g'),`<span class="token-type">$1</span>`);
  
  // Functions
  code=code.replace(/\b(def\s+)([a-zA-Z_]\w*)/g,`$1<span class="token-fun">$2</span>`);
  code=code.replace(/\b(class\s+)([a-zA-Z_]\w*)/g,`$1<span class="token-tag">$2</span>`);
  
  // Numbers (including complex, binary, octal, hex)
  code=code.replace(/\b0[xX][0-9a-fA-F]+\b|\b0[oO][0-7]+\b|\b0[bB][01]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[jJ]?\b/g,`<span class="token-num">$&</span>`);
  
  // Operators
  code=code.replace(/(?:\*\*|\/\/|<<|>>|:=|<=|>=|==|!=|[+\-*/%=<>!&|^~])/g,`<span class="token-op">$&</span>`);
  
  // Delimiters
  code=code.replace(/[()[\]{},:;@]/g,`<span class="token-del">$&</span>`);
  
  // Special variables (dunder)
  code=code.replace(/\b(__\w+__)\b/g,`<span class="token-pre">$1</span>`);
  
  return code.replace(/\t/g,'  ');
}