import apiClient from "@/lib/clients/apiClient"
import type { FormDefaultValues } from "../types/form-types"

const AUTH = { access_token: true } as const

export interface CurrentUserProfile {
  firstName: string | null
  middleName: string | null
  lastName: string | null
  email: string
  phoneNumber: string | null
}

export async function fetchMyProfile(): Promise<CurrentUserProfile> {
  return apiClient.get<CurrentUserProfile>("/auth/me", AUTH)
}

export interface SubmitApplicationResponse {
  id: number
  applicationNumber: string
  status: string
}

// Applications - Submit.bru's post-response script reads res.body.data.id —
// the real response is {data: {...}}-wrapped despite admission_README.md
// showing a flat shape for this endpoint.
interface SubmitApplicationApiResponse {
  data: SubmitApplicationResponse
}

/**
 * Builds the real multipart/form-data body per bruno/admission's
 * "Applications - Submit.bru" and posts to POST /admissions/applications.
 * Field casing intentionally mixed: camelCase for identity/program fields
 * (firstName, sessionId, programId, entryMode, startTerm, studyMode,
 * agreeToTerms), snake_case for everything documented in admission_README.md's
 * original CreateApplicationDto — this matches the real backend exactly, not
 * a frontend convention choice.
 */
export async function submitApplication(
  values: FormDefaultValues,
  profile: CurrentUserProfile,
  sessionId: number
): Promise<SubmitApplicationResponse> {
  const form = new FormData()

  const appendIf = (
    key: string,
    value: string | number | boolean | undefined | null
  ) => {
    if (value === undefined || value === null || value === "") return
    // Laravel's `boolean` validation rule only accepts true/false/1/0/"1"/"0"
    // (strict in_array check) — NOT the strings "true"/"false" that
    // String(value) would produce, so every has_disability/has_sponsor/
    // is_next_of_kin_primary_contact/awaiting_result submission was failing
    // backend validation with "must be true or false" until this mapped
    // booleans to "1"/"0" specifically.
    const serialized =
      typeof value === "boolean" ? (value ? "1" : "0") : String(value)
    form.append(key, serialized)
  }

  // Identity — from the logged-in user's own profile, not re-collected.
  appendIf("firstName", profile.firstName ?? "")
  appendIf("middleName", profile.middleName ?? "")
  appendIf("lastName", profile.lastName ?? "")
  appendIf("email", profile.email)
  appendIf("phoneNumber", profile.phoneNumber ?? "")

  // Program & session
  appendIf("entryMode", values.entryMode)
  appendIf("sessionId", sessionId)
  appendIf("programId", values.programId)

  // Step 1: Personal Information
  appendIf("nationality", values.nationality)
  appendIf("stateOfOrigin", values.state_of_origin)
  appendIf("lga", values.lga)
  appendIf("religion", values.religion)
  appendIf("dob", values.dob)
  appendIf("gender", values.gender === "Male" ? "MALE" : "FEMALE")
  appendIf("hometown", values.hometown)
  appendIf("hometown_address", values.hometown_address)
  appendIf("contact_address", values.contact_address)
  appendIf("has_disability", values.has_disability)
  if (values.has_disability) appendIf("disability", values.disability)

  // Step 2: Sponsor Information
  appendIf("has_sponsor", values.has_sponsor)
  if (values.has_sponsor) {
    appendIf("sponsor_name", values.sponsor_name)
    appendIf("sponsor_relationship", values.sponsor_relationship)
    appendIf("sponsor_email", values.sponsor_email)
    appendIf("sponsor_contact_address", values.sponsor_contact_address)
    appendIf("sponsor_phone_number", values.sponsor_phone_number)
  }

  // Step 3: Next of Kin
  appendIf("next_of_kin_name", values.next_of_kin_name)
  appendIf("next_of_kin_relationship", values.next_of_kin_relationship)
  appendIf("next_of_kin_phone_number", values.next_of_kin_phone_number)
  appendIf("next_of_kin_address", values.next_of_kin_address)
  appendIf("next_of_kin_email", values.next_of_kin_email)
  appendIf(
    "is_next_of_kin_primary_contact",
    values.is_next_of_kin_primary_contact
  )
  appendIf(
    "next_of_kin_alternate_phone_number",
    values.next_of_kin_alternate_phone_number
  )
  appendIf("next_of_kin_occupation", values.next_of_kin_occupation)
  appendIf("next_of_kin_workplace", values.next_of_kin_workplace)

  // Step 5 & 6: Qualification fields + exam sitting
  appendIf("awaiting_result", values.awaiting_result)
  if (!values.awaiting_result) {
    appendIf("combined_result", values.combined_result)
    appendIf("first_sitting_type", values.first_sitting_type)
    appendIf("first_sitting_year", values.first_sitting_year)
    appendIf("first_sitting_exam_number", values.first_sitting_exam_number)
    if (values.combined_result === "combined_result") {
      appendIf("second_sitting_type", values.second_sitting_type)
      appendIf("second_sitting_year", values.second_sitting_year)
      appendIf("second_sitting_exam_number", values.second_sitting_exam_number)
    }
  }

  // Step 8: Program Selection
  appendIf("startTerm", values.startTerm)
  appendIf("studyMode", values.studyMode)
  appendIf("agreeToTerms", values.agreeToTerms)

  // Files (Step 4 & 7)
  if (values.passport) form.append("passport", values.passport)
  if (values.first_school_leaving)
    form.append("first_school_leaving", values.first_school_leaving)
  if (values.o_level) form.append("o_level", values.o_level)
  if (values.other_documents) {
    values.other_documents.forEach((file) =>
      form.append("other_documents[]", file)
    )
  }
  if (values.first_sitting_result)
    form.append("first_sitting_result", values.first_sitting_result)
  if (values.second_sitting_result)
    form.append("second_sitting_result", values.second_sitting_result)

  const response = await apiClient.post<SubmitApplicationApiResponse>(
    "/admissions/applications",
    form,
    AUTH
  )
  return response.data
}
