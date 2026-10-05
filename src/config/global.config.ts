// Instance placeholders — each university deployment replaces these values.
export const SUPPORT_EMAIL = "support@qhub.example"
export const SUPPORT_PHONE = "+234 800 000 0000"
export const UNIVERSITY_NAME = "QHUB University"
export const UNIVERSITY_LOGO_URL = "/logo/logo.jpg"
// Concatenating first made the fallback unreachable ("undefined/api/v1"), so
// choose the base before appending the version prefix.
export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3030"}/api/v1`

export const ADMISSION_PORTAL_URL = "https://admission.qhub.example"
export const PAYMENT_GATEWAY_URL = "https://payments.qhub.example"

export const SOCIAL_MEDIA_LINKS = {
  facebook: "https://www.facebook.com/qhub",
  twitter: "https://twitter.com/qhub",
  instagram: "https://www.instagram.com/qhub",
  linkedin: "https://www.linkedin.com/school/qhub",
}
export const CONTACT_INFO = {
  address: "QHUB University, Nigeria",
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
