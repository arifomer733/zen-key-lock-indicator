const toggle = document.getElementById("toggle");
const cornerBtns = document.querySelectorAll(".corner-btn");
const colorDots = document.querySelectorAll(".color-dot");
const themeSync = document.getElementById("themeSync");

let themeColor = "#aac8ff"; // Fallback default

// ─── Apply accent color to the popup UI ──────────────────────────
function applyAccent(color) {
    document.body.style.setProperty("--accent", color);
    document.body.style.setProperty("--accent-bg", color + "1A");
    document.body.style.setProperty("--accent-border", color + "40");
    document.body.style.setProperty("--accent-glow", color + "30");
}

// ─── Load current state ──────────────────────────────────────────
async function init() {
    try {
        const [state, storage] = await Promise.all([
            browser.runtime.sendMessage({ action: "getState" }),
            browser.storage.local.get(["keylockPosition", "keylockCustomColor"])
        ]);

        // Apply enabled state
        if (state && !state.enabled) {
            toggle.classList.remove("active");
        }

        // Cache the active theme color
        if (state && state.themeColor) {
            themeColor = state.themeColor;
        }

        const isCustom = storage && storage.keylockCustomColor;
        const activeColor = isCustom || state.effectiveColor || themeColor || "#aac8ff";
        applyAccent(activeColor);

        // Highlight selected dot
        colorDots.forEach(dot => dot.classList.remove("active"));
        if (!isCustom) {
            themeSync.classList.add("active");
        } else {
            const hexColor = storage.keylockCustomColor.toLowerCase();
            const matchingDot = Array.from(colorDots).find(d => d.getAttribute("data-color") === hexColor);
            if (matchingDot) {
                matchingDot.classList.add("active");
            }
        }

        // Apply saved position
        const activeCorner = (storage && storage.keylockPosition) || "bottom-left";
        cornerBtns.forEach(btn => {
            if (btn.getAttribute("data-corner") === activeCorner) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    } catch (e) {
        console.debug("Popup init error:", e);
    }
}

// ─── Toggle enabled/disabled ─────────────────────────────────────
toggle.addEventListener("click", async () => {
    const result = await browser.runtime.sendMessage({ action: "toggleEnabled" });
    if (result.enabled) {
        toggle.classList.add("active");
    } else {
        toggle.classList.remove("active");
    }
});

// ─── Corner position buttons ─────────────────────────────────────
cornerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const corner = btn.getAttribute("data-corner");
        browser.runtime.sendMessage({ action: "setPosition", corner });

        cornerBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// ─── Color Palette clicks ────────────────────────────────────────
colorDots.forEach(dot => {
    dot.addEventListener("click", () => {
        colorDots.forEach(d => d.classList.remove("active"));
        dot.classList.add("active");

        if (dot === themeSync) {
            // Reset to theme color
            applyAccent(themeColor);
            browser.storage.local.remove("keylockCustomColor");
            browser.runtime.sendMessage({ action: "setColor", color: themeColor });
        } else {
            // Custom palette color
            const color = dot.getAttribute("data-color");
            applyAccent(color);
            browser.storage.local.set({ keylockCustomColor: color });
            browser.runtime.sendMessage({ action: "setColor", color });
        }
    });
});

init();
