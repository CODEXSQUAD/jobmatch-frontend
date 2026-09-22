import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'

export function HomePage() {
  return (
    <Stack spacing={5}>
      <Box sx={{ maxWidth: 760 }}>
        <Chip label="Знакомьтесь, JobMatch" size="small" sx={{ mb: 3, bgcolor: '#eaf1eb' }} />
        <Typography variant="h1" gutterBottom>Работа, которую<br />вы выбираете осознанно.</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 19, lineHeight: 1.7, maxWidth: 630, mb: 3 }}>
          Сервис поиска работы с ограниченным количеством откликов. Выбирайте подходящие вакансии и знакомьте работодателя со своим опытом.
        </Typography>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button component={Link} to="/vacancies" variant="contained" size="large">К разделу вакансий</Button>
          <Button component={Link} to="/system" variant="outlined" size="large">Проверить API</Button>
        </Stack>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        {[
          ['Для соискателя', 'Находите вакансии, отправляйте резюме и следите за решением работодателя.'],
          ['Для работодателя', 'Публикуйте вакансии, знакомьтесь с кандидатами и принимайте решения по откликам.'],
        ].map(([title, description]) => (
          <Paper key={title} variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="overline" color="text.secondary">В планах MVP</Typography>
            <Typography variant="h2" sx={{ mt: 1, mb: 1.5 }}>{title}</Typography>
            <Typography color="text.secondary">{description}</Typography>
          </Paper>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary">Сейчас доступен каркас приложения и проверка связи с сервером. Пользовательские сценарии находятся в разработке.</Typography>
    </Stack>
  )
}
