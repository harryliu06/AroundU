import assert from 'node:assert/strict'
import { beforeEach, mock, test } from 'node:test'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'secret_key'
const JWT_SECRET = 'secret_key'

const users = new Map()
let friendships = []
let messages = []

function objectId() {
  return new mongoose.Types.ObjectId().toString()
}

function tokenFor(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET)
}

function seedUser(overrides = {}) {
  const id = objectId()
  const user = {
    id,
    _id: id,
    email: overrides.email ?? `seed-${id}@example.com`,
    password: overrides.password ?? '$2b$10$placeholder',
    profile: overrides.profile ?? {
      fullName: 'Seed User',
      age: 21,
      interests: ['Music', 'Coffee', 'Gaming'],
    },
    updatedAt: new Date(),
  }
  users.set(id, user)
  return user
}

function participantKey(a, b) {
  return [String(a), String(b)].sort().join(':')
}

function populateFriendship(f) {
  if (!f) return f
  return {
    ...f,
    requester: users.get(String(f.requester)) ?? f.requester,
    recipient: users.get(String(f.recipient)) ?? f.recipient,
  }
}

function chainableQuery(filterFn) {
  return {
    populate() { return this },
    sort: async () => friendships.filter(filterFn).map(populateFriendship),
  }
}

const UserMock = {
  findById: async (id) => users.get(String(id)) ?? null,
  findOne: async ({ email } = {}) => {
    if (!email) return null
    for (const u of users.values()) if (u.email === email) return u
    return null
  },
  create: async (data) => {
    const user = { id: objectId(), _id: objectId(), ...data }
    users.set(user.id, user)
    return user
  },
  findByIdAndUpdate: async (id, update, options = {}) => {
    const user = users.get(String(id))
    if (!user) return null
    if (update.profile) Object.assign(user, { profile: update.profile })
    users.set(String(id), user)
    return options.new ? user : { ...user }
  },
  find: (query) => ({
    sort: () => ({
      limit: async (n) => {
        let all = [...users.values()]
        if (query?._id?.$ne) all = all.filter((u) => String(u.id) !== String(query._id.$ne))
        return all.slice(0, n)
      },
    }),
  }),
}

const FriendshipMock = {
  create: async (data) => {
    const f = { id: objectId(), ...data, createdAt: new Date(), updatedAt: new Date() }
    friendships.push(f)
    return f
  },
  findOne: async (query) => {
    if (query.participantKey) {
      return friendships.find((f) => f.participantKey === query.participantKey) ?? null
    }
    if (query.$or) {
      return (
        friendships.find((f) =>
          query.$or.some((cond) =>
            Object.entries(cond).every(([k, v]) => String(f[k]) === String(v))
          )
        ) ?? null
      )
    }
    return null
  },
  findOneAndUpdate: (query, update, options = {}) => {
    let f = friendships.find((friendship) => {
      if (query._id) {
        return (
          String(friendship.id) === String(query._id) &&
          String(friendship.recipient) === String(query.recipient) &&
          friendship.status === query.status
        )
      }
      return friendship.participantKey === query.participantKey
    })
    if (!f && options.upsert) {
      f = { id: objectId(), createdAt: new Date() }
      friendships.push(f)
    }
    if (f) Object.assign(f, update, { updatedAt: new Date() })
    return {
      populate() { return Promise.resolve(populateFriendship(f)) },
      then(resolve, reject) { return Promise.resolve(f).then(resolve, reject) },
    }
  },
  findOneAndDelete: async (query) => {
    const idx = friendships.findIndex(
      (f) =>
        f.participantKey === query.participantKey &&
        f.status === query.status &&
        String(f.blockedBy) === String(query.blockedBy)
    )
    if (idx === -1) return null
    return friendships.splice(idx, 1)[0]
  },
  find: (query) =>
    chainableQuery((f) => {
      if (query.status && f.status !== query.status) return false
      if (query.blockedBy && String(f.blockedBy) !== String(query.blockedBy)) return false
      if (query.recipient && String(f.recipient) !== String(query.recipient)) return false
      if (query.$or) {
        return query.$or.some(
          (cond) =>
            (cond.requester && String(f.requester) === String(cond.requester)) ||
            (cond.recipient && String(f.recipient) === String(cond.recipient))
        )
      }
      return true
    }),
  exists: async (query) => {
    const found = friendships.find((f) => {
      if (f.status !== query.status) return false
      return query.$or.some(
        (cond) =>
          String(f.requester) === String(cond.requester) &&
          String(f.recipient) === String(cond.recipient)
      )
    })
    return found ? { id: found.id } : null
  },
}

const MessageMock = {
  create: async (data) => {
    const msg = { id: objectId(), ...data, createdAt: new Date() }
    messages.push(msg)
    return msg
  },
  find: (query) => ({
    sort: async () =>
      messages
        .filter((m) => m.conversationKey === query.conversationKey)
        .sort((a, b) => a.createdAt - b.createdAt),
  }),
}

