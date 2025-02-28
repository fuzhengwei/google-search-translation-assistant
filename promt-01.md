{
"manifest_version": 3,
"name": "谷歌，中文搜索转英文（Ctrl/Command + E）",
"version": "1.0",
"description": "将谷歌搜索中的中文关键词转换为英文",
"permissions": ["activeTab", "commands", "scripting"],
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
"description": "将中文搜索转换为英文"
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
]
}

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.action === "translate") {
const searchInput = document.querySelector('textarea[name="q"], input[name="q"]');
if (!searchInput) return;

    // 选中所有文本
    searchInput.select();

    // 获取选中文本（或整个值）
    const selectedText = window.getSelection().toString() || searchInput.value;

    if (selectedText.trim()) {
      translateText(selectedText)
        .then(translatedText => {
          // 替换为翻译结果
          searchInput.value = translatedText;
          // 自动提交搜索（可选）
          searchInput.form?.submit();
        })
        .catch(error => console.error('翻译失败:', error));
    }
}
});

function translateText(text) {
return new Promise((resolve, reject) => {
const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-CN|en`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.responseStatus === 200 && data.responseData) {
          resolve(data.responseData.translatedText);
        } else {
          reject(new Error('翻译失败，请重试'));
        }
      })
      .catch(error => reject(error));
});
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="options.css">
</head>
<body>
<div class="container">
    <h2>使用说明</h2>
    <h4>1. 谷歌搜索输入中文</h4>
    <h4>2. Ctrl/Command + E 转换为英文搜索</h4>
    <div id="weather-info" class="weather-card">
    </div>
</div>
<script src="content.js"></script>
</body>
</html>

修改代码
1. 我希望可以用户自己配置，什么快捷键，转换为什么语言。如；中文可以转换为，英美法德日意奥俄语言。
2. 注意，支持同时存在任意一个用户配置的快捷键和对应的转换。用户在键盘摁快捷键，自动录入输入框。
3. 进入配置页，可以看到当前已经存在的配置。允许用户手动删除已经配置的快捷键。
4. 把配置保存到浏览器里，用户可以增加不同的语言转换的快捷键。
5. 提供使用说明：告知用户，打开谷歌浏览器，输入内容后，摁对应快捷键可以转换为需要的语言进行搜索。
6. 转换语言提供单独的选项页面进行配置，注意UI要美化。同时展示作者：小傅哥，版本 v1.0