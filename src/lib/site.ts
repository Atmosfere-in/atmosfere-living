/**
 * Business details used on the policy and contact pages.
 * Blank values are simply left out of the pages — fill them in when available.
 */
export const BUSINESS = {
  brand: "Atmosfere Living",
  legalName: "", // registered business name
  email: "", // customer support email
  phone: "", // customer support phone
  address: "", // registered address
  gstin: "",
  hours: "Monday to Saturday, 10 am – 6 pm IST",
  jurisdiction: "India",
};

/** The Contact page and "contact us" lines only appear once an email or phone is filled in. */
export const HAS_CONTACT = !!(BUSINESS.email || BUSINESS.phone);

/** Date shown as "Last updated" on the policy pages. */
export const POLICIES_UPDATED = "2026-11-16";
