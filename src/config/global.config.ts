import { resolveApiBaseUrl } from "@/lib/tenant/api-origin"

/*
| Fallback branding.
|
| These are no longer the institution's identity — that comes per-request from
| GET /tenant/public via useTenant(). They remain as the defaults used when no
| tenant is resolved: the platform host, and the case where the branding
| lookup fails and a page still has to render something.
*/
export const SUPPORT_EMAIL = "support.odl@school.edu.ng"
export const SUPPORT_PHONE = "+2347044914032"
export const UNIVERSITY_NAME = "University of Lagos"
export const UNIVERSITY_LOGO_URL = "/logo/logo.jpg"
/**
 * The API base for the institution this request belongs to.
 *
 * Was previously `process.env.X + "/api/v1" || fallback` — string concatenation
 * is always truthy, so that fallback could never run and an unset variable
 * yielded "undefined/api/v1". Resolution now lives in resolveApiBaseUrl(),
 * which derives the host so each institution talks to its own API.
 */
export const API_BASE_URL = resolveApiBaseUrl()

export const ADMISSION_PORTAL_URL = "https://admission.unilag.edu.ng"
export const PAYMENT_GATEWAY_URL = "https://payments.unilag.edu.ng"

export const SOCIAL_MEDIA_LINKS = {
  facebook: "https://www.facebook.com/unilag",
  twitter: "https://twitter.com/unilag",
  instagram: "https://www.instagram.com/unilag",
  linkedin: "https://www.linkedin.com/school/unilag",
}
export const CONTACT_INFO = {
  address: "University of Lagos, Akoka, Lagos, Nigeria",
  email: SUPPORT_EMAIL,
  phone: SUPPORT_PHONE,
}

export const OUR_PROGRAMS = {
  "Distance Learning Programs": true,
  "Undergraduate Programs": false,
  "Postgraduate Programs": true,
  "Business School Programs": false,
  "Professional Courses": false,
  "Certificate Programs": true,
  "Diploma Programs": false,
  "Online Courses": false,
}

// FEE AMOUNTS (could also be fetched from API in real implementation)
export const APPLICATION_FEE_AMOUNT = 10000
export const ACCEPTANCE_FEE_AMOUNT = 30000
export const TUITION_FEE_AMOUNT = 195000

// SITE RELATED INFORMATION
export const SITE_NAME = "QHUB University Portal"
export const SITE_DESCRIPTION =
  "Your gateway to academic excellence and seamless university services at QHUB University."
export const SITE_KEYWORDS =
  "QHUB University, student portal, academic services, financial services, course registration, results, admission, fees payment"
export const SITE_URL = "https://qhub.portal.sandbox.qverselearning.org"
export const SITE_LOGO_URL = "/logo/logo.jpg"