mock.module(new URL('../../database/user.js',       import.meta.url).href, { defaultExport: UserMock })
mock.module(new URL('../../database/friendship.js', import.meta.url).href, { defaultExport: FriendshipMock })
mock.module(new URL('../../database/message.js',    import.meta.url).href, { defaultExport: MessageMock })

const { signupUser, loginUser, getUserByToken } = await import('../../logic/userLogic.js')
const {
  addFriendByToken,
  acceptFriendRequestByToken,
  blockUserByToken,
  unblockUserByToken,
  listFriendsByToken,
  listBlockedUsersByToken,
  sendMessageByToken,
  listMessagesByToken,
  acceptFriendRequest,
} = await import('../../logic/socialLogic.js')

beforeEach(() => {
  users.clear()
  friendships = []
  messages = []
})

test('data persisted by signupUser allows a successful loginUser call', async () => {
  const plaintext = 'correctHorse99'

  const signupResult = await signupUser({
    email: 'roundtrip@example.com',
    password: plaintext,
    profile: { fullName: 'Round Trip', age: 24, interests: ['Hiking', 'Coffee', 'Art'] },
  })

  assert.equal(signupResult.status, 201, 'Signup should succeed')
  assert.ok(signupResult.body.token, 'Signup should return a token')

  const loginResult = await loginUser({ email: 'roundtrip@example.com', password: plaintext })

  assert.equal(loginResult.status, 200, 'Login should succeed with the credentials from signup')
  assert.ok(loginResult.body.token, 'Login should return a token')

  const signupId = jwt.verify(signupResult.body.token, JWT_SECRET).id
  const loginId  = jwt.verify(loginResult.body.token,  JWT_SECRET).id

  assert.equal(String(loginId), String(signupId), 'Both tokens must encode the same user id')

  const badLogin = await loginUser({ email: 'roundtrip@example.com', password: 'wrongPassword' })
  assert.equal(badLogin.status, 401, 'Wrong password should be rejected')
})

test('password field is absent from every response in the full signup-login-me flow', async () => {
  function deepContainsPassword(obj, path = 'root') {
    if (obj === null || typeof obj !== 'object') return false
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'password') {
        throw new Error(`password field found at path: ${path}.${key}`)
      }
      deepContainsPassword(value, `${path}.${key}`)
    }
    return false
  }

  const signupResult = await signupUser({
    email: 'noleak-flow@example.com',
    password: 'password123',
    profile: { fullName: 'No Leak', age: 22, interests: ['Music', 'Travel', 'Art'] },
  })

  assert.equal(signupResult.status, 201)
  assert.doesNotThrow(
    () => deepContainsPassword(signupResult.body),
    'Signup response must not contain a password field at any depth'
  )

  const stored = [...users.values()].find((u) => u.email === 'noleak-flow@example.com')
  stored.password = await bcrypt.hash('password123', 10)

  const loginResult = await loginUser({ email: 'noleak-flow@example.com', password: 'password123' })
  assert.equal(loginResult.status, 200)
  assert.doesNotThrow(
    () => deepContainsPassword(loginResult.body),
    'Login response must not contain a password field at any depth'
  )

  const meResult = await getUserByToken(`Bearer ${loginResult.body.token}`)
  assert.equal(meResult.status, 200)
  assert.doesNotThrow(
    () => deepContainsPassword(meResult.body),
    'getUserByToken response must not contain a password field at any depth'
  )
})

test('friendship state machine persists correctly across all transitions', async () => {
  const userA = seedUser({ email: 'fsm-a@example.com', profile: { fullName: 'FSM A', age: 21, interests: ['Music', 'Coffee', 'Art'] } })
  const userB = seedUser({ email: 'fsm-b@example.com', profile: { fullName: 'FSM B', age: 22, interests: ['Music', 'Coffee', 'Art'] } })

  const addResult = await addFriendByToken(`Bearer ${tokenFor(userA.id)}`, userB.id)
  assert.equal(addResult.status, 201, 'Friend request should be created (201)')
  assert.equal(addResult.body.friendship.status, 'pending')

  const requestId = addResult.body.friendship.id

  const acceptResult = await acceptFriendRequestByToken(`Bearer ${tokenFor(userB.id)}`, requestId)
  assert.equal(acceptResult.status, 200, 'Accept should succeed')
  assert.equal(acceptResult.body.friendship.status, 'accepted')

  const friendsOfA = await listFriendsByToken(`Bearer ${tokenFor(userA.id)}`)
  const friendsOfB = await listFriendsByToken(`Bearer ${tokenFor(userB.id)}`)

  assert.ok(
    friendsOfA.body.friends.some((f) => f.id === userB.id),
    'B should appear in A\'s friends list'
  )
  assert.ok(
    friendsOfB.body.friends.some((f) => f.id === userA.id),
    'A should appear in B\'s friends list'
  )

  const blockResult = await blockUserByToken(`Bearer ${tokenFor(userA.id)}`, userB.id)
  assert.equal(blockResult.status, 200)

  const blockedList = await listBlockedUsersByToken(`Bearer ${tokenFor(userA.id)}`)
  assert.equal(blockedList.status, 200)
  assert.ok(
    blockedList.body.blockedUsers.some((u) => u.id === userB.id),
    'B should appear in A\'s blocked list after blocking'
  )

  const unblockResult = await unblockUserByToken(`Bearer ${tokenFor(userA.id)}`, userB.id)
  assert.equal(unblockResult.status, 200)
  assert.equal(unblockResult.body.message, 'User unblocked.')

  const blockedAfterUnblock = await listBlockedUsersByToken(`Bearer ${tokenFor(userA.id)}`)
  assert.equal(
    blockedAfterUnblock.body.blockedUsers.length,
    0,
    'Blocked list should be empty after unblocking'
  )
})

