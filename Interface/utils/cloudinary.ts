declare const process: {
  env: {
    EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?: string
    EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?: string
  }
}

type UploadInput = {
  uri: string
  mimeType?: string
  fileName?: string
}

export async function uploadImageToCloudinary({ uri, mimeType, fileName }: UploadInput) {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary cloud name and upload preset are required.')
  }

  const formData = new FormData()
  formData.append('file', {
    uri,
    type: mimeType || 'image/jpeg',
    name: fileName || `aroundu-profile-${Date.now()}.jpg`,
  } as unknown as Blob)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'aroundu/profile-images')

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json()

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Could not upload profile picture.')
  }

  return String(data.secure_url)
}
