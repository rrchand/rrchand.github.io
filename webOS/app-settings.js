/* Settings app for theme, persistence and desktop preferences. */
(function () {
  function render(container) {
    const state = window.NovaState.state;
    container.innerHTML = `
      <div class="app-shell">
        <div class="toolbar"><strong>Settings</strong></div>
        <div class="app-body">
          <div class="settings-grid">
            <section class="card">
              <h3>Appearance</h3>
              <p>Switch between light and dark themes. The choice is saved locally.</p>
              <button class="pill-button" data-theme="light">Light</button>
              <button class="pill-button" data-theme="dark">Dark</button>
            </section>
            <section class="card">
              <h3>Persistence</h3>
              <p>Reset localStorage to restore the default desktop and file system.</p>
              <button class="pill-button" data-reset>Reset saved data</button>
            </section>
            <section class="card">
              <h3>Window snapping</h3>
              <p>Drag a window to the left, right or top edge to snap or maximize it.</p>
              <button class="pill-button" data-open-files>Open File Explorer</button>
            </section>
            <section class="card">
              <h3>Extension model</h3>
              <p>Apps are registered with NovaApps.register. Add a new app file and script tag to extend the OS.</p>
              <button class="pill-button" data-open-terminal>Open Terminal</button>
            </section>
          </div>
        </div>
      </div>`;
    container.querySelectorAll("[data-theme]").forEach(button => button.onclick = () => {
      state.persisted.theme = button.dataset.theme;
      window.NovaState.save();
      document.documentElement.dataset.theme = state.persisted.theme;
    });
    container.querySelector("[data-reset]").onclick = () => {
      if (confirm("Reset all saved NovaDesk data?")) {
        state.persisted = window.NovaStorage.reset();
        window.NovaState.save();
        location.reload();
      }
    };
    container.querySelector("[data-open-files]").onclick = () => window.NovaWindows.openApp("files");
    container.querySelector("[data-open-terminal]").onclick = () => window.NovaWindows.openApp("terminal");
  }

  window.NovaApps.register({ id: "settings", name: "Settings", icon: "⚙️", description: "Theme and system controls", render });
})();
