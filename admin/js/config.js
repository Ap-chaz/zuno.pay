/* =========================================================
   ZUNO Admin — config
   Point this at your backend once it's live. Everything else
   in the admin panel reads from here.
   ========================================================= */
window.ZUNO_ADMIN_CONFIG = {
  // Base URL for the API. Leave as "/api" if the admin panel is
  // served from the same domain as the backend. Otherwise use a
  // full origin, e.g. "https://api.zunopay.com".
  API_BASE_URL: "/api",

  // Expected endpoints (adjust paths in api.js if yours differ):
  //   POST   {API_BASE_URL}/admin/login          { email, password } -> { token, admin }
  //   GET    {API_BASE_URL}/admin/waitlist        ?search=&page=&limit= -> { items, total, page, limit }
  //   DELETE {API_BASE_URL}/admin/waitlist/:id    -> { success }

  // ---------------------------------------------------------
  // TEMPORARY — no backend yet. When DEV_MODE is true, login
  // and the waitlist table both run entirely in the browser
  // against the fixed credentials and fake data below, no
  // network calls made. Set this to false (or delete this
  // whole block) once your real backend is live.
  // ---------------------------------------------------------
  DEV_MODE: true,
  DEV_CREDENTIALS: {
    email: "admin@zunopay.com",
    password: "zuno-admin-2026",
  },
  DEV_MOCK_WAITLIST: [
    { id: "1", fullName: "Amina Wanjiru",   email: "amina.wanjiru@gmail.com",  createdAt: daysAgo(0) },
    { id: "2", fullName: "Brian Otieno",    email: "brian.otieno@gmail.com",   createdAt: daysAgo(0) },
    { id: "3", fullName: "Cynthia Mutua",   email: "cynthia.mutua@yahoo.com",  createdAt: daysAgo(1) },
    { id: "4", fullName: "Dennis Kiprop",   email: "dennis.kiprop@gmail.com",  createdAt: daysAgo(2) },
    { id: "5", fullName: "Faith Achieng",   email: "faith.achieng@outlook.com",createdAt: daysAgo(3) },
    { id: "6", fullName: "George Mwangi",   email: "george.mwangi@gmail.com",  createdAt: daysAgo(4) },
    { id: "7", fullName: "Halima Noor",     email: "halima.noor@gmail.com",    createdAt: daysAgo(5) },
    { id: "8", fullName: "Ian Kamau",       email: "ian.kamau@gmail.com",      createdAt: daysAgo(6) },
    { id: "9", fullName: "Joyce Nyambura",  email: "joyce.nyambura@gmail.com", createdAt: daysAgo(8) },
    { id: "10", fullName: "Kevin Omondi",   email: "kevin.omondi@gmail.com",   createdAt: daysAgo(12) },
    { id: "11", fullName: "Lilian Chebet",  email: "lilian.chebet@gmail.com",  createdAt: daysAgo(15) },
    { id: "12", fullName: "Moses Njoroge",  email: "moses.njoroge@gmail.com",  createdAt: daysAgo(20) },
  ],
};

function daysAgo(n) {
  let d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

