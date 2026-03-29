const root = document.body
  , codeArea = document.getElementById('code')
  , preview = document.getElementById('output')
  , tabs = [...document.querySelectorAll('.tab')];
if (!codeArea || !preview)
    throw new Error('Editor markup missing');
const LANGS = ['html', 'css', 'js', 'py', 'c', 'cpp'];
const STORAGE = 'mini-editor-v3';
const themes = window.THEMES || {
    dark: {
        bg: '#0b0f19',
        panel: '#111827',
        text: '#e2e8f0',
        muted: '#64748b',
        accent: '#3b82f6',
        line: '#1e293b',
        gutter: '#0f172a',
        sel: 'rgba(59,130,246,0.2)',
        match: 'rgba(234,179,8,0.15)'
    },
    light: {
        bg: '#ffffff',
        panel: '#f8fafc',
        text: '#0f172a',
        muted: '#64748b',
        accent: '#2563eb',
        line: '#e2e8f0',
        gutter: '#f1f5f9',
        sel: 'rgba(37,99,235,0.15)',
        match: 'rgba(234,179,8,0.2)'
    }
};
const snippets = {
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>App</title>\n</head>\n<body>\n  <div id="root">\n    <h1>Hello World</h1>\n    <p>Edit HTML, CSS, JS, Python, C, and C++.</p>\n  </div>\n</body>\n</html>',
    css: '* { box-sizing: border-box; margin: 0; }\nbody { \n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  padding: 2rem;\n}\nh1 { color: #0f172a; margin-bottom: 1rem; }',
    js: 'const App = {\n  init() {\n    console.log("Hello from JS");\n    this.bindEvents();\n  },\n  bindEvents() {\n    document.addEventListener("click", e => {\n      console.log("Clicked:", e.target);\n    });\n  }\n};\nApp.init();',
    py: '#!/usr/bin/env python3\nimport sys\n\ndef main():\n    name = "editor"\n    print(f"Hello, {name}!")\n    print(f"Python {sys.version}")\n\nif __name__ == "__main__":\n    main()',
    c: '#include <stdio.h>\n#include <stdlib.h>\n\nint main(int argc, char *argv[]) {\n    printf("Hello, C editor!\\n");\n    return EXIT_SUCCESS;\n}',
    cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name = "editor";\n    std::cout << "Hello, " << name << "!\\n";\n    return 0;\n}'
};
const PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    "`": "`"
};
const state = {
    lang: 'html',
    theme: 'dark',
    fontSize: 14,
    wrap: true,
    folds: new Map(),
    undo: [],
    redo: [],
    dirty: false,
    search: '',
    replace: '',
    cursor: 0,
    selection: [0, 0],
    lastSave: 0,
    autoSaveMs: 700,
    previewMs: 120,
    previewTimer: 0,
    saveTimer: 0,
    searchMatches: [],
    matchIndex: -1,
    regexSearch: false,
    paletteOpen: false,
    autoClose: true,
    matchBrackets: true
};
let editorWrap, gutter, highlight, status, toolbar, foldLayer, commandPalette, minimap, bracketMatch;
function boot() {
    injectThemeStyles();
    buildShell();
    bindTabs();
    bindKeys();
    bindGlobal();
    restoreSession();
    setLanguage(state.lang, false);
    applyTheme(state.theme);
    applyFont(state.fontSize);
    debouncePreview();
    startAutoSave();
    refreshAll();
}
function injectThemeStyles() {
    if (document.getElementById('editor-runtime-styles'))
        return;
    const s = document.createElement('style');
    s.id = 'editor-runtime-styles';
    s.textContent = `
:root{--ed-bg:#0b0f19;--ed-panel:#111827;--ed-text:#e2e8f0;--ed-muted:#64748b;--ed-accent:#3b82f6;--ed-line:#1e293b;--ed-gutter:#0f172a;--ed-sel:rgba(59,130,246,0.2);--ed-match:rgba(234,179,8,0.15)}
*{box-sizing:border-box}
body,html{background:var(--ed-bg);color:var(--ed-text);margin:0;height:100%;overflow:hidden;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
#container{position:fixed;inset:0;display:grid;grid-template-columns:minmax(320px,1.4fr) 1fr;gap:1px;background:var(--ed-line)}
.editor{position:relative;display:grid;grid-template-rows:auto auto 1fr auto;background:var(--ed-panel);min-width:0;overflow:hidden}
.tabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px 12px;border-bottom:1px solid var(--ed-line);background:var(--ed-bg);user-select:none}
.tab{border:1px solid transparent;border-radius:6px;padding:6px 12px;background:transparent;color:var(--ed-muted);cursor:pointer;transition:.15s;font-size:12px;font-weight:500}
.tab:hover{color:var(--ed-text);background:rgba(255,255,255,0.03)}
.tab.active{background:var(--ed-accent);color:#fff}
#toolbar{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid var(--ed-line);background:var(--ed-bg)}
#toolbar button{border:1px solid var(--ed-line);border-radius:6px;padding:5px 10px;background:var(--ed-panel);color:var(--ed-muted);cursor:pointer;font-size:11px;transition:.15s}
#toolbar button:hover{border-color:var(--ed-accent);color:var(--ed-text);background:var(--ed-panel)}
#toolbar button.primary{background:var(--ed-accent);color:#fff;border-color:var(--ed-accent)}
#editorShell{position:relative;display:grid;grid-template-columns:auto 1fr auto;overflow:hidden;min-height:0}
#editorGutter{position:relative;overflow:hidden;background:var(--ed-gutter);border-right:1px solid var(--ed-line);color:var(--ed-muted);font:12px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;padding:12px 0;user-select:none;text-align:right;min-width:45px}
#editorGutter .line{padding:0 10px 0 8px;position:relative;transition:.15s}
#editorGutter .line.active{color:var(--ed-text);background:rgba(255,255,255,0.04)}
#editorGutter .fold{position:absolute;left:2px;top:50%;transform:translateY(-50%);width:16px;height:16px;display:grid;place-items:center;font-size:10px;cursor:pointer;opacity:.6;transition:.15s}
#editorGutter .fold:hover{opacity:1;color:var(--ed-accent)}
#editorBody{position:relative;min-width:0;overflow:hidden;background:var(--ed-panel)}
#editorHighlight,#editorFoldOverlay,#editorMatchOverlay{position:absolute;inset:0;margin:0;padding:12px;overflow:hidden;pointer-events:none;font:inherit;line-height:1.6;white-space:pre;word-break:normal;tab-size:2;z-index:1}
#editorHighlight{color:var(--ed-text);z-index:1}
#editorMatchOverlay{z-index:2}
#editorFoldOverlay{z-index:3}
#editorActiveLine{position:absolute;left:0;right:0;background:rgba(255,255,255,0.02);pointer-events:none;z-index:0;transition:top .1s}
.match{background:var(--ed-match);border-radius:2px}
.bracket-match{background:rgba(96,165,250,0.3);border:1px solid rgba(96,165,250,0.5);border-radius:3px}
.folded{display:inline-block;background:rgba(59,130,246,0.15);color:var(--ed-accent);border:1px solid rgba(59,130,246,0.3);border-radius:6px;padding:0 6px;margin:0 2px;pointer-events:auto;cursor:pointer;font-size:0.9em}
#code{position:absolute;inset:0;padding:12px;border:0;outline:0;resize:none;background:transparent;color:transparent;caret-color:var(--ed-accent);overflow:auto;font:inherit;line-height:1.6;white-space:pre;word-break:normal;tab-size:2;z-index:4}
#code::selection{background:var(--ed-sel)}
#code:focus{outline:none}
#minimap{position:relative;width:120px;background:var(--ed-gutter);border-left:1px solid var(--ed-line);overflow:hidden;opacity:0.6;transition:.15s}
#minimap:hover{opacity:1}
#minimap canvas{display:block;width:100%;height:100%}
#preview{background:#fff;min-width:0;overflow:hidden;position:relative}
#output{width:100%;height:100%;border:0;background:#fff}
#statusBar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 12px;border-top:1px solid var(--ed-line);background:var(--ed-bg);color:var(--ed-muted);font:11px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap}
#statusLeft,#statusRight{display:flex;gap:12px;align-items:center}
.statusPill{padding:2px 8px;border:1px solid var(--ed-line);border-radius:4px;background:rgba(255,255,255,0.02);display:flex;gap:6px;align-items:center}
.statusPill.error{color:#ef4444;border-color:rgba(239,68,68,0.3)}
#commandPalette{position:fixed;top:20%;left:50%;transform:translateX(-50%) scale(0.95);width:min(600px,90vw);background:var(--ed-panel);border:1px solid var(--ed-line);border-radius:12px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);opacity:0;pointer-events:none;transition:.15s;z-index:1000;overflow:hidden}
#commandPalette.open{opacity:1;pointer-events:auto;transform:translateX(-50%) scale(1)}
#paletteInput{width:100%;padding:16px;border:0;border-bottom:1px solid var(--ed-line);background:transparent;color:var(--ed-text);font:inherit;font-size:16px;outline:none}
#paletteList{max-height:400px;overflow:auto;padding:8px}
.paletteItem{padding:10px 12px;border-radius:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;color:var(--ed-text)}
.paletteItem:hover,.paletteItem.active{background:var(--ed-accent);color:#fff}
.paletteItem kbd{font-size:11px;opacity:0.6;background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px}
.token-kw{color:#c084fc;font-weight:500}.token-str{color:#4ade80}.token-num{color:#fbbf24}.token-com{color:#64748b;font-style:italic}.token-op{color:#94a3b8}.token-del{color:#f472b6}.token-attr{color:#93c5fd}.token-tag{color:#f97316;font-weight:500}.token-key{color:#60a5fa}.token-type{color:#22c55e;font-weight:500}.token-pre{color:#f59e0b}.token-err{background:rgba(248,113,113,.2);text-decoration:underline wavy #ef4444}
`;
    document.head.appendChild(s)
}
function buildShell() {
    const container = document.getElementById('container');
    if (!container)
        return;
    editorWrap = document.createElement('div');
    editorWrap.id = 'editorShell';
    gutter = document.createElement('div');
    gutter.id = 'editorGutter';
    highlight = document.createElement('pre');
    highlight.id = 'editorHighlight';
    foldLayer = document.createElement('pre');
    foldLayer.id = 'editorFoldOverlay';
    const matchOverlay = document.createElement('pre');
    matchOverlay.id = 'editorMatchOverlay';
    const activeLine = document.createElement('div');
    activeLine.id = 'editorActiveLine';
    const body = document.createElement('div');
    body.id = 'editorBody';
    body.append(activeLine, highlight, matchOverlay, foldLayer, codeArea);
    minimap = document.createElement('div');
    minimap.id = 'minimap';
    minimap.innerHTML = '<canvas></canvas>';
    editorWrap.append(gutter, body, minimap);
    container.insertBefore(editorWrap, container.firstChild);
    status = document.createElement('div');
    status.id = 'statusBar';
    status.innerHTML = '<div id="statusLeft"><span class="statusPill" id="statLang">HTML</span><span class="statusPill" id="statTheme">dark</span><span class="statusPill" id="statPos">Ln 1, Col 1</span><span class="statusPill" id="statSel">0 chars</span></div><div id="statusRight"><span class="statusPill" id="statLines">1 lines</span><span class="statusPill" id="statFold">0 folds</span><span class="statusPill" id="statSave">saved</span></div>';
    container.parentElement.insertBefore(status, container.nextSibling);
    toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    toolbar.innerHTML = `<button data-act="undo" title="Undo (Ctrl+Z)">↶</button><button data-act="redo" title="Redo (Ctrl+Shift+Z)">↷</button><button data-act="find" title="Find (Ctrl+F)">🔍</button><button data-act="replace" title="Replace (Ctrl+H)">⇄</button><button data-act="fold" title="Fold All">−</button><button data-act="unfold" title="Unfold All">+</button><button data-act="wrap" title="Toggle Wrap">↵</button><button data-act="regex" title="Regex Search">.*</button><button data-act="palette" title="Command Palette (Ctrl+Shift+P)">⌘</button><button data-act="theme" title="Toggle Theme">◐</button><button data-act="save" class="primary" title="Save (Ctrl+S)">💾</button><button data-act="download" title="Download">⬇</button><button data-act="load" title="Load File">📁</button><button data-act="zoom-out">A−</button><button data-act="zoom-in">A+</button>`;
    container.insertBefore(toolbar, container.firstChild);
    commandPalette = document.createElement('div');
    commandPalette.id = 'commandPalette';
    commandPalette.innerHTML = '<input id="paletteInput" placeholder="Type a command..." autocomplete="off"><div id="paletteList"></div>';
    document.body.appendChild(commandPalette);
    bracketMatch = document.createElement('span');
    bracketMatch.className = 'bracket-match';
    toolbar.addEventListener('click', onToolbar);
}
function bindTabs() {
    tabs.forEach(t => t.addEventListener('click', () => setLanguage(t.dataset.lang, true)))
}
function bindKeys() {
    codeArea.addEventListener('keydown', e => {
        if (state.paletteOpen && e.key === 'Escape') {
            closePalette();
            return
        }
        if (state.paletteOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                navigatePalette(e.key === 'ArrowDown' ? 1 : -1);
                e.preventDefault()
            }
            if (e.key === 'Enter') {
                executePalette();
                e.preventDefault()
            }
            return
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey)
                indentSelection(-1);
            else
                indentSelection(1);
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            smartEnter();
            return
        }
        if (PAIRS[e.key] && state.autoClose && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const s = codeArea.selectionStart
              , e2 = codeArea.selectionEnd;
            const next = codeArea.value[e2] || '';
            if (!next || /[\s)\]}>;"'`]/.test(next)) {
                insertText(e.key + PAIRS[e.key]);
                codeArea.selectionStart = codeArea.selectionEnd = s + 1;
                return
            }
        }
        if (e.key === 'Backspace') {
            const s = codeArea.selectionStart;
            if (s === codeArea.selectionEnd && s > 0) {
                const pair = codeArea.value.slice(s - 1, s + 1);
                if (Object.entries(PAIRS).some( ([k,v]) => k + v === pair)) {
                    codeArea.value = codeArea.value.slice(0, s - 1) + codeArea.value.slice(s + 1);
                    codeArea.selectionStart = codeArea.selectionEnd = s - 1;
                    syncAfterEdit();
                    e.preventDefault();
                    return
                }
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            e.shiftKey ? redo() : undo();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redo();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveSession();
            flashMessage('Saved');
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            promptSearch();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            promptReplace();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            openPalette();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleComment();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            duplicateLine();
            return
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            goToLine();
            return
        }
        if (e.altKey && e.key === 'ArrowUp') {
            e.preventDefault();
            moveLine(-1);
            return
        }
        if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault();
            moveLine(1);
            return
        }
        if (e.ctrlKey && e.shiftKey && e.key === '[') {
            e.preventDefault();
            foldCurrent();
            return
        }
        if (e.ctrlKey && e.shiftKey && e.key === ']') {
            e.preventDefault();
            unfoldCurrent();
            return
        }
        if (state.matchBrackets && '()[]{}'.includes(e.key)) {
            setTimeout(highlightMatchingBracket, 0)
        }
    }
    );
    codeArea.addEventListener('input', onInput);
    codeArea.addEventListener('scroll', syncScroll);
    ['click', 'keyup', 'mouseup', 'selectstart'].forEach(evt => codeArea.addEventListener(evt, syncCaret));
    codeArea.addEventListener('dragover', e => {
        e.preventDefault();
        codeArea.style.background = 'rgba(59,130,246,0.05)'
    }
    );
    codeArea.addEventListener('dragleave', () => {
        codeArea.style.background = ''
    }
    );
    codeArea.addEventListener('drop', onDrop);
    window.addEventListener('resize', refreshAll);
    window.addEventListener('beforeunload', () => {
        if (state.dirty)
            saveSession()
    }
    );
    document.getElementById('paletteInput').addEventListener('input', filterPalette);
    document.addEventListener('click', e => {
        if (state.paletteOpen && !commandPalette.contains(e.target))
            closePalette()
    }
    );
}
function bindGlobal() {
    window.addEventListener('error', e => flashMessage(e.message, 'error'))
}
function onToolbar(e) {
    const a = e.target.dataset.act;
    if (!a)
        return;
    const actions = {
        undo,
        redo,
        find: promptSearch,
        replace: promptReplace,
        fold: foldAll,
        unfold: unfoldAll,
        wrap: toggleWrap,
        theme: toggleTheme,
        save() {
            saveSession();
            flashMessage('Saved')
        },
        download,
        load: loadFile,
        palette: openPalette,
        'zoom-in': () => applyFont(state.fontSize + 1),
        'zoom-out': () => applyFont(Math.max(10, state.fontSize - 1)),
        regex() {
            state.regexSearch = !state.regexSearch;
            flashMessage('Regex: ' + (state.regexSearch ? 'ON' : 'OFF'))
        }
    };
    if (actions[a])
        actions[a]()
}
function openPalette() {
    state.paletteOpen = true;
    commandPalette.classList.add('open');
    document.getElementById('paletteInput').value = '';
    document.getElementById('paletteInput').focus();
    filterPalette()
}
function closePalette() {
    state.paletteOpen = false;
    commandPalette.classList.remove('open');
    codeArea.focus()
}
function filterPalette() {
    const q = document.getElementById('paletteInput').value.toLowerCase();
    const items = [{
        label: 'Go to Line',
        shortcut: 'Ctrl+G',
        act: goToLine
    }, {
        label: 'Find',
        shortcut: 'Ctrl+F',
        act: promptSearch
    }, {
        label: 'Replace',
        shortcut: 'Ctrl+H',
        act: promptReplace
    }, {
        label: 'Toggle Comment',
        shortcut: 'Ctrl+/',
        act: toggleComment
    }, {
        label: 'Duplicate Line',
        shortcut: 'Ctrl+D',
        act: duplicateLine
    }, {
        label: 'Move Line Up',
        shortcut: 'Alt+↑',
        act: () => moveLine(-1)
    }, {
        label: 'Move Line Down',
        shortcut: 'Alt+↓',
        act: () => moveLine(1)
    }, {
        label: 'Fold All',
        act: foldAll
    }, {
        label: 'Unfold All',
        act: unfoldAll
    }, {
        label: 'Toggle Fold',
        shortcut: 'Ctrl+Shift+[',
        act: foldCurrent
    }, {
        label: 'Toggle Word Wrap',
        act: toggleWrap
    }, {
        label: 'Toggle Regex Search',
        act() {
            state.regexSearch = !state.regexSearch;
            flashMessage('Regex: ' + (state.regexSearch ? 'ON' : 'OFF'))
        }
    }, {
        label: 'Toggle Bracket Match',
        act() {
            state.matchBrackets = !state.matchBrackets;
            flashMessage('Bracket match: ' + (state.matchBrackets ? 'ON' : 'OFF'))
        }
    }, {
        label: 'Toggle Auto-close',
        act() {
            state.autoClose = !state.autoClose;
            flashMessage('Auto-close: ' + (state.autoClose ? 'ON' : 'OFF'))
        }
    }, {
        label: 'Increase Font Size',
        act: () => applyFont(state.fontSize + 1)
    }, {
        label: 'Decrease Font Size',
        act: () => applyFont(state.fontSize - 1)
    }, {
        label: 'Reset Font Size',
        act: () => applyFont(14)
    }, {
        label: 'Toggle Theme',
        act: toggleTheme
    }, {
        label: 'Save File',
        shortcut: 'Ctrl+S',
        act() {
            saveSession();
            flashMessage('Saved')
        }
    }, {
        label: 'Download File',
        act: download
    }, {
        label: 'Load File',
        act: loadFile
    }, {
        label: 'Run/Preview',
        act: renderPreview
    }, {
        label: 'Clear Storage',
        act() {
            localStorage.removeItem(STORAGE);
            location.reload()
        }
    }];
    const list = document.getElementById('paletteList');
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q)) : items;
    list.innerHTML = filtered.map( (i, idx) => `<div class="paletteItem${idx === 0 ? ' active' : ''}" data-idx="${idx}"><span>${i.label}</span><kbd>${i.shortcut || ''}</kbd></div>`).join('');
    list.querySelectorAll('.paletteItem').forEach(el => el.onclick = () => {
        const item = filtered[Number(el.dataset.idx)];
        closePalette();
        item.act()
    }
    );
    state.paletteItems = filtered
}
function navigatePalette(dir) {
    const items = document.querySelectorAll('.paletteItem');
    if (!items.length)
        return;
    let active = Array.from(items).findIndex(i => i.classList.contains('active'));
    active = Math.max(0, Math.min(items.length - 1, active + dir));
    items.forEach(i => i.classList.remove('active'));
    items[active].classList.add('active');
    items[active].scrollIntoView({
        block: 'nearest'
    })
}
function executePalette() {
    const active = document.querySelector('.paletteItem.active');
    if (active && state.paletteItems) {
        const item = state.paletteItems[Number(active.dataset.idx)];
        closePalette();
        item.act()
    }
}
function setLanguage(lang, persist) {
    state.lang = LANGS.includes(lang) ? lang : 'html';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.lang === state.lang));
    const buf = loadBuffer(state.lang);
    codeArea.value = buf !== null ? buf : snippets[state.lang];
    codeArea.setAttribute('data-lang', state.lang);
    state.folds.clear();
    if (persist)
        saveSession();
    refreshAll();
    flashMessage(state.lang.toUpperCase())
}
function loadBuffer(lang) {
    try {
        return localStorage.getItem(`${STORAGE}:buf:${lang}`)
    } catch {
        return null
    }
}
function saveBuffer(lang, val) {
    try {
        localStorage.setItem(`${STORAGE}:buf:${lang}`, val)
    } catch (e) {
        flashMessage('Storage full', 'error')
    }
}
function onInput() {
    pushUndo();
    state.dirty = true;
    state.redo.length = 0;
    saveBuffer(state.lang, codeArea.value);
    debouncePreview();
    refreshAll();
    scheduleSession();
    drawMinimap()
}
function pushUndo() {
    const v = codeArea.value;
    if (!state.undo.length || state.undo[state.undo.length - 1] !== v) {
        state.undo.push(v);
        if (state.undo.length > 300)
            state.undo.shift()
    }
}
function undo() {
    if (!state.undo.length)
        return;
    state.redo.push(codeArea.value);
    codeArea.value = state.undo.pop();
    syncAfterEdit()
}
function redo() {
    if (!state.redo.length)
        return;
    state.undo.push(codeArea.value);
    codeArea.value = state.redo.pop();
    syncAfterEdit()
}
function syncAfterEdit() {
    saveBuffer(state.lang, codeArea.value);
    debouncePreview();
    refreshAll();
    scheduleSession();
    drawMinimap()
}
function indentSelection(dir) {
    const s = codeArea.selectionStart
      , e = codeArea.selectionEnd
      , v = codeArea.value
      , b = v.slice(0, s)
      , m = v.slice(s, e)
      , a = v.slice(e);
    if (s === e && dir < 0) {
        const lineStart = v.lastIndexOf('\n', s - 1) + 1;
        const current = v.slice(lineStart, s);
        if (current.startsWith('  ')) {
            codeArea.value = v.slice(0, lineStart) + current.slice(2) + v.slice(s);
            codeArea.selectionStart = codeArea.selectionEnd = s - 2;
            return
        } else if (current.startsWith('\t')) {
            codeArea.value = v.slice(0, lineStart) + current.slice(1) + v.slice(s);
            codeArea.selectionStart = codeArea.selectionEnd = s - 1;
            return
        }
    }
    const lines = m.split('\n');
    if (dir > 0) {
        const ins = '  ';
        const text = lines.map(l => ins + l).join('\n');
        codeArea.value = b + text + a;
        const offset = lines.length * 2;
        codeArea.selectionStart = s;
        codeArea.selectionEnd = e + offset
    } else {
        const text = lines.map(l => l.startsWith('  ') ? l.slice(2) : l.startsWith('\t') ? l.slice(1) : l).join('\n');
        const removed = lines.reduce( (n, l) => n + (l.startsWith('  ') ? 2 : l.startsWith('\t') ? 1 : 0), 0);
        codeArea.value = b + text + a;
        codeArea.selectionStart = s;
        codeArea.selectionEnd = Math.max(s, e - removed)
    }
    syncAfterEdit()
}
function smartEnter() {
    const s = codeArea.selectionStart
      , v = codeArea.value
      , lineStart = v.lastIndexOf('\n', s - 1) + 1
      , current = v.slice(lineStart, s);
    let indent = (current.match(/^[\t ]*/) || [''])[0];
    const before = v.slice(lineStart, s).trimEnd();
    const pairs = {
        '{': '}',
        '[': ']',
        '(': ')'
    };
    let extra = '';
    let closer = '';
    if (pairs[before.slice(-1)]) {
        extra = '  ';
        closer = '\n' + indent + pairs[before.slice(-1)];
        indent += '  '
    }
    insertText('\n' + indent + extra + closer);
    if (closer)
        codeArea.selectionStart = codeArea.selectionEnd = s + 1 + indent.length
}
function insertText(t) {
    const s = codeArea.selectionStart
      , e = codeArea.selectionEnd;
    codeArea.value = codeArea.value.slice(0, s) + t + codeArea.value.slice(e);
    codeArea.selectionStart = codeArea.selectionEnd = s + t.length
}
function toggleComment() {
    const lang = state.lang
      , v = codeArea.value
      , s = codeArea.selectionStart
      , e = codeArea.selectionEnd || s;
    const lineStart = v.lastIndexOf('\n', s - 1) + 1;
    const lineEnd = v.indexOf('\n', e) === -1 ? v.length : v.indexOf('\n', e);
    const text = v.slice(lineStart, lineEnd);
    const lines = text.split('\n');
    const markers = {
        js: '//',
        css: '/*',
        html: '<!--',
        py: '#',
        c: '//',
        cpp: '//'
    };
    const marker = markers[lang] || '//';
    if (lang === 'css' && marker === '/*') {
        const blockStart = text.search(/\/\*/)
          , blockEnd = text.search(/\*\//);
        if (blockStart !== -1 && blockEnd !== -1 && blockStart < blockEnd) {
            const cleaned = text.replace(/\/\*|\*\//g, '');
            codeArea.value = v.slice(0, lineStart) + cleaned + v.slice(lineEnd);
            syncAfterEdit();
            return
        }
        const commented = '/* ' + text + ' */';
        codeArea.value = v.slice(0, lineStart) + commented + v.slice(lineEnd);
        syncAfterEdit();
        return
    }
    const allCommented = lines.every(l => l.trimStart().startsWith(marker));
    const newLines = lines.map(l => {
        if (allCommented) {
            const match = l.match(new RegExp(`^(\\s*)${escapeRx(marker)}\\s?(.*)$`));
            return match ? match[1] + match[2] : l
        } else {
            const indent = l.match(/^(\s*)/)[0];
            return indent + marker + ' ' + l.slice(indent.length)
        }
    }
    );
    codeArea.value = v.slice(0, lineStart) + newLines.join('\n') + v.slice(lineEnd);
    syncAfterEdit()
}
function escapeRx(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function duplicateLine() {
    const s = codeArea.selectionStart
      , v = codeArea.value
      , l = v.lastIndexOf('\n', s - 1) + 1
      , r = v.indexOf('\n', s);
    const end = r === -1 ? v.length : r;
    const line = v.slice(l, end);
    const selOffset = s - l;
    codeArea.selectionStart = codeArea.selectionEnd = end;
    insertText('\n' + line);
    const newPos = end + 1 + selOffset;
    codeArea.selectionStart = codeArea.selectionEnd = newPos;
    syncAfterEdit()
}
function moveLine(dir) {
    if (dir !== 1 && dir !== -1)
        return;
    const v = codeArea.value
      , s = codeArea.selectionStart
      , l = v.lastIndexOf('\n', s - 1);
    const lineStart = l + 1;
    let lineEnd = v.indexOf('\n', s);
    if (lineEnd === -1)
        lineEnd = v.length;
    const line = v.slice(lineStart, lineEnd);
    const before = v.slice(0, lineStart);
    const after = v.slice(lineEnd + 1);
    if (dir === -1) {
        if (l === -1)
            return;
        const prevLineStart = v.lastIndexOf('\n', l - 1) + 1;
        const prevLine = v.slice(prevLineStart, l);
        codeArea.value = v.slice(0, prevLineStart) + line + '\n' + prevLine + '\n' + after;
        const newPos = prevLineStart + (s - lineStart);
        codeArea.selectionStart = codeArea.selectionEnd = newPos
    } else {
        const nextLineEnd = v.indexOf('\n', lineEnd + 1);
        if (nextLineEnd === -1 && (lineEnd >= v.length || v.slice(lineEnd).trim() === ''))
            return;
        const actualNextEnd = nextLineEnd === -1 ? v.length : nextLineEnd;
        const nextLine = v.slice(lineEnd + 1, actualNextEnd);
        codeArea.value = before + nextLine + '\n' + line + (after ? '\n' + after : '');
        const newPos = lineStart + nextLine.length + 1 + (s - lineStart);
        codeArea.selectionStart = codeArea.selectionEnd = newPos
    }
    syncAfterEdit()
}
function goToLine() {
    const n = Number(prompt('Go to line:', getCurrentLine()));
    if (!n)
        return;
    const lines = codeArea.value.split('\n');
    const line = Math.max(1, Math.min(n, lines.length));
    let pos = 0;
    for (let i = 0; i < line - 1; i++)
        pos += lines[i].length + 1;
    codeArea.selectionStart = codeArea.selectionEnd = pos;
    codeArea.focus();
    syncCaret()
}
function promptSearch() {
    const q = prompt('Find:', state.search);
    if (q === null)
        return;
    state.search = q;
    runSearch()
}
function promptReplace() {
    const find = prompt('Find:', state.search);
    if (find === null)
        return;
    const rep = prompt('Replace with:', state.replace);
    if (rep === null)
        return;
    state.search = find;
    state.replace = rep;
    replaceAll()
}
function runSearch() {
    state.searchMatches = [];
    state.matchIndex = -1;
    const q = state.search;
    if (!q)
        return;
    const v = codeArea.value;
    const flags = state.regexSearch ? 'g' : 'gi';
    try {
        const re = new RegExp(state.regexSearch ? q : escapeRx(q),flags);
        let m;
        while ((m = re.exec(v)) !== -1) {
            state.searchMatches.push([m.index, m.index + m[0].length]);
            if (m[0].length === 0)
                re.lastIndex++
        }
    } catch (e) {
        flashMessage('Invalid regex', 'error');
        return
    }
    if (state.searchMatches.length) {
        state.matchIndex = 0;
        highlightMatches();
        const match = state.searchMatches[0];
        codeArea.setSelectionRange(match[0], match[1]);
        codeArea.focus();
        refreshStatus()
    } else {
        flashMessage('Not found');
        highlightMatches()
    }
}
function highlightMatches() {
    const mo = document.getElementById('editorMatchOverlay');
    if (!mo)
        return;
    const v = codeArea.value;
    let html = '';
    let last = 0;
    state.searchMatches.forEach( ([s,e], i) => {
        html += escHtml(v.slice(last, s));
        const cls = i === state.matchIndex ? 'match bracket-match' : 'match';
        html += `<span class="${cls}">${escHtml(v.slice(s, e))}</span>`;
        last = e
    }
    );
    html += escHtml(v.slice(last));
    mo.innerHTML = html
}
function replaceAll() {
    if (!state.search)
        return;
    pushUndo();
    const flags = state.regexSearch ? 'g' : 'gi';
    try {
        const re = new RegExp(state.regexSearch ? state.search : escapeRx(state.search),flags);
        codeArea.value = codeArea.value.replace(re, state.replace || '');
        syncAfterEdit()
    } catch (e) {
        flashMessage('Replace error', 'error')
    }
}
function toggleWrap() {
    state.wrap = !state.wrap;
    codeArea.style.whiteSpace = state.wrap ? 'pre-wrap' : 'pre';
    refreshAll()
}
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    saveSession()
}
function applyTheme(name) {
    const t = themes[name] || themes.dark;
    Object.entries(t).forEach( ([k,v]) => document.documentElement.style.setProperty(`--ed-${k}`, v));
    state.theme = name;
    refreshAll()
}
function applyFont(size) {
    state.fontSize = Math.max(8, Math.min(32, size));
    codeArea.style.fontSize = state.fontSize + 'px';
    highlight.style.fontSize = state.fontSize + 'px';
    foldLayer.style.fontSize = state.fontSize + 'px';
    document.getElementById('editorMatchOverlay').style.fontSize = state.fontSize + 'px';
    gutter.style.fontSize = Math.max(10, state.fontSize - 2) + 'px';
    refreshAll();
    saveSession()
}
function foldCurrent() {
    const r = getFoldRange(codeArea.selectionStart);
    if (r) {
        const key = `${r.start}:${r.end}`;
        if (state.folds.has(key))
            state.folds.delete(key);
        else
            state.folds.set(key, {
                ...r,
                collapsed: true
            });
        refreshAll()
    }
}
function unfoldCurrent() {
    foldCurrent()
}
function foldAll() {
    state.folds.clear();
    for (const r of collectFoldRanges(codeArea.value, state.lang))
        state.folds.set(`${r.start}:${r.end}`, {
            ...r,
            collapsed: true
        });
    refreshAll()
}
function unfoldAll() {
    state.folds.clear();
    refreshAll()
}
function getFoldRange(pos) {
    return collectFoldRanges(codeArea.value, state.lang).find(r => pos >= r.start && pos <= r.end) || null
}
function collectFoldRanges(text, lang) {
    const out = [];
    const lines = text.split('\n');
    const stack = [];
    let index = 0;
    const indentStack = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const start = index;
        const end = index + line.length;
        const trimmed = line.trim();
        const indent = line.length - line.trimStart().length;
        if (lang === 'py' || lang === 'yaml') {
            while (indentStack.length && indentStack[indentStack.length - 1] >= indent)
                indentStack.pop();
            if (/:\s*$/.test(line) && !line.trimStart().startsWith('#')) {
                if (i < lines.length - 1) {
                    const nextIndent = (lines[i + 1].match(/^(\s*)/) || ['', ''])[1].length;
                    if (nextIndent > indent) {
                        stack.push({
                            line: i,
                            start: index,
                            indent: indent
                        });
                        indentStack.push(indent)
                    }
                }
            }
            if (stack.length && indentStack.length === 0) {
                const open = stack.pop();
                if (i > open.line + 1)
                    out.push({
                        start: open.start,
                        end: end,
                        openLine: open.line,
                        closeLine: i
                    })
            }
        } else {
            if (/[\{\[]\s*$/.test(line) || /\b(function|class|if|else|for|while|do|switch|try|catch|finally|with|def|struct|namespace|interface|enum)\s*[{(]?$/.test(line) || /<(div|section|article|header|footer|main|nav|aside|ul|ol|table|script|style|template|block)\b/i.test(line)) {
                stack.push({
                    line: i,
                    start: index
                })
            }
            if (/[\}\]]\s*[;,]?$/.test(line) || /^\s*(end|fi|esac|done|elif|else)\b/.test(line) || /^\s*<\/(div|section|article|header|footer|main|nav|aside|ul|ol|table|script|style)\b/i.test(line) || /^\s*\#\s*end/.test(line) || /^\s*<!--\s*end/.test(line)) {
                const open = stack.pop();
                if (open && i > open.line + 1)
                    out.push({
                        start: open.start,
                        end: end,
                        openLine: open.line,
                        closeLine: i
                    })
            }
        }
        index = end + 1
    }
    while (stack.length) {
        const open = stack.pop();
        if (lines.length > open.line + 1)
            out.push({
                start: open.start,
                end: index,
                openLine: open.line,
                closeLine: lines.length - 1
            })
    }
    return out
}
function renderHighlighted() {
    const lines = codeArea.value.split('\n');
    const lang = state.lang;
    const h = [];
    const foldH = [];
    const foldSet = buildFoldLineSet();
    let idx = 0;
    const cursorLine = getCurrentLine() - 1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const active = i === cursorLine;
        h.push(`<div class="line${active ? ' active' : ''}" data-line="${i + 1}">${tokenize(line, lang)}</div>`);
        if (foldSet.has(i)) {
            const r = foldSet.get(i);
            foldH.push(`<div class="line" style="top:${i * 1.6}em"><span class="folded" data-fold-target="${r.endLine}">⋯ ${r.hiddenLines} lines</span></div>`)
        }
        idx += line.length + 1
    }
    highlight.innerHTML = h.join('');
    foldLayer.innerHTML = foldH.join('');
    bindFoldClicks();
    updateActiveLine(cursorLine);
    if (state.searchMatches.length)
        highlightMatches()
}
function buildFoldLineSet() {
    const map = new Map();
    for (const r of state.folds.values()) {
        const hidden = Math.max(0, r.closeLine - r.openLine - 1);
        if (hidden > 0)
            map.set(r.openLine, {
                endLine: r.closeLine + 1,
                hiddenLines: hidden
            })
    }
    return map
}
function bindFoldClicks() {
    foldLayer.querySelectorAll('.folded').forEach(el => {
        el.onclick = () => {
            const t = Number(el.dataset.foldTarget);
            for (const [k,v] of state.folds)
                if (v.closeLine === t - 1) {
                    state.folds.delete(k);
                    break
                }
            refreshAll()
        }
    }
    )
}
function tokenize(line, lang) {
    const esc = s => s.replace(/[&<>]/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }[m]));
    let out = esc(line);
    const rules = {
        html: [[/(&lt;!--[\s\S]*?--&gt;)/g, 'token-com'], [/(&lt;\/?)([a-zA-Z][\w:-]*)([^&gt;]*?)(\/?&gt;)/g, '$1<span class="token-tag">$2</span>$3$4'], [/\s([a-zA-Z-:]+)(=)/g, ' <span class="token-attr">$1</span>$2'], [/(".*?")/g, '<span class="token-str">$1</span>']],
        css: [[/\/\*[\s\S]*?\*\//g, 'token-com'], [/\b(@media|@supports|@keyframes|@import|@font-face|from|to)\b/g, 'token-pre'], [/\b([a-z-]+)(?=\s*:)/g, 'token-key'], [/\b(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|\d+(\.\d+)?(px|em|rem|%|vh|vw|deg|s|ms)?)\b/g, 'token-num'], [/[{}]/g, 'token-del']],
        js: [[/\/\/.*$/g, 'token-com'], [/\/\*[\s\S]*?\*\//g, 'token-com'], [/\b(const|let|var|function|class|if|else|for|while|return|switch|case|break|continue|new|try|catch|throw|import|from|export|default|async|await|typeof|instanceof|this|super|extends|static|get|set)\b/g, 'token-kw'], [/\b(true|false|null|undefined)\b/g, 'token-pre'], [/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, 'token-str'], [/\b\d+(\.\d+)?\b/g, 'token-num'], [/[=+\-*/%&|^~!<>?:]+/g, 'token-op'], [/[{}()[\];,.]/g, 'token-del']],
        py: [[/#.*$/g, 'token-com'], [/\b(def|class|return|if|elif|else|for|while|break|continue|import|from|as|pass|with|lambda|try|except|finally|yield|async|await|in|is|not|and|or|None|True|False)\b/g, 'token-kw'], [/(['"])(?:\\.|(?!\1)[^\\])*\1/g, 'token-str'], [/\b\d+(\.\d+)?\b/g, 'token-num'], [/[=+\-*/%&|^~!<>?:]+/g, 'token-op'], [/[()[\]{},.:;]/g, 'token-del']],
        c: [[/\/\/.*$/g, 'token-com'], [/\/\*[\s\S]*?\*\//g, 'token-com'], [/\b(int|float|double|char|void|return|if|else|for|while|do|break|continue|switch|case|default|struct|typedef|enum|static|const|unsigned|signed|long|short|sizeof|volatile|extern|inline)\b/g, 'token-type'], [/(['"])(?:\\.|(?!\1)[^\\])*\1/g, 'token-str'], [/\b\d+(\.\d+)?\b/g, 'token-num'], [/[=+\-*/%&|^~!<>?:]+/g, 'token-op'], [/[{}()[\];,.]/g, 'token-del']],
        cpp: [[/\/\/.*$/g, 'token-com'], [/\/\*[\s\S]*?\*\//g, 'token-com'], [/\b(int|float|double|char|void|return|if|else|for|while|do|break|continue|switch|case|default|class|struct|public|private|protected|template|typename|namespace|using|std|const|static|constexpr|auto|new|delete|virtual|override|explicit|operator|friend|inline|volatile)\b/g, 'token-type'], [/\b(true|false|nullptr)\b/g, 'token-pre'], [/(['"])(?:\\.|(?!\1)[^\\])*\1/g, 'token-str'], [/\b\d+(\.\d+)?\b/g, 'token-num'], [/[=+\-*/%&|^~!<>?:]+/g, 'token-op'], [/[{}()[\];,.]/g, 'token-del']]
    };
    for (const [re,rep] of rules[lang] || [])
        out = out.replace(re, typeof rep === 'string' ? rep : `<span class="${rep}">$&</span>`);
    return out.replace(/\t/g, '  ')
}
function refreshGutter() {
    const lines = codeArea.value.split('\n').length;
    const nums = [];
    const current = getCurrentLine();
    for (let i = 1; i <= lines; i++)
        nums.push(`<div class="line${i === current ? ' active' : ''}"><span class="fold">${foldExistsAtLine(i - 1) ? '▼' : ''}</span>${i}</div>`);
    gutter.innerHTML = nums.join('');
    gutter.querySelectorAll('.fold').forEach( (el, i) => el.onclick = () => toggleFoldAtLine(i))
}
function foldExistsAtLine(n) {
    for (const r of state.folds.values())
        if (r.openLine === n)
            return true;
    return false
}
function toggleFoldAtLine(n) {
    const ranges = [...collectFoldRanges(codeArea.value, state.lang)].filter(r => r.openLine === n);
    if (!ranges.length)
        return;
    const r = ranges[0];
    const key = `${r.start}:${r.end}`;
    if (state.folds.has(key))
        state.folds.delete(key);
    else
        state.folds.set(key, {
            ...r,
            collapsed: true
        });
    refreshAll()
}
function getCurrentLine() {
    return codeArea.value.slice(0, codeArea.selectionStart).split('\n').length
}
function syncCaret() {
    state.cursor = codeArea.selectionStart;
    state.selection = [codeArea.selectionStart, codeArea.selectionEnd];
    refreshStatus();
    refreshGutter();
    renderHighlighted();
    if (state.matchBrackets)
        highlightMatchingBracket()
}
function highlightMatchingBracket() {
    const overlay = document.getElementById('editorMatchOverlay');
    if (!overlay)
        return;
    const s = codeArea.selectionStart;
    const v = codeArea.value;
    const ch = v[s];
    const pairs = {
        '(': ')',
        '[': ']',
        '{': '}',
        ')': '(',
        '}': '{',
        ']': '['
    };
    if (!pairs[ch]) {
        overlay.querySelectorAll('.bracket-match').forEach(e => e.remove());
        return
    }
    const close = ch === '(' || ch === '[' || ch === '{';
    const target = pairs[ch];
    let depth = 1;
    let pos = s;
    const lines = v.slice(0, s).split('\n');
    const lineNum = lines.length;
    const col = lines[lines.length - 1].length;
    while (close ? ++pos < v.length : --pos >= 0) {
        const c = v[pos];
        if (c === ch)
            depth++;
        else if (c === target)
            depth--;
        if (depth === 0) {
            const linesBefore = v.slice(0, pos).split('\n');
            const tLine = linesBefore.length;
            const tCol = linesBefore[linesBefore.length - 1].length;
            const charWidth = state.fontSize * 0.6;
            const lineHeight = state.fontSize * 1.6;
            const left = Math.min(col, tCol) * charWidth;
            const top = Math.min(lineNum, tLine) * lineHeight;
            const width = Math.abs(col - tCol) * charWidth + state.fontSize;
            const height = Math.abs(lineNum - tLine) * lineHeight + lineHeight;
            const mark = document.createElement('span');
            mark.className = 'bracket-match';
            mark.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${lineHeight}px;pointer-events:none;`;
            overlay.appendChild(mark);
            setTimeout( () => mark.remove(), 300);
            return
        }
    }
}
function updateActiveLine(lineIdx) {
    const al = document.getElementById('editorActiveLine');
    if (al)
        al.style.top = (lineIdx * state.fontSize * 1.6 + 12) + 'px'
}
function syncScroll() {
    const st = codeArea.scrollTop;
    gutter.scrollTop = st;
    highlight.scrollTop = st;
    foldLayer.scrollTop = st;
    document.getElementById('editorMatchOverlay').scrollTop = st;
    drawMinimapViewport()
}
function debouncePreview() {
    clearTimeout(state.previewTimer);
    state.previewTimer = setTimeout(renderPreview, state.previewMs)
}
function renderPreview() {
    if (state.lang === 'py' || state.lang === 'c' || state.lang === 'cpp') {
        flashMessage(`Preview not available for ${state.lang.toUpperCase()}`);
        return
    }
    const d = preview.contentDocument || preview.contentWindow.document;
    const html = state.lang === 'html' ? codeArea.value : loadBuffer('html') || snippets.html;
    const css = state.lang === 'css' ? codeArea.value : loadBuffer('css') || snippets.css;
    const js = state.lang === 'js' ? codeArea.value : loadBuffer('js') || snippets.js;
    d.open();
    d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`);
    d.close();
    state.lastSave = Date.now();
    state.dirty = false;
    refreshStatus();
    flashMessage('Preview updated')
}
function drawMinimap() {
    const c = minimap.querySelector('canvas');
    if (!c)
        return;
    const ctx = c.getContext('2d');
    const h = codeArea.scrollHeight;
    c.height = h;
    c.width = minimap.clientWidth;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ed-gutter');
    ctx.fillRect(0, 0, c.width, h);
    const lines = codeArea.value.split('\n');
    const lh = state.fontSize * 1.6;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ed-muted');
    ctx.font = `${state.fontSize * 0.5}px monospace`;
    lines.forEach( (line, i) => {
        if (i * lh > h)
            return;
        ctx.fillText(line.slice(0, 40), 2, i * lh + lh * 0.7)
    }
    );
    drawMinimapViewport()
}
function drawMinimapViewport() {
    const c = minimap.querySelector('canvas');
    if (!c)
        return;
    const ctx = c.getContext('2d');
    const vp = codeArea.clientHeight;
    const st = codeArea.scrollTop;
    const h = c.height;
    ctx.fillStyle = 'rgba(59,130,246,0.2)';
    ctx.fillRect(0, st, c.width, Math.min(vp, h - st))
}
function refreshStatus() {
    const stat = (id, val) => {
        const el = document.getElementById(id);
        if (el)
            el.textContent = val
    }
    ;
    stat('statLang', state.lang.toUpperCase());
    stat('statTheme', state.theme);
    stat('statPos', `Ln ${getCurrentLine()}, Col ${codeArea.selectionStart - codeArea.value.lastIndexOf('\n', codeArea.selectionStart - 1)}`);
    stat('statSel', `${Math.abs(state.selection[1] - state.selection[0])} chars`);
    stat('statLines', `${codeArea.value.split('\n').length} lines`);
    stat('statFold', `${state.folds.size} folds`);
    stat('statSave', state.dirty ? '● modified' : '✓ saved')
}
function scheduleSession() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(saveSession, 1200)
}
function saveSession() {
    try {
        const data = {
            lang: state.lang,
            theme: state.theme,
            fontSize: state.fontSize,
            wrap: state.wrap,
            autoClose: state.autoClose,
            matchBrackets: state.matchBrackets,
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE, JSON.stringify(data));
        state.dirty = false;
        refreshStatus()
    } catch (e) {
        console.error('Save failed', e)
    }
}
function restoreSession() {
    try {
        const raw = localStorage.getItem(STORAGE);
        if (!raw)
            return;
        const s = JSON.parse(raw);
        if (s.theme)
            state.theme = s.theme;
        if (s.fontSize)
            state.fontSize = s.fontSize;
        if (typeof s.wrap === 'boolean')
            state.wrap = s.wrap;
        if (typeof s.autoClose === 'boolean')
            state.autoClose = s.autoClose;
        if (typeof s.matchBrackets === 'boolean')
            state.matchBrackets = s.matchBrackets;
        if (s.lang && LANGS.includes(s.lang))
            state.lang = s.lang
    } catch (e) {}
}
function startAutoSave() {
    setInterval( () => {
        if (state.dirty)
            saveSession()
    }
    , 5000)
}
function download() {
    const blob = new Blob([codeArea.value],{
        type: 'text/plain'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `script.${state.lang}`;
    a.click();
    setTimeout( () => URL.revokeObjectURL(a.href), 1000)
}
function loadFile() {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = '.txt,.js,.html,.css,.py,.c,.cpp,.h,.json,.md';
    i.onchange = async () => {
        const f = i.files && i.files[0];
        if (!f)
            return;
        const ext = f.name.split('.').pop();
        if (LANGS.includes(ext))
            setLanguage(ext, false);
        codeArea.value = await f.text();
        syncAfterEdit();
        flashMessage(`Loaded ${f.name}`)
    }
    ;
    i.click()
}
function onDrop(e) {
    e.preventDefault();
    codeArea.style.background = '';
    const f = e.dataTransfer.files[0];
    if (!f)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        const ext = f.name.split('.').pop();
        if (LANGS.includes(ext))
            setLanguage(ext, false);
        codeArea.value = reader.result;
        syncAfterEdit();
        flashMessage(`Loaded ${f.name}`)
    }
    ;
    reader.readAsText(f)
}
function flashMessage(msg, type='info') {
    const s = document.getElementById('statSave');
    if (!s)
        return;
    const orig = s.textContent;
    s.textContent = msg;
    if (type === 'error')
        s.parentElement.classList.add('error');
    setTimeout( () => {
        s.textContent = orig;
        s.parentElement.classList.remove('error')
    }
    , 2000)
}
function escHtml(s) {
    return s.replace(/[&<>]/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }[m]))
}
function refreshAll() {
    refreshGutter();
    renderHighlighted();
    syncScroll();
    refreshStatus();
    drawMinimap()
}
boot();
