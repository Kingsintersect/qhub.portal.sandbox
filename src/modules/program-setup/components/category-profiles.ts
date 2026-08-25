import type {
  CategoryProfile,
  ProgramCategory,
} from "@/modules/program-setup/types"

/**
 * What is structurally different about each programme type, as the wizard needs
 * to know it. Straight from the Program Type Configuration Reference §2 — every
 * value here is a real difference in how these programmes run in Nigeria, not a
 * cosmetic label.
 *
 * `usesCreditUnits` / `usesLevels` drive which fields are shown at all rather
 * than shown-and-ignored: a secondary "credit unit" or a cohort "level" is a
 * meaningless field that an admin would otherwise be invited to fill in.
 */
export const CATEGORY_PROFILES: Record<ProgramCategory, CategoryProfile> = {
  DEGREE: {
    label: "Degree (Undergraduate)",
    description:
      "NUC-regulated. Faculty → Department → Programme → Level → Semester. Credit-unit-weighted GPA on a 5-point scale.",
    courseTerm: "Course",
    structureHint: "Faculty → Department",
    usesCreditUnits: true,
    usesLevels: true,
    showsAccreditation: true,
    defaultSchemeType: "CREDIT_WEIGHTED_GPA",
    gpaIsOptIn: false,
  },
  POSTGRADUATE: {
    label: "Postgraduate",
    description:
      "Runs under a School of Postgraduate Studies rather than the undergraduate faculty tree. Same GPA mechanics, higher pass threshold, weighted thesis.",
    courseTerm: "Course",
    structureHint: "School of Postgraduate Studies",
    usesCreditUnits: true,
    usesLevels: true,
    showsAccreditation: false,
    defaultSchemeType: "CREDIT_WEIGHTED_GPA",
    gpaIsOptIn: false,
  },
  CERTIFICATE: {
    label: "Certificate",
    description:
      "Shortest and least regulated — as little as 8 weeks, rolling intake, no CGPA and no level progression. The certificate is the result.",
    courseTerm: "Module",
    structureHint: "Standalone — no faculty or department",
    usesCreditUnits: false,
    usesLevels: false,
    showsAccreditation: false,
    defaultSchemeType: "PASS_FAIL",
    gpaIsOptIn: true,
  },
  SECONDARY_SCHOOL: {
    label: "Secondary School",
    description:
      "Section → Stream → Class → Term. WAEC/NECO 9-point letter scale with a 30/70 CA-exam split; a simple average and class position rather than a GPA.",
    courseTerm: "Subject",
    structureHint: "Section → Stream (Senior only)",
    usesCreditUnits: false,
    usesLevels: true,
    showsAccreditation: false,
    defaultSchemeType: "SIMPLE_AVERAGE",
    gpaIsOptIn: true,
  },
}

export const CATEGORY_ORDER: ProgramCategory[] = [
  "DEGREE",
  "POSTGRADUATE",
  "CERTIFICATE",
  "SECONDARY_SCHOOL",
]
