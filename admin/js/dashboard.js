/* =========================================================
   ZUNO Admin — dashboard logic
   ========================================================= */
(function () {
  "use strict";

  window.ZunoAdmin.session.requireAuth();

  const PAGE_LIMIT = 20;
  let state = {
    page: 1,
    total: 0,
    search: "",
    items: [],
    pendingDeleteId: null,
  };

  let els = {
    adminEmail: document.getElementById("adminEmail"),
    signOutBtn: document.getElementById("signOutBtn"),
    exportBtn: document.getElementById("exportBtn"),
    searchInput: document.getElementById("searchInput"),
    body: document.getElementById("waitlistBody"),
    loading: document.getElementById("tableLoading"),
    empty: document.getElementById("tableEmpty"),
    error: document.getElementById("tableError"),
    errorMessage: document.getElementById("tableErrorMessage"),
    retryBtn: document.getElementById("retryBtn"),
    pagination: document.getElementById("pagination"),
    prevBtn: document.getElementById("prevPageBtn"),
    nextBtn: document.getElementById("nextPageBtn"),
    pageStatus: document.getElementById("pageStatus"),
    statTotal: document.getElementById("statTotal"),
    statToday: document.getElementById("statToday"),
    statWeek: document.getElementById("statWeek"),
    deleteModal: document.getElementById("deleteModal"),
    deleteModalBody: document.getElementById("deleteModalBody"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    toast: document.getElementById("toast"),
  };

  let admin = window.ZunoAdmin.session.getAdmin();
  els.adminEmail.textContent = (admin && admin.email) || "";

  if (window.ZUNO_ADMIN_CONFIG.DEV_MODE) {
    document.getElementById("devBadge").hidden = false;
  }

  /* ---------- Mobile hamburger menu ---------- */
  let hamburgerBtn = document.getElementById("hamburgerBtn");
  let topbarMenu = document.getElementById("topbarMenu");

  function closeMenu() {
    topbarMenu.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  }

  hamburgerBtn.addEventListener("click", function () {
    let isOpen = topbarMenu.classList.toggle("is-open");
    hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Collapse the menu back if the screen is resized past the mobile breakpoint.
  window.addEventListener("resize", function () {
    if (window.innerWidth > 720) closeMenu();
  });

  els.signOutBtn.addEventListener("click", function () {
    window.ZunoAdmin.session.clearSession();
    window.location.href = "index.html";
  });

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.hidden = true;
    }, 3000);
  }

  /* ---------- Table states ---------- */
  function setTableState(mode, message) {
    els.loading.hidden = mode !== "loading";
    els.empty.hidden = mode !== "empty";
    els.error.hidden = mode !== "error";
    if (mode === "error") els.errorMessage.textContent = message || "Something went wrong. Try again.";
  }

  function formatDate(iso) {
    if (!iso) return "—";
    let d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function escapeHtml(str) {
    let div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  /* ---------- Render ---------- */
  function renderRows(items) {
    els.body.innerHTML = items
      .map(function (item) {
        let name = item.fullName || item.name || "—";
        let email = item.email || "—";
        return (
          '<tr>' +
          '<td data-label="Name">' + escapeHtml(name) + '</td>' +
          '<td data-label="Email">' + escapeHtml(email) + '</td>' +
          '<td data-label="Joined">' + formatDate(item.createdAt) + '</td>' +
          '<td class="admin-table-actions">' +
          '<button class="admin-btn admin-btn--danger admin-btn--sm" data-delete-id="' +
          escapeHtml(item.id) + '" data-delete-label="' + escapeHtml(name || email) + '">Remove</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join("");
  }

  function renderPagination() {
    let totalPages = Math.max(1, Math.ceil(state.total / PAGE_LIMIT));
    els.pagination.hidden = state.total <= PAGE_LIMIT;
    els.pageStatus.textContent = "Page " + state.page + " of " + totalPages;
    els.prevBtn.disabled = state.page <= 1;
    els.nextBtn.disabled = state.page >= totalPages;
  }

  /* ---------- Load list ---------- */
  let loadRequestId = 0;
  async function loadWaitlist() {
    let requestId = ++loadRequestId;
    setTableState("loading");
    els.pagination.hidden = true;

    try {
      let result = await window.ZunoAdmin.api.getWaitlist({
        search: state.search,
        page: state.page,
        limit: PAGE_LIMIT,
      });
      if (requestId !== loadRequestId) return; // a newer request superseded this one

      state.items = result.items || [];
      state.total = typeof result.total === "number" ? result.total : state.items.length;

      els.statTotal.textContent = state.total;

      if (state.items.length === 0) {
        setTableState("empty");
      } else {
        setTableState("none");
        renderRows(state.items);
      }
      renderPagination();
    } catch (err) {
      if (requestId !== loadRequestId) return;
      setTableState("error", err.message);
    }
  }

  /* ---------- Load stats (today / this week) ---------- */
  async function loadStats() {
    try {
      let result = await window.ZunoAdmin.api.getWaitlist({ page: 1, limit: 5000 });
      let all = result.items || [];
      let now = new Date();
      let startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 6);

      let today = 0;
      let week = 0;
      all.forEach(function (item) {
        let d = new Date(item.createdAt);
        if (isNaN(d.getTime())) return;
        if (d >= startOfToday) today++;
        if (d >= startOfWeek) week++;
      });

      els.statToday.textContent = today;
      els.statWeek.textContent = week;
    } catch (err) {
      els.statToday.textContent = "—";
      els.statWeek.textContent = "—";
    }
  }

  /* ---------- Search ---------- */
  let searchTimer = null;
  els.searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.search = els.searchInput.value.trim();
      state.page = 1;
      loadWaitlist();
    }, 350);
  });

  /* ---------- Pagination ---------- */
  els.prevBtn.addEventListener("click", function () {
    if (state.page <= 1) return;
    state.page -= 1;
    loadWaitlist();
  });
  els.nextBtn.addEventListener("click", function () {
    state.page += 1;
    loadWaitlist();
  });
  els.retryBtn.addEventListener("click", loadWaitlist);

  /* ---------- Delete ---------- */
  els.body.addEventListener("click", function (e) {
    let btn = e.target.closest("[data-delete-id]");
    if (!btn) return;
    state.pendingDeleteId = btn.getAttribute("data-delete-id");
    els.deleteModalBody.textContent =
      "This removes " + btn.getAttribute("data-delete-label") + " from the waitlist. This can't be undone.";
    els.deleteModal.hidden = false;
    els.confirmDeleteBtn.focus();
  });

  function closeModal() {
    els.deleteModal.hidden = true;
    state.pendingDeleteId = null;
  }
  els.cancelDeleteBtn.addEventListener("click", closeModal);
  els.deleteModal.addEventListener("click", function (e) {
    if (e.target === els.deleteModal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !els.deleteModal.hidden) closeModal();
  });

  els.confirmDeleteBtn.addEventListener("click", async function () {
    if (!state.pendingDeleteId) return;
    let id = state.pendingDeleteId;
    els.confirmDeleteBtn.disabled = true;
    els.confirmDeleteBtn.textContent = "Removing...";

    try {
      await window.ZunoAdmin.api.deleteEntry(id);
      closeModal();
      showToast("Signup removed.");
      // If we just deleted the last row on a page beyond page 1, step back a page.
      if (state.items.length === 1 && state.page > 1) {
        state.page -= 1;
      }
      loadWaitlist();
      loadStats();
    } catch (err) {
      showToast(err.message || "Couldn't remove that signup.");
    } finally {
      els.confirmDeleteBtn.disabled = false;
      els.confirmDeleteBtn.textContent = "Remove";
    }
  });

  /* ---------- Export CSV ---------- */
  function toCsvValue(value) {
    let str = value == null ? "" : String(value);
    if (/[",\n]/.test(str)) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  els.exportBtn.addEventListener("click", async function () {
    let original = els.exportBtn.textContent;
    els.exportBtn.disabled = true;
    els.exportBtn.textContent = "Preparing...";

    try {
      let result = await window.ZunoAdmin.api.getWaitlist({ search: state.search, page: 1, limit: 5000 });
      let items = result.items || [];

      if (items.length === 0) {
        showToast("Nothing to export yet.");
        return;
      }

      let rows = [["Name", "Email", "Joined"]];
      items.forEach(function (item) {
        rows.push([item.fullName || item.name || "", item.email || "", formatDate(item.createdAt)]);
      });

      let csv = rows.map(function (row) { return row.map(toCsvValue).join(","); }).join("\n");
      let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "zuno-waitlist-" + new Date().toISOString().slice(0, 10) + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || "Couldn't export the waitlist.");
    } finally {
      els.exportBtn.disabled = false;
      els.exportBtn.textContent = original;
    }
  });

  /* ---------- Init ---------- */
  loadWaitlist();
  loadStats();
})();
