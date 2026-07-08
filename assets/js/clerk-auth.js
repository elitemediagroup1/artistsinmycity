/*
 * ArtistsInMyCity - Clerk Authentication (browser / vanilla JS).
 * Sprint 8.2. Loads Clerk once, exposes window.AIMCAuth, wires nav state,
 * join role-choice, sign-in, protected routes, Roadie auth context, and
 * GA + Loop analytics events. TEST keys only. No secret keys in frontend.
 */
(function () {
  "use strict";
  if (window.__aimcClerkAuthLoaded) { return; }
  window.__aimcClerkAuthLoaded = true;

  var CLERK_UI_SRC = "https://topical-kodiak-98.clerk.accounts.dev/npm/@clerk/ui@1/dist/ui.browser.js";
  var CLERK_JS_SRC = "https://topical-kodiak-98.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
  var CLERK_PUBLISHABLE_KEY = "pk_test_dG9waWNhbC1rb2RpYWstOTguY2xlcmsuYWNjb3VudHMuZGV2JA";

  var ROLES = ["artist", "fan", "creator", "admin"];
  var PENDING_ROLE_KEY = "aimc.pendingRole";
  var LOCAL_ROLE_KEY = "aimc.role";
  var RETURN_KEY = "aimc.returnTo";

  var REDIRECTS = {
    signup: {
      artist:  "/pages/artist-onboarding.html",
      fan:     "/dashboard/fan-dashboard.html",
      creator: "/dashboard/creator-dashboard.html",
      admin:   "/dashboard/admin.html"
    },
    signin: {
      artist:  "/dashboard/artist-studio.html",
      fan:     "/dashboard/fan-dashboard.html",
      creator: "/dashboard/creator-dashboard.html",
      admin:   "/dashboard/admin.html"
    },
    home: {
      artist:  "/dashboard/artist-studio.html",
      fan:     "/dashboard/fan-dashboard.html",
      creator: "/dashboard/creator-dashboard.html",
      admin:   "/dashboard/admin.html"
    }
  };

  var PROTECTED = {
    "/dashboard/artist-studio.html":     "artist",
    "/pages/artist-onboarding.html":     "artist",
    "/pages/exhibit-builder.html":       "artist",
    "/dashboard/fan-dashboard.html":     "fan",
    "/dashboard/creator-dashboard.html": "creator",
    "/dashboard/admin.html":             "admin"
  };

  /* ---------- helpers ---------- */
  function track(name, payload) {
    payload = payload || {};
    try { if (window.AIMC && typeof window.AIMC.trackEvent === "function") window.AIMC.trackEvent(name, payload); } catch (e) {}
    try { if (window.AIMCLoop && typeof window.AIMCLoop.track === "function") window.AIMCLoop.track(name, payload); } catch (e) {}
    try { if (typeof window.aimcTrack === "function") window.aimcTrack(name, payload); } catch (e) {}
    try { if (typeof window.gtag === "function") window.gtag("event", name, payload); } catch (e) {}
  }
  function safeGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function safeDel(k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  function normalizeRole(r) {
    r = (r || "").toString().toLowerCase().trim();
    return ROLES.indexOf(r) !== -1 ? r : null;
  }
  function currentPath() {
    var pth = window.location.pathname || "/";
    if (pth.length > 1 && pth.charAt(pth.length - 1) === "/") pth = pth.slice(0, -1);
    if (pth.indexOf(".html") === -1 && pth !== "/") pth = pth + ".html";
    return pth;
  }

  /* ---------- Clerk script loading (once) ---------- */
  var clerkReadyPromise = null;
  function loadClerkScripts() {
    if (clerkReadyPromise) return clerkReadyPromise;
    clerkReadyPromise = new Promise(function (resolve, reject) {
      function afterJs() {
        if (!window.Clerk) { reject(new Error("Clerk global missing")); return; }
        try {
          window.Clerk.load({}).then(function () { resolve(window.Clerk); }, reject);
        } catch (e) { reject(e); }
      }
      /* NOTE: @clerk/ui@1 (ui.browser.js) is intentionally NOT loaded here.
         clerk-js@6 (clerk.browser.js) already bundles the sign-in/sign-up
         modal UI. Loading @clerk/ui alongside it disables the built-in
         openSignIn/mountUserButton components ("not loaded with Ui
         components"). CLERK_UI_SRC is retained for reference/future use. */
      /* Core Clerk JS. */
      var existing = document.querySelector("script[data-aimc-clerk-js]");
      if (existing) {
        if (window.Clerk) { afterJs(); }
        else { existing.addEventListener("load", afterJs); existing.addEventListener("error", reject); }
        return;
      }
      var s = document.createElement("script");
      s.defer = true; s.setAttribute("crossorigin", "anonymous");
      s.setAttribute("data-clerk-publishable-key", CLERK_PUBLISHABLE_KEY);
      s.src = CLERK_JS_SRC; s.setAttribute("data-aimc-clerk-js", "1");
      s.addEventListener("load", afterJs);
      s.addEventListener("error", function () { reject(new Error("Failed to load Clerk")); });
      (document.head || document.documentElement).appendChild(s);
    });
    return clerkReadyPromise;
  }

  /* ---------- role read / write ---------- */
  function readClerkRole() {
    try {
      var u = window.Clerk && window.Clerk.user;
      if (u && u.publicMetadata && u.publicMetadata.role) return normalizeRole(u.publicMetadata.role);
    } catch (e) {}
    return null;
  }
  function getRole() {
    return readClerkRole() || normalizeRole(safeGet(LOCAL_ROLE_KEY));
  }
  /*
   * setRole: attempts to persist the role to Clerk public metadata via the
   * server-side Netlify function (clerk-set-role). Always mirrors to
   * localStorage as a fallback until Clerk metadata is confirmed in prod.
   */
  function setRole(role) {
    role = normalizeRole(role);
    if (!role) return Promise.resolve(false);
    safeSet(LOCAL_ROLE_KEY, role);
    var userId = null;
    try { userId = window.Clerk && window.Clerk.user && window.Clerk.user.id; } catch (e) {}
    if (!userId) return Promise.resolve(true);
    return fetch("/.netlify/functions/clerk-set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, role: role })
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  /* ---------- auth state ---------- */
  function isSignedIn() {
    try { return !!(window.Clerk && window.Clerk.user); } catch (e) { return false; }
  }
  function getUser() {
    try { return (window.Clerk && window.Clerk.user) || null; } catch (e) { return null; }
  }

  /* ---------- redirects ---------- */
  function redirectAfterAuth(kind) {
    var role = getRole();
    var table = REDIRECTS[kind] || REDIRECTS.home;
    var to = role ? table[role] : null;
    var ret = safeGet(RETURN_KEY);
    if (ret) { safeDel(RETURN_KEY); window.location.href = ret; return; }
    if (to) { window.location.href = to; }
  }

  /* ---------- sign in / up / out ---------- */
  function openClerk(which, opts) {
    opts = opts || {};
    return loadClerkScripts().then(function (Clerk) {
      var isSignup = which === "signup";
      var modalFn = isSignup ? Clerk.openSignUp : Clerk.openSignIn;
      /* Prefer the in-page modal. If the bundled UI is unavailable, fall
         back to Clerk hosted redirect, then to our own pages. */
      if (typeof modalFn === "function") {
        try { modalFn.call(Clerk, opts); return Clerk; } catch (err) {}
      }
      var redirectFn = isSignup ? Clerk.redirectToSignUp : Clerk.redirectToSignIn;
      if (typeof redirectFn === "function") {
        try { redirectFn.call(Clerk, opts); return Clerk; } catch (err) {}
      }
      window.location.href = isSignup ? "/pages/join.html" : "/pages/sign-in.html";
      return Clerk;
    });
  }
    function signIn(opts) {
    track("auth_signin_opened", {});
    return openClerk("signin", opts);
  }
  function signUp(role) {
    role = normalizeRole(role);
    if (role) { safeSet(PENDING_ROLE_KEY, role); track("auth_role_selected", { role: role }); }
    track("auth_signup_opened", { role: role || "" });
    return openClerk("signup", {});
  }
  function signOut() {
    track("user_logout", {});
    return loadClerkScripts().then(function (Clerk) {
      safeDel(LOCAL_ROLE_KEY);
      return Clerk.signOut().then(function () { window.location.href = "/index.html"; });
    });
  }

  /* ---------- route protection ---------- */
  function requireAuth(options) {
    options = options || {};
    var need = options.role || null;
    return loadClerkScripts().then(function () {
      if (!isSignedIn()) {
        safeSet(RETURN_KEY, window.location.pathname + window.location.search);
        track("auth_required_redirect", { path: currentPath() });
        signIn({});
        return false;
      }
      if (need && need !== "any") {
        var role = getRole();
        if (role && role !== need) {
          track("auth_wrong_role", { have: role, need: need });
          renderWrongRole(role, need);
          return false;
        }
      }
      return true;
    });
  }

  /* ---------- nav auth state ---------- */
  function roleLink(role) {
    if (role === "artist")  return { href: "/dashboard/artist-studio.html", label: "My Studio" };
    if (role === "fan")     return { href: "/dashboard/fan-dashboard.html", label: "Fan Space" };
    if (role === "creator") return { href: "/dashboard/creator-dashboard.html", label: "Creator Space" };
    if (role === "admin")   return { href: "/dashboard/admin.html", label: "Admin" };
    return null;
  }
  function updateNav() {
    var header = document.querySelector("header.site-header");
    if (!header) return;
    var signInBtn = header.querySelector('a.btn.ghost[href*="sign-in"]');
    var joinBtn = header.querySelector('a.btn.hot[href*="join"]');
    var signed = isSignedIn();
    if (signInBtn) signInBtn.style.display = signed ? "none" : "";
    if (joinBtn) joinBtn.style.display = signed ? "none" : "";
    /* role-aware dashboard link */
    var existingRoleLink = header.querySelector("[data-aimc-role-link]");
    if (signed) {
      var link = roleLink(getRole());
      if (link) {
        if (!existingRoleLink) {
          existingRoleLink = document.createElement("a");
          existingRoleLink.className = "btn ghost";
          existingRoleLink.setAttribute("data-aimc-role-link", "1");
          if (joinBtn && joinBtn.parentNode) joinBtn.parentNode.insertBefore(existingRoleLink, joinBtn);
          else header.appendChild(existingRoleLink);
        }
        existingRoleLink.href = link.href;
        existingRoleLink.textContent = link.label;
        existingRoleLink.style.display = "";
      }
      /* Clerk user button */
      var mount = header.querySelector("[data-aimc-user-button]");
      if (!mount) {
        mount = document.createElement("div");
        mount.setAttribute("data-aimc-user-button", "1");
        mount.style.display = "inline-flex";
        mount.style.alignItems = "center";
        mount.style.marginLeft = "10px";
        header.appendChild(mount);
      }
      try {
        if (window.Clerk && typeof window.Clerk.mountUserButton === "function" && !mount.getAttribute("data-mounted")) {
          window.Clerk.mountUserButton(mount, { afterSignOutUrl: "/index.html" });
          mount.setAttribute("data-mounted", "1");
        }
      } catch (e) {}
    } else {
      if (existingRoleLink) existingRoleLink.style.display = "none";
      var m = header.querySelector("[data-aimc-user-button]");
      if (m) m.style.display = "none";
    }
  }

  /* ---------- role choice modal (Join) ---------- */
  function ensureModalStyles() {
    if (document.getElementById("aimc-auth-style")) return;
    var st = document.createElement("style");
    st.id = "aimc-auth-style";
    st.textContent = [
      ".aimc-auth-ov{position:fixed;inset:0;background:rgba(6,4,16,.72);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}",
      ".aimc-auth-card{background:#0c0a1a;border:1px solid rgba(255,255,255,.12);border-radius:20px;max-width:520px;width:100%;padding:28px;box-shadow:0 24px 80px rgba(0,0,0,.6)}",
      ".aimc-auth-card h3{margin:0 0 6px;font-size:22px;color:#fff}",
      ".aimc-auth-card p{margin:0 0 18px;color:#9ca8bb;font-size:14px}",
      ".aimc-auth-tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
      ".aimc-auth-tile{text-align:left;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);border-radius:14px;padding:14px 16px;cursor:pointer;color:#fff;transition:border-color .15s,background .15s}",
      ".aimc-auth-tile:hover{border-color:#8a5cff;background:rgba(138,92,255,.12)}",
      ".aimc-auth-tile b{display:block;font-size:15px;margin-bottom:2px}",
      ".aimc-auth-tile small{color:#9ca8bb;font-size:12px}",
      ".aimc-auth-x{margin-top:16px;text-align:right}",
      ".aimc-auth-x button{background:none;border:0;color:#9ca8bb;cursor:pointer;font-size:13px}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }
  function openRoleModal() {
    ensureModalStyles();
    track("auth_role_modal_opened", {});
    var ov = document.createElement("div");
    ov.className = "aimc-auth-ov";
    var tiles = [
      { role: "artist",  title: "Artist",  desc: "Build your premium exhibit and get discovered." },
      { role: "fan",     title: "Fan",     desc: "Follow artists and explore your city scene." },
      { role: "creator", title: "Creator", desc: "Spotlight artists and cover local events." }
    ];
    var admin = safeGet("aimc.adminPreview") === "1";
    if (admin) tiles.push({ role: "admin", title: "Admin Preview", desc: "Preview the admin dashboard experience." });
    var tileHtml = tiles.map(function (t) {
      return '<button class="aimc-auth-tile" data-role="' + t.role + '"><b>' + t.title + '</b><small>' + t.desc + "</small></button>";
    }).join("");
    ov.innerHTML = '<div class="aimc-auth-card" role="dialog" aria-modal="true"><h3>How do you want to join ArtistsInMyCity?</h3><p>Pick a portal to get started.</p><div class="aimc-auth-tiles">' + tileHtml + '</div><div class="aimc-auth-x"><button data-close="1">Cancel</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) {
      var tile = e.target.closest ? e.target.closest(".aimc-auth-tile") : null;
      if (tile) { var r = tile.getAttribute("data-role"); ov.remove(); signUp(r); return; }
      if (e.target === ov || (e.target.getAttribute && e.target.getAttribute("data-close"))) ov.remove();
    });
  }

  /* ---------- wrong-role screen ---------- */
  function renderWrongRole(have, need) {
    ensureModalStyles();
    var link = roleLink(have);
    var dest = link ? link.href : "/index.html";
    var destLabel = link ? link.label : "Home";
    var ov = document.createElement("div");
    ov.className = "aimc-auth-ov";
    ov.innerHTML = '<div class="aimc-auth-card" role="dialog" aria-modal="true"><h3>This area is for ' + need + ' accounts</h3><p>Your account is set up as a ' + have + '. You can head to your own space instead.</p><div class="aimc-auth-tiles" style="grid-template-columns:1fr"><a class="aimc-auth-tile" href="' + dest + '"><b>Go to ' + destLabel + '</b><small>Continue to your dashboard.</small></a></div></div>';
    document.body.appendChild(ov);
  }

  /* ---------- Roadie auth context ---------- */
  function roadieAuthContext() {
    var ctx = { signedIn: isSignedIn(), page: currentPath() };
    var u = getUser();
    if (u) {
      ctx.userId = u.id || null;
      ctx.firstName = u.firstName || (u.fullName ? u.fullName.split(" ")[0] : null) || null;
      ctx.role = getRole();
    }
    try {
      if (window.RoadieMemory) {
        if (typeof window.RoadieMemory.getMemory === "function") ctx.memory = window.RoadieMemory.getMemory();
        var m = ctx.memory || {};
        ctx.selectedCity = (m.selectedCities && m.selectedCities[0]) || m.selectedCity || null;
      }
    } catch (e) {}
    return ctx;
  }
  function roadieGreeting() {
    var role = getRole();
    if (!isSignedIn()) return null;
    if (role === "artist")  return "Welcome back. Ready to improve your exhibit?";
    if (role === "fan")     return "Welcome back. Want to discover something new?";
    if (role === "creator") return "Welcome back. Ready to spotlight local talent?";
    return null;
  }
  function publishRoadieContext() {
    try {
      window.AIMCAuthContext = roadieAuthContext();
      var g = roadieGreeting();
      if (g) window.AIMCAuthContext.greeting = g;
      window.dispatchEvent(new CustomEvent("aimc:auth-context", { detail: window.AIMCAuthContext }));
    } catch (e) {}
  }

  /* ---------- post sign-in / sign-up handling ---------- */
  function handleAuthenticated() {
    var role = getRole();
    var pending = normalizeRole(safeGet(PENDING_ROLE_KEY));
    if (!role && pending) {
      /* fresh signup: persist chosen role then redirect to signup destination */
      safeDel(PENDING_ROLE_KEY);
      var loginName = "user_signup"; var roleName = pending + "_signup";
      Promise.resolve(setRole(pending)).then(function () {
        track(loginName, { role: pending });
        track(roleName, { role: pending });
        publishRoadieContext();
        updateNav();
        redirectAfterAuth("signup");
      });
      return;
    }
    if (!role) { safeDel(PENDING_ROLE_KEY); openRoleModal(); return; }
    track("user_login", { role: role });
    track(role + "_login", { role: role });
    publishRoadieContext();
    updateNav();
  }

  var wasSignedIn = null;
  function onClerkChange() {
    var now = isSignedIn();
    updateNav();
    publishRoadieContext();
    if (wasSignedIn === false && now === true) { handleAuthenticated(); }
    wasSignedIn = now;
  }

  /* ---------- wiring existing nav buttons ---------- */
  function wireNavButtons() {
    var header = document.querySelector("header.site-header");
    if (!header) return;
    var signInBtn = header.querySelector('a.btn.ghost[href*="sign-in"]');
    var joinBtn = header.querySelector('a.btn.hot[href*="join"]');
    if (signInBtn && !signInBtn.getAttribute("data-aimc-wired")) {
      signInBtn.setAttribute("data-aimc-wired", "1");
      signInBtn.addEventListener("click", function (e) { e.preventDefault(); signIn({}); });
    }
    if (joinBtn && !joinBtn.getAttribute("data-aimc-wired")) {
      joinBtn.setAttribute("data-aimc-wired", "1");
      joinBtn.addEventListener("click", function (e) { e.preventDefault(); openRoleModal(); });
    }
  }

  /* ---------- init ---------- */
  var initPromise = null;
  function init() {
    if (initPromise) return initPromise;
    wireNavButtons();
    initPromise = loadClerkScripts().then(function (Clerk) {
      wasSignedIn = isSignedIn();
      updateNav();
      publishRoadieContext();
      try { if (typeof Clerk.addListener === "function") Clerk.addListener(onClerkChange); } catch (e) {}
      /* if we just returned from a redirect-based flow, handle it */
      if (isSignedIn()) { handleAuthenticated(); }
      /* route protection for protected pages */
      var need = PROTECTED[currentPath()];
      if (need) { requireAuth({ role: need }); }
      return Clerk;
    }).catch(function (e) {
      /* Clerk unavailable: keep placeholder nav, do not crash */
      try { console.warn("[AIMCAuth] Clerk load failed", e && e.message); } catch (x) {}
    });
    return initPromise;
  }

  /* ---------- expose ---------- */
  window.AIMCAuth = {
    init: init,
    isSignedIn: isSignedIn,
    getUser: getUser,
    getRole: getRole,
    signIn: signIn,
    signUp: signUp,
    signOut: signOut,
    requireAuth: requireAuth,
    setRole: setRole,
    redirectAfterAuth: redirectAfterAuth,
    openRoleModal: openRoleModal,
    getAuthContext: roadieAuthContext,
    getGreeting: roadieGreeting
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
