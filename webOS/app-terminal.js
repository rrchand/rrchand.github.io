/* Terminal app with basic commands for inspecting and controlling NovaDesk. */
(function () {
  function render(container) {
    container.innerHTML = `
      <div class="app-shell"><div class="app-body"><div class="terminal">
        <div class="terminal-output">NovaDesk Terminal\nType help for commands.\n</div>
        <div class="terminal-line"><span class="prompt">nova&gt;</span><input class="terminal-input" autofocus /></div>
      </div></div></div>`;
    const output = container.querySelector(".terminal-output");
    const input = container.querySelector(".terminal-input");
    input.focus();

    function print(text) { output.textContent += text + "\n"; output.scrollTop = output.scrollHeight; }
    function run(command) {
      const [cmd, ...args] = command.trim().split(/\s+/);
      print(`nova> ${command}`);
      if (!cmd) return;
      if (cmd === "help") print("Commands: help, apps, open <app>, theme <light|dark>, ls <path>, clear, about");
      else if (cmd === "apps") print(window.NovaApps.all().filter(a => !a.hidden).map(a => `${a.id}  ${a.name}`).join("\n"));
      else if (cmd === "open") {
        const app = args[0];
        if (window.NovaApps.get(app)) window.NovaWindows.openApp(app);
        else print("App not found.");
      }
      else if (cmd === "theme") {
        const theme = args[0];
        if (["light", "dark"].includes(theme)) {
          window.NovaState.state.persisted.theme = theme;
          window.NovaState.save();
          document.documentElement.dataset.theme = theme;
          print(`Theme changed to ${theme}.`);
        } else print("Usage: theme light or theme dark");
      }
      else if (cmd === "ls") {
        const path = args[0] || "/";
        const node = window.NovaState.getNodeByPath(path);
        if (!node || node.type !== "folder") print("Folder not found.");
        else print(Object.keys(node.children || {}).join("\n") || "Empty folder");
      }
      else if (cmd === "clear") output.textContent = "";
      else if (cmd === "about") print("NovaDesk is a local web desktop prototype built with HTML, CSS and JavaScript.");
      else print("Unknown command. Type help.");
    }
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const value = input.value;
        input.value = "";
        run(value);
      }
    });
  }

  window.NovaApps.register({ id: "terminal", name: "Terminal", icon: "⌨️", description: "Developer console", render });
})();
