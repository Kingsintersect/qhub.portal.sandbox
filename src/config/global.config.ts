export const SUPPORT_EMAIL = "support.odl@school.edu.ng"
export const SUPPORT_PHONE = "+2347044914032";
export const UNIVERSITY_NAME = "University of Lagos";
export const UNIVERSITY_LOGO_URL = "/logo/logo.jpg";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export const ADMISSION_PORTAL_URL = "https://admission.unilag.edu.ng";
export const PAYMENT_GATEWAY_URL = "https://payments.unilag.edu.ng";

export const SOCIAL_MEDIA_LINKS = {
    facebook: "https://www.facebook.com/unilag",
    twitter: "https://twitter.com/unilag",
    instagram: "https://www.instagram.com/unilag",
    linkedin: "https://www.linkedin.com/school/unilag",
};
export const CONTACT_INFO = {
    address: "University of Lagos, Akoka, Lagos, Nigeria",
    email: SUPPORT_EMAIL,
    phone: SUPPORT_PHONE,
};

export const OUR_PROGRAMS = {
    "Distance Learning Programs": true,
    "Undergraduate Programs": false,
    "Postgraduate Programs": true,
    "Business School Programs": false,
    "Professional Courses": false,
    "Certificate Programs": true,
    "Diploma Programs": false,
    "Online Courses": false
};

// FEE AMOUNTS (could also be fetched from API in real implementation)
export const APPLICATION_FEE_AMOUNT = 10000;
export const ACCEPTANCE_FEE_AMOUNT = 30000;
export const TUITION_FEE_AMOUNT = 195000;
