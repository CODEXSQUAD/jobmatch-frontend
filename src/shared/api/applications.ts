import { requestJson } from './client'

export type ApplicationStatus = 'Submitted' | 'Viewed' | 'Invited' | 'Rejected' | 'Withdrawn'

export type JobApplication = {
  id: string
  vacancyId: string
  status: ApplicationStatus
  coverLetter: string | null
  resumeSnapshot: unknown
  snapshotVersion: number
  submittedAt: string
}

export type CreditBalance = { periodDate: string; balance: number; dailyLimit: number }

export function applyToVacancy(vacancyId: string, coverLetter: string | null = null) {
  return requestJson<JobApplication>(`/api/vacancies/${vacancyId}/applications`, {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ coverLetter }),
  })
}

export function getMyApplications() {
  return requestJson<JobApplication[]>('/api/applications/me', { cache: 'no-store' })
}

export function withdrawApplication(applicationId: string) {
  return requestJson<JobApplication>(`/api/applications/${applicationId}/withdraw`, { method: 'POST' })
}

export function getMyCredits() {
  return requestJson<CreditBalance>('/api/credits/me', { cache: 'no-store' })
}

export function getVacancyApplications(vacancyId: string) {
  return requestJson<JobApplication[]>(`/api/vacancies/${vacancyId}/applications`, { cache: 'no-store' })
}

export function updateApplicationStatus(applicationId: string, status: 'Viewed' | 'Invited' | 'Rejected') {
  return requestJson<JobApplication>(`/api/employer/applications/${applicationId}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  })
}
