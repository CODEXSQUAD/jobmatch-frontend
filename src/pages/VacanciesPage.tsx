import { useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Pagination, Paper, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getVacancies } from '../shared/api/vacancies'
import type { VacancySummary, WorkFormat } from '../shared/api/vacancies'

const formats: Record<WorkFormat, string> = { Office: 'Офис', Remote: 'Удалённо', Hybrid: 'Гибрид' }
const money = new Intl.NumberFormat('ru-RU')

function salary({ salaryFrom, salaryTo }: VacancySummary) {
  if (salaryFrom != null && salaryTo != null) return `${money.format(salaryFrom)}–${money.format(salaryTo)} ₽ / месяц`
  if (salaryFrom != null) return `от ${money.format(salaryFrom)} ₽ / месяц`
  if (salaryTo != null) return `до ${money.format(salaryTo)} ₽ / месяц`
  return 'Зарплата не указана'
}

export function VacanciesPage() {
  const [page, setPage] = useState(1)
  const vacancies = useQuery({
    queryKey: ['vacancies', page],
    queryFn: ({ signal }) => getVacancies(page, signal),
    networkMode: 'always',
    retry: false,
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h1">Вакансии</Typography>
      <Typography color="text.secondary">Опубликованные вакансии работодателей. В учебном окружении используются вымышленные компании и предложения.</Typography>
      <Box aria-live="polite" aria-busy={vacancies.isFetching}>
        {vacancies.isFetching ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }} role="status">
            <CircularProgress size={24} aria-label="Загрузка вакансий" />
            <Typography>Загружаем вакансии…</Typography>
          </Stack>
        ) : vacancies.isError ? (
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Alert severity="error">{vacancies.error.message}</Alert>
            <Button variant="outlined" onClick={() => void vacancies.refetch()}>Повторить загрузку</Button>
          </Stack>
        ) : vacancies.data?.items.length === 0 ? (
          <Alert severity="info">На этой странице пока нет вакансий.</Alert>
        ) : (
          <Stack spacing={2}>
            {vacancies.data?.items.map(vacancy => (
              <Paper component="article" key={vacancy.id} variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h2" gutterBottom>{vacancy.title}</Typography>
                <Typography sx={{ mb: 1 }}>{salary(vacancy)}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{vacancy.company.name} · {vacancy.city}</Typography>
                <Chip label={formats[vacancy.workFormat]} size="small" variant="outlined" />
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
      {vacancies.data && !vacancies.isError && !vacancies.isFetching && vacancies.data.totalPages > 1 && (
        <Pagination count={vacancies.data.totalPages} page={page} onChange={(_event, value) => setPage(value)}
          getItemAriaLabel={(type, value) => type === 'page' ? `Страница ${value}` : type === 'next' ? 'Следующая страница' : 'Предыдущая страница'} />
      )}
    </Stack>
  )
}
