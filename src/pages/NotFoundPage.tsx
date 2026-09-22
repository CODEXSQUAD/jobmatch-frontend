import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="overline">404</Typography>
      <Typography variant="h1">Страница не найдена</Typography>
      <Typography color="text.secondary">Проверьте адрес или вернитесь на главную.</Typography>
      <Button component={Link} to="/" variant="contained">На главную</Button>
    </Stack>
  )
}
