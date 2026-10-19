import { useState } from 'react'
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeVacancy, createVacancy, getEmployerVacancies, publishVacancy } from '../shared/api/employer'
import type { VacancyInput } from '../shared/api/employer'

const initial: VacancyInput = { title: '', description: '', requirements: '', city: '', workFormat: 'Hybrid', salaryFrom: null, salaryTo: null }

export function EmployerVacanciesPage() {
  const [form, setForm] = useState(initial)
  const queryClient = useQueryClient()
  const vacancies = useQuery({ queryKey: ['employer-vacancies'], queryFn: getEmployerVacancies, retry: false })
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['employer-vacancies'] })
  const create = useMutation({ mutationFn: createVacancy, onSuccess: () => { setForm(initial); refresh() } })
  const publish = useMutation({ mutationFn: publishVacancy, onSuccess: refresh })
  const close = useMutation({ mutationFn: closeVacancy, onSuccess: refresh })

  return (
    <Stack spacing={4}>
      <Typography variant="h1">Вакансии компании</Typography>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Новый черновик</Typography>
        <Stack component="form" spacing={2} onSubmit={event => { event.preventDefault(); create.mutate(form) }}>
          <TextField label="Название вакансии" required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} />
          <TextField label="Город" required value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} />
          <TextField select label="Формат" value={form.workFormat} onChange={event => setForm({ ...form, workFormat: event.target.value as VacancyInput['workFormat'] })}>
            <MenuItem value="Office">Офис</MenuItem><MenuItem value="Remote">Удалённо</MenuItem><MenuItem value="Hybrid">Гибрид</MenuItem>
          </TextField>
          <TextField label="Описание" required multiline minRows={3} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
          <TextField label="Требования" required multiline minRows={3} value={form.requirements} onChange={event => setForm({ ...form, requirements: event.target.value })} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Зарплата от" type="number" value={form.salaryFrom ?? ''} onChange={event => setForm({ ...form, salaryFrom: event.target.value ? Number(event.target.value) : null })} />
            <TextField label="Зарплата до" type="number" value={form.salaryTo ?? ''} onChange={event => setForm({ ...form, salaryTo: event.target.value ? Number(event.target.value) : null })} />
          </Stack>
          {create.isError && <Alert severity="error">{create.error.message}</Alert>}
          <Button type="submit" variant="contained" disabled={create.isPending}>Создать черновик</Button>
        </Stack>
      </Paper>
      {vacancies.isError && <Alert severity="error">{vacancies.error.message}</Alert>}
      {vacancies.data?.map(vacancy => (
        <Paper key={vacancy.id} variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="h2">{vacancy.title}</Typography>
            <Typography>{vacancy.city} · {vacancy.status}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {vacancy.status === 'Draft' && <Button variant="contained" onClick={() => publish.mutate(vacancy.id)}>Опубликовать</Button>}
              {vacancy.status === 'Published' && <Button color="error" variant="outlined" onClick={() => close.mutate(vacancy.id)}>Закрыть</Button>}
              {vacancy.status !== 'Draft' && <Button component={Link} to={`/employer/vacancies/${vacancy.id}/applications`}>Отклики</Button>}
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
