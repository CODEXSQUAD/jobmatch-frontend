import { useState } from 'react'
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeVacancy, createVacancy, getEmployerVacancies, publishVacancy, updateVacancy } from '../shared/api/employer'
import type { Vacancy, VacancyInput } from '../shared/api/employer'

const vacanciesKey = ['employer-vacancies'] as const
const initial: VacancyInput = { title: '', description: '', requirements: '', city: '', workFormat: 'Hybrid', salaryFrom: null, salaryTo: null }
const statusLabels: Record<Vacancy['status'], string> = { Draft: 'Черновик', Published: 'Опубликована', Closed: 'Закрыта' }

function toInput(vacancy: Vacancy): VacancyInput {
  return {
    title: vacancy.title,
    description: vacancy.description,
    requirements: vacancy.requirements,
    city: vacancy.city,
    workFormat: vacancy.workFormat,
    salaryFrom: vacancy.salaryFrom,
    salaryTo: vacancy.salaryTo,
  }
}

export function EmployerVacanciesPage() {
  const [form, setForm] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const vacancies = useQuery({ queryKey: vacanciesKey, queryFn: getEmployerVacancies, retry: false })

  const replaceCached = (updated: Vacancy) => {
    queryClient.setQueryData<Vacancy[]>(vacanciesKey, current =>
      current?.map(vacancy => vacancy.id === updated.id ? updated : vacancy) ?? [updated])
  }

  const create = useMutation({
    mutationFn: createVacancy,
    onSuccess: created => {
      queryClient.setQueryData<Vacancy[]>(vacanciesKey, current => current ? [created, ...current] : [created])
      setForm(initial)
      setNotice('Черновик создан.')
    },
  })
  const save = useMutation({
    mutationFn: ({ id, input }: { id: string; input: VacancyInput }) => updateVacancy(id, input),
    onSuccess: updated => {
      replaceCached(updated)
      setEditingId(null)
      setForm(initial)
      setNotice('Изменения черновика сохранены.')
    },
  })
  const publish = useMutation({
    mutationFn: publishVacancy,
    onSuccess: updated => {
      replaceCached(updated)
      setNotice(`Вакансия «${updated.title}» опубликована.`)
    },
  })
  const close = useMutation({
    mutationFn: closeVacancy,
    onSuccess: updated => {
      replaceCached(updated)
      setNotice(`Вакансия «${updated.title}» закрыта.`)
    },
  })

  const formPending = create.isPending || save.isPending
  const listActionPending = publish.isPending || close.isPending
  const formError = editingId ? save.error : create.error

  const clearActionMessages = () => {
    setNotice(null)
    publish.reset()
    close.reset()
  }

  const startCreate = () => {
    if (formPending) return
    setEditingId(null)
    setForm(initial)
    setNotice(null)
    create.reset()
    save.reset()
    publish.reset()
    close.reset()
  }

  const startEdit = (vacancy: Vacancy) => {
    if (vacancy.status !== 'Draft' || formPending || listActionPending) return
    setEditingId(vacancy.id)
    setForm(toInput(vacancy))
    setNotice(null)
    create.reset()
    save.reset()
    publish.reset()
    close.reset()
  }

  const submit = () => {
    if (formPending) return
    setNotice(null)
    if (editingId) save.mutate({ id: editingId, input: form })
    else create.mutate(form)
  }

  const runPublish = (id: string) => {
    if (listActionPending || editingId) return
    clearActionMessages()
    publish.mutate(id)
  }

  const runClose = (id: string) => {
    if (listActionPending || editingId) return
    clearActionMessages()
    close.mutate(id)
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h1">Вакансии компании</Typography>
      {notice && <Alert severity="success">{notice}</Alert>}
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h2" sx={{ mb: 2 }}>{editingId ? 'Редактирование черновика' : 'Новый черновик'}</Typography>
        <Stack component="form" spacing={2} onSubmit={event => { event.preventDefault(); submit() }}>
          <TextField label="Название вакансии" required value={form.title} disabled={formPending} onChange={event => setForm({ ...form, title: event.target.value })} />
          <TextField label="Город" required value={form.city} disabled={formPending} onChange={event => setForm({ ...form, city: event.target.value })} />
          <TextField select label="Формат" value={form.workFormat} disabled={formPending} onChange={event => setForm({ ...form, workFormat: event.target.value as VacancyInput['workFormat'] })}>
            <MenuItem value="Office">Офис</MenuItem><MenuItem value="Remote">Удалённо</MenuItem><MenuItem value="Hybrid">Гибрид</MenuItem>
          </TextField>
          <TextField label="Описание" required multiline minRows={3} value={form.description} disabled={formPending} onChange={event => setForm({ ...form, description: event.target.value })} />
          <TextField label="Требования" required multiline minRows={3} value={form.requirements} disabled={formPending} onChange={event => setForm({ ...form, requirements: event.target.value })} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Зарплата от" type="number" value={form.salaryFrom ?? ''} disabled={formPending} onChange={event => setForm({ ...form, salaryFrom: event.target.value ? Number(event.target.value) : null })} />
            <TextField label="Зарплата до" type="number" value={form.salaryTo ?? ''} disabled={formPending} onChange={event => setForm({ ...form, salaryTo: event.target.value ? Number(event.target.value) : null })} />
          </Stack>
          {formError && <Alert severity="error">{editingId ? 'Не удалось сохранить черновик' : 'Не удалось создать черновик'}: {formError.message}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button type="submit" variant="contained" disabled={formPending}>
              {formPending ? 'Сохраняем…' : editingId ? 'Сохранить изменения' : 'Создать черновик'}
            </Button>
            {editingId && <Button type="button" disabled={formPending} onClick={startCreate}>Отменить редактирование</Button>}
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h2">Список вакансий</Typography>
      {vacancies.isPending && <Alert severity="info">Загружаем вакансии…</Alert>}
      {vacancies.isError && <Alert severity="error">Не удалось загрузить вакансии: {vacancies.error.message}</Alert>}
      {publish.isError && <Alert severity="error">Не удалось опубликовать вакансию: {publish.error.message}</Alert>}
      {close.isError && <Alert severity="error">Не удалось закрыть вакансию: {close.error.message}</Alert>}
      {vacancies.isSuccess && vacancies.data.length === 0 && <Alert severity="info">У компании пока нет вакансий. Создайте первый черновик.</Alert>}
      {vacancies.data?.map(vacancy => (
        <Paper key={vacancy.id} variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="h2">{vacancy.title}</Typography>
            <Typography>{vacancy.city} · {statusLabels[vacancy.status]}</Typography>
            <Typography color="text.secondary">{vacancy.description}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {vacancy.status === 'Draft' && (
                <>
                  <Button variant="outlined" disabled={formPending || listActionPending || editingId !== null} onClick={() => startEdit(vacancy)}>Редактировать</Button>
                  <Button variant="contained" disabled={listActionPending || formPending || editingId !== null} onClick={() => runPublish(vacancy.id)}>
                    {publish.isPending && publish.variables === vacancy.id ? 'Публикуем…' : 'Опубликовать'}
                  </Button>
                </>
              )}
              {vacancy.status === 'Published' && (
                <Button color="error" variant="outlined" disabled={listActionPending || formPending || editingId !== null} onClick={() => runClose(vacancy.id)}>
                  {close.isPending && close.variables === vacancy.id ? 'Закрываем…' : 'Закрыть'}
                </Button>
              )}
              {vacancy.status !== 'Draft' && <Button component={Link} to={`/employer/vacancies/${vacancy.id}/applications`}>Отклики</Button>}
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
