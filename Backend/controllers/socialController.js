import {
  acceptFriendRequestByToken,
  addFriendByToken,
  blockUserByToken,
  getFriendStatusByToken,
  listBlockedUsersByToken,
  listFriendRequestsByToken,
  listFriendsByToken,
  listMessagesByToken,
  sendMessageByToken,
  unblockUserByToken,
} from '../logic/socialLogic.js'

export async function addFriend(req, res) {
  try {
    const result = await addFriendByToken(req.headers.authorization, req.params.friendId)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while adding friend.' })
  }
}

export async function listFriends(req, res) {
  try {
    const result = await listFriendsByToken(req.headers.authorization)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching friends.' })
  }
}

export async function getFriendStatus(req, res) {
  try {
    const result = await getFriendStatusByToken(req.headers.authorization, req.params.friendId)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while checking friend status.' })
  }
}

export async function blockUser(req, res) {
  try {
    const result = await blockUserByToken(req.headers.authorization, req.params.userId)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while blocking user.' })
  }
}

export async function unblockUser(req, res) {
  try {
    const result = await unblockUserByToken(req.headers.authorization, req.params.userId)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while unblocking user.' })
  }
}

export async function listBlockedUsers(req, res) {
  try {
    const result = await listBlockedUsersByToken(req.headers.authorization)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching blocked users.' })
  }
}

export async function listFriendRequests(req, res) {
  try {
    const result = await listFriendRequestsByToken(req.headers.authorization)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching friend requests.' })
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const result = await acceptFriendRequestByToken(
      req.headers.authorization,
      req.params.requestId
    )

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while accepting friend request.' })
  }
}

export async function sendMessage(req, res) {
  try {
    const result = await sendMessageByToken(
      req.headers.authorization,
      req.params.friendId,
      req.body.text
    )

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while sending message.' })
  }
}

export async function listMessages(req, res) {
  try {
    const result = await listMessagesByToken(req.headers.authorization, req.params.friendId)

    res.status(result.status).json(result.body)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error while fetching messages.' })
  }
}
