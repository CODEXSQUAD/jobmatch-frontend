import { useState } from 'react'
import { Alert, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { getVacancyApplications, updateApplicationStatus } from '../shared/api/applications'
import type { ApplicationStatus, JobApplication } from '../shared/api/applications'

const labels: Record<ApplicationStatus, string> = { Submitted: 'Новый', Viewed: 'Просмотрен', Invited: 'Приглашён', Rejected: 'Отказ', Withdrawn: 'Отозван' }
const actionLabels = { Viewed: 'просмотр', Invited: 'приглашение', Rejected: 'отказ' } as const
type EmployerStatus = keyof typeof actionLabels

export function EmployerApplicationsPage() {
  const { vacancyId = '' } = useParams()
  const [notice, setNotice] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const applicationsKey = ['vacancy-applications', vacancyId] as const
  const applications = useQuery({ queryKey: applicationsKey, queryFn: () => getVacancyApplications(vacancyId), enabled: Boolean(vacancyId), retry: false })
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployerStatus }) => updateApplicationStatus(id, status),
    onSuccess: updated => {
      queryClient.setQueryData<JobApplication[]>(applicationsKey, current =>
        current?.map(application => application.id === updated.id ? updated : application) ?? [updated])
      setNotice(`Статус отклика изменён: ${labels[updated.status]}.`)
    },
  })

  const changeStatus = (id: string, status: EmployerStatus) => {
    if (update.isPending) return
    setNotice(null)
    update.reset()
    update.mutate({ id, status })
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h1">Отклики на вакансию</Typography>
      {Boolean(vacancyId) && applications.isPending && <Alert severity="info">Загружаем отклики…</Alert>}
      {applications.isError && <Alert severity="error">Не удалось загрузить отклики: {applications.error.message}</Alert>}
      {update.isError && (
        <Alert severity="error">
          Не удалось выполнить действие «{update.variables ? actionLabels[update.variables.status] : 'изменение статуса'}»: {update.error.message}
        </Alert>
      )}
      {notice && <Alert severity="success">{notice}</Alert>}
      {applications.isSuccess && applications.data.length === 0 && <Alert severity="info">На эту вакансию пока никто не откликнулся.</Alert>}
      {applications.data?.map(application => {
        const resume = application.resumeSnapshot
        const pendingThisApplication = update.isPending && update.variables?.id === application.id
        return (
          <Paper key={application.id} variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                <Typography variant="h2" sx={{ flex: 1 }}>{resume.fullName || 'Кандидат'}</Typography>
                <Chip label={labels[application.status]} />
              </Stack>

              <Stack spacing={0.5}>
                <Typography sx={{ fontWeight: 700 }}>{resume.desiredPosition || 'Желаемая должность не указана'}</Typography>
                <Typography>{resume.contactEmail || 'Email не указан'}</Typography>
                <Typography>{resume.contactPhone || 'Телефон не указан'}</Typography>
              </Stack>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{resume.summary || 'Описание кандидата не указано.'}</Typography>
              <Typography color="text.secondary">Навыки: {resume.skills.join(', ') || 'не указаны'}</Typography>

              <Divider />
              <Typography variant="h3">Опыт работы</Typography>
              {resume.workExperience.length === 0 && <Typography color="text.secondary">Опыт работы не указан.</Typography>}
              {resume.workExperience.map((experience, index) => (
                <Stack key={`work-${index}`} spacing={0.5}>
                  <Typography sx={{ fontWeight: 700 }}>{experience.position || 'Должность не указана'} · {experience.companyName || 'Компания не указана'}</Typography>
                  <Typography color="text.secondary">
                    {experience.startedOn || 'Дата начала не указана'} — {experience.endedOn || 'по настоящее время'}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{experience.description || 'Описание обязанностей не указано.'}</Typography>
                </Stack>
              ))}

              <Divider />
              <Typography variant="h3">Образование</Typography>
              {resume.education.length === 0 && <Typography color="text.secondary">Образование не указано.</Typography>}
              {resume.education.map((education, index) => (
                <Stack key={`education-${index}`} spacing={0.5}>
                  <Typography sx={{ fontWeight: 700 }}>{education.institution || 'Учебное заведение не указано'}</Typography>
                  <Typography>{education.specialty || 'Специальность не указана'}</Typography>
                  <Typography color="text.secondary">
                    {[education.degree, education.graduationYear].filter(value => value !== null && value !== '').join(' · ') || 'Степень и год окончания не указаны'}
                  </Typography>
                </Stack>
              ))}

              <Divider />
              <Typography variant="h3">Сопроводительное письмо</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {application.coverLetter?.trim() || 'Сопроводительное письмо не добавлено.'}
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {application.status === 'Submitted' && (
                  <Button disabled={update.isPending} onClick={() => changeStatus(application.id, 'Viewed')}>
                    {pendingThisApplication && update.variables?.status === 'Viewed' ? 'Сохраняем…' : 'Просмотрено'}
                  </Button>
                )}
                {['Submitted', 'Viewed'].includes(application.status) && (
                  <Button variant="contained" color="success" disabled={update.isPending} onClick={() => changeStatus(application.id, 'Invited')}>
                    {pendingThisApplication && update.variables?.status === 'Invited' ? 'Приглашаем…' : 'Пригласить'}
                  </Button>
                )}
                {!['Rejected', 'Withdrawn'].includes(application.status) && (
                  <Button variant="outlined" color="error" disabled={update.isPending} onClick={() => changeStatus(application.id, 'Rejected')}>
                    {pendingThisApplication && update.variables?.status === 'Rejected' ? 'Отказываем…' : 'Отказать'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}
