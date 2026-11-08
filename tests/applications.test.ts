import { describe, expect, it } from 'vitest'
import { normalizeResumeSnapshot } from '../src/shared/api/applications'

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
})
