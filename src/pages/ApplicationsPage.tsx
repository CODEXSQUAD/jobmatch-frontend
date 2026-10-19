import { Alert, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyApplications, withdrawApplication } from '../shared/api/applications'
import type { ApplicationStatus } from '../shared/api/applications'

const labels: Record<ApplicationStatus, string> = {
  Submitted: 'Отправлен', Viewed: 'Просмотрен', Invited: 'Приглашение', Rejected: 'Отказ', Withdrawn: 'Отозван',
}

export function ApplicationsPage() {
  const queryClient = useQueryClient()
  const applications = useQuery({ queryKey: ['applications'], queryFn: getMyApplications, retry: false })
  const withdraw = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h1">Мои отклики</Typography>
      {applications.isError && <Alert severity="error">{applications.error.message}</Alert>}
      {withdraw.isError && <Alert severity="error">{withdraw.error.message}</Alert>}
      {applications.data?.length === 0 && <Alert severity="info">Вы ещё не отправили ни одного отклика.</Alert>}
      {applications.data?.map(application => (
        <Paper key={application.id} variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Chip label={labels[application.status]} color={application.status === 'Invited' ? 'success' : application.status === 'Rejected' ? 'error' : 'default'} />
            <Typography>Вакансия: {application.vacancyId}</Typography>
            <Typography variant="body2" color="text.secondary">Отправлен {new Date(application.submittedAt).toLocaleString('ru-RU')}</Typography>
            {!['Rejected', 'Withdrawn'].includes(application.status) && (
              <Button variant="outlined" color="error" onClick={() => withdraw.mutate(application.id)} disabled={withdraw.isPending}>Отозвать отклик</Button>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
