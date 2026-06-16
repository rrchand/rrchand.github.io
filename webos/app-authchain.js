/* NovaDesk AuthChain
   First-run password setup, blockchain-style auth ledger, login gate and recovery reset.
   This is a local educational security simulation. It uses browser WebCrypto and localStorage only. */
(function () {
  const AUTH_KEY = "novadesk.authchain.v1";
  const WORDS = ["nova","orbit","pixel","matrix","signal","vector","cipher","galaxy","lunar","quantum","atlas","ember","crystal","rocket","harbor","silver","forest","binary","cosmic","kernel","shadow","plasma","zenith","aurora","delta","echo","fusion","glacier","helios","ion","jade","kepler","lotus","meteor","nimbus","onyx","pulse","radar","solaris","titan","umbra","vortex","wave","xenon","yonder","zephyr"];

  const enc = new TextEncoder();
  const toHex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
  const fromHex = hex => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const uid = p => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function randomHex(bytes = 16) {
    const data = new Uint8Array(bytes);
    crypto.getRandomValues(data);
    return [...data].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function recoveryPhrase() {
    const indexes = new Uint8Array(12);
    crypto.getRandomValues(indexes);
    return [...indexes].map(i => WORDS[i % WORDS.length]).join("-");
  }

  async function sha256(text) {
    return toHex(await crypto.subtle.digest("SHA-256", enc.encode(String(text))));
  }

  async function passwordHash(password, salt) {
    let value = `${salt}:${password}`;
    for (let i = 0; i < 1200; i++) value = await sha256(value);
    return value;
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || "null") || null;
    } catch {
      return null;
    }
  }

  function save(auth) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  async function makeBlock(auth, type, payload) {
    const previous = auth.chain.at(-1);
    const block = {
      index: auth.chain.length,
      type,
      time: Date.now(),
      previousHash: previous ? previous.hash : "0" ,
      payload
    };
    block.hash = await sha256(JSON.stringify({ index: block.index, type: block.type, time: block.time, previousHash: block.previousHash, payload: block.payload }));
    auth.chain.push(block);
    save(auth);
    return block;
  }

  async function verifyChain(auth = load()) {
    if (!auth || !Array.isArray(auth.chain)) return false;
    for (let i = 0; i < auth.chain.length; i++) {
      const block = auth.chain[i];
      const expectedPrev = i === 0 ? "0" : auth.chain[i - 1].hash;
      if (block.previousHash !== expectedPrev) return false;
      const expectedHash = await sha256(JSON.stringify({ index: block.index, type: block.type, time: block.time, previousHash: block.previousHash, payload: block.payload }));
      if (block.hash !== expectedHash) return false;
    }
    return true;
  }

  function renderOverlay(mode = "auto", message = "") {
    let existing = document.getElementById("authchain-overlay");
    if (!existing) {
      existing = document.createElement("section");
      existing.id = "authchain-overlay";
      existing.className = "authchain-overlay";
      document.body.appendChild(existing);
    }

    const auth = load();
    const firstRun = !auth || !auth.passwordHash;
    const view = mode === "auto" ? (firstRun ? "setup" : "login") : mode;

    existing.innerHTML = `
      <div class="authchain-card">
        <div class="auth-orb">⛓️</div>
        <h1>NovaDesk AuthChain</h1>
        <p class="auth-muted">Blockchain-style local authentication ledger</p>
        ${message ? `<div class="auth-message">${esc(message)}</div>` : ""}
        <div id="authchain-content"></div>
      </div>`;

    const content = existing.querySelector("#authchain-content");
    if (view === "setup") setupView(content);
    if (view === "login") loginView(content);
    if (view === "reset") resetView(content);
    if (view === "ledger") ledgerView(content);
  }

  function setupView(host) {
    host.innerHTML = `
      <div class="auth-grid">
        <label>Display name<input id="auth-name" class="input" value="Nova User" autocomplete="name"></label>
        <label>Create password<input id="auth-pass" class="input" type="password" autocomplete="new-password"></label>
        <label>Confirm password<input id="auth-pass2" class="input" type="password" autocomplete="new-password"></label>
        <button id="auth-create" class="btn primary">Create AuthChain Identity</button>
      </div>
      <p class="auth-muted">First launch requires a password. Your password is not stored directly. A local hash and recovery phrase hash are recorded in the AuthChain ledger.</p>`;
    host.querySelector("#auth-create").onclick = async () => {
      const name = host.querySelector("#auth-name").value.trim() || "Nova User";
      const pass = host.querySelector("#auth-pass").value;
      const pass2 = host.querySelector("#auth-pass2").value;
      if (pass.length < 6) return renderOverlay("setup", "Use at least 6 characters.");
      if (pass !== pass2) return renderOverlay("setup", "Passwords do not match.");
      const phrase = recoveryPhrase();
      const salt = randomHex(16);
      const auth = {
        version: 1,
        userId: uid("user"),
        name,
        salt,
        passwordHash: await passwordHash(pass, salt),
        recoverySalt: randomHex(16),
        recoveryHash: "",
        created: Date.now(),
        lastLogin: null,
        chain: []
      };
      auth.recoveryHash = await passwordHash(phrase, auth.recoverySalt);
      await makeBlock(auth, "GENESIS", { userId: auth.userId, nameHash: await sha256(name), note: "AuthChain identity created" });
      await makeBlock(auth, "SET_PASSWORD", { passwordHash: await sha256(auth.passwordHash), recoveryHash: await sha256(auth.recoveryHash) });
      const state = window.NovaState?.state?.persisted;
      if (state) {
        state.user = state.user || {};
        state.user.name = name;
        state.user.pin = "authchain";
        state.user.authEnabled = true;
        window.NovaState.save();
      }
      renderRecoveryReveal(phrase);
    };
  }

  function renderRecoveryReveal(phrase) {
    const overlay = document.getElementById("authchain-overlay");
    overlay.innerHTML = `
      <div class="authchain-card">
        <div class="auth-orb">🔐</div>
        <h1>Recovery Phrase</h1>
        <p class="auth-muted">Save this phrase. It is required to reset your password.</p>
        <div class="recovery-box">${esc(phrase)}</div>
        <button id="copy-recovery" class="btn">Copy phrase</button>
        <button id="continue-login" class="btn primary">I saved it, continue</button>
      </div>`;
    overlay.querySelector("#copy-recovery").onclick = () => navigator.clipboard?.writeText(phrase);
    overlay.querySelector("#continue-login").onclick = () => unlock();
  }

  function loginView(host) {
    const auth = load();
    host.innerHTML = `
      <div class="auth-grid">
        <div class="auth-user"><div class="avatar">${esc((auth?.name || "ND").slice(0,2).toUpperCase())}</div><h2>${esc(auth?.name || "Nova User")}</h2></div>
        <label>Password<input id="auth-login-pass" class="input" type="password" autocomplete="current-password"></label>
        <button id="auth-login" class="btn primary">Unlock NovaDesk</button>
        <button id="auth-reset" class="btn">Reset password with AuthChain</button>
        <button id="auth-ledger" class="btn">View AuthChain ledger</button>
      </div>`;
    host.querySelector("#auth-login").onclick = login;
    host.querySelector("#auth-login-pass").onkeydown = e => { if (e.key === "Enter") login(); };
    host.querySelector("#auth-reset").onclick = () => renderOverlay("reset");
    host.querySelector("#auth-ledger").onclick = () => renderOverlay("ledger");
    setTimeout(() => host.querySelector("#auth-login-pass")?.focus(), 40);
  }

  async function login() {
    const auth = load();
    if (!auth) return renderOverlay("setup");
    const pass = document.getElementById("auth-login-pass")?.value || "";
    const hash = await passwordHash(pass, auth.salt);
    if (hash !== auth.passwordHash) return renderOverlay("login", "Invalid password.");
    auth.lastLogin = Date.now();
    await makeBlock(auth, "LOGIN", { loginHash: await sha256(auth.userId + auth.lastLogin) });
    save(auth);
    unlock();
  }

  function resetView(host) {
    host.innerHTML = `
      <div class="auth-grid">
        <label>Recovery phrase<input id="reset-phrase" class="input" autocomplete="off"></label>
        <label>New password<input id="reset-pass" class="input" type="password" autocomplete="new-password"></label>
        <label>Confirm new password<input id="reset-pass2" class="input" type="password" autocomplete="new-password"></label>
        <button id="reset-now" class="btn primary">Write Password Reset Block</button>
        <button id="back-login" class="btn">Back to login</button>
      </div>
      <p class="auth-muted">Password reset is recorded as a new block. The previous password hash remains in the historical ledger, but only the latest credential is accepted.</p>`;
    host.querySelector("#back-login").onclick = () => renderOverlay("login");
    host.querySelector("#reset-now").onclick = async () => {
      const auth = load();
      const phrase = host.querySelector("#reset-phrase").value.trim();
      const pass = host.querySelector("#reset-pass").value;
      const pass2 = host.querySelector("#reset-pass2").value;
      if (!auth) return renderOverlay("setup");
      if (pass.length < 6) return renderOverlay("reset", "Use at least 6 characters.");
      if (pass !== pass2) return renderOverlay("reset", "New passwords do not match.");
      const phraseHash = await passwordHash(phrase, auth.recoverySalt);
      if (phraseHash !== auth.recoveryHash) return renderOverlay("reset", "Recovery phrase is not valid.");
      auth.salt = randomHex(16);
      auth.passwordHash = await passwordHash(pass, auth.salt);
      await makeBlock(auth, "RESET_PASSWORD", { passwordHash: await sha256(auth.passwordHash), resetProof: await sha256(phraseHash), note: "Password reset by recovery phrase" });
      save(auth);
      renderOverlay("login", "Password reset complete. Sign in with the new password.");
    };
  }

  async function ledgerView(host) {
    const auth = load();
    if (!auth) return renderOverlay("setup");
    const ok = await verifyChain(auth);
    host.innerHTML = `
      <div class="auth-ledger-status ${ok ? "ok" : "bad"}">${ok ? "Ledger verified" : "Ledger verification failed"}</div>
      <div class="auth-ledger">
        ${auth.chain.map(block => `
          <div class="auth-block">
            <strong>Block #${block.index} • ${esc(block.type)}</strong>
            <small>${new Date(block.time).toLocaleString()}</small>
            <code>Hash: ${esc(block.hash.slice(0, 28))}...</code>
            <code>Previous: ${esc(block.previousHash.slice(0, 28))}...</code>
          </div>`).join("")}
      </div>
      <button id="back-login" class="btn">Back</button>`;
    host.querySelector("#back-login").onclick = () => renderOverlay("login");
  }

  function unlock() {
    document.getElementById("authchain-overlay")?.remove();
    document.getElementById("lock-screen")?.classList.add("hidden");
    window.NovaNotify?.toast("AuthChain unlocked", "Welcome back");
  }

  function lock() {
    renderOverlay("login");
  }

  function css() {
    if (document.getElementById("authchain-style")) return;
    const style = document.createElement("style");
    style.id = "authchain-style";
    style.textContent = `
      .authchain-overlay{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;background:radial-gradient(circle at 25% 20%,rgba(96,165,250,.45),transparent 30%),linear-gradient(135deg,#020617,#172554,#581c87);color:white;padding:18px}.authchain-card{width:min(520px,94vw);max-height:92vh;overflow:auto;border:1px solid rgba(255,255,255,.22);border-radius:30px;padding:28px;background:rgba(255,255,255,.13);backdrop-filter:blur(24px);box-shadow:0 30px 90px rgba(0,0,0,.35)}.auth-orb{width:76px;height:76px;margin:0 auto 12px;display:grid;place-items:center;border-radius:26px;background:linear-gradient(135deg,#60a5fa,#a78bfa);font-size:34px}.authchain-card h1{text-align:center;margin:0}.auth-muted{text-align:center;opacity:.78;line-height:1.45}.auth-grid{display:grid;gap:12px}.auth-grid label{display:grid;gap:6px}.auth-message{border:1px solid rgba(248,113,113,.45);background:rgba(248,113,113,.16);border-radius:16px;padding:10px;margin:12px 0}.auth-user{text-align:center}.recovery-box{font-family:ui-monospace,Consolas,monospace;word-break:break-word;border:1px solid rgba(255,255,255,.25);border-radius:18px;background:rgba(0,0,0,.26);padding:16px;margin:14px 0;font-size:18px}.auth-ledger{display:grid;gap:10px;margin:12px 0}.auth-block{border:1px solid rgba(255,255,255,.22);border-radius:16px;background:rgba(0,0,0,.18);padding:12px;display:grid;gap:4px}.auth-block code{font-size:12px;opacity:.82;word-break:break-all}.auth-ledger-status{border-radius:14px;padding:10px;margin-top:10px;text-align:center}.auth-ledger-status.ok{background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.35)}.auth-ledger-status.bad{background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.35)}`;
    document.head.appendChild(style);
  }

  function start() {
    css();
    renderOverlay("auto");
  }

  window.NovaAuth = { start, lock, unlock, verifyChain, renderOverlay, load };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
