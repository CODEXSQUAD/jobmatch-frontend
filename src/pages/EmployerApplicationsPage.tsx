import { Alert, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { getVacancyApplications, updateApplicationStatus } from '../shared/api/applications'
import type { ApplicationStatus } from '../shared/api/applications'

const labels: Record<ApplicationStatus, string> = { Submitted: 'Новый', Viewed: 'Просмотрен', Invited: 'Приглашён', Rejected: 'Отказ', Withdrawn: 'Отозван' }

export function EmployerApplicationsPage() {
  const { vacancyId = '' } = useParams()
  const queryClient = useQueryClient()
  const applications = useQuery({ queryKey: ['vacancy-applications', vacancyId], queryFn: () => getVacancyApplications(vacancyId), enabled: Boolean(vacancyId), retry: false })
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Viewed' | 'Invited' | 'Rejected' }) => updateApplicationStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['vacancy-applications', vacancyId] }),
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h1">Отклики на вакансию</Typography>
      {applications.isError && <Alert severity="error">{applications.error.message}</Alert>}
      {update.isError && <Alert severity="error">{update.error.message}</Alert>}
      {applications.data?.length === 0 && <Alert severity="info">Откликов пока нет.</Alert>}
      {applications.data?.map(application => {
        const resume = application.resumeSnapshot
        return (
          <Paper key={application.id} variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Chip label={labels[application.status]} />
              <Typography variant="h2">{resume.fullName || 'Кандидат'}</Typography>
              <Typography>{resume.desiredPosition || 'Должность не указана'}</Typography>
              <Typography>{[resume.contactEmail, resume.contactPhone].filter(Boolean).join(' · ') || 'Контакты не указаны'}</Typography>
              <Typography>{resume.summary || 'Описание не указано'}</Typography>
              <Typography color="text.secondary">Навыки: {resume.skills.join(', ') || 'не указаны'}</Typography>
              {resume.workExperience.map((experience, index) => (
                <Typography key={`work-${index}`} color="text.secondary">
                  Опыт: {experience.position} в {experience.companyName}, с {experience.startedOn}{experience.endedOn ? ` по ${experience.endedOn}` : ''}{experience.description ? ` — ${experience.description}` : ''}
                </Typography>
              ))}
              {resume.education.map((education, index) => (
                <Typography key={`education-${index}`} color="text.secondary">
                  Образование: {education.institution}, {education.specialty}{education.degree ? `, ${education.degree}` : ''}{education.graduationYear ? ` (${education.graduationYear})` : ''}
                </Typography>
              ))}
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {application.status === 'Submitted' && <Button onClick={() => update.mutate({ id: application.id, status: 'Viewed' })}>Просмотрено</Button>}
                {['Submitted', 'Viewed'].includes(application.status) && <Button variant="contained" color="success" onClick={() => update.mutate({ id: application.id, status: 'Invited' })}>Пригласить</Button>}
                {!['Rejected', 'Withdrawn'].includes(application.status) && <Button variant="outlined" color="error" onClick={() => update.mutate({ id: application.id, status: 'Rejected' })}>Отказать</Button>}
              </Stack>
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}
