import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeVacancy, publishVacancy, updateVacancy } from '../src/shared/api/employer'

afterEach(() => vi.unstubAllGlobals())

const input = {
  title: 'Обновлённый разработчик',
  description: 'Новое описание',
  requirements: 'Новые требования',
  city: 'Москва',
  workFormat: 'Remote' as const,
  salaryFrom: 150_000,
  salaryTo: 200_000,
}

const vacancy = {
  id: 'vacancy-1',
  ...input,
  status: 'Draft',
  company: { id: 'company-1', name: 'Компания' },
  publishedAt: null,
}

describe('employer vacancies API', () => {
  it('updates every field of an existing draft through the implemented PUT endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(vacancy))
    vi.stubGlobal('fetch', fetchMock)

    await expect(updateVacancy('vacancy-1', input)).resolves.toEqual(vacancy)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/vacancies/vacancy-1',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(input) }),
    )
  })

  it('keeps validation and status errors returned while saving a draft', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { code: 'vacancy_not_draft', message: 'Редактировать можно только черновик.' },
      { status: 409 },
    )))

    await expect(updateVacancy('vacancy-1', input)).rejects.toMatchObject({
      status: 409,
      code: 'vacancy_not_draft',
      message: 'Редактировать можно только черновик.',
    })
  })

  it.each([
    ['publish', publishVacancy, '/api/employer/vacancies/vacancy-1/publish'],
    ['close', closeVacancy, '/api/employer/vacancies/vacancy-1/close'],
  ] as const)('keeps the backend error for a failed %s action', async (_name, action, path) => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(
      { code: 'invalid_vacancy_status', message: 'Недопустимый статус вакансии.' },
      { status: 409 },
    ))
    vi.stubGlobal('fetch', fetchMock)

    await expect(action('vacancy-1')).rejects.toMatchObject({
      status: 409,
      code: 'invalid_vacancy_status',
      message: 'Недопустимый статус вакансии.',
    })
    expect(fetchMock).toHaveBeenCalledWith(path, expect.objectContaining({ method: 'POST' }))
  })
})
