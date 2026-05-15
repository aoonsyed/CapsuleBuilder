/** Form Department storefront auth URLs (Shopify customer accounts). */
export const FD_STORE_URL = "https://formdepartment.com";
export const FD_LOGIN_URL = `${FD_STORE_URL}/account/login`;
export const FD_REGISTER_URL = `${FD_STORE_URL}/account/register`;
export const FD_LOGOUT_URL = `${FD_STORE_URL}/account/logout`;
export const FD_ACCOUNT_URL = `${FD_STORE_URL}/account`;
export const FD_UPGRADE_URL =
  "https://formdepartment.com/pages/about?view=subscription-plans";

export function getCustomerIdFromSearch(search = "") {
  const params =
    typeof search === "string" && search.length
      ? new URLSearchParams(search.startsWith("?") ? search : `?${search}`)
      : typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
  return (params.get("customer_id") || "").trim();
}

export function isSignedIn(customerId = getCustomerIdFromSearch()) {
  return /^\d{13}$/.test(customerId);
}

/** Capsule Builder URL to return to after login/register (current page when possible). */
export function getCapsuleReturnUrl() {
  if (typeof window === "undefined") {
    return `${FD_STORE_URL}/apps/capsule-builder`;
  }
  const { origin, pathname, search } = window.location;
  if (pathname.includes("capsule") || pathname === "/" || pathname === "/landing") {
    return `${origin}${pathname}${search}`;
  }
  return `${origin}/capsule-builder`;
}

function withReturnUrl(basePath, returnUrl) {
  const u = new URL(basePath, FD_STORE_URL);
  u.searchParams.set("return_url", returnUrl || getCapsuleReturnUrl());
  return u.toString();
}

export function buildLoginUrl(returnUrl) {
  return withReturnUrl(FD_LOGIN_URL, returnUrl);
}

export function buildRegisterUrl(returnUrl) {
  return withReturnUrl(FD_REGISTER_URL, returnUrl);
}

export function buildLogoutUrl(returnUrl) {
  const u = new URL(FD_LOGOUT_URL);
  if (returnUrl) {
    u.searchParams.set("return_url", returnUrl);
  } else {
    u.searchParams.set("return_url", FD_STORE_URL);
  }
  return u.toString();
}

export function buildStoreUrlWithCustomer(customerId) {
  const u = new URL(FD_STORE_URL);
  if (customerId) u.searchParams.set("customer_id", customerId);
  return u.toString();
}

export function signOut() {
  if (typeof window !== "undefined") {
    window.location.href = buildLogoutUrl();
  }
}
