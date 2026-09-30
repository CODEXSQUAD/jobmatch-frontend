import { ApiError, requestJson } from './client'

export type WorkFormat = 'Office' | 'Remote' | 'Hybrid'

export interface VacancySummary {
  id: string
  title: string
  city: string
  workFormat: WorkFormat
  salaryFrom?: number | null
  salaryTo?: number | null
  company: { id: string; name: string }
  publishedAt: string
}

export interface VacancyPage {
  items: VacancySummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSalary(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 0)
}

function isVacancy(value: unknown): value is VacancySummary {
  return isRecord(value)
    && typeof value.id === 'string' && typeof value.title === 'string'
    && typeof value.city === 'string' && typeof value.publishedAt === 'string'
    && ['Office', 'Remote', 'Hybrid'].includes(String(value.workFormat))
    && isSalary(value.salaryFrom) && isSalary(value.salaryTo)
    && isRecord(value.company) && typeof value.company.id === 'string'
    && typeof value.company.name === 'string'
}

export async function getVacancies(page: number, signal?: AbortSignal): Promise<VacancyPage> {
  const query = new URLSearchParams({ page: String(page), pageSize: '3' })
  const data = await requestJson<unknown>(`/api/vacancies?${query}`, { signal })
  if (!isRecord(data) || !Array.isArray(data.items) || !data.items.every(isVacancy)
    || !['page', 'pageSize', 'totalCount', 'totalPages'].every(key => Number.isInteger(data[key]))
    || Number(data.page) < 1 || Number(data.pageSize) < 1
    || Number(data.totalCount) < 0 || Number(data.totalPages) < 0) {
    throw new ApiError('Сервер вернул некорректный список вакансий.', undefined, 'invalid_response')
  }
  return data as unknown as VacancyPage
}
