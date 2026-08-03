import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn('MONGODB_URI is not set — /api/subscribe will not persist data.')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
  }
}
