import { apiJson } from './api'

type UploadInput = {
  uri: string
  token: string
  mimeType?: string
  fileName?: string
}

export async function uploadImageToCloudinary({ uri, token, mimeType, fileName }: UploadInput) {
  const { response: signatureResponse, data: signatureData } = await apiJson(
    '/cloudinary/signature',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!signatureResponse.ok) {
    throw new Error(signatureData.message || 'Could not prepare profile picture upload.')
  }

  const formData = new FormData()
  formData.append('file', {
    uri,
    type: mimeType || 'image/jpeg',
    name: fileName || `aroundu-profile-${Date.now()}.jpg`,
  } as unknown as Blob)
  formData.append('api_key', String(signatureData.apiKey))
  formData.append('timestamp', String(signatureData.timestamp))
  formData.append('signature', String(signatureData.signature))
  formData.append('folder', String(signatureData.folder))

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )
  const data = await response.json()

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Could not upload profile picture.')
  }

  return String(data.secure_url)
}
