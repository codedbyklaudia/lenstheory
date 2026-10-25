import express, { Router } from 'express'
import { put } from '@vercel/blob'
import { adminOnly } from '../middleware/requireAdmin.js'

// Image uploads from the admin dashboard.
//
// Why not just save the file on the server's disk? On Vercel the server is a "serverless function":
// its disk is wiped between requests, so a saved file would vanish. Instead we store images in
// Vercel Blob (file storage with a public URL) and save only that URL in the database.
//
// Needs BLOB_READ_WRITE_TOKEN in .env: Vercel -> your project -> Storage -> create a Blob store.
// Vercel adds the token to the deployed project automatically; copy it into server/.env for local use.

const MAX_MB = 4 // Vercel functions accept request bodies up to about 4.5 MB

const router = Router()

// POST /api/uploads?filename=beach.jpg   body: the image file itself (not JSON)
// -> { url: 'https://....public.blob.vercel-storage.com/uploads/beach-x7f3.jpg' }
// express.raw() collects the file's bytes into req.body (a Buffer), for image/* requests only.
router.post('/', adminOnly, express.raw({ type: 'image/*', limit: `${MAX_MB}mb` }), async (req, res) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Image uploads are not set up yet (BLOB_READ_WRITE_TOKEN is missing)' })
  }
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: 'Please choose an image file' })
  }

  // Keep the file name tidy (letters, numbers, dots and dashes). addRandomSuffix stops two
  // uploads called "photo.jpg" from overwriting each other.
  const filename = String(req.query.filename || 'photo').replace(/[^\w.-]+/g, '-').slice(-80)
  const blob = await put(`uploads/${filename}`, req.body, {
    access: 'public',
    addRandomSuffix: true,
    contentType: req.get('Content-Type'),
  })

  res.status(201).json({ url: blob.url })
})

export default router
