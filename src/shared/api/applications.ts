import { requestJson } from './client'

export type ApplicationStatus = 'Submitted' | 'Viewed' | 'Invited' | 'Rejected' | 'Withdrawn'

export type WorkExperience = {
  companyName: string
  position: string
  startedOn: string
  endedOn: string | null
  description: string | null
}

export type Education = {
  institution: string
  specialty: string
  degree: string | null
  graduationYear: number | null
}

export type ResumeSnapshot = {
  fullName: string
  contactEmail: string
  contactPhone: string
  desiredPosition: string
  summary: string
  skills: string[]
  workExperience: WorkExperience[]
  education: Education[]
}

export type JobApplication = {
  id: string
  vacancyId: string
  status: ApplicationStatus
  coverLetter: string | null
  resumeSnapshot: ResumeSnapshot
  snapshotVersion: number
  submittedAt: string
}

export type CreditBalance = { periodDate: string; balance: number; dailyLimit: number }

type JsonObject = Record<string, unknown>
type WireApplication = Omit<JobApplication, 'resumeSnapshot'> & { resumeSnapshot: unknown }

function object(value: unknown): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {}
}

function field(source: JsonObject, camelCase: string, pascalCase: string): unknown {
  return source[camelCase] ?? source[pascalCase]
}

function stringField(source: JsonObject, camelCase: string, pascalCase: string): string {
  const value = field(source, camelCase, pascalCase)
  return typeof value === 'string' ? value : ''
}

function nullableStringField(source: JsonObject, camelCase: string, pascalCase: string): string | null {
  const value = field(source, camelCase, pascalCase)
  return typeof value === 'string' ? value : null
}

function arrayField(source: JsonObject, camelCase: string, pascalCase: string): unknown[] {
  const value = field(source, camelCase, pascalCase)
  return Array.isArray(value) ? value : []
}

export function normalizeResumeSnapshot(value: unknown): ResumeSnapshot {
  const source = object(value)
  return {
    fullName: stringField(source, 'fullName', 'FullName'),
    contactEmail: stringField(source, 'contactEmail', 'ContactEmail'),
    contactPhone: stringField(source, 'contactPhone', 'ContactPhone'),
    desiredPosition: stringField(source, 'desiredPosition', 'DesiredPosition'),
    summary: stringField(source, 'summary', 'Summary'),
    skills: arrayField(source, 'skills', 'Skills').filter((skill): skill is string => typeof skill === 'string'),
    workExperience: arrayField(source, 'workExperience', 'WorkExperience').map(item => {
      const experience = object(item)
      return {
        companyName: stringField(experience, 'companyName', 'CompanyName'),
        position: stringField(experience, 'position', 'Position'),
        startedOn: stringField(experience, 'startedOn', 'StartedOn'),
        endedOn: nullableStringField(experience, 'endedOn', 'EndedOn'),
        description: nullableStringField(experience, 'description', 'Description'),
      }
    }),
    education: arrayField(source, 'education', 'Education').map(item => {
      const education = object(item)
      const graduationYear = field(education, 'graduationYear', 'GraduationYear')
      return {
        institution: stringField(education, 'institution', 'Institution'),
        specialty: stringField(education, 'specialty', 'Specialty'),
        degree: nullableStringField(education, 'degree', 'Degree'),
        graduationYear: typeof graduationYear === 'number' ? graduationYear : null,
      }
    }),
  }
}

function normalizeApplication(application: WireApplication): JobApplication {
  return { ...application, resumeSnapshot: normalizeResumeSnapshot(application.resumeSnapshot) }
}

export function applyToVacancy(vacancyId: string, coverLetter: string | null = null) {
  return requestJson<WireApplication>(`/api/vacancies/${vacancyId}/applications`, {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ coverLetter }),
  }).then(normalizeApplication)
}

export function getMyApplications() {
  return requestJson<WireApplication[]>('/api/applications/me', { cache: 'no-store' })
    .then(applications => applications.map(normalizeApplication))
}

export function withdrawApplication(applicationId: string) {
  return requestJson<WireApplication>(`/api/applications/${applicationId}/withdraw`, { method: 'POST' })
    .then(normalizeApplication)
}

export function getMyCredits() {
  return requestJson<CreditBalance>('/api/credits/me', { cache: 'no-store' })
}

export function getVacancyApplications(vacancyId: string) {
  return requestJson<WireApplication[]>(`/api/vacancies/${vacancyId}/applications`, { cache: 'no-store' })
    .then(applications => applications.map(normalizeApplication))
}

export function updateApplicationStatus(applicationId: string, status: 'Viewed' | 'Invited' | 'Rejected') {
  return requestJson<WireApplication>(`/api/employer/applications/${applicationId}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }).then(normalizeApplication)
}
