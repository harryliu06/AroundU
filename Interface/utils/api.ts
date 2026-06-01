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
