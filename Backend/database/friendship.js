import mongoose from 'mongoose'

const friendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
    },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    participantKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

friendshipSchema.index({ recipient: 1, status: 1 })
friendshipSchema.index({ requester: 1, status: 1 })
friendshipSchema.index({ blockedBy: 1, status: 1 })

export default mongoose.model('Friendship', friendshipSchema)
