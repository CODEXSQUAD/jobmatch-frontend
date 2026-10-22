import { useEffect, useState } from 'react'
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiError } from '../shared/api/client'
import { getMyCompany, saveMyCompany } from '../shared/api/employer'
import type { CompanyInput } from '../shared/api/employer'

export function CompanyPage() {
  const [form, setForm] = useState<CompanyInput>({ name: '', description: '', city: '' })
  const company = useQuery({ queryKey: ['company'], queryFn: getMyCompany, retry: false })
  const save = useMutation({ mutationFn: saveMyCompany, onSuccess: data => setForm(data) })
  useEffect(() => { if (company.data) setForm(company.data) }, [company.data])
  const missing = company.error instanceof ApiError && company.error.status === 404

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Typography variant="h1">Моя компания</Typography>
      {missing && <Alert severity="info">Сначала заполните компанию — после этого можно создавать вакансии.</Alert>}
      {company.isError && !missing && <Alert severity="error">{company.error.message}</Alert>}
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack component="form" spacing={2.5} onSubmit={event => { event.preventDefault(); save.mutate(form) }}>
          <TextField label="Название" required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
          <TextField label="Город" required value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} />
          <TextField label="Описание" required multiline minRows={4} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
          {save.isError && <Alert severity="error">{save.error.message}</Alert>}
          {save.isSuccess && <Alert severity="success">Компания сохранена.</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={save.isPending}>Сохранить компанию</Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
