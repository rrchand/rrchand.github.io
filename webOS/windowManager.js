/* Window manager: creation, focus, movement, resizing, snapping and taskbar tracking. */
(function () {
  const state = window.NovaState.state;
  const layer = () => document.getElementById("window-layer");
  const taskbarApps = () => document.getElementById("taskbar-apps");
  const snapPreview = () => document.getElementById("snap-preview");

  function openApp(appId, appState) {
    const app = window.NovaApps.get(appId);
    if (!app) return;
    const id = `win-${state.nextWindowId++}`;
    const offset = (state.windows.length % 8) * 26;
    const win = {
      id, appId, appState: appState || {}, title: appState?.title || app.name,
      x: Math.min(160 + offset, window.innerWidth - 360), y: Math.min(90 + offset, window.innerHeight - 320),
      width: Math.min(760, window.innerWidth - 40), height: Math.min(520, window.innerHeight - 100),
      minimized: false, maximized: false, z: ++state.zIndex
    };
    state.windows.push(win);
    renderWindow(win);
    focusWindow(id);
    renderTaskbar();
    rememberRecent(appId);
  }

  function renderWindow(win) {
    const app = window.NovaApps.get(win.appId);
    const el = document.createElement("section");
    el.className = "window";
    el.dataset.windowId = win.id;
    el.style.left = `${win.x}px`;
    el.style.top = `${win.y}px`;
    el.style.width = `${win.width}px`;
    el.style.height = `${win.height}px`;
    el.style.zIndex = win.z;
    el.innerHTML = `
      <header class="window-titlebar">
        <span class="window-app-icon">${app.icon}</span>
        <span class="window-title">${win.title}</span>
        <div class="window-controls">
          <button class="window-control" data-control="minimize" title="Minimize">–</button>
          <button class="window-control" data-control="maximize" title="Maximize">□</button>
          <button class="window-control close" data-control="close" title="Close">×</button>
        </div>
      </header>
      <div class="window-content"></div>
      <div class="resize-handle"></div>`;
    layer().appendChild(el);
    app.render(el.querySelector(".window-content"), win);
    wireWindow(el, win);
  }

  function wireWindow(el, win) {
    el.addEventListener("pointerdown", () => focusWindow(win.id));
    el.querySelector('[data-control="close"]').onclick = () => closeWindow(win.id);
    el.querySelector('[data-control="minimize"]').onclick = () => minimizeWindow(win.id);
    el.querySelector('[data-control="maximize"]').onclick = () => toggleMaximize(win.id);
    el.querySelector(".window-titlebar").addEventListener("pointerdown", e => startDrag(e, win));
    el.querySelector(".resize-handle").addEventListener("pointerdown", e => startResize(e, win));
  }

  function focusWindow(id) {
    const win = state.windows.find(w => w.id === id);
    if (!win) return;
    win.minimized = false;
    win.z = ++state.zIndex;
    state.activeWindowId = id;
    document.querySelectorAll(".window").forEach(el => {
      const active = el.dataset.windowId === id;
      el.classList.toggle("focused", active);
      if (active) {
        el.classList.remove("hidden");
        el.style.zIndex = win.z;
      }
    });
    renderTaskbar();
  }

  function closeWindow(id) {
    const el = document.querySelector(`[data-window-id="${id}"]`);
    if (el) el.remove();
    state.windows = state.windows.filter(w => w.id !== id);
    if (state.activeWindowId === id) state.activeWindowId = state.windows.at(-1)?.id || null;
    renderTaskbar();
  }

  function minimizeWindow(id) {
    const win = state.windows.find(w => w.id === id);
    const el = document.querySelector(`[data-window-id="${id}"]`);
    if (!win || !el) return;
    win.minimized = true;
    el.classList.add("hidden");
    if (state.activeWindowId === id) state.activeWindowId = null;
    renderTaskbar();
  }

  function toggleMaximize(id) {
    const win = state.windows.find(w => w.id === id);
    const el = document.querySelector(`[data-window-id="${id}"]`);
    if (!win || !el) return;
    if (!win.maximized) {
      win.restore = { x: win.x, y: win.y, width: win.width, height: win.height };
      applyBounds(win, 0, 0, window.innerWidth, window.innerHeight - 74);
      win.maximized = true;
      el.classList.add("maximized");
    } else {
      const r = win.restore || { x: 120, y: 80, width: 760, height: 520 };
      applyBounds(win, r.x, r.y, r.width, r.height);
      win.maximized = false;
      el.classList.remove("maximized");
    }
  }

  function applyBounds(win, x, y, width, height) {
    Object.assign(win, { x, y, width, height });
    const el = document.querySelector(`[data-window-id="${win.id}"]`);
    if (el) Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` });
  }

  function startDrag(e, win) {
    if (e.target.closest("button")) return;
    focusWindow(win.id);
    if (win.maximized) toggleMaximize(win.id);
    const startX = e.clientX, startY = e.clientY, origX = win.x, origY = win.y;
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = ev => {
      const x = Math.max(0, Math.min(window.innerWidth - 120, origX + ev.clientX - startX));
      const y = Math.max(0, Math.min(window.innerHeight - 90, origY + ev.clientY - startY));
      applyBounds(win, x, y, win.width, win.height);
      showSnap(ev.clientX, ev.clientY);
    };
    const up = ev => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      applySnap(win, ev.clientX, ev.clientY);
      snapPreview().classList.add("hidden");
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  function startResize(e, win) {
    e.preventDefault();
    focusWindow(win.id);
    const startX = e.clientX, startY = e.clientY, startW = win.width, startH = win.height;
    const move = ev => applyBounds(win, win.x, win.y, Math.max(320, startW + ev.clientX - startX), Math.max(230, startH + ev.clientY - startY));
    const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  function showSnap(x, y) {
    const p = snapPreview();
    const h = window.innerHeight - 74;
    if (y < 8) setPreview(0, 0, window.innerWidth, h);
    else if (x < 8) setPreview(0, 0, window.innerWidth / 2, h);
    else if (x > window.innerWidth - 8) setPreview(window.innerWidth / 2, 0, window.innerWidth / 2, h);
    else p.classList.add("hidden");
  }

  function setPreview(x, y, w, h) {
    const p = snapPreview();
    Object.assign(p.style, { left: `${x + 8}px`, top: `${y + 8}px`, width: `${w - 16}px`, height: `${h - 16}px` });
    p.classList.remove("hidden");
  }

  function applySnap(win, x, y) {
    const h = window.innerHeight - 74;
    if (y < 8) { applyBounds(win, 0, 0, window.innerWidth, h); win.maximized = true; }
    else if (x < 8) applyBounds(win, 0, 0, window.innerWidth / 2, h);
    else if (x > window.innerWidth - 8) applyBounds(win, window.innerWidth / 2, 0, window.innerWidth / 2, h);
  }

  function renderTaskbar() {
    const host = taskbarApps();
    host.innerHTML = "";
    state.windows.forEach(win => {
      const app = window.NovaApps.get(win.appId);
      const button = document.createElement("button");
      button.className = `taskbar-button taskbar-app ${state.activeWindowId === win.id ? "active" : ""} ${win.minimized ? "minimized" : ""}`;
      button.innerHTML = `<span>${app.icon}</span><span class="label">${win.title}</span>`;
      button.onclick = () => focusWindow(win.id);
      host.appendChild(button);
    });
  }

  function rememberRecent(appId) {
    const recent = state.persisted.recentApps.filter(id => id !== appId);
    recent.unshift(appId);
    state.persisted.recentApps = recent.slice(0, 8);
    window.NovaState.save();
  }

  window.NovaWindows = { openApp, focusWindow, closeWindow, minimizeWindow, toggleMaximize, renderTaskbar };
})();
