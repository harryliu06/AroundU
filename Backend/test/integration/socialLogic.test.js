import assert from 'node:assert/strict'
import { beforeEach, mock, test } from 'node:test'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'secret_key'

const users = new Map()
let friendships = []
let messages = []

function objectId() {
  return new mongoose.Types.ObjectId().toString()
}

function tokenFor(userId) {
  return jwt.sign({ id: userId }, 'secret_key')
}

function participantKey(a, b) {
  return [String(a), String(b)].sort().join(':')
}

function createUser(label) {
  const id = objectId()
  const user = {
    id,
    email: `${label}@example.com`,
    profile: {
      fullName: `Test ${label}`,
      age: 21,
      interests: ['Music', 'Coffee'],
    },
  }

  users.set(id, user)

  return {
    id,
    token: tokenFor(id),
    user,
  }
}

function populateFriendship(friendship) {
  if (!friendship) return friendship

  return {
    ...friendship,
    requester: users.get(String(friendship.requester)) ?? friendship.requester,
    recipient: users.get(String(friendship.recipient)) ?? friendship.recipient,
  }
}

function queryResult(value) {
  return {
    populate() {
      return Promise.resolve(populateFriendship(value))
    },

    then(resolve, reject) {
      return Promise.resolve(value).then(resolve, reject)
    },
  }
}

const UserMock = {
  findById: async (id) => users.get(String(id)) ?? null,
}

const FriendshipMock = {
  create: async (data) => {
    const friendship = {
      id: objectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    friendships.push(friendship)
    return friendship
  },

  findOne: async (query) => {
    if (query.participantKey) {
      return friendships.find((f) => f.participantKey === query.participantKey) ?? null
    }

    if (query.$or) {
      return friendships.find((friendship) =>
        query.$or.some((condition) =>
          Object.entries(condition).every(
            ([key, value]) => String(friendship[key]) === String(value)
          )
        )
      ) ?? null
    }

    return null
  },

  findOneAndUpdate: (query, update, options = {}) => {
    let friendship = friendships.find((f) => {
      if (query._id) {
        return (
          String(f.id) === String(query._id) &&
          String(f.recipient) === String(query.recipient) &&
          f.status === query.status
        )
      }

      return f.participantKey === query.participantKey
    })

    if (!friendship && options.upsert) {
      friendship = {
        id: objectId(),
        createdAt: new Date(),
      }
      friendships.push(friendship)
    }

    if (friendship) {
      Object.assign(friendship, update, { updatedAt: new Date() })
    }

    return queryResult(friendship)
  },

  findOneAndDelete: async (query) => {
    const index = friendships.findIndex(
      (f) =>
        f.participantKey === query.participantKey &&
        f.status === query.status &&
        String(f.blockedBy) === String(query.blockedBy)
    )

    if (index === -1) return null

    return friendships.splice(index, 1)[0]
  },

  find: (query) => ({
    populate() {
      return this
    },

    sort: async () =>
      friendships
        .filter((f) => {
          if (query.status && f.status !== query.status) return false
          if (query.blockedBy && String(f.blockedBy) !== String(query.blockedBy)) return false
          if (query.recipient && String(f.recipient) !== String(query.recipient)) return false
          return true
        })
        .map(populateFriendship),
  }),

  exists: async (query) => {
    const found = friendships.find((f) => {
      if (f.status !== query.status) return false

      return query.$or.some(
        (condition) =>
          String(f.requester) === String(condition.requester) &&
          String(f.recipient) === String(condition.recipient)
      )
    })

    return found ? { id: found.id } : null
  },
}

const MessageMock = {
  create: async (data) => {
    const message = {
      id: objectId(),
      ...data,
      createdAt: new Date(),
    }

    messages.push(message)
    return message
  },

  find: (query) => ({
    sort: async () =>
      messages
        .filter((message) => message.conversationKey === query.conversationKey)
        .sort((a, b) => a.createdAt - b.createdAt),
  }),
}

mock.module(new URL('../../database/user.js', import.meta.url).href, {
  defaultExport: UserMock,
})

mock.module(new URL('../../database/friendship.js', import.meta.url).href, {
  defaultExport: FriendshipMock,
})

mock.module(new URL('../../database/message.js', import.meta.url).href, {
  defaultExport: MessageMock,
})

const {
  acceptFriendRequest,
  addFriend,
  blockUser,
  listBlockedUsers,
  listMessages,
  sendMessage,
  unblockUser,
} = await import('../../controllers/socialController.js')

function mockResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code
      return this
    },

    json(body) {
      this.body = body
      return this
    },
  }
}

beforeEach(() => {
  users.clear()
  friendships = []
  messages = []
})

test('blocking a user prevents them from appearing as unblocked', async () => {
  const blocker = createUser('blocker')
  const blocked = createUser('blocked')

  const blockRes = mockResponse()

  await blockUser(
    {
      headers: { authorization: blocker.token },
      params: { userId: blocked.id },
    },
    blockRes
  )

  assert.equal(blockRes.statusCode, 200)
  assert.equal(blockRes.body.message, 'User blocked.')

  const listRes = mockResponse()

  await listBlockedUsers(
    {
      headers: { authorization: blocker.token },
      params: {},
    },
    listRes
  )

  assert.equal(listRes.statusCode, 200)
  assert.equal(listRes.body.blockedUsers.length, 1)
  assert.equal(listRes.body.blockedUsers[0].id, blocked.id)
})

test('unblocking a user removes them from the blocked users list', async () => {
  const blocker = createUser('unblocker')
  const blocked = createUser('unblocked')

  await blockUser(
    {
      headers: { authorization: blocker.token },
      params: { userId: blocked.id },
    },
    mockResponse()
  )

  const unblockRes = mockResponse()

  await unblockUser(
    {
      headers: { authorization: blocker.token },
      params: { userId: blocked.id },
    },
    unblockRes
  )

  assert.equal(unblockRes.statusCode, 200)
  assert.equal(unblockRes.body.message, 'User unblocked.')

  const listRes = mockResponse()

  await listBlockedUsers(
    {
      headers: { authorization: blocker.token },
      params: {},
    },
    listRes
  )

  assert.equal(listRes.body.blockedUsers.length, 0)
})

test('a blocked user cannot send a friend request to the blocker', async () => {
  const blocker = createUser('friend-blocker')
  const blocked = createUser('friend-blocked')

  await blockUser(
    {
      headers: { authorization: blocker.token },
      params: { userId: blocked.id },
    },
    mockResponse()
  )

  const requestRes = mockResponse()

  await addFriend(
    {
      headers: { authorization: blocked.token },
      params: { friendId: blocker.id },
    },
    requestRes
  )

  assert.equal(requestRes.statusCode, 403)
  assert.equal(requestRes.body.message, 'You cannot send a friend request to this user.')
})

test('friends can send and list messages', async () => {
  const userA = createUser('message-a')
  const userB = createUser('message-b')

  const friendRequestRes = mockResponse()

  await addFriend(
    {
      headers: { authorization: userA.token },
      params: { friendId: userB.id },
    },
    friendRequestRes
  )

  assert.equal(friendRequestRes.statusCode, 201)

  const acceptRes = mockResponse()

  await acceptFriendRequest(
    {
      headers: { authorization: userB.token },
      params: { requestId: friendRequestRes.body.friendship.id },
    },
    acceptRes
  )

  assert.equal(acceptRes.statusCode, 200)

  const sendRes = mockResponse()

  await sendMessage(
    {
      headers: { authorization: userA.token },
      params: { friendId: userB.id },
      body: { text: 'Hello friend' },
    },
    sendRes
  )

  assert.equal(sendRes.statusCode, 201)
  assert.equal(sendRes.body.message.text, 'Hello friend')

  const listRes = mockResponse()

  await listMessages(
    {
      headers: { authorization: userA.token },
      params: { friendId: userB.id },
    },
    listRes
  )

  assert.equal(listRes.statusCode, 200)
  assert.equal(listRes.body.messages.length, 1)
  assert.equal(listRes.body.messages[0].text, 'Hello friend')
})

test('blocking an existing friend prevents further messaging', async () => {
  const userA = createUser('block-friend-a')
  const userB = createUser('block-friend-b')

  const friendRequestRes = mockResponse()

  await addFriend(
    {
      headers: { authorization: userA.token },
      params: { friendId: userB.id },
    },
    friendRequestRes
  )

  await acceptFriendRequest(
    {
      headers: { authorization: userB.token },
      params: { requestId: friendRequestRes.body.friendship.id },
    },
    mockResponse()
  )

  const beforeBlockRes = mockResponse()

  await sendMessage(
    {
      headers: { authorization: userA.token },
      params: { friendId: userB.id },
      body: { text: 'Before block' },
    },
    beforeBlockRes
  )

  assert.equal(beforeBlockRes.statusCode, 201)

  await blockUser(
    {
      headers: { authorization: userA.token },
      params: { userId: userB.id },
    },
    mockResponse()
  )

  const afterBlockRes = mockResponse()

  await sendMessage(
    {
      headers: { authorization: userB.token },
      params: { friendId: userA.id },
      body: { text: 'After block' },
    },
    afterBlockRes
  )

  assert.equal(afterBlockRes.statusCode, 403)
  assert.equal(afterBlockRes.body.message, 'You can only message friends.')
})
