declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || ''

export function apiFetch(path: string, options?: RequestInit) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(options?.headers || {}),
  }

  return fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    headers,
  })
}

export async function apiJson(path: string, options?: RequestInit) {
  const response = await apiFetch(path, options)
  const text = await response.text()

  if (!text) {
    return { response, data: {} }
  }

  try {
    return { response, data: JSON.parse(text) }
  } catch {
    return {
      response,
      data: {
        message: text,
      },
    }
  }
}
