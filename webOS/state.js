/* Central app state and utility functions. */
(function () {
  const persisted = window.NovaStorage.load();

  const state = {
    persisted,
    windows: [],
    zIndex: 100,
    activeWindowId: null,
    nextWindowId: 1,
    startOpen: false
  };

  function save() {
    window.NovaStorage.save(state.persisted);
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function getNodeByPath(path) {
    const parts = path.split("/").filter(Boolean);
    let node = state.persisted.fs;
    for (const part of parts) {
      if (!node.children || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }

  function parentPath(path) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
  }

  function baseName(path) {
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }

  function createFsItem(folderPath, name, type, content) {
    const folder = getNodeByPath(folderPath);
    if (!folder || folder.type !== "folder") throw new Error("Folder not found");
    if (!name.trim()) throw new Error("Name is required");
    folder.children[name] = type === "folder" ? { type: "folder", children: {} } : { type: "file", content: content || "" };
    save();
  }

  function deleteFsItem(path) {
    const folder = getNodeByPath(parentPath(path));
    const name = baseName(path);
    if (folder && folder.children && folder.children[name]) {
      delete folder.children[name];
      save();
    }
  }

  window.NovaState = { state, save, uid, getNodeByPath, createFsItem, deleteFsItem, parentPath, baseName };
})();
