import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import Friendship from '../../database/friendship.js'
import Message from '../../database/message.js'
import User from '../../database/user.js'

import {
  addFriendByToken,
  blockUserByToken,
  getFriendStatusByToken,
  listBlockedUsersByToken,
  listMessagesByToken,
  sendMessageByToken,
  unblockUserByToken,
} from '../../logic/socialLogic.js'

const JWT_SECRET = 'secret_key'

function objectId() {
  return new mongoose.Types.ObjectId().toString()
}

function tokenFor(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET)
}

function fakeUser(id, email = 'test@example.com') {
  return {
    id,
    email,
    profile: {
      fullName: 'Test User',
      age: 21,
      interests: ['Music', 'Coffee'],
    },
  }
}

test('blockUserByToken rejects missing authorization token', async () => {
  const result = await blockUserByToken('', objectId())

  assert.equal(result.status, 401)
  assert.equal(result.body.message, 'Authorization token is required.')
})

test('blockUserByToken rejects invalid blocked user id', async () => {
  const originalFindById = User.findById
  const userId = objectId()

  try {
    User.findById = async () => fakeUser(userId)

    const result = await blockUserByToken(tokenFor(userId), 'invalid-id')

    assert.equal(result.status, 400)
    assert.equal(result.body.message, 'Invalid user id.')
  } finally {
    User.findById = originalFindById
  }
})

test('blockUserByToken rejects blocking yourself', async () => {
  const originalFindById = User.findById
  const userId = objectId()

  try {
    User.findById = async () => fakeUser(userId)

    const result = await blockUserByToken(tokenFor(userId), userId)

    assert.equal(result.status, 400)
    assert.equal(result.body.message, 'You cannot block yourself.')
  } finally {
    User.findById = originalFindById
  }
})

test('blockUserByToken blocks another user', async () => {
  const originalFindById = User.findById
  const originalFindOneAndUpdate = Friendship.findOneAndUpdate

  const blockerId = objectId()
  const blockedId = objectId()

  try {
    User.findById = async (id) => {
      if (String(id) === String(blockerId)) return fakeUser(blockerId, 'blocker@example.com')
      if (String(id) === String(blockedId)) return fakeUser(blockedId, 'blocked@example.com')
      return null
    }

    Friendship.findOneAndUpdate = async (query, update, options) => {
      assert.equal(query.participantKey, [blockerId, blockedId].sort().join(':'))
      assert.equal(update.requester, blockerId)
      assert.equal(update.recipient, blockedId)
      assert.equal(update.status, 'blocked')
      assert.equal(update.blockedBy, blockerId)
      assert.equal(options.upsert, true)

      return {
        id: objectId(),
        requester: blockerId,
        recipient: blockedId,
        status: 'blocked',
        blockedBy: blockerId,
      }
    }

    const result = await blockUserByToken(tokenFor(blockerId), blockedId)

    assert.equal(result.status, 200)
    assert.equal(result.body.message, 'User blocked.')
    assert.equal(result.body.blockedUser.id, blockedId)
  } finally {
    User.findById = originalFindById
    Friendship.findOneAndUpdate = originalFindOneAndUpdate
  }
})

test('unblockUserByToken removes a block created by the authenticated user', async () => {
  const originalFindById = User.findById
  const originalFindOneAndDelete = Friendship.findOneAndDelete

  const blockerId = objectId()
  const blockedId = objectId()

  try {
    User.findById = async () => fakeUser(blockerId)

    Friendship.findOneAndDelete = async (query) => {
      assert.equal(query.participantKey, [blockerId, blockedId].sort().join(':'))
      assert.equal(query.status, 'blocked')
      assert.equal(query.blockedBy, blockerId)

      return {
        id: objectId(),
        status: 'blocked',
        blockedBy: blockerId,
      }
    }

    const result = await unblockUserByToken(tokenFor(blockerId), blockedId)

    assert.equal(result.status, 200)
    assert.equal(result.body.message, 'User unblocked.')
  } finally {
    User.findById = originalFindById
    Friendship.findOneAndDelete = originalFindOneAndDelete
  }
})

test('unblockUserByToken returns 404 when block relationship does not exist', async () => {
  const originalFindById = User.findById
  const originalFindOneAndDelete = Friendship.findOneAndDelete

  const blockerId = objectId()
  const blockedId = objectId()

  try {
    User.findById = async () => fakeUser(blockerId)
    Friendship.findOneAndDelete = async () => null

    const result = await unblockUserByToken(tokenFor(blockerId), blockedId)

    assert.equal(result.status, 404)
    assert.equal(result.body.message, 'Blocked user not found.')
  } finally {
    User.findById = originalFindById
    Friendship.findOneAndDelete = originalFindOneAndDelete
  }
})

test('listBlockedUsersByToken returns users blocked by authenticated user', async () => {
  const originalFindById = User.findById
  const originalFind = Friendship.find

  const blockerId = objectId()
  const blockedId = objectId()

  try {
    User.findById = async () => fakeUser(blockerId)

    Friendship.find = (query) => {
      assert.equal(query.status, 'blocked')
      assert.equal(query.blockedBy, blockerId)

      return {
        populate() {
          return this
        },
        sort: async () => [
          {
            requester: fakeUser(blockerId, 'blocker@example.com'),
            recipient: fakeUser(blockedId, 'blocked@example.com'),
          },
        ],
      }
    }

    const result = await listBlockedUsersByToken(tokenFor(blockerId))

    assert.equal(result.status, 200)
    assert.equal(result.body.blockedUsers.length, 1)
    assert.equal(result.body.blockedUsers[0].id, blockedId)
  } finally {
    User.findById = originalFindById
    Friendship.find = originalFind
  }
})

test('getFriendStatusByToken marks blocked relationship as blockedByMe', async () => {
  const originalFindById = User.findById
  const originalFindOne = Friendship.findOne

  const blockerId = objectId()
  const blockedId = objectId()
  const requestId = objectId()

  try {
    User.findById = async () => fakeUser(blockerId)

    Friendship.findOne = async () => ({
      id: requestId,
      requester: blockerId,
      recipient: blockedId,
      status: 'blocked',
      blockedBy: blockerId,
    })

    const result = await getFriendStatusByToken(tokenFor(blockerId), blockedId)

    assert.equal(result.status, 200)
    assert.equal(result.body.status, 'blocked')
    assert.equal(result.body.direction, 'outgoing')
    assert.equal(result.body.blockedByMe, true)
    assert.equal(result.body.requestId, requestId)
  } finally {
    User.findById = originalFindById
    Friendship.findOne = originalFindOne
  }
})

test('addFriendByToken rejects friend request when relationship is blocked', async () => {
  const originalFindById = User.findById
  const originalFindOne = Friendship.findOne

  const blockerId = objectId()
  const blockedId = objectId()

  try {
    User.findById = async (id) => {
      if (String(id) === String(blockerId)) return fakeUser(blockerId, 'blocker@example.com')
      if (String(id) === String(blockedId)) return fakeUser(blockedId, 'blocked@example.com')
      return null
    }

    Friendship.findOne = async () => ({
      id: objectId(),
      requester: blockerId,
      recipient: blockedId,
      status: 'blocked',
      blockedBy: blockerId,
    })

    const result = await addFriendByToken(tokenFor(blockerId), blockedId)

    assert.equal(result.status, 403)
    assert.equal(result.body.message, 'Unblock this user before sending a friend request.')
  } finally {
    User.findById = originalFindById
    Friendship.findOne = originalFindOne
  }
})

test('sendMessageByToken rejects messaging when users are not friends', async () => {
  const originalFindById = User.findById
  const originalExists = Friendship.exists

  const senderId = objectId()
  const recipientId = objectId()

  try {
    User.findById = async () => fakeUser(senderId)
    Friendship.exists = async () => null

    const result = await sendMessageByToken(tokenFor(senderId), recipientId, 'Hello')

    assert.equal(result.status, 403)
    assert.equal(result.body.message, 'You can only message friends.')
  } finally {
    User.findById = originalFindById
    Friendship.exists = originalExists
  }
})

test('sendMessageByToken creates message when users are friends', async () => {
  const originalFindById = User.findById
  const originalExists = Friendship.exists
  const originalCreate = Message.create

  const senderId = objectId()
  const recipientId = objectId()

  try {
    User.findById = async () => fakeUser(senderId)
    Friendship.exists = async () => ({ id: objectId() })

    Message.create = async (message) => {
      assert.equal(message.conversationKey, [senderId, recipientId].sort().join(':'))
      assert.equal(message.sender, senderId)
      assert.equal(message.recipient, recipientId)
      assert.equal(message.text, 'Hello')

      return {
        id: objectId(),
        ...message,
      }
    }

    const result = await sendMessageByToken(tokenFor(senderId), recipientId, '  Hello  ')

    assert.equal(result.status, 201)
    assert.equal(result.body.message.text, 'Hello')
  } finally {
    User.findById = originalFindById
    Friendship.exists = originalExists
    Message.create = originalCreate
  }
})

test('listMessagesByToken rejects viewing messages when users are not friends', async () => {
  const originalFindById = User.findById
  const originalExists = Friendship.exists

  const userId = objectId()
  const friendId = objectId()

  try {
    User.findById = async () => fakeUser(userId)
    Friendship.exists = async () => null

    const result = await listMessagesByToken(tokenFor(userId), friendId)

    assert.equal(result.status, 403)
    assert.equal(result.body.message, 'You can only view chats with friends.')
  } finally {
    User.findById = originalFindById
    Friendship.exists = originalExists
  }
})
