import {
  addFriendByToken,
  listFriendsByToken,
  listMessagesByToken,
  sendMessageByToken,
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
