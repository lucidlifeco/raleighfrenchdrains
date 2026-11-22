// One place for everything that changes per site.
// When cloning this site for another market (e.g. Wilmington), edit this file first.
export default {
  name: "Raleigh French Drains",
  url: "https://raleighfrenchdrains.com",
  city: "Raleigh",
  region: "Wake and Johnston counties",

  // Replace with the call-tracking number before launch.
  phone: "(919) 000-0000",
  phoneHref: "+19190000000",
  phoneIsPlaceholder: true,

  // Form handler URL (CallRail form tracking, Formspree, etc.).
  // Leave empty to hide the form and show only the call button.
  formEndpoint: "",

  // Set up free forwarding with Cloudflare Email Routing.
  contactEmail: "info@raleighfrenchdrains.com",

  year: new Date().getFullYear(),

  areas: [
    "Raleigh", "Cary", "Apex", "Wake Forest", "Holly Springs",
    "Fuquay-Varina", "Garner", "Knightdale", "Clayton", "Morrisville",
  ],
};
