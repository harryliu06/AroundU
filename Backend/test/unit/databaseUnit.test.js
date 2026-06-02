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

function makeUser(overrides = {}) {
  const id = objectId()
  const user = {
    id,
    _id: id,
    email: overrides.email ?? `user-${id}@example.com`,
    password: overrides.password ?? '$2b$10$placeholder.hash.placeholder.hash.placeholder',
    profile: overrides.profile ?? {
      fullName: 'Test User',
      age: 21,
      interests: ['Music', 'Coffee', 'Gaming'],
    },
    updatedAt: new Date(),
  }
  users.set(id, user)
  return user
}

const UserMock = {
  findById: async (id) => users.get(String(id)) ?? null,
  findOne: async ({ email } = {}) => {
    if (!email) return null
    for (const u of users.values()) {
      if (u.email === email) return u
    }
    return null
  },
  create: async (data) => {
    const user = { id: objectId(), _id: objectId(), ...data }
    users.set(user.id, user)
    return user
  },
  find: (query) => ({
    sort: () => ({
      limit: async (n) => {
        let all = [...users.values()]
        if (query?._id?.$ne) {
          all = all.filter((u) => String(u.id) !== String(query._id.$ne))
        }
        return all.slice(0, n)
      },
    }),
  }),
}

function populateFriendship(f) {
  if (!f) return f
  return {
    ...f,
    requester: users.get(String(f.requester)) ?? f.requester,
    recipient: users.get(String(f.recipient)) ?? f.recipient,
  }
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
      populate() {
        return Promise.resolve(populateFriendship(f))
      },
      then(resolve, reject) {
        return Promise.resolve(f).then(resolve, reject)
      },
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
  find: (query) => ({
    populate() { return this },
    sort: async () =>
      friendships
        .filter((f) => {
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
        })
        .map(populateFriendship),
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
  blockUserByToken,
  sendMessageByToken,
} = await import('../../logic/socialLogic.js')

beforeEach(() => {
  users.clear()
  friendships = []
  messages = []
})

test('signupUser stores a bcrypt hash, not the plaintext password', async () => {
  const plaintext = 'securePassword1'

  const result = await signupUser({
    email: 'hash@example.com',
    password: plaintext,
    profile: { fullName: 'Hash Test', age: 22, interests: ['Music', 'Coffee', 'Art'] },
  })

  assert.equal(result.status, 201)

  const stored = [...users.values()].find((u) => u.email === 'hash@example.com')

  assert.ok(stored, 'User should be present in the store')
  assert.notEqual(stored.password, plaintext, 'Stored password must not equal the plaintext')
  assert.ok(
    stored.password.startsWith('$2b$') || stored.password.startsWith('$2a$'),
    'Stored password should be a bcrypt hash'
  )

  const matches = await bcrypt.compare(plaintext, stored.password)
  assert.ok(matches, 'bcrypt.compare should verify the hash against the original plaintext')
})

test('signupUser response never exposes the password field', async () => {
  const result = await signupUser({
    email: 'noleak@example.com',
    password: 'password123',
    profile: { fullName: 'No Leak', age: 20, interests: ['Gaming', 'Coffee', 'Art'] },
  })

  assert.equal(result.status, 201)

  const userInResponse = result.body.user
  assert.ok(userInResponse, 'Response should contain a user object')
  assert.ok(!('password' in userInResponse), 'Top-level user object must not have a password field')

  assert.ok('id'      in userInResponse, 'user.id should be present')
  assert.ok('email'   in userInResponse, 'user.email should be present')
  assert.ok('profile' in userInResponse, 'user.profile should be present')
})

test('signupUser and loginUser both return a JWT signed with the correct secret', async () => {
  const plaintext = 'password123'

  const signupResult = await signupUser({
    email: 'jwt@example.com',
    password: plaintext,
    profile: { fullName: 'JWT User', age: 25, interests: ['Music', 'Coffee', 'Travel'] },
  })

  assert.equal(signupResult.status, 201)

  const signupPayload = jwt.verify(signupResult.body.token, JWT_SECRET)
  assert.ok(signupPayload.id, 'Signup token payload should contain an id')

  const stored = [...users.values()].find((u) => u.email === 'jwt@example.com')
  stored.password = await bcrypt.hash(plaintext, 10)

  const loginResult = await loginUser({ email: 'jwt@example.com', password: plaintext })
  assert.equal(loginResult.status, 200)

  const loginPayload = jwt.verify(loginResult.body.token, JWT_SECRET)
  assert.ok(loginPayload.id, 'Login token payload should contain an id')
  assert.equal(String(loginPayload.id), String(signupPayload.id), 'Both tokens should encode the same user id')
})

test('getUserByToken rejects a missing token with 401', async () => {
  const result = await getUserByToken('')
  assert.equal(result.status, 401)
  assert.equal(result.body.message, 'Authorization token is required.')
})

test('getUserByToken rejects an expired token with 401', async () => {
  const expiredToken = jwt.sign({ id: objectId() }, JWT_SECRET, { expiresIn: '-1s' })
  const result = await getUserByToken(`Bearer ${expiredToken}`)
  assert.equal(result.status, 401)
  assert.equal(result.body.message, 'Invalid or expired token.')
})

test('getUserByToken rejects a token signed with a different secret', async () => {
  const tamperedToken = jwt.sign({ id: objectId() }, 'wrong_secret')
  const result = await getUserByToken(`Bearer ${tamperedToken}`)
  assert.equal(result.status, 401)
  assert.equal(result.body.message, 'Invalid or expired token.')
})

test('friendship participantKey is identical no matter which user is listed first', async () => {
  const userA = makeUser({ profile: { fullName: 'A', age: 20, interests: ['Music', 'Coffee', 'Art'] } })
  const userB = makeUser({ profile: { fullName: 'B', age: 21, interests: ['Music', 'Coffee', 'Art'] } })

  const resultAB = await addFriendByToken(`Bearer ${tokenFor(userA.id)}`, userB.id)
  assert.equal(resultAB.status, 201)

  const keyAB = resultAB.body.friendship.participantKey

  const resultBA = await addFriendByToken(`Bearer ${tokenFor(userB.id)}`, userA.id)
  assert.equal(resultBA.status, 200)
  assert.equal(
    resultBA.body.friendship.participantKey,
    keyAB,
    'participantKey must be the same regardless of direction'
  )
})

test('addFriendByToken rejects a self-friend request with 400', async () => {
  const user = makeUser({ profile: { fullName: 'Solo', age: 22, interests: ['Music', 'Coffee', 'Art'] } })
  const result = await addFriendByToken(`Bearer ${tokenFor(user.id)}`, user.id)

  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'You cannot add yourself as a friend.')
})

test('blockUserByToken rejects a self-block with 400', async () => {
  const user = makeUser({ profile: { fullName: 'SelfBlock', age: 23, interests: ['Music', 'Coffee', 'Art'] } })
  const result = await blockUserByToken(`Bearer ${tokenFor(user.id)}`, user.id)

  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'You cannot block yourself.')
})

