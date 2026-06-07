let enabled = true;

// ─── Get theme accent color ──────────────────────────────────────
async function getThemeColor() {
    try {
        const theme = await browser.theme.getCurrent();
        if (theme && theme.colors) {
            return theme.colors.popup_highlight ||
                   theme.colors.tab_selected ||
                   theme.colors.toolbar_field_focus_border_bottom ||
                   theme.colors.button_background_active ||
                   theme.colors.icons_attention ||
                   theme.colors.tab_loading ||
                   null;
        }
    } catch (e) {}
    return null;
}

// ─── Get the effective accent color (custom > theme > default) ───
async function getEffectiveColor() {
    const storage = await browser.storage.local.get("keylockCustomColor");
    if (storage && storage.keylockCustomColor) {
        return storage.keylockCustomColor;
    }
    const theme = await getThemeColor();
    return theme || "#aac8ff";
}

// ─── Broadcast to all tabs ───────────────────────────────────────
async function broadcastToAllTabs(message) {
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, message).catch(() => {});
    }
}

// ─── Message handler ─────────────────────────────────────────────
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message) return;

    if (message.action === "getState") {
        Promise.all([
            getThemeColor(),
            getEffectiveColor()
        ]).then(([themeColor, effectiveColor]) => {
            sendResponse({
                enabled,
                themeColor,
                effectiveColor
            });
        });
        return true; // Async response
    }

    if (message.action === "toggleEnabled") {
        enabled = !enabled;
        broadcastToAllTabs({ toggle: enabled });
        sendResponse({ enabled });
    }

    if (message.action === "setPosition") {
        browser.storage.local.set({ keylockPosition: message.corner });
        broadcastToAllTabs({ updatePosition: message.corner });
    }

    if (message.action === "setColor") {
        broadcastToAllTabs({ updateColor: message.color });
    }
});

// ─── Theme change listener ───────────────────────────────────────
browser.theme.onUpdated.addListener(async () => {
    // Only push new theme color if user hasn't set a custom one
    const storage = await browser.storage.local.get("keylockCustomColor");
    if (!storage || !storage.keylockCustomColor) {
        const color = await getThemeColor();
        if (color) {
            broadcastToAllTabs({ updateColor: color });
        }
    }
});
