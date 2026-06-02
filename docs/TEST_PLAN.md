# Test Plan

# Part 1
# 1.1 Scope

## In-Scope
- **Log In/Sign up** – Every other feature gates on auth; bugs here lock out all users.
- **Interest/hobby filtering** – Core value proposition; wrong results break the app's purpose.
- **Chat Messaging** – Feature with ordering, persistence, and concurrency concerns.
- **Blocking & location privacy controls** – Directly counters stated stalking/harassment risks; must be airtight.
- **Database read/write correctness** – Incorrect persistence = data loss or data leak.
- **Form Validation (Creating Profile - Email, Password, Age)** – Invalid required fields should show a clear error message without crashing the whole application.
- **Map/directions integration logic** – Meetup coordination depends on it; wrong directions are a usability failure.
- **Backend API endpoints** – Backend is the source of truth for all data; broken endpoints cascade everywhere.

## Out-of-Scope
- **Real-time Chat** – Database storage usage high and don’t have budget for high amount of messages.
- **GPS system** – Requires API from third-party sites where we can’t acquire subscriptions.
- **Real-time Direction** – We don’t have budget for API calls locked behind subscriptions.

# 1.2 Quality Goals
- No critical bug in the signup or login flow, such as a softlock — a user must always be able to create an account and log back in.
- Backend stores 50+ user profiles without data loss.
- 95% of requests to read endpoint should be finished in 500ms.
- Message sent successfully and present/viewable on other user’s screen.
- Safe password storage in database.
- Page Navigation should be crash-free (buttons).
- Tags are successfully filtered without missing a person within a radius of 4 miles.

# 1.3 Risks & Priorities

| Area                                               | Why it's risky / costly                                                                                                | Priority (H / M / L) |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Signup/login failures                              | Users cannot access the app if account creation, login, or token handling breaks, blocking all other features.         | H                    |
| Duplicate emails during signup                     | Creating multiple accounts for one email might cause identity and data consistency problems.                           | H                    |
| Auth token expiry edge cases                       | Expired or invalid tokens could incorrectly lock users out or allow unauthorized access to protected routes.           | H                    |
| Location radius filtering returns wrong users      | AroundU's core feature depends on showing nearby users correctly. Wrong radius logic breaks discovery of users.        | H                    |
| Interest/location matching shows irrelevant people | Users may not find meaningful nearby connections if filtering logic does not match shared hobbies/location correctly.  | H                    |
| Blocked user can still view/contact target         | Major privacy and safety risk. Blocking must prevent discovery, profile access, and messaging where applicable.        | H                    |
| Privacy controls fail to hide sensitive data       | Location/profile data exposure can create safety concerns, especially for student and young professional users.        | H                    |
| Database persistence failure                       | Signup, profile, friends, and chat rely on MongoDB. If writes do not persist, user data can be lost.                   | H                    |
| Password storage/security mistakes                 | Plain-text or leaked passwords would be a serious security issue. Passwords must be hashed and never returned by APIs. | H                    |
| Chat messages lost or loaded out of order          | Users expect friend chat history to persist. Lost or misordered messages make conversations unreliable.                | M                    |
| Chat access after users leave radius               | Friends should retain chat history even after leaving the nearby radius. Losing access would break the friend system.  | M                    |
| Frontend component/layout issues                   | UI problems can make forms, chat, or settings harder to use, but most are recoverable.                                 | L                    |
# 1.4 Strategy — Test Types and Approach per Component

| Component                          | Test Types You'll Apply                                          | Framework                                 | Why This Fits                                                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Native Frontend**          | Manual UI testing, component-level validation checks             | Expo Go / Android Emulator                | AroundU is mobile-first, so testing on a real device or emulator best matches login, profile, chat, settings, and navigation behavior.              |
| **Express Backend Auth**           | Unit tests for auth logic; integration tests for auth API routes | Node built-in test runner (`node --test`) | Our current auth tests use Node's built-in runner to test signup, login, token expiry, and protected routes without requiring extra test libraries. |
| **Database**                       | Integration tests with test MongoDB database                     | MongoDB Atlas test database / Mongoose    | AroundU needs to confirm user accounts persist and can be retrieved after signup/login.                                                             |
| **Cross-cutting concurrency/load** | Basic API response-time testing                                  | Postman Runner or k6 if time allows       | Signup/login and read endpoints should remain responsive under repeated local requests.                                                             |

