chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.getPlatformInfo((info) => {
        const isMac = info.os === 'mac';
        const defaultShortcut = {
            key: 'E',
            ctrl: !isMac,
            meta: isMac,
            alt: false,
            shift: false
        };

        chrome.storage.local.get('configs', (data) => {
            const configs = data.configs || [];

            // 防止重复添加
            const exists = configs.some(cfg =>
                cfg.shortcut.key === 'E' &&
                (cfg.shortcut.ctrl === defaultShortcut.ctrl || cfg.shortcut.meta === defaultShortcut.meta) &&
                cfg.targetLang === 'en'
            );

            if (!exists) {
                const defaultConfig = {
                    id: Date.now(),
                    shortcut: defaultShortcut,
                    targetLang: 'en'
                };
                chrome.storage.local.set({ configs: [...configs, defaultConfig] });
            }
        });
    });
});
