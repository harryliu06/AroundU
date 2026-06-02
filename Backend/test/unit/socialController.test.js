import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const calls = []
let handlers = {}

function mockLogicFunction(name) {
  return async (...args) => {
    calls.push({ name, args })

    if (handlers[name]) {
      return handlers[name](...args)
    }

    return {
      status: 200,
      body: { message: `${name} success` },
    }
  }
}

mock.module(new URL('../../logic/socialLogic.js', import.meta.url).href, {
  namedExports: {
    acceptFriendRequestByToken: mockLogicFunction('acceptFriendRequestByToken'),
    addFriendByToken: mockLogicFunction('addFriendByToken'),
    blockUserByToken: mockLogicFunction('blockUserByToken'),
    getFriendStatusByToken: mockLogicFunction('getFriendStatusByToken'),
    listBlockedUsersByToken: mockLogicFunction('listBlockedUsersByToken'),
    listFriendRequestsByToken: mockLogicFunction('listFriendRequestsByToken'),
    listFriendsByToken: mockLogicFunction('listFriendsByToken'),
    listMessagesByToken: mockLogicFunction('listMessagesByToken'),
    sendMessageByToken: mockLogicFunction('sendMessageByToken'),
    unblockUserByToken: mockLogicFunction('unblockUserByToken'),
  },
})

const {
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

function resetMocks() {
  calls.length = 0
  handlers = {}
}

const token = 'Bearer test-token'

const successCases = [
  {
    name: 'addFriend',
    controller: addFriend,
    logicName: 'addFriendByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
    },
    expectedArgs: [token, 'friend-id'],
  },
  {
    name: 'listFriends',
    controller: listFriends,
    logicName: 'listFriendsByToken',
    req: {
      headers: { authorization: token },
      params: {},
    },
    expectedArgs: [token],
  },
  {
    name: 'getFriendStatus',
    controller: getFriendStatus,
    logicName: 'getFriendStatusByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
    },
    expectedArgs: [token, 'friend-id'],
  },
  {
    name: 'blockUser',
    controller: blockUser,
    logicName: 'blockUserByToken',
    req: {
      headers: { authorization: token },
      params: { userId: 'blocked-user-id' },
    },
    expectedArgs: [token, 'blocked-user-id'],
  },
  {
    name: 'unblockUser',
    controller: unblockUser,
    logicName: 'unblockUserByToken',
    req: {
      headers: { authorization: token },
      params: { userId: 'blocked-user-id' },
    },
    expectedArgs: [token, 'blocked-user-id'],
  },
  {
    name: 'listBlockedUsers',
    controller: listBlockedUsers,
    logicName: 'listBlockedUsersByToken',
    req: {
      headers: { authorization: token },
      params: {},
    },
    expectedArgs: [token],
  },
  {
    name: 'listFriendRequests',
    controller: listFriendRequests,
    logicName: 'listFriendRequestsByToken',
    req: {
      headers: { authorization: token },
      params: {},
    },
    expectedArgs: [token],
  },
  {
    name: 'acceptFriendRequest',
    controller: acceptFriendRequest,
    logicName: 'acceptFriendRequestByToken',
    req: {
      headers: { authorization: token },
      params: { requestId: 'request-id' },
    },
    expectedArgs: [token, 'request-id'],
  },
  {
    name: 'sendMessage',
    controller: sendMessage,
    logicName: 'sendMessageByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
      body: { text: 'Hello there' },
    },
    expectedArgs: [token, 'friend-id', 'Hello there'],
  },
  {
    name: 'listMessages',
    controller: listMessages,
    logicName: 'listMessagesByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
    },
    expectedArgs: [token, 'friend-id'],
  },
]

for (const testCase of successCases) {
  test(`${testCase.name} calls ${testCase.logicName} and returns its result`, async () => {
    resetMocks()

    handlers[testCase.logicName] = async (...args) => {
      assert.deepEqual(args, testCase.expectedArgs)

      return {
        status: 201,
        body: { message: `${testCase.name} worked` },
      }
    }

    const res = mockResponse()

    await testCase.controller(testCase.req, res)

    assert.equal(calls.length, 1)
    assert.equal(calls[0].name, testCase.logicName)
    assert.equal(res.statusCode, 201)
    assert.deepEqual(res.body, { message: `${testCase.name} worked` })
  })
}

const errorCases = [
  {
    name: 'addFriend',
    controller: addFriend,
    logicName: 'addFriendByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
    },
    expectedMessage: 'Server error while adding friend.',
  },
  {
    name: 'listFriends',
    controller: listFriends,
    logicName: 'listFriendsByToken',
    req: {
      headers: { authorization: token },
      params: {},
    },
    expectedMessage: 'Server error while fetching friends.',
  },
  {
    name: 'getFriendStatus',
    controller: getFriendStatus,
    logicName: 'getFriendStatusByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
    },
    expectedMessage: 'Server error while checking friend status.',
  },
  {
    name: 'blockUser',
    controller: blockUser,
    logicName: 'blockUserByToken',
    req: {
      headers: { authorization: token },
      params: { userId: 'blocked-user-id' },
    },
    expectedMessage: 'Server error while blocking user.',
  },
  {
    name: 'unblockUser',
    controller: unblockUser,
    logicName: 'unblockUserByToken',
    req: {
      headers: { authorization: token },
      params: { userId: 'blocked-user-id' },
    },
    expectedMessage: 'Server error while unblocking user.',
  },
  {
    name: 'listBlockedUsers',
    controller: listBlockedUsers,
    logicName: 'listBlockedUsersByToken',
    req: {
      headers: { authorization: token },
      params: {},
    },
    expectedMessage: 'Server error while fetching blocked users.',
  },
  {
    name: 'listFriendRequests',
    controller: listFriendRequests,
    logicName: 'listFriendRequestsByToken',
    req: {
      headers: { authorization: token },
      params: {},
    },
    expectedMessage: 'Server error while fetching friend requests.',
  },
  {
    name: 'acceptFriendRequest',
    controller: acceptFriendRequest,
    logicName: 'acceptFriendRequestByToken',
    req: {
      headers: { authorization: token },
      params: { requestId: 'request-id' },
    },
    expectedMessage: 'Server error while accepting friend request.',
  },
  {
    name: 'sendMessage',
    controller: sendMessage,
    logicName: 'sendMessageByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
      body: { text: 'Hello there' },
    },
    expectedMessage: 'Server error while sending message.',
  },
  {
    name: 'listMessages',
    controller: listMessages,
    logicName: 'listMessagesByToken',
    req: {
      headers: { authorization: token },
      params: { friendId: 'friend-id' },
    },
    expectedMessage: 'Server error while fetching messages.',
  },
]

for (const testCase of errorCases) {
  test(`${testCase.name} returns 500 when ${testCase.logicName} throws`, async () => {
    resetMocks()

    const originalConsoleError = console.error

    try {
      console.error = () => {}

      handlers[testCase.logicName] = async () => {
        throw new Error('Mock failure')
      }

      const res = mockResponse()

      await testCase.controller(testCase.req, res)

      assert.equal(res.statusCode, 500)
      assert.deepEqual(res.body, { message: testCase.expectedMessage })
    } finally {
      console.error = originalConsoleError
    }
  })
}