test('addFriendByToken rejects a non-ObjectId friendId with 400', async () => {
  const user = makeUser({ profile: { fullName: 'Validator', age: 24, interests: ['Music', 'Coffee', 'Art'] } })
  const result = await addFriendByToken(`Bearer ${tokenFor(user.id)}`, 'not-a-valid-id')

  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'Invalid friend id.')
})

test('sendMessageByToken rejects an empty message text with 400', async () => {
  const userA = makeUser({ profile: { fullName: 'Sender', age: 21, interests: ['Music', 'Coffee', 'Art'] } })
  const userB = makeUser({ profile: { fullName: 'Receiver', age: 22, interests: ['Music', 'Coffee', 'Art'] } })

  const pKey = [String(userA.id), String(userB.id)].sort().join(':')
  friendships.push({
    id: objectId(),
    requester: userA.id,
    recipient: userB.id,
    status: 'accepted',
    blockedBy: null,
    participantKey: pKey,
  })

  const blankResult = await sendMessageByToken(`Bearer ${tokenFor(userA.id)}`, userB.id, '   ')
  assert.equal(blankResult.status, 400)
  assert.equal(blankResult.body.message, 'Message text is required.')

  const emptyResult = await sendMessageByToken(`Bearer ${tokenFor(userA.id)}`, userB.id, '')
  assert.equal(emptyResult.status, 400)
  assert.equal(emptyResult.body.message, 'Message text is required.')
})

test('signupUser rejects a duplicate email with 409', async () => {
  makeUser({ email: 'dupe@example.com' })

  const result = await signupUser({
    email: 'dupe@example.com',
    password: 'password123',
    profile: { fullName: 'Dupe', age: 21, interests: ['Music', 'Coffee', 'Art'] },
  })

  assert.equal(result.status, 409)
  assert.equal(result.body.message, 'An account with this email already exists.')
})

test('signupUser rejects a missing profile with 400', async () => {
  const noProfile = await signupUser({
    email: 'noprofile@example.com',
    password: 'password123',
    profile: null,
  })
  assert.equal(noProfile.status, 400)
  assert.equal(noProfile.body.message, 'Profile information is required.')

  const fewInterests = await signupUser({
    email: 'fewinterests@example.com',
    password: 'password123',
    profile: { fullName: 'Few', age: 21, interests: ['Music'] },
  })
  assert.equal(fewInterests.status, 400)
  assert.equal(fewInterests.body.message, 'Profile information is required.')
})