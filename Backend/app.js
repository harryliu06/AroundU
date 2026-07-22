import express from 'express'
import cors from 'cors'

import {
  getCurrentUser,
  getUser,
  login,
  signup,
  nearbyUsers,
  updateCurrentUser,
  updateCurrentUserLocation,
} from './controllers/userController.js'
import {
  acceptFriendRequest,
  addFriend,
  blockUser,
  getFriendStatus,
  listBlockedUsers,
  listFriendRequests,
  listFriends,
  listMessages,
  sendMessage,
  unblockUser,
} from './controllers/socialController.js'

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.json({ message: 'API is running!' })
})

app.post('/signup', signup)
app.post('/login', login)
app.get('/me', getCurrentUser)
app.patch('/me', updateCurrentUser)
app.patch('/me/location', updateCurrentUserLocation)
app.get('/users/:id', getUser)
app.get('/nearby-users', nearbyUsers)
app.get('/friends', listFriends)
app.post('/friends/:friendId', addFriend)
app.get('/friends/:friendId/status', getFriendStatus)
app.get('/blocked-users', listBlockedUsers)
app.post('/blocked-users/:userId', blockUser)
app.delete('/blocked-users/:userId', unblockUser)
app.get('/friend-requests', listFriendRequests)
app.post('/friend-requests/:requestId/accept', acceptFriendRequest)
app.get('/chats/:friendId/messages', listMessages)
app.post('/chats/:friendId/messages', sendMessage)

export default app
