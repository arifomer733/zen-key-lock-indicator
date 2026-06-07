const TOAST_ID = "zen-keylock-toast";
const STYLE_ID = "zen-keylock-style";

let activeCorner = "bottom-left";
let isEnabled = false;
let isDismissed = false;
let accentColor = "#aac8ff";

let states = {
    CapsLock: false,
    NumLock: false,
    ScrollLock: false
};

const LABELS = {
    CapsLock: "Caps Lock",
    NumLock: "Num Lock",
    ScrollLock: "Scroll Lock"
};

const ICONS = {
    CapsLock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 9h-5v5H9v-5H4z"/><rect x="9" y="19" width="6" height="2" rx="1"/></svg>`,
    NumLock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="3"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="6" x2="15" y2="6"/></svg>`,
    ScrollLock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><polyline points="8 7 12 3 16 7"/><polyline points="8 17 12 21 16 17"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`
};

// ─── CSS Styles ──────────────────────────────────────────────────
function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    @keyframes zen-toast-in-bottom {
      0%   { opacity: 0; transform: translateY(20px) scale(0.92); }
      60%  { opacity: 1; transform: translateY(-3px) scale(1.01); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes zen-toast-in-top {
      0%   { opacity: 0; transform: translateY(-20px) scale(0.92); }
      60%  { opacity: 1; transform: translateY(3px) scale(1.01); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes zen-toast-out-bottom {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(16px) scale(0.95); }
    }

    @keyframes zen-toast-out-top {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-16px) scale(0.95); }
    }

    @keyframes zen-badge-in {
      0%   { opacity: 0; transform: translateX(-8px) scale(0.85); }
      70%  { opacity: 1; transform: translateX(1px) scale(1.02); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes zen-dot-pulse {
      0%, 100% { box-shadow: 0 0 4px 1px var(--zen-glow); }
      50%      { box-shadow: 0 0 10px 3px var(--zen-glow); }
    }

    #${TOAST_ID} {
      --zen-accent: ${accentColor};
      --zen-glow: ${accentColor}66;
      position: fixed;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 0px;
      padding: 0 !important;
      border-radius: 14px !important;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
      color: #ffffff !important;
      user-select: none !important;
      pointer-events: auto;
      opacity: 0;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Glass container (inner wrapper) */
    #${TOAST_ID} .zen-toast-glass {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 8px 8px 12px !important;
      background: rgba(22, 22, 26, 0.82) !important;
      backdrop-filter: blur(20px) saturate(1.6) !important;
      -webkit-backdrop-filter: blur(20px) saturate(1.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 14px !important;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.04),
        0 8px 40px rgba(0, 0, 0, 0.45),
        0 0 20px -4px var(--zen-glow) !important;
    }

    /* Accent gradient line at top of toast */
    #${TOAST_ID} .zen-toast-glass::before {
      content: '';
      position: absolute;
      top: 0; left: 12px; right: 12px;
      height: 1.5px;
      background: linear-gradient(90deg, transparent, var(--zen-accent), transparent) !important;
      opacity: 0.7;
      border-radius: 1px;
    }

    /* Positions */
    #${TOAST_ID}.top-left     { top: 20px !important; left: 20px !important;  bottom: auto !important; right: auto !important; }
    #${TOAST_ID}.top-right    { top: 20px !important; right: 20px !important; bottom: auto !important; left: auto !important;  }
    #${TOAST_ID}.bottom-left  { bottom: 20px !important; left: 20px !important;  top: auto !important; right: auto !important; }
    #${TOAST_ID}.bottom-right { bottom: 20px !important; right: 20px !important; top: auto !important; left: auto !important;  }

    /* Animate in */
    #${TOAST_ID}.zen-in.bottom-left,
    #${TOAST_ID}.zen-in.bottom-right {
      animation: zen-toast-in-bottom 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    #${TOAST_ID}.zen-in.top-left,
    #${TOAST_ID}.zen-in.top-right {
      animation: zen-toast-in-top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    /* Animate out */
    #${TOAST_ID}.zen-out.bottom-left,
    #${TOAST_ID}.zen-out.bottom-right {
      animation: zen-toast-out-bottom 0.28s cubic-bezier(0.4, 0, 1, 1) forwards;
    }
    #${TOAST_ID}.zen-out.top-left,
    #${TOAST_ID}.zen-out.top-right {
      animation: zen-toast-out-top 0.28s cubic-bezier(0.4, 0, 1, 1) forwards;
    }

    /* Badge */
    .zen-keylock-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 5px 10px 5px 8px !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.06) !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      font-size: 11.5px !important;
      line-height: 1 !important;
      color: var(--zen-accent) !important;
      opacity: 0;
      animation: zen-badge-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .zen-keylock-badge .zen-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--zen-accent);
      opacity: 0.85;
    }

    .zen-keylock-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--zen-accent) !important;
      animation: zen-dot-pulse 2s ease-in-out infinite;
      flex-shrink: 0;
    }

    /* Close button */
    .zen-keylock-close {
      all: unset !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 22px !important;
      height: 22px !important;
      border-radius: 6px !important;
      color: rgba(255, 255, 255, 0.3) !important;
      cursor: pointer !important;
      transition: all 0.18s ease !important;
      flex-shrink: 0;
      font-size: 15px !important;
      line-height: 1 !important;
    }

    .zen-keylock-close:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
  `;
    (document.head || document.documentElement).appendChild(style);
}

// ─── Render toast with only active lock badges ───────────────────
function renderToast() {
    const activeKeys = Object.keys(states).filter(k => states[k]);

    // No locks active → dismiss toast with animation
    if (activeKeys.length === 0 || isDismissed) {
        dismissAnimated();
        return;
    }

    // Remove old toast (no animation, we rebuild)
    const old = document.getElementById(TOAST_ID);
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.className = `${activeCorner} zen-in`;

    let badgesHTML = "";
    activeKeys.forEach((key, i) => {
        const delay = i * 0.07;
        badgesHTML += `
            <div class="zen-keylock-badge" style="animation-delay: ${delay}s;">
                <span class="zen-icon">${ICONS[key]}</span>
                <span>${LABELS[key]}</span>
                <div class="zen-keylock-dot"></div>
            </div>
        `;
    });

    toast.innerHTML = `
        <div class="zen-toast-glass">
            ${badgesHTML}
            <button class="zen-keylock-close" title="Dismiss">&times;</button>
        </div>
    `;

    document.documentElement.appendChild(toast);

    toast.querySelector(".zen-keylock-close").addEventListener("click", (e) => {
        e.stopPropagation();
        isDismissed = true;
        dismissAnimated();
    });
}

function dismissAnimated() {
    const toast = document.getElementById(TOAST_ID);
    if (!toast || toast.classList.contains("zen-out")) return;

    toast.classList.remove("zen-in");
    toast.classList.add("zen-out");

    toast.addEventListener("animationend", () => {
        toast.remove();
    }, { once: true });
}

// ─── Lock State Detection ────────────────────────────────────────
function checkLockStates(e) {
    if (typeof e.getModifierState !== "function") return;

    const caps = e.getModifierState("CapsLock");
    const num = e.getModifierState("NumLock");
    const scroll = e.getModifierState("ScrollLock");

    const changed = (caps !== states.CapsLock || num !== states.NumLock || scroll !== states.ScrollLock);

    if (changed) {
        states = { CapsLock: caps, NumLock: num, ScrollLock: scroll };

        const isLockKey = e.type.startsWith("key") &&
            (e.key === "CapsLock" || e.key === "NumLock" || e.key === "ScrollLock" || e.key === "Scroll");

        if (isLockKey) {
            isDismissed = false;
        }

        if (isEnabled) renderToast();
    }
}

// ─── Enable / Disable ────────────────────────────────────────────
function enable() {
    if (isEnabled) return;
    isEnabled = true;
    injectCSS();
}

function disable() {
    isEnabled = false;
    const toast = document.getElementById(TOAST_ID);
    const style = document.getElementById(STYLE_ID);
    if (toast) toast.remove();
    if (style) style.remove();
}

// ─── Accent color update ─────────────────────────────────────────
function setAccentColor(color) {
    if (!color) return;
    accentColor = color;

    // Update CSS custom properties in existing style
    const style = document.getElementById(STYLE_ID);
    if (style) {
        style.textContent = style.textContent
            .replace(/--zen-accent:\s*[^;]+;/g, `--zen-accent: ${color};`)
            .replace(/--zen-glow:\s*[^;]+;/g, `--zen-glow: ${color}66;`);
    }

    // Re-render if visible
    if (isEnabled && !isDismissed) renderToast();
}

// ─── Color utility ───────────────────────────────────────────────
function hexToRgba(hex, alpha) {
    if (hex.startsWith("rgb")) return hex.replace(")", `, ${alpha})`).replace("rgb(", "rgba(");
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Event Listeners ─────────────────────────────────────────────
window.addEventListener("keydown", checkLockStates, { passive: true });
window.addEventListener("keyup", checkLockStates, { passive: true });
window.addEventListener("mousedown", checkLockStates, { passive: true });

// ─── Extension Messages ──────────────────────────────────────────
browser.runtime.onMessage.addListener((msg) => {
    if (!msg) return;

    if (msg.hasOwnProperty("toggle")) {
        if (msg.toggle) enable();
        else disable();
    }

    if (msg.hasOwnProperty("updatePosition")) {
        activeCorner = msg.updatePosition;
        if (isEnabled && !isDismissed) renderToast();
    }

    if (msg.hasOwnProperty("updateColor") && msg.updateColor) {
        setAccentColor(msg.updateColor);
    }

    if (msg.hasOwnProperty("themeColor") && msg.themeColor) {
        setAccentColor(msg.themeColor);
    }
});

// ─── Initialization ─────────────────────────────────────────────
Promise.all([
    browser.storage.local.get("keylockPosition"),
    browser.runtime.sendMessage({ action: "getState" })
]).then(([storage, stateResponse]) => {
    if (storage && storage.keylockPosition) {
        activeCorner = storage.keylockPosition;
    }
    if (stateResponse) {
        if (stateResponse.effectiveColor) {
            accentColor = stateResponse.effectiveColor;
        } else if (stateResponse.themeColor) {
            accentColor = stateResponse.themeColor;
        }
        if (stateResponse.enabled !== false) {
            enable();
        }
    }
}).catch(() => {
    enable();
});