# 1.5 Environment & Assumptions

- **Runtime:**
  - Node 18+ for the Express backend
  - Python 3.14+ for any Python services
  - Expo Go for the mobile frontend
- **Test database:** A separate local SQLite instance
- **External APIs mocked:**
  - Map/directions provider (Mapbox / Google Maps) → mocked with fixed coordinate responses
  - Push notification service (APNs / FCM) → stubbed; we verify the call was made, not that it was delivered
  - Email verification service → stubbed with an in-memory store
- **Test data:** Generated programmatically at test runtime (no hardcoded shared global state). Each test that needs a user creates one; teardown deletes it.
- **Device or Emulator required:** Frontend unit tests run in a mobile device; either iOS or Android system.

# 1.6 Member Ownership of Test Categories / Components

| Member  | Test Categories / Components                                                    |
| ------- | ------------------------------------------------------------------------------- |
| Harry   | Auth unit & integration tests (signup, login, token expiry, protected routes)   |
| Swaraag | Location logic unit tests; radius filtering integration tests                   |
| Jacob   | Chat integration tests; message ordering and persistence                        |
| Dorian  | Blocking & privacy enforcement. Friending & Accepting Friends                   |
| Tatiana | Database persistence and security                                               |



# Part 2

# 2.3 Test by Category
## Auth testing responsibility: signup, login, token expiry, and protected routes (Harry)

Last updated: June 1, 2026 (commit: 0c10138f24b3b6cb15b21f342b0fbe755296d2a6)

| Category    | Count | Example                                                                                                                                                                                                          |
| ----------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        |     6 | `signupUser rejects missing email and password`<br>`signupUser accepts a valid email format`<br>`loginUser rejects unknown email`<br>`getUserByToken rejects missing authorization token`                        |
| Integration |     4 | `POST /signup creates an account and returns auth data`<br>`POST /login returns a token for valid credentials`<br>`GET /me rejects missing authorization token`<br>`GET /me rejects expired authorization token` |

## Blocking, privacy, friending, and accepting testing responsibility: (Dorian)

Last updated: June 1, 2026 (commit: 6913b41dfe3c9d95e433abe0b5aa6b7984ef7ccf)

| Category    | Count | Example                                                                                                                                                                                                          |
| ----------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        |    20  | `blockUser calls blockUserByToken and returns its result`<br>`blockUser returns 500 when blockUserByToken throws`<br>`addFriend calls addFriendByToken and returns its result`|
| Integration |    5   | `a blocked user cannot send a friend request to the blocker`<br>`friends can send and list messages`<br>`blocking an existing friend prevents further messaging`|

# 2.4
## Where the Tests Live + How to Run Them

Test folder structure:

```txt
Backend/
  test/
    unit/
      userLogic.test.js
    integration/
      authRoutes.test.js
```

Run commands:

```bash
cd Backend
npm install
npm test
```

Optional category-specific commands:

```bash
npm run test:unit
npm run test:integration
npm run test:coverage
```

Approximate run-times:

| Category    |       Time | Where it runs |
| ----------- | ---------: | ------------- |
| Unit        | < 1 second | local + CI    |
| Integration |  ~1 second | local + CI    |


# 2.5
## Coverage Achieved (IN PROGRESS)

Last updated: June 1, 2026 (commit: 0c10138f24b3b6cb15b21f342b0fbe755296d2a6)

| Test type          | Tool                                       | Coverage % |
| ------------------ | ------------------------------------------ | ---------: |
| Unit               | `node --test --experimental-test-coverage` |            |
| Integration        | `node --test --experimental-test-coverage` |            |
| Combined (overall) | `npm run test:coverage`                    |            |

