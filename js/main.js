/* =========================================================
   ZUNO — main.js
   Handles: mobile nav toggle, waitlist tabs, form feedback,
   header scroll state. No external dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  let toggle = document.getElementById("menuToggle");
  let nav = document.getElementById("navLinks");

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
      let isOpen = nav.classList.contains("active");
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

  /* ---------- Waitlist / contact forms ----------
     Front-end only placeholder: shows inline confirmation.
     Wire this up to a real signup endpoint when one exists. */
  document.querySelectorAll("form[data-waitlist-form]").forEach(function (form) {
    let feedback = form.querySelector(".form-feedback");
    let button = form.querySelector("button");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let inputs = form.querySelectorAll("input");
      let isValid = true;
      inputs.forEach(function (inp) {
        if (!inp.checkValidity()) {
          isValid = false;
        }
      });
      if (!isValid) {
        // Report on the first invalid field so the browser focuses it.
        for (let i = 0; i < inputs.length; i++) {
          if (!inputs[i].checkValidity()) {
            inputs[i].reportValidity();
            break;
          }
        }
        return;
      }

      let data = {};
      inputs.forEach(function (inp) {
        data[inp.name || inp.id] = inp.value.trim();
      });
      // Front-end only placeholder: log the captured signup.
      // Wire this up to a real signup endpoint when one exists.
      console.log("Waitlist signup:", data);

      if (button) {
  let original = button.textContent;
  button.disabled = true;
  button.textContent = "Processing...";

  setTimeout(function () {
    button.textContent = "Reserved ✓";

    // Show the message at the same time
    if (feedback) {
      feedback.textContent = "You're on the list! We'll be in touch.";
    }

    setTimeout(function () {
      button.disabled = false;
      button.textContent = original;

      // Optional: clear the message after a few seconds
      feedback.textContent = "";
    }, 3000);

  }, 1200);
}

form.reset();
    });
  });

  /* ---------- Header scroll state ---------- */
  let header = document.querySelector("header");
  if (header) {
    let onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{

    e.preventDefault();

    const target=document.querySelector(
      link.getAttribute('href')
    );

    if(target){

      const offset = 90;

      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        offset;

      window.scrollTo({
        top,
        behavior:'smooth'
      });

    }

  });
});
