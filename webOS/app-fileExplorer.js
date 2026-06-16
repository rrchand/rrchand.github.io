/* File Explorer app with multiple tabs and simulated localStorage-backed file system. */
(function () {
  function render(container, win) {
    function escapeHtml(str) {
      return String(str).replace(/[&<>'\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
    }
    const tabs = win.appState.tabs || [{ id: window.NovaState.uid("tab"), path: "/Documents" }];
    win.appState.tabs = tabs;
    win.appState.activeTabId = win.appState.activeTabId || tabs[0].id;

    function activeTab() {
      return win.appState.tabs.find(t => t.id === win.appState.activeTabId) || win.appState.tabs[0];
    }

    function draw() {
      const tab = activeTab();
      const node = window.NovaState.getNodeByPath(tab.path);
      container.innerHTML = `
        <div class="app-shell">
          <div class="tabs"></div>
          <div class="toolbar">
            <button class="tool-button" data-action="up">↑</button>
            <input class="path-input" value="${escapeHtml(tab.path)}" aria-label="Path" />
            <button class="tool-button" data-action="new-folder">New folder</button>
            <button class="tool-button" data-action="new-file">New file</button>
          </div>
          <div class="app-body">
            <div class="split">
              <div class="sidebar"></div>
              <div class="file-grid"></div>
            </div>
          </div>
        </div>`;

      const tabsEl = container.querySelector(".tabs");
      win.appState.tabs.forEach(t => {
        const button = document.createElement("button");
        button.className = "tab" + (t.id === win.appState.activeTabId ? " active" : "");
        button.textContent = t.path || "/";
        button.onclick = () => { win.appState.activeTabId = t.id; draw(); };
        button.oncontextmenu = e => {
          e.preventDefault();
          window.NovaContextMenu.show(e.clientX, e.clientY, [
            { label: "Close tab", icon: "✕", action: () => {
              win.appState.tabs = win.appState.tabs.filter(tabItem => tabItem.id !== t.id);
              if (!win.appState.tabs.length) win.appState.tabs.push({ id: window.NovaState.uid("tab"), path: "/Documents" });
              win.appState.activeTabId = win.appState.tabs[0].id;
              draw();
            }}
          ]);
        };
        tabsEl.appendChild(button);
      });
      const add = document.createElement("button");
      add.className = "tab tab-add";
      add.textContent = "+";
      add.onclick = () => { const id = window.NovaState.uid("tab"); win.appState.tabs.push({ id, path: "/Documents" }); win.appState.activeTabId = id; draw(); };
      tabsEl.appendChild(add);

      const sidebar = container.querySelector(".sidebar");
      ["/Desktop", "/Documents", "/Downloads", "/Pictures"].forEach(path => {
        const button = document.createElement("button");
        button.className = "sidebar-item" + (tab.path === path ? " active" : "");
        button.textContent = path.replace("/", "");
        button.onclick = () => { tab.path = path; draw(); };
        sidebar.appendChild(button);
      });

      const pathInput = container.querySelector(".path-input");
      pathInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          const target = pathInput.value.trim() || "/";
          if (window.NovaState.getNodeByPath(target)?.type === "folder") { tab.path = target; draw(); }
          else alert("Folder not found.");
        }
      });

      container.querySelector('[data-action="up"]').onclick = () => {
        if (tab.path !== "/") { tab.path = window.NovaState.parentPath(tab.path) || "/"; draw(); }
      };
      container.querySelector('[data-action="new-folder"]').onclick = () => createItem("folder");
      container.querySelector('[data-action="new-file"]').onclick = () => createItem("file");

      const grid = container.querySelector(".file-grid");
      if (!node || node.type !== "folder") {
        grid.innerHTML = `<div class="empty-state">This folder could not be opened.</div>`;
        return;
      }
      const entries = Object.entries(node.children || {});
      if (!entries.length) grid.innerHTML = `<div class="empty-state">This folder is empty. Right-click or use the toolbar to create items.</div>`;
      entries.forEach(([name, item]) => {
        const div = document.createElement("div");
        div.className = "file-item";
        div.innerHTML = `<div class="file-icon">${item.type === "folder" ? "📁" : "📄"}</div><div class="file-name">${escapeHtml(name)}</div>`;
        div.ondblclick = () => {
          if (item.type === "folder") { tab.path = `${tab.path.replace(/\/$/, "")}/${name}`; draw(); }
          else openFile(name, item);
        };
        div.oncontextmenu = e => {
          e.preventDefault();
          const itemPath = `${tab.path.replace(/\/$/, "")}/${name}`;
          window.NovaContextMenu.show(e.clientX, e.clientY, [
            { label: item.type === "folder" ? "Open" : "View", icon: "↗", action: () => div.ondblclick() },
            { label: "Delete", icon: "🗑", action: () => { window.NovaState.deleteFsItem(itemPath); draw(); } }
          ]);
        };
        grid.appendChild(div);
      });
    }

    function createItem(type) {
      const tab = activeTab();
      const suggested = type === "folder" ? "New Folder" : "New File.txt";
      const name = prompt(`Enter ${type} name`, suggested);
      if (!name) return;
      try {
        window.NovaState.createFsItem(tab.path, name, type, type === "file" ? "New file" : "");
        draw();
      } catch (error) { alert(error.message); }
    }

    function openFile(name, item) {
      const safe = item.content || "";
      window.NovaWindows.openApp("viewer", { title: name, content: safe });
    }

    draw();
  }

  window.NovaApps.register({ id: "files", name: "File Explorer", icon: "📁", description: "Browse local simulated files", render });
  window.NovaApps.register({
    id: "viewer", name: "Text Viewer", icon: "📄", description: "View text files", hidden: true,
    render(container, win) {
      container.innerHTML = `<div class="app-shell"><div class="app-body"><textarea class="setting-input" style="width:100%;height:100%;resize:none">${escapeHtml(win.appState.content || "")}</textarea></div></div>`;
    }
  });
})();
