import { Router } from 'express'
import mongoose from 'mongoose'
import Subscriber from '../models/Subscriber.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const router = Router()

router.post('/subscribe', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' })
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Launch list is offline right now. Try again shortly.' })
  }

  try {
    await Subscriber.create({ email })
    return res.status(201).json({ message: "You're on the list. See you out there." })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: "You're already on the list." })
    }
    return res.status(500).json({ message: 'Something drifted off course. Try again.' })
  }
})

export default router
