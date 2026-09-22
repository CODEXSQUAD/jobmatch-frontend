import { Button, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'

export function VacanciesPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h1">Вакансии</Typography>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h2" gutterBottom>Каталог готовится</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620, mb: 3 }}>Здесь появятся вакансии, поиск и фильтры. Подключение каталога к данным сервера — следующий этап разработки.</Typography>
        <Button component={Link} to="/system" variant="outlined">Проверить связь с сервером</Button>
      </Paper>
    </Stack>
  )
}
