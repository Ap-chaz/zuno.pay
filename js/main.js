/* =========================================================
   ZUNO — main.js
   Handles: mobile nav toggle, waitlist tabs, form feedback,
   header scroll state. No external dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("navLinks");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("active");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close the menu after a nav link is tapped.
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    // Close on outside click.
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("active")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });

    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // Close if the viewport grows back to desktop size.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Waitlist tabs (Email / Phone) ---------- */
  document.querySelectorAll(".tabs").forEach(function (tabGroup) {
    var buttons = tabGroup.querySelectorAll("button");
    var card = tabGroup.closest(".waitlist-card");
    var input = card ? card.querySelector("input") : null;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        if (!input) return;
        var mode = btn.getAttribute("data-mode");
        if (mode === "phone") {
          input.type = "tel";
          input.placeholder = "Enter your phone number";
          input.setAttribute("inputmode", "tel");
        } else {
          input.type = "email";
          input.placeholder = "Enter your email address";
          input.removeAttribute("inputmode");
        }
      });
    });
  });

  /* ---------- Waitlist / contact forms ----------
     Front-end only placeholder: shows inline confirmation.
     Wire this up to a real signup endpoint when one exists. */
  document.querySelectorAll("form[data-waitlist-form]").forEach(function (form) {
    var feedback = form.querySelector(".form-feedback");
    var button = form.querySelector("button");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      if (input && !input.checkValidity()) {
        input.reportValidity();
        return;
      }
      if (feedback) {
        feedback.textContent = "You're on the list! We'll be in touch.";
      }
      if (button) {
        var original = button.textContent;
        button.disabled = true;
        button.textContent = "Joined ✓";
        setTimeout(function () {
          button.disabled = false;
          button.textContent = original;
        }, 3000);
      }
      form.reset();
    });
  });

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
