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
    // 动态设置源语言：转换到中文时自动检测源语言，其他情况从中文转出
    const sourceLang = targetLang === 'zh-CN' ? 'auto' : 'zh-CN';
    return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`)
        .then(res => res.json())
        .then(data => {
            if (data.responseStatus === 200) return data.responseData.translatedText;
            throw new Error('翻译失败');
        });
}
