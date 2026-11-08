import { afterEach, describe, expect, it, vi } from 'vitest'
import { getVacancyApplications, normalizeResumeSnapshot, updateApplicationStatus } from '../src/shared/api/applications'

afterEach(() => vi.unstubAllGlobals())

const application = {
  id: 'application-1',
  vacancyId: 'vacancy-1',
  status: 'Submitted',
  coverLetter: 'Полный текст сопроводительного письма',
  snapshotVersion: 1,
  submittedAt: '2026-11-08T10:00:00Z',
  resumeSnapshot: {
    FullName: 'Старый кандидат',
    ContactEmail: 'legacy@example.test',
    ContactPhone: '+70000000002',
    DesiredPosition: 'Legacy-разработчик',
    Summary: 'Старое описание',
    Skills: ['PostgreSQL'],
    WorkExperience: [{ CompanyName: 'Старая компания', Position: 'Разработчик', StartedOn: '2020-01-01', EndedOn: null, Description: null }],
    Education: [{ Institution: 'Старый университет', Specialty: 'Информатика', Degree: null, GraduationYear: 2020 }],
  },
}

describe('resume snapshots', () => {
  it('keeps the current camelCase contract including nested fields', () => {
    const snapshot = normalizeResumeSnapshot({
      fullName: 'Новый кандидат',
      contactEmail: 'new@example.test',
      contactPhone: '+70000000001',
      desiredPosition: 'Разработчик',
      summary: 'Описание',
      skills: ['C#'],
      workExperience: [{ companyName: 'Новая компания', position: 'Стажёр', startedOn: '2025-01-01', endedOn: null, description: 'API' }],
      education: [{ institution: 'Университет', specialty: 'ПО', degree: 'Бакалавр', graduationYear: 2027 }],
    })

    expect(snapshot.fullName).toBe('Новый кандидат')
    expect(snapshot.workExperience[0].companyName).toBe('Новая компания')
    expect(snapshot.education[0].graduationYear).toBe(2027)
  })

  it('normalizes legacy PascalCase snapshots including nested fields', () => {
    const snapshot = normalizeResumeSnapshot({
      FullName: 'Старый кандидат',
      ContactEmail: 'legacy@example.test',
      ContactPhone: '+70000000002',
      DesiredPosition: 'Legacy-разработчик',
      Summary: 'Старое описание',
      Skills: ['PostgreSQL'],
      WorkExperience: [{ CompanyName: 'Старая компания', Position: 'Разработчик', StartedOn: '2020-01-01', EndedOn: null, Description: 'Backend' }],
      Education: [{ Institution: 'Старый университет', Specialty: 'Информатика', Degree: null, GraduationYear: 2020 }],
    })

    expect(snapshot).toMatchObject({
      fullName: 'Старый кандидат',
      contactEmail: 'legacy@example.test',
      contactPhone: '+70000000002',
      desiredPosition: 'Legacy-разработчик',
      skills: ['PostgreSQL'],
    })
    expect(snapshot.workExperience[0]).toMatchObject({ companyName: 'Старая компания', description: 'Backend' })
    expect(snapshot.education[0]).toMatchObject({ institution: 'Старый университет', graduationYear: 2020 })
  })

  it('keeps the cover letter and normalizes a legacy snapshot from the applications API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([application])))

    const result = await getVacancyApplications('vacancy-1')

    expect(result[0].coverLetter).toBe('Полный текст сопроводительного письма')
    expect(result[0].resumeSnapshot).toMatchObject({
      fullName: 'Старый кандидат',
      workExperience: [{ companyName: 'Старая компания', description: null }],
      education: [{ institution: 'Старый университет', degree: null }],
    })
  })

  it('sends the selected employer status and normalizes the updated application', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ...application, status: 'Invited' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await updateApplicationStatus('application-1', 'Invited')

    expect(result.status).toBe('Invited')
    expect(result.resumeSnapshot.fullName).toBe('Старый кандидат')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/employer/applications/application-1/status',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'Invited' }) }),
    )
  })
})
