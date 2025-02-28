document.addEventListener('DOMContentLoaded', init);

function init() {
    const hotkeyInput = document.getElementById('hotkeyInput');
    const addBtn = document.getElementById('addBtn');
    let currentShortcut = { key: '', ctrl: false, alt: false, shift: false, meta: false };

    // 快捷键捕获
    hotkeyInput.addEventListener('keydown', e => {
        e.preventDefault();
        const key = e.key.toUpperCase();

        if (['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) return;

        currentShortcut = {
            key,
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey
        };

        // 更新显示
        hotkeyInput.value = formatShortcut(currentShortcut);
        document.getElementById('ctrlCheck').checked = currentShortcut.ctrl;
        document.getElementById('altCheck').checked = currentShortcut.alt;
        document.getElementById('shiftCheck').checked = currentShortcut.shift;
        document.getElementById('cmdCheck').checked = currentShortcut.meta;
    });

    // 添加配置
    addBtn.addEventListener('click', () => {
        const targetLang = document.getElementById('langSelect').value;

        chrome.storage.local.get('configs', data => {
            const newConfig = {
                id: Date.now(),
                shortcut: currentShortcut,
                targetLang
            };

            // 查重
            const exists = (data.configs || []).some(cfg =>
                cfg.shortcut.key === newConfig.shortcut.key &&
                cfg.shortcut.ctrl === newConfig.shortcut.ctrl &&
                cfg.shortcut.alt === newConfig.shortcut.alt &&
                cfg.shortcut.shift === newConfig.shortcut.shift &&
                cfg.shortcut.meta === newConfig.shortcut.meta
            );

            if (exists) {
                alert('此快捷键已存在！');
                return;
            }

            const updatedConfigs = [...(data.configs || []), newConfig];
            chrome.storage.local.set({ configs: updatedConfigs }, () => {
                renderConfigs(updatedConfigs);
                hotkeyInput.value = '';
                currentShortcut = { key: '', ctrl: false, alt: false, shift: false, meta: false };
            });
        });
    });

    // 初始渲染
    chrome.storage.local.get('configs', data => renderConfigs(data.configs || []));
}

function renderConfigs(configs) {
    const tbody = document.getElementById('configTable');
    tbody.innerHTML = configs.map(config => `
        <tr>
            <td>${formatShortcut(config.shortcut)}</td>
            <td>${getLangName(config.targetLang)}</td>
            <td>
                <button class="deleteBtn" data-id="${config.id}">删除</button>
            </td>
        </tr>
    `).join('');

    // 删除事件
    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            chrome.storage.local.get('configs', data => {
                const updated = data.configs.filter(cfg => cfg.id !== id);
                chrome.storage.local.set({ configs: updated }, () => renderConfigs(updated));
            });
        });
    });
}

function formatShortcut(shortcut) {
    return [
        shortcut.ctrl ? 'Ctrl+' : '',
        shortcut.alt ? 'Alt+' : '',
        shortcut.shift ? 'Shift+' : '',
        shortcut.meta ? 'Cmd+' : '',
        shortcut.key
    ].join('');
}

function getLangName(code) {
    const langs = {
        en: '英语',
        fr: '法语',
        de: '德语',
        ja: '日语',
        ru: '俄语',
        'zh-CN': '中文'
    };
    return langs[code] || code;
}
