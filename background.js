let enabled = true;

// Set initial badge state on startup
updateBadge();

browser.browserAction.onClicked.addListener((tab) => {
    enabled = !enabled;
    updateBadge();

    // Broadcast toggle message to all tabs
    browser.tabs.query({}, (tabs) => {
        for (let t of tabs) {
            browser.tabs.sendMessage(t.id, { toggle: enabled }).catch(() => {
                // Ignore errors from tabs where content script is not loaded
            });
        }
    });
});

// Respond to state queries from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === "getState") {
        sendResponse({ enabled: enabled });
    }
});

function updateBadge() {
    browser.browserAction.setBadgeText({ text: enabled ? "ON" : "OFF" });
    browser.browserAction.setBadgeBackgroundColor({ color: enabled ? "#22c55e" : "#ef4444" });
}
