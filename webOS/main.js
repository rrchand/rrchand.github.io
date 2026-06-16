/* Desktop bootstrap, start menu, desktop icons, clock and global shortcuts. */
(function () {
  const state = window.NovaState.state;
  const startMenu = document.getElementById("start-menu");
  const startApps = document.getElementById("start-apps");
  const search = document.getElementById("start-search");

  function boot() {
    document.documentElement.dataset.theme = state.persisted.theme || "light";
    renderDesktopIcons();
    renderStartApps();
    wireGlobalEvents();
    updateClock();
    setInterval(updateClock, 1000);
    setTimeout(() => document.getElementById("boot-screen").classList.add("done"), 650);
  }

  function renderDesktopIcons() {
    const host = document.getElementById("desktop-icons");
    host.innerHTML = "";
    ["files", "settings", "browser", "terminal"].forEach(id => {
      const app = window.NovaApps.get(id);
      const button = document.createElement("button");
      button.className = "desktop-icon";
      button.innerHTML = `<span class="app-icon">${app.icon}</span><span>${app.name}</span>`;
      button.ondblclick = () => window.NovaWindows.openApp(id);
      button.onclick = () => button.focus();
      host.appendChild(button);
    });
  }

  function renderStartApps(filter = "") {
    startApps.innerHTML = "";
    window.NovaApps.all().filter(app => !app.hidden).filter(app => `${app.name} ${app.description}`.toLowerCase().includes(filter.toLowerCase())).forEach(app => {
      const button = document.createElement("button");
      button.className = "start-app";
      button.innerHTML = `<span class="app-icon">${app.icon}</span><strong>${app.name}</strong><small>${app.description}</small>`;
      button.onclick = () => { toggleStart(false); window.NovaWindows.openApp(app.id); };
      startApps.appendChild(button);
    });
  }

  function toggleStart(force) {
    state.startOpen = typeof force === "boolean" ? force : !state.startOpen;
    startMenu.classList.toggle("hidden", !state.startOpen);
    if (state.startOpen) { search.value = ""; renderStartApps(); setTimeout(() => search.focus(), 50); }
  }

  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function wireGlobalEvents() {
    document.getElementById("start-button").onclick = () => toggleStart();
    document.getElementById("start-close").onclick = () => toggleStart(false);
    document.getElementById("quick-settings").onclick = () => { toggleStart(false); window.NovaWindows.openApp("settings"); };
    document.getElementById("quick-terminal").onclick = () => { toggleStart(false); window.NovaWindows.openApp("terminal"); };
    document.getElementById("theme-toggle").onclick = () => {
      state.persisted.theme = state.persisted.theme === "dark" ? "light" : "dark";
      window.NovaState.save();
      document.documentElement.dataset.theme = state.persisted.theme;
    };
    search.addEventListener("input", () => renderStartApps(search.value));
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); toggleStart(true); }
      if (e.key === "Escape") toggleStart(false);
    });
    document.getElementById("desktop").addEventListener("contextmenu", e => {
      if (e.target.closest(".window") || e.target.closest(".taskbar")) return;
      e.preventDefault();
      window.NovaContextMenu.show(e.clientX, e.clientY, [
        { label: "Open File Explorer", icon: "📁", action: () => window.NovaWindows.openApp("files") },
        { label: "Open Settings", icon: "⚙️", action: () => window.NovaWindows.openApp("settings") },
        "divider",
        { label: "New text file", icon: "📄", action: () => {
          const name = prompt("File name", "Desktop Note.txt");
          if (name) window.NovaState.createFsItem("/Desktop", name, "file", "New desktop note");
        }},
        { label: "Toggle theme", icon: "◐", action: () => document.getElementById("theme-toggle").click() }
      ]);
    });
  }

  boot();
})();
