import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
      fullName: { type: String, required: true },
      age: { type: Number, required: true },
      schoolOrWork: { type: String, default: '' },
      bio: { type: String, default: '' },
      interests: { type: [String], default: [] },
      profileImage: { type: String, default: '' },
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
