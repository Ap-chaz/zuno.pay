/* =========================================================
   ZUNO Admin — API client
   Thin wrapper around fetch: attaches the bearer token, parses
   JSON, and sends the admin back to login on a 401.
   ========================================================= */
window.ZunoAdmin = window.ZunoAdmin || {};

(function (ns) {
  "use strict";

  const BASE = window.ZUNO_ADMIN_CONFIG.API_BASE_URL;
  const TOKEN_KEY = "zuno_admin_token";
  const ADMIN_KEY = "zuno_admin_profile";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, admin) {
    localStorage.setItem(TOKEN_KEY, token);
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }

  function getAdmin() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function requireAuth() {
    if (!getToken()) {
      window.location.href = "index.html";
    }
  }

  async function request(path, options) {
    options = options || {};
    let headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {}
    );
    let token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    let response;
    try {
      response = await fetch(BASE + path, Object.assign({}, options, { headers }));
    } catch (networkErr) {
      throw new Error("Can't reach the server. Check your connection and try again.");
    }

    if (response.status === 401) {
      clearSession();
      window.location.href = "index.html?expired=1";
      return null;
    }

    let body = null;
    let text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (e) {
        body = null;
      }
    }

    if (!response.ok) {
      let message = (body && (body.message || body.error)) || "Something went wrong. Try again.";
      throw new Error(message);
    }

    return body;
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function devLogin(email, password) {
    await wait(500);
    let creds = window.ZUNO_ADMIN_CONFIG.DEV_CREDENTIALS;
    if (email.toLowerCase() === creds.email.toLowerCase() && password === creds.password) {
      return { token: "dev-token-" + Date.now(), admin: { email: creds.email } };
    }
    throw new Error("Incorrect email or password. (Dev mode credentials are in config.js)");
  }

  async function devGetWaitlist(params) {
    await wait(400);
    params = params || {};
    let all = window.ZUNO_ADMIN_CONFIG.DEV_MOCK_WAITLIST.slice();
    let search = (params.search || "").toLowerCase().trim();
    if (search) {
      all = all.filter(function (item) {
        return (
          (item.fullName || "").toLowerCase().includes(search) ||
          (item.email || "").toLowerCase().includes(search)
        );
      });
    }
    all.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    let page = params.page || 1;
    let limit = params.limit || 20;
    let start = (page - 1) * limit;
    let items = all.slice(start, start + limit);

    return { items: items, total: all.length, page: page, limit: limit };
  }

  async function devDeleteEntry(id) {
    await wait(300);
    let list = window.ZUNO_ADMIN_CONFIG.DEV_MOCK_WAITLIST;
    let index = list.findIndex(function (item) { return String(item.id) === String(id); });
    if (index === -1) throw new Error("That signup no longer exists.");
    list.splice(index, 1);
    return { success: true };
  }

  ns.api = {
    login: function (email, password) {
      if (window.ZUNO_ADMIN_CONFIG.DEV_MODE) return devLogin(email, password);
      return request("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      });
    },
    getWaitlist: function (params) {
      if (window.ZUNO_ADMIN_CONFIG.DEV_MODE) return devGetWaitlist(params);
      params = params || {};
      let query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      query.set("page", params.page || 1);
      query.set("limit", params.limit || 20);
      return request("/admin/waitlist?" + query.toString(), { method: "GET" });
    },
    deleteEntry: function (id) {
      if (window.ZUNO_ADMIN_CONFIG.DEV_MODE) return devDeleteEntry(id);
      return request("/admin/waitlist/" + encodeURIComponent(id), { method: "DELETE" });
    },
  };

  ns.session = {
    getToken: getToken,
    setSession: setSession,
    clearSession: clearSession,
    getAdmin: getAdmin,
    requireAuth: requireAuth,
  };
})(window.ZunoAdmin);
