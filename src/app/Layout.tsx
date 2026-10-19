import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router'
import { getCurrentUser, logout } from '../shared/api/auth'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/vacancies', label: 'Вакансии' },
  { to: '/system', label: 'Проверка API' },
]

export function Layout() {
  const queryClient = useQueryClient()
  const currentUser = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 30_000,
  })
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(['current-user'], null),
  })

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <a className="skip-link" href="#main-content">Перейти к содержимому</a>
      <Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #e0e6df' }}>
        <Container maxWidth="lg" sx={{ py: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography component={NavLink} to="/" sx={{ fontSize: 24, fontWeight: 750, color: 'primary.main', textDecoration: 'none', mr: 'auto' }}>JobMatch<span className="brand-dot">.</span></Typography>
          <Stack component="nav" aria-label="Основная навигация" direction="row" useFlexGap sx={{ gap: 0.5, flexWrap: 'wrap' }}>
            {links.map(({ to, label }) => (
              <Button key={to} component={NavLink} to={to} end sx={{ '&.active': { bgcolor: '#eaf1eb' } }}>{label}</Button>
            ))}
            {currentUser.data?.role === 'Candidate' && (
              <>
                <Button component={NavLink} to="/resume" sx={{ '&.active': { bgcolor: '#eaf1eb' } }}>Резюме</Button>
                <Button component={NavLink} to="/applications" sx={{ '&.active': { bgcolor: '#eaf1eb' } }}>Мои отклики</Button>
              </>
            )}
            {currentUser.data?.role === 'Employer' && (
              <>
                <Button component={NavLink} to="/company" sx={{ '&.active': { bgcolor: '#eaf1eb' } }}>Компания</Button>
                <Button component={NavLink} to="/employer/vacancies" sx={{ '&.active': { bgcolor: '#eaf1eb' } }}>Мои вакансии</Button>
              </>
            )}
            {currentUser.data ? (
              <Button onClick={() => signOut.mutate()} disabled={signOut.isPending}>Выйти · {currentUser.data.email}</Button>
            ) : (
              <Button component={NavLink} to="/auth" sx={{ '&.active': { bgcolor: '#eaf1eb' } }}>Войти</Button>
            )}
          </Stack>
        </Container>
      </Box>
      <Container component="main" id="main-content" tabIndex={-1} maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
        <Outlet />
      </Container>
      <Container component="footer" maxWidth="lg" sx={{ py: 3, borderTop: '1px solid #e0e6df', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>JobMatch · Поиск работы с осознанным выбором</Typography>
        <Chip label="Учебный MVP" size="small" variant="outlined" />
      </Container>
    </Box>
  )
}
