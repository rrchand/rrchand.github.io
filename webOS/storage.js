/* Storage helpers keep all persistent data under one localStorage key. */
(function () {
  const KEY = "novadesk.v1";

  const defaultState = {
    theme: "light",
    wallpaper: "default",
    fs: {
      type: "folder",
      children: {
        Desktop: { type: "folder", children: {} },
        Documents: {
          type: "folder",
          children: {
            "Welcome.txt": { type: "file", content: "Welcome to NovaDesk. This file system is simulated and saved in localStorage." },
            "Project Notes.md": { type: "file", content: "# NovaDesk\n\nA local web desktop with windows, apps, tabs, themes and persistence." }
          }
        },
        Downloads: { type: "folder", children: {} },
        Pictures: { type: "folder", children: {} }
      }
    },
    browserTabs: [{ title: "Home", url: "nova://home", html: "" }],
    recentApps: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(defaultState);
      return Object.assign(clone(defaultState), JSON.parse(raw));
    } catch (error) {
      console.warn("Storage load failed. Falling back to defaults.", error);
      return clone(defaultState);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Storage save failed.", error);
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
    return load();
  }

  window.NovaStorage = { load, save, reset, defaultState };
})();
