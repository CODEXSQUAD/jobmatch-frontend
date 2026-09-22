export class ApiError extends Error {
  readonly status?: number
  readonly code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type RequestOptions = RequestInit & { timeoutMs?: number }

function isApiErrorBody(value: unknown): value is { message: string; code: string } {
  return typeof value === 'object' && value !== null
    && 'message' in value && typeof value.message === 'string'
    && 'code' in value && typeof value.code === 'string'
}

/** Use contract paths, e.g. /health or /api/vacancies. Cookies stay same-origin. */
export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 10_000, signal, ...init } = options
  const controller = new AbortController()
  const abort = () => controller.abort(signal?.reason)
  if (signal?.aborted) abort()
  else signal?.addEventListener('abort', abort, { once: true })

  let timedOut = false
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) headers.set('Accept', 'application/json')
    if (typeof init.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    const response = await fetch(path, {
      ...init, headers, credentials: 'same-origin', signal: controller.signal,
    })

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null)
      const message = isApiErrorBody(body) ? body.message
        : response.status >= 500
          ? 'Сервер недоступен или вернул ошибку. Проверьте запуск backend и повторите запрос.'
          : `Не удалось выполнить запрос (HTTP ${response.status}).`
      throw new ApiError(message, response.status, isApiErrorBody(body) ? body.code : undefined)
    }
    if (response.status === 204) return undefined as T
    try {
      return await response.json() as T
    } catch (error) {
      if (controller.signal.aborted) throw error
      throw new ApiError('Сервер вернул некорректный JSON.', response.status, 'invalid_response')
    }
  } catch (error) {
    if (signal?.aborted) throw error
    if (timedOut) throw new ApiError('Сервер не ответил вовремя. Повторите проверку.', undefined, 'timeout')
    if (error instanceof ApiError) throw error
    throw new ApiError('Не удалось связаться с сервером. Проверьте соединение и запуск backend.', undefined, 'network_error')
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
