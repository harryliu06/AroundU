import 'dotenv/config'

import app from './app.js'
import { connectToDatabase } from './database/db.js'

await connectToDatabase()

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
