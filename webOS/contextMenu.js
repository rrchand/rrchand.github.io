/* Reusable right-click context menu. */
(function () {
  const menu = () => document.getElementById("context-menu");

  function hide() {
    menu().classList.add("hidden");
    menu().innerHTML = "";
  }

  function show(x, y, items) {
    const el = menu();
    el.innerHTML = "";
    items.forEach(item => {
      if (item === "divider") {
        const divider = document.createElement("div");
        divider.className = "context-divider";
        el.appendChild(divider);
        return;
      }
      const button = document.createElement("button");
      button.className = "context-item";
      button.innerHTML = `<span>${item.icon || ""}</span><span>${item.label}</span>`;
      button.addEventListener("click", () => {
        hide();
        item.action && item.action();
      });
      el.appendChild(button);
    });

    el.classList.remove("hidden");
    const rect = el.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 8);
    const top = Math.min(y, window.innerHeight - rect.height - 8);
    el.style.left = `${Math.max(8, left)}px`;
    el.style.top = `${Math.max(8, top)}px`;
  }

  document.addEventListener("click", hide);
  document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
  window.NovaContextMenu = { show, hide };
})();
