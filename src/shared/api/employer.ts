import { requestJson } from './client'
import type { WorkFormat } from './vacancies'

export type Company = { id: string; name: string; description: string; city: string }
export type CompanyInput = Omit<Company, 'id'>

export type Vacancy = {
  id: string
  title: string
  description: string
  requirements: string
  city: string
  workFormat: WorkFormat
  salaryFrom: number | null
  salaryTo: number | null
  status: 'Draft' | 'Published' | 'Closed'
  company: { id: string; name: string }
  publishedAt: string | null
}

export type VacancyInput = Pick<Vacancy, 'title' | 'description' | 'requirements' | 'city' | 'workFormat' | 'salaryFrom' | 'salaryTo'>

export const getMyCompany = () => requestJson<Company>('/api/company/me', { cache: 'no-store' })
export const saveMyCompany = (company: CompanyInput) => requestJson<Company>('/api/company/me', { method: 'PUT', body: JSON.stringify(company) })
export const getEmployerVacancies = () => requestJson<Vacancy[]>('/api/employer/vacancies', { cache: 'no-store' })
export const createVacancy = (vacancy: VacancyInput) => requestJson<Vacancy>('/api/employer/vacancies', { method: 'POST', body: JSON.stringify(vacancy) })
export const publishVacancy = (id: string) => requestJson<Vacancy>(`/api/employer/vacancies/${id}/publish`, { method: 'POST' })
export const closeVacancy = (id: string) => requestJson<Vacancy>(`/api/employer/vacancies/${id}/close`, { method: 'POST' })
