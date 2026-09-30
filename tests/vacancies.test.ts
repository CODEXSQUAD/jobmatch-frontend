import { afterEach, expect, it, vi } from 'vitest'
import { getVacancies } from '../src/shared/api/vacancies'

afterEach(() => vi.unstubAllGlobals())

it('requests the selected page with the API prefix and accepts an empty page', async () => {
  const result = { items: [], page: 2, pageSize: 3, totalCount: 0, totalPages: 0 }
  const fetchMock = vi.fn().mockResolvedValue(Response.json(result))
  vi.stubGlobal('fetch', fetchMock)
  await expect(getVacancies(2)).resolves.toEqual(result)
  expect(fetchMock).toHaveBeenCalledWith('/api/vacancies?page=2&pageSize=3', expect.anything())
})

it('accepts a vacancy with optional salary fields', async () => {
  const result = { items: [{ id: '1', title: 'Разработчик', city: 'Москва', workFormat: 'Remote', salaryTo: null,
    company: { id: '2', name: 'Учебная компания' }, publishedAt: '2026-09-20T09:00:00Z' }], page: 1, pageSize: 3, totalCount: 1, totalPages: 1 }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(result)))
  await expect(getVacancies(1)).resolves.toEqual(result)
})

it.each([{}, { items: [null], page: 1, pageSize: 3, totalCount: 1, totalPages: 1 }])('rejects malformed catalog data: %j', async (data) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(data)))
  await expect(getVacancies(1)).rejects.toMatchObject({ code: 'invalid_response' })
})
