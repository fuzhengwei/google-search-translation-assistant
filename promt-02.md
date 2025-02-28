{
"manifest_version": 3,
"name": "谷歌搜索语言转换工具",
"version": "1.0",
"description": "将谷歌搜索中的关键词转换为用户指定的语言",
"permissions": ["activeTab", "commands", "scripting", "storage"],
"host_permissions": ["https://api.mymemory.translated.net/*"],
"background": {
"service_worker": "background.js"
},
"commands": {
"translate": {
"suggested_key": {
"default": "Ctrl+E",
"mac": "Command+E"
},
"description": "将搜索关键词转换为指定语言"
}
},
"icons": {
"128": "icon.png"
},
"content_scripts": [
{
"matches": ["*://www.google.com/*"],
"js": ["content.js"]
}
],
"options_ui": {
"page": "options.html",
"open_in_tab": true
}
}

options.js

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
en: '英语', fr: '法语', de: '德语', ja: '日语', ru: '俄语'
};
return langs[code] || code;
}

options.html

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>搜索转换配置</title>
    <link rel="stylesheet" href="options.css">
</head>
<body>
<div class="container">
    <h1>多语言搜索转换配置</h1>

    <div class="config-form">
        <div class="form-group">
            <label>快捷键组合：</label>
            <input type="text" id="hotkeyInput" placeholder="按下组合键（如 Ctrl/Command+E）" readonly>
            <div class="modifiers">
                <label><input type="checkbox" id="ctrlCheck"> Ctrl</label>
                <label><input type="checkbox" id="altCheck"> Alt</label>
                <label><input type="checkbox" id="shiftCheck"> Shift</label>
                <label><input type="checkbox" id="cmdCheck"> Cmd</label>
            </div>
        </div>

        <div class="form-group">
            <label>转目标语言：</label>
            <select id="langSelect">
                <option value="en">英语</option>
                <option value="fr">法语</option>
                <option value="de">德语</option>
                <option value="ja">日语</option>
                <option value="ru">俄语</option>
            </select>
        </div>

        <button id="addBtn">添加配置</button>
    </div>

    <div class="config-list">
        <h2>当前配置</h2>
        <table>
            <thead>
            <tr>
                <th>快捷键</th>
                <th>目标语言</th>
                <th>操作</th>
            </tr>
            </thead>
            <tbody id="configTable"></tbody>
        </table>
    </div>

    <div class="footer">
        <p>作者：小傅哥 | 版本 v1.0</p>
        <p>使用说明：在Google搜索页面输入内容后，按下配置的快捷键即可自动转换</p>
    </div>
</div>
<script src="options.js"></script>
</body>
</html>

content.js

let configs = [];

// 加载配置
chrome.storage.local.get('configs', (data) => {
configs = data.configs || [];
});

// 监听配置变化
chrome.storage.onChanged.addListener((changes) => {
if (changes.configs) {
configs = changes.configs.newValue || [];
}
});

// 快捷键监听
document.addEventListener('keydown', (e) => {
const searchInput = document.querySelector('textarea[name="q"], input[name="q"]');
if (!searchInput || searchInput !== document.activeElement) return;

configs.forEach(config => {
const { key, ctrl, alt, shift, meta } = config.shortcut;
if (
e.key.toUpperCase() === key.toUpperCase() &&
e.ctrlKey === ctrl &&
e.altKey === alt &&
e.shiftKey === shift &&
e.metaKey === meta
) {
e.preventDefault();
translateAndSubmit(searchInput, config.targetLang);
}
});
});

async function translateAndSubmit(input, targetLang) {
try {
const translated = await translateText(input.value, targetLang);
input.value = translated;
input.form?.submit();
} catch (error) {
console.error('翻译失败:', error);
}
}

function translateText(text, targetLang) {
return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-CN|${targetLang}`)
.then(res => res.json())
.then(data => {
if (data.responseStatus === 200) return data.responseData.translatedText;
throw new Error('翻译失败');
});
}

修改以上代码，
1. 转目标语言，增加中文
2. 安装插件默认支持Ctrl/Command + E 转换为英文