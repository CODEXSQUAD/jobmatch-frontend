import { useState } from 'react'
import { Alert, Box, Button, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { login, register } from '../shared/api/auth'
import type { CurrentUser, UserRole } from '../shared/api/auth'

type Mode = 'login' | 'register'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Candidate')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const auth = useMutation({
    mutationFn: () => mode === 'login'
      ? login(email, password)
      : register(email, password, role),
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(['current-user'], user)
      navigate(user.role === 'Candidate' ? '/vacancies' : '/')
    },
  })

  return (
    <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto' }}>
      <Box>
        <Typography variant="overline" color="text.secondary">Учётная запись</Typography>
        <Typography variant="h1">{mode === 'login' ? 'Вход' : 'Регистрация'}</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Tabs value={mode} onChange={(_event, value: Mode) => { setMode(value); auth.reset() }} sx={{ mb: 3 }}>
          <Tab value="login" label="Войти" />
          <Tab value="register" label="Создать аккаунт" />
        </Tabs>
        <Stack component="form" spacing={2.5} onSubmit={(event) => { event.preventDefault(); auth.mutate() }}>
          <TextField label="Email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" />
          <TextField label="Пароль" type="password" value={password} onChange={event => setPassword(event.target.value)} required slotProps={{ htmlInput: { minLength: 8 } }} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} helperText={mode === 'register' ? 'Минимум 8 символов, цифра и специальный знак.' : undefined} />
          {mode === 'register' && (
            <TextField select label="Роль" value={role} onChange={event => setRole(event.target.value as UserRole)}>
              <MenuItem value="Candidate">Соискатель</MenuItem>
              <MenuItem value="Employer">Работодатель</MenuItem>
            </TextField>
          )}
          {auth.isError && <Alert severity="error">{auth.error.message}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={auth.isPending || !email || password.length < 8}>
            {auth.isPending ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
