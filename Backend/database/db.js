import mongoose from 'mongoose'
import 'dotenv/config'

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGOURI

  if (!mongoUri) {
    throw new Error('Missing MONGO_URI in .env')
  }

  await mongoose.connect(mongoUri)
  console.log('Connected to database')
}