test('messages persist correctly and conversations are isolated between different pairs', async () => {
  const userA = seedUser({ email: 'iso-a@example.com', profile: { fullName: 'Iso A', age: 21, interests: ['Music', 'Coffee', 'Art'] } })
  const userB = seedUser({ email: 'iso-b@example.com', profile: { fullName: 'Iso B', age: 22, interests: ['Music', 'Coffee', 'Art'] } })
  const userC = seedUser({ email: 'iso-c@example.com', profile: { fullName: 'Iso C', age: 23, interests: ['Music', 'Coffee', 'Art'] } })

  friendships.push({
    id: objectId(),
    requester: userA.id,
    recipient: userB.id,
    status: 'accepted',
    blockedBy: null,
    participantKey: participantKey(userA.id, userB.id),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  friendships.push({
    id: objectId(),
    requester: userA.id,
    recipient: userC.id,
    status: 'accepted',
    blockedBy: null,
    participantKey: participantKey(userA.id, userC.id),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await sendMessageByToken(`Bearer ${tokenFor(userA.id)}`, userB.id, 'Hello B — message one')
  await sendMessageByToken(`Bearer ${tokenFor(userA.id)}`, userB.id, 'Hello B — message two')
  await sendMessageByToken(`Bearer ${tokenFor(userA.id)}`, userC.id, 'Hello C — exclusive message')

  const abMessages = await listMessagesByToken(`Bearer ${tokenFor(userA.id)}`, userB.id)
  assert.equal(abMessages.status, 200)
  assert.equal(abMessages.body.messages.length, 2, 'A↔B conversation should have exactly 2 messages')
  assert.ok(
    abMessages.body.messages.every((m) => m.text.includes('Hello B')),
    'A↔B messages should only contain messages addressed to B'
  )

  const acMessages = await listMessagesByToken(`Bearer ${tokenFor(userA.id)}`, userC.id)
  assert.equal(acMessages.status, 200)
  assert.equal(acMessages.body.messages.length, 1, 'A↔C conversation should have exactly 1 message')
  assert.equal(acMessages.body.messages[0].text, 'Hello C — exclusive message')

  const bSeesAC = await listMessagesByToken(`Bearer ${tokenFor(userB.id)}`, userC.id)
  assert.equal(bSeesAC.status, 403, 'B should be forbidden from reading the A↔C conversation')
})

test('a user cannot accept a friend request that was addressed to a different user', async () => {
  const sender    = seedUser({ email: 'xsender@example.com',   profile: { fullName: 'Sender',    age: 21, interests: ['Music', 'Coffee', 'Art'] } })
  const recipient = seedUser({ email: 'xrecipient@example.com', profile: { fullName: 'Recipient', age: 22, interests: ['Music', 'Coffee', 'Art'] } })
  const intruder  = seedUser({ email: 'xintruder@example.com',  profile: { fullName: 'Intruder',  age: 23, interests: ['Music', 'Coffee', 'Art'] } })

  const addResult = await addFriendByToken(`Bearer ${tokenFor(sender.id)}`, recipient.id)
  assert.equal(addResult.status, 201)
  const requestId = addResult.body.friendship.id

  const intruderAccept = await acceptFriendRequestByToken(
    `Bearer ${tokenFor(intruder.id)}`,
    requestId
  )

  assert.equal(
    intruderAccept.status,
    404,
    'Intruder should receive 404 because they are not the recipient of the request'
  )

  const storedFriendship = friendships.find((f) => f.id === requestId)
  assert.equal(
    storedFriendship?.status,
    'pending',
    'Friendship status must still be pending after the unauthorised accept attempt'
  )

  const legitimateAccept = await acceptFriendRequestByToken(
    `Bearer ${tokenFor(recipient.id)}`,
    requestId
  )
  assert.equal(legitimateAccept.status, 200, 'Legitimate recipient should be able to accept')
  assert.equal(legitimateAccept.body.friendship.status, 'accepted')
})