import { Alert, AlertTitle, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../shared/api/health'
import { ApiError } from '../shared/api/client'

export function HealthPage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => getHealth(signal),
    networkMode: 'always',
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
  })

  return (
    <Stack spacing={3} sx={{ maxWidth: 820 }}>
      <Box>
        <Typography variant="overline" color="text.secondary">Состояние приложения</Typography>
        <Typography variant="h1" gutterBottom>Проверка API</Typography>
        <Typography color="text.secondary">Проверяем, что браузер получает ответ от сервера JobMatch.</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Typography component="h2" sx={{ fontFamily: 'monospace', fontSize: 20 }}>GET /health</Typography>
            <Button variant="contained" disabled={health.isFetching} onClick={() => void health.refetch()}>
              {health.isFetching ? 'Проверяем…' : 'Повторить проверку'}
            </Button>
          </Box>
          <Box aria-live="polite" aria-busy={health.isFetching}>
            {health.isFetching ? (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }} role="status">
                <CircularProgress size={22} aria-label="Проверка соединения" />
                <Typography>Ожидаем ответ сервера…</Typography>
              </Stack>
            ) : health.isError ? (
              <Alert severity="error">
                <AlertTitle>Проверка не выполнена</AlertTitle>
                {health.error.message}
                {health.error instanceof ApiError && health.error.status && (
                  <Typography variant="body2" sx={{ mt: 1 }}>HTTP {health.error.status}</Typography>
                )}
              </Alert>
            ) : health.data ? (
              <Stack spacing={2}>
                <Alert severity="success"><AlertTitle>Сервер доступен</AlertTitle>Запрос выполнен успешно · HTTP 200</Alert>
                <Box component="pre" aria-label="Ответ сервера" sx={{ m: 0, p: 2.5, bgcolor: '#f1f5f0', borderRadius: 2, overflowX: 'auto', fontSize: 16 }}>{JSON.stringify(health.data, null, 2)}</Box>
                <Typography variant="body2" color="text.secondary">Проверено: {new Date(health.dataUpdatedAt).toLocaleTimeString('ru-RU')}</Typography>
              </Stack>
            ) : null}
          </Box>
          <Typography variant="body2" color="text.secondary">Эта проверка подтверждает доступность API. Состояние базы данных endpoint пока не проверяет.</Typography>
        </Stack>
      </Paper>
    </Stack>
  )
}
