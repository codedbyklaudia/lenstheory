import { apiFetch } from './api'

const MAX_SIDE = 2400 // pixels: plenty for a full-screen photo, and keeps files well under the 4 MB limit

// Uploads an image the admin picked, and returns its public URL (to save in the database).
//   const url = await uploadImage(fileFromInput)
//
// Camera photos are often 10+ MB, more than the server accepts. So first we redraw the photo
// smaller on an invisible <canvas> and save it as a JPEG (WebP would be smaller, but Safari
// cannot create WebP files this way).
export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')

  const resized = await resize(file)
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'

  // The body is the image itself (not JSON), so we tell the server its real type.
  const { url } = await apiFetch(`/api/uploads?filename=${encodeURIComponent(name)}`, {
    method: 'POST',
    body: resized,
    headers: { 'Content-Type': resized.type },
  })
  return url
}

async function resize(file) {
  const image = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)

  // toBlob gives us the canvas as an image file. 0.85 = good quality, much smaller file.
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
}
