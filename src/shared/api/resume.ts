import { requestJson } from './client'

export type Resume = {
  fullName: string
  contactEmail: string
  contactPhone: string
  desiredPosition: string
  summary: string
  skills: string[]
  workExperience: Array<{
    companyName: string
    position: string
    startedOn: string
    endedOn: string | null
    description: string | null
  }>
  education: Array<{
    institution: string
    specialty: string
    degree: string | null
    graduationYear: number | null
  }>
}

export function getMyResume() {
  return requestJson<Resume>('/api/resume/me', { cache: 'no-store' })
}

export function saveMyResume(resume: Resume) {
  return requestJson<Resume>('/api/resume/me', {
    method: 'PUT',
    body: JSON.stringify(resume),
  })
}
