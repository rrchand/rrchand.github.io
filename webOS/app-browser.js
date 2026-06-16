/* Offline browser/app viewer with multiple tabs. It renders safe internal pages and simple typed content. */
(function () {
  const pages = {
    "nova://home": `<h2>Nova Browser</h2><p>This offline app viewer supports tabs and internal pages.</p><p>Try <strong>nova://apps</strong>, <strong>nova://help</strong> or type any note into the address bar.</p>`,
    "nova://apps": `<h2>Available apps</h2><ul><li>File Explorer</li><li>Settings</li><li>Browser</li><li>Terminal</li></ul>`,
    "nova://help": `<h2>Help</h2><p>Drag windows by their titlebars, resize from the bottom-right corner, and right-click the desktop for quick actions.</p>`
  };

  function render(container, win) {
    win.appState.tabs = win.appState.tabs || JSON.parse(JSON.stringify(window.NovaState.state.persisted.browserTabs));
    win.appState.activeTabId = win.appState.activeTabId || window.NovaState.uid("browser-tab");
    win.appState.tabs = win.appState.tabs.map((tab, index) => tab.id ? tab : Object.assign({ id: index === 0 ? win.appState.activeTabId : window.NovaState.uid("browser-tab") }, tab));

    function activeTab() { return win.appState.tabs.find(t => t.id === win.appState.activeTabId) || win.appState.tabs[0]; }
    function persistTabs() {
      window.NovaState.state.persisted.browserTabs = win.appState.tabs.map(t => ({ title: t.title, url: t.url, html: t.html || "" }));
      window.NovaState.save();
    }
    function draw() {
      const tab = activeTab();
      container.innerHTML = `
        <div class="app-shell">
          <div class="tabs"></div>
          <div class="toolbar">
            <button class="tool-button" data-home>⌂</button>
            <input class="url-input" value="${tab.url || "nova://home"}" aria-label="Address" />
            <button class="tool-button" data-go>Go</button>
          </div>
          <div class="app-body"><main class="browser-page"></main></div>
        </div>`;
      const tabsEl = container.querySelector(".tabs");
      win.appState.tabs.forEach(t => {
        const button = document.createElement("button");
        button.className = "tab" + (t.id === win.appState.activeTabId ? " active" : "");
        button.textContent = t.title || t.url || "Tab";
        button.onclick = () => { win.appState.activeTabId = t.id; draw(); };
        button.oncontextmenu = e => {
          e.preventDefault();
          window.NovaContextMenu.show(e.clientX, e.clientY, [{ label: "Close tab", icon: "✕", action: () => {
            win.appState.tabs = win.appState.tabs.filter(tabItem => tabItem.id !== t.id);
            if (!win.appState.tabs.length) win.appState.tabs.push({ id: window.NovaState.uid("browser-tab"), title: "Home", url: "nova://home" });
            win.appState.activeTabId = win.appState.tabs[0].id;
            persistTabs();
            draw();
          }}]);
        };
        tabsEl.appendChild(button);
      });
      const add = document.createElement("button");
      add.className = "tab tab-add";
      add.textContent = "+";
      add.onclick = () => { const id = window.NovaState.uid("browser-tab"); win.appState.tabs.push({ id, title: "Home", url: "nova://home" }); win.appState.activeTabId = id; persistTabs(); draw(); };
      tabsEl.appendChild(add);

      const page = container.querySelector(".browser-page");
      page.innerHTML = pages[tab.url] || tab.html || `<h2>Offline viewer</h2><p>${escapeHtml(tab.url || "")}</p><p>This browser is offline-first. It does not fetch external websites when opened from a local file.</p>`;
      const input = container.querySelector(".url-input");
      const go = () => {
        const value = input.value.trim() || "nova://home";
        tab.url = value;
        tab.title = value.replace("nova://", "").replace(/^./, c => c.toUpperCase());
        if (!pages[value] && !value.startsWith("nova://")) tab.html = `<h2>Note</h2><p>${escapeHtml(value)}</p>`;
        persistTabs();
        draw();
      };
      input.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      container.querySelector("[data-go]").onclick = go;
      container.querySelector("[data-home]").onclick = () => { tab.url = "nova://home"; tab.title = "Home"; persistTabs(); draw(); };
    }
    draw();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  }

  window.NovaApps.register({ id: "browser", name: "Browser", icon: "🌐", description: "Offline tabbed app viewer", render });
})();
