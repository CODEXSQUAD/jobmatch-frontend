import { ApiError, requestJson } from './client'

export interface HealthResponse { status: 'ok' }

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const result = await requestJson<unknown>('/health', { signal, cache: 'no-store' })
  if (typeof result !== 'object' || result === null || !('status' in result) || result.status !== 'ok') {
    throw new ApiError('Ответ сервера не соответствует контракту /health: ожидается status: ok.', undefined, 'invalid_response')
  }
  return { status: result.status }
}
