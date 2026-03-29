// Enhanced live preview with console capture
function updatePreviewWithConsole(code) {
    const output = document.getElementById('output');
    const previewDoc = output.contentDocument || output.contentWindow.document;

    // Capture console output
    const consoleMessages = [];
    const customConsole = {
        log: (...args) => consoleMessages.push({type:'log', msg: args.join(' ')}),
        error: (...args) => consoleMessages.push({type:'error', msg: args.join(' ')}),
        warn: (...args) => consoleMessages.push({type:'warn', msg: args.join(' ')})
    };

    previewDoc.open();
    previewDoc.write(`<style>${code.css}</style>${code.html}<script>
      (function(){
        const console = ${JSON.stringify(customConsole)};
        try { ${code.js} } catch(e) { console.error(e); }
      })();
    </script>`);
    previewDoc.close();

    // Optionally display console output
    let logContainer = previewDoc.getElementById('console-log');
    if(!logContainer){
        logContainer = previewDoc.createElement('div');
        logContainer.id = 'console-log';
        logContainer.style.position = 'fixed';
        logContainer.style.bottom = '0';
        logContainer.style.left = '0';
        logContainer.style.width = '100%';
        logContainer.style.maxHeight = '150px';
        logContainer.style.overflowY = 'auto';
        logContainer.style.background = 'rgba(0,0,0,0.8)';
        logContainer.style.color = '#0f0';
        logContainer.style.fontSize = '12px';
        logContainer.style.padding = '5px';
        previewDoc.body.appendChild(logContainer);
    }
    logContainer.innerHTML = consoleMessages.map(m => `[${m.type}] ${m.msg}`).join('<br>');
}
