import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import subscribeRouter from './routes/subscribe.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', subscribeRouter)

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Sledje API listening on port ${PORT}`)
  })
})
