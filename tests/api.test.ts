import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, requestJson } from '../src/shared/api/client'
import { getHealth } from '../src/shared/api/health'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('API client', () => {
  it('uses the health contract path and same-origin credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getHealth()).resolves.toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith('/health', expect.objectContaining({ credentials: 'same-origin', cache: 'no-store' }))
  })

  it('preserves the error message, code and HTTP status from the contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ code: 'validation_error', message: 'Проверьте поля.' }, { status: 400 })))
    await expect(requestJson('/api/resume/me')).rejects.toMatchObject({ status: 400, code: 'validation_error', message: 'Проверьте поля.' })
  })

  it('handles an empty proxy error without showing success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })))
    await expect(getHealth()).rejects.toMatchObject({ status: 500, message: expect.stringContaining('Проверьте запуск backend') })
  })

  it('explains network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(getHealth()).rejects.toMatchObject({ code: 'network_error' })
  })

  it('rejects HTML from a misconfigured SPA fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>app</html>', { status: 200 })))
    await expect(getHealth()).rejects.toMatchObject({ code: 'invalid_response' })
  })

  it.each([null, {}, { status: 'error' }])('rejects an unexpected health payload: %j', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body)))
    await expect(getHealth()).rejects.toBeInstanceOf(ApiError)
  })

  it('accepts empty 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(requestJson<void>('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('aborts a stalled request with a readable timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_path, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const result = expect(requestJson('/health', { timeoutMs: 100 })).rejects.toMatchObject({ code: 'timeout' })
    await vi.advanceTimersByTimeAsync(100)
    await result
  })

  it('preserves caller cancellation instead of showing a network error', async () => {
    const controller = new AbortController()
    vi.stubGlobal('fetch', vi.fn((_path, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const result = expect(requestJson('/health', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await result
  })
})
