import { useEffect, useState } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiError } from '../shared/api/client'
import { getMyResume, saveMyResume } from '../shared/api/resume'
import type { Resume } from '../shared/api/resume'

const emptyResume: Resume = {
  fullName: '', contactEmail: '', contactPhone: '', desiredPosition: '', summary: '',
  skills: [], workExperience: [], education: [],
}

export function ResumePage() {
  const [form, setForm] = useState(emptyResume)
  const [skills, setSkills] = useState('')
  const resume = useQuery({ queryKey: ['resume'], queryFn: getMyResume, retry: false })
  const save = useMutation({
    mutationFn: () => saveMyResume({ ...form, skills: skills.split(',').map(item => item.trim()).filter(Boolean) }),
    onSuccess: data => { setForm(data); setSkills(data.skills.join(', ')) },
  })

  useEffect(() => {
    if (resume.data) { setForm(resume.data); setSkills(resume.data.skills.join(', ')) }
  }, [resume.data])

  const set = (field: keyof Resume) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm(current => ({ ...current, [field]: event.target.value }))
  const newResume = resume.error instanceof ApiError && resume.error.status === 404

  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography variant="overline" color="text.secondary">Профиль соискателя</Typography>
        <Typography variant="h1">Моё резюме</Typography>
        <Typography color="text.secondary">Заполненное резюме требуется для отправки отклика.</Typography>
      </Box>
      {resume.isError && !newResume && <Alert severity="error">{resume.error.message}</Alert>}
      {newResume && <Alert severity="info">Резюме ещё не заполнено. Создайте его сейчас.</Alert>}
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack component="form" spacing={2.5} onSubmit={event => { event.preventDefault(); save.mutate() }}>
          <TextField label="Имя и фамилия" required value={form.fullName} onChange={set('fullName')} />
          <TextField label="Контактный email" type="email" required value={form.contactEmail} onChange={set('contactEmail')} />
          <TextField label="Телефон" required value={form.contactPhone} onChange={set('contactPhone')} />
          <TextField label="Желаемая должность" required value={form.desiredPosition} onChange={set('desiredPosition')} />
          <TextField label="О себе и опыте" required multiline minRows={4} value={form.summary} onChange={set('summary')} />
          <TextField label="Навыки" value={skills} onChange={event => setSkills(event.target.value)} helperText="Перечислите через запятую, например: C#, PostgreSQL, Docker" />
          {save.isError && <Alert severity="error">{save.error.message}</Alert>}
          {save.isSuccess && <Alert severity="success">Резюме сохранено.</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={save.isPending}>Сохранить резюме</Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
