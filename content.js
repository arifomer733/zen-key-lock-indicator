const TOAST_ID = "zen-keylock-toast";
const STYLE_ID = "zen-keylock-style";

let activeCorner = "bottom-left";
let isEnabled = true;
let isDismissed = false;
let fadeTimeout = null;

let states = {
    CapsLock: false,
    NumLock: false,
    ScrollLock: false
};

// ─── CSS Styles ──────────────────────────────────────────────────
function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    #${TOAST_ID} {
      position: fixed;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(18, 18, 18, 0.85) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      padding: 8px 14px !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      color: #ffffff !important;
      transition: opacity 0.25s ease, transform 0.25s ease !important;
      user-select: none !important;
      opacity: 0;
      pointer-events: none;
      font-size: 12px !important;
    }

    #${TOAST_ID}.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* Positions */
    #${TOAST_ID}.top-left { top: 24px !important; left: 24px !important; transform: translateY(-10px); }
    #${TOAST_ID}.top-right { top: 24px !important; right: 24px !important; transform: translateY(-10px); }
    #${TOAST_ID}.bottom-left { bottom: 24px !important; left: 24px !important; transform: translateY(10px); }
    #${TOAST_ID}.bottom-right { bottom: 24px !important; right: 24px !important; transform: translateY(10px); }

    #${TOAST_ID}.visible.top-left,
    #${TOAST_ID}.visible.top-right,
    #${TOAST_ID}.visible.bottom-left,
    #${TOAST_ID}.visible.bottom-right {
      transform: translateY(0);
    }

    /* Indicators */
    .zen-keylock-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .zen-keylock-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px !important;
      background: rgba(255, 255, 255, 0.06) !important;
      border: 1px solid rgba(255, 255, 255, 0.04) !important;
      border-radius: 6px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      font-size: 11px !important;
      color: rgba(255, 255, 255, 0.4) !important;
      transition: all 0.2s ease !important;
    }

    .zen-keylock-badge.active {
      background: rgba(34, 197, 94, 0.15) !important;
      border-color: rgba(34, 197, 94, 0.3) !important;
      color: #22c55e !important;
    }

    .zen-keylock-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease !important;
    }

    .zen-keylock-badge.active .zen-keylock-dot {
      background: #22c55e !important;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.6) !important;
    }

    /* Corner Selector Grid */
    .zen-keylock-grid {
      display: grid;
      grid-template-columns: repeat(2, 8px);
      gap: 4px;
      border-left: 1px solid rgba(255, 255, 255, 0.15);
      padding-left: 10px;
    }

    .zen-keylock-cell {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      cursor: pointer;
      transition: background 0.15s ease !important;
    }

    .zen-keylock-cell:hover {
      background: rgba(255, 255, 255, 0.6) !important;
    }

    .zen-keylock-cell.active {
      background: #22c55e !important;
    }

    /* Close button */
    .zen-keylock-close {
      background: none !important;
      border: none !important;
      color: rgba(255, 255, 255, 0.4) !important;
      font-size: 16px !important;
      cursor: pointer !important;
      padding: 0 !important;
      margin: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50% !important;
      transition: all 0.2s ease !important;
    }

    .zen-keylock-close:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
  `;
    (document.head || document.documentElement).appendChild(style);
}

// ─── DOM Toast Creation ──────────────────────────────────────────
function createToast() {
    if (document.getElementById(TOAST_ID)) return;

    const toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.className = `${activeCorner}`;

    toast.innerHTML = `
    <div class="zen-keylock-container">
      <div class="zen-keylock-badge" id="zen-badge-caps">
        <div class="zen-keylock-dot"></div>CAPS
      </div>
      <div class="zen-keylock-badge" id="zen-badge-num">
        <div class="zen-keylock-dot"></div>NUM
      </div>
      <div class="zen-keylock-badge" id="zen-badge-scroll">
        <div class="zen-keylock-dot"></div>SCRL
      </div>
    </div>
    
    <div class="zen-keylock-grid" title="Position Toast">
      <div class="zen-keylock-cell" data-corner="top-left" title="Top Left"></div>
      <div class="zen-keylock-cell" data-corner="top-right" title="Top Right"></div>
      <div class="zen-keylock-cell" data-corner="bottom-left" title="Bottom Left"></div>
      <div class="zen-keylock-cell" data-corner="bottom-right" title="Bottom Right"></div>
    </div>

    <button class="zen-keylock-close" title="Dismiss Toast">&times;</button>
  `;

    document.documentElement.appendChild(toast);

    // Click to reposition
    toast.querySelectorAll(".zen-keylock-cell").forEach(cell => {
        cell.addEventListener("click", () => {
            const corner = cell.getAttribute("data-corner");
            updatePosition(corner);
        });
    });

    // Close button click
    toast.querySelector(".zen-keylock-close").addEventListener("click", () => {
        dismissToast();
    });

    // Hover prevents fading out
    toast.addEventListener("mouseenter", () => {
        clearTimeout(fadeTimeout);
    });
    toast.addEventListener("mouseleave", () => {
        startFadeTimer(1500);
    });

    updateUI();
}

// ─── Update position ──────────────────────────────────────────────
function updatePosition(corner) {
    activeCorner = corner;
    const toast = document.getElementById(TOAST_ID);
    if (toast) {
        toast.className = `${activeCorner} visible`;
        // Update active dot in grid
        toast.querySelectorAll(".zen-keylock-cell").forEach(cell => {
            if (cell.getAttribute("data-corner") === corner) {
                cell.classList.add("active");
            } else {
                cell.classList.remove("active");
            }
        });
    }

    // Save preference to extension storage
    browser.storage.local.set({ keylockPosition: corner }).catch(() => {});
}

// ─── Update Indicators UI ─────────────────────────────────────────
function updateUI() {
    const toast = document.getElementById(TOAST_ID);
    if (!toast) return;

    const badges = {
        CapsLock: document.getElementById("zen-badge-caps"),
        NumLock: document.getElementById("zen-badge-num"),
        ScrollLock: document.getElementById("zen-badge-scroll")
    };

    for (let key in badges) {
        if (badges[key]) {
            if (states[key]) {
                badges[key].classList.add("active");
            } else {
                badges[key].classList.remove("active");
            }
        }
    }

    // Also update grid active cell status
    toast.querySelectorAll(".zen-keylock-cell").forEach(cell => {
        if (cell.getAttribute("data-corner") === activeCorner) {
            cell.classList.add("active");
        } else {
            cell.classList.remove("active");
        }
    });
}

// ─── Show / Hide / Fade ───────────────────────────────────────────
function showToast() {
    if (!isEnabled || isDismissed) return;

    createToast();
    const toast = document.getElementById(TOAST_ID);
    if (toast) {
        toast.classList.add("visible");
        startFadeTimer(3000);
    }
}

function dismissToast() {
    isDismissed = true;
    const toast = document.getElementById(TOAST_ID);
    if (toast) {
        toast.classList.remove("visible");
    }
}

function startFadeTimer(duration) {
    clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
        const toast = document.getElementById(TOAST_ID);
        if (toast) {
            toast.classList.remove("visible");
        }
    }, duration);
}

// ─── Lock State Detection ─────────────────────────────────────────
function checkLockStates(e) {
    if (typeof e.getModifierState !== "function") return;

    const caps = e.getModifierState("CapsLock");
    const num = e.getModifierState("NumLock");
    const scroll = e.getModifierState("ScrollLock");

    // Check if any lock states changed
    if (caps !== states.CapsLock || num !== states.NumLock || scroll !== states.ScrollLock) {
        states = { CapsLock: caps, NumLock: num, ScrollLock: scroll };
        updateUI();
        showToast();
    }
}

// ─── Enable / Disable ─────────────────────────────────────────────
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
    clearTimeout(fadeTimeout);
}

// ─── Event Listeners ──────────────────────────────────────────────
window.addEventListener("keydown", checkLockStates, { passive: true });
window.addEventListener("keyup", checkLockStates, { passive: true });
window.addEventListener("mousedown", checkLockStates, { passive: true });

// ─── Extension Messages ───────────────────────────────────────────
browser.runtime.onMessage.addListener((msg) => {
    if (msg && msg.hasOwnProperty("toggle")) {
        if (msg.toggle) enable();
        else disable();
    }
});

// ─── Initialization ──────────────────────────────────────────────
// Load saved corner preference and current extension status
Promise.all([
    browser.storage.local.get("keylockPosition"),
    browser.runtime.sendMessage({ action: "getState" })
]).then(([storage, stateResponse]) => {
    if (storage && storage.keylockPosition) {
        activeCorner = storage.keylockPosition;
    }
    if (stateResponse && stateResponse.enabled !== undefined) {
        if (stateResponse.enabled) {
            enable();
        } else {
            disable();
        }
    }
}).catch((err) => {
    console.debug("Zen Key Lock: Initialization state check failed.", err);
    enable(); // Fallback to enabled
});
