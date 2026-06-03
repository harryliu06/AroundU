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
- **Backend API endpoints** – Backend is the source of truth for all data; broken endpoints cascade everywhere.

## Out-of-Scope
- **Real-time Chat** – Database storage usage high and don’t have budget for high amount of messages.
- **GPS system** – Requires API from third-party sites where we can’t acquire subscriptions.
- **Real-time Map Direction** – We don’t have budget for API calls locked behind subscriptions.

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

| Component                           | Test Types You'll Apply                                                                            | Framework                                                      | Why This Fits                                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Native Frontend**           | Manual UI testing, component-level validation checks                                               | Expo Go / Android Emulator                                     | AroundU is mobile-first, so testing on a real device or emulator best matches login, profile, chat, settings, and navigation behavior.              |
| **Express Backend Auth**            | Unit tests for auth logic; integration tests for auth API routes                                   | Node built-in test runner (`node --test`)                      | Our current auth tests use Node's built-in runner to test signup, login, token expiry, and protected routes without requiring extra test libraries. |
| **Location and interest filtering** | Unit tests for nearby-user filtering; integration tests for full nearby-user response behavior     | Node built-in test runner / mocked user data                   | AroundU's prototype discovery flow uses shared interests and demo distances, so mocked users make the filtering behavior repeatable.                |
| **Chat, friends, and blocking**     | Unit tests for social controllers; integration tests for friend, chat, block, and unblock behavior | Node built-in test runner / mocked or in-memory model behavior | These features are safety- and workflow-critical, so tests verify route and logic behavior without relying on a live production database.           |
| **Database**                        | Integration tests with test MongoDB database                                                       | MongoDB Atlas test database / Mongoose                         | AroundU needs to confirm user accounts persist and can be retrieved after signup/login.                                                             |
| **Cross-cutting concurrency/load**  | Basic API response-time testing                                                                    | Postman Runner or k6 if time allows                            | Signup/login and read endpoints should remain responsive under repeated local requests.                                                             |

# 1.5 Environment & Assumptions
- **Runtime:**
  - Node 22.x for the Express backend
  - Expo Go for the mobile frontend
- **Test data:** Generated programmatically at test runtime. Most backend tests use mocked or in-memory data and restore mocked model methods after each test, so no shared production database state is modified.
- **Device or Emulator required:** Backend tests run locally through Node. Frontend behavior is tested manually through Expo Go on either iOS or Android.

# 1.6 Member Ownership of Test Categories / Components

| Member | Test Categories / Components                                                                       |
| ------ | -------------------------------------------------------------------------------------------------- |
| Harry  | Auth unit & integration tests (signup, login, token expiry, protected routes), Frontend UI testing |
| Jacob  | Location logic unit tests; radius filtering integration tests                                      |
| Dorian | Chat integration tests; message ordering and persistence                                           |
| Dorian | Blocking & privacy enforcement. Friending & Accepting Friends                                      |
| Jacob  | Database persistence and security                                                                  |



# Part 2

# 2.3 Test by Category
## Auth testing responsibility: signup, login, token expiry, and protected routes, Frontend manually testing with Expo Go (Harry)

Last updated: June 1, 2026 (commit: 0c10138f24b3b6cb15b21f342b0fbe755296d2a6)

| Category    | Count | Example                                                                                                                                                                                                          |
| ----------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        |     6 | `signupUser rejects missing email and password`<br>`signupUser accepts a valid email format`<br>`loginUser rejects unknown email`<br>`getUserByToken rejects missing authorization token`                        |
| Integration |     4 | `POST /signup creates an account and returns auth data`<br>`POST /login returns a token for valid credentials`<br>`GET /me rejects missing authorization token`<br>`GET /me rejects expired authorization token` |

## Blocking & privacy enforcement. Friending & Accepting Friends\ Chat integration tests; message ordering and persistence: (Dorian)

Last updated: June 1, 2026 (commit: 6913b41dfe3c9d95e433abe0b5aa6b7984ef7ccf)

| Category    | Count | Example                                                                                                                                                                        |
| ----------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit        |    20 | `blockUser calls blockUserByToken and returns its result`<br>`blockUser returns 500 when blockUserByToken throws`<br>`addFriend calls addFriendByToken and returns its result` |
| Integration |     5 | `a blocked user cannot send a friend request to the blocker`<br>`friends can send and list messages`<br>`blocking an existing friend prevents further messaging`               |

## Location logic unit tests; radius filtering integration tests\ Database persistence and security: (Jacob)

Last updated: June 2, 2026 (commit: 633638d59ffcb8b9ec7e3494efac2c9e783d1eee)

| Category    | Count | Example                                                                                                                                                                                                                                                              |
| ----------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        |    20 | `unauthenticated request to nearby-users returns 200 with an empty filtered list`<br>`users with a blocked friendship status are excluded from nearby results`<br>`sendMessageByToken rejects an empty message text with 400`                                        |
| Integration |     9 | `a user cannot accept a friend request that was addressed to a different use`<br>`users with no overlapping interests are excluded while those with at least one are included`<br>`nearby users carry the correct friendStatus reflecting the existing relationship` |


# 2.4
## Where the Tests Live + How to Run Them

Test folder structure:

```txt
Backend/
  coverage/
    index.html
  test/
    unit/
      databaseUnit.test.js
      locationLogic.test.js
      socialController.test.js
      userLogic.test.js
    integration/
      authRoutes.test.js
      databaseIntegration.test.js
      radiusFiltering.test.js
      socialLogic.test.js
```

Run commands:

```bash
cd Backend
npm install
npm test
```

Optional category-specific commands:

```bash
//Run only unit test
npm run test:unit

//Run only integration test
npm run test:integration

//Get coverage report on Terminal
npm run test:coverage

//Generate html coverage report
npm run test:html
```

Approximate run-times:

| Category    |      Time | Where it runs |
| ----------- | --------: | ------------- |
| Unit        | ~1 second | local + CI    |
| Integration | ~1 second | local + CI    |


# 2.5
## Coverage Achieved

Last updated: June 2, 2026 (commit: 601159c1535721c5df9fbdff0ead2e7c29b0a25e)

| Test type          | Tool                                | Coverage % |
| ------------------ | ----------------------------------- | ---------: |
| Unit               | `npm run test:coverage:unit`        |      68.02 |
| Integration        | `npm run test:coverage:integration` |      85.40 |
| Combined (overall) | `npm run test:coverage`             |      82.61 |

What's not covered and why?
The React Native frontend is not covered by automated tests yet, so UI layouts and page navigation are tested manually through Expo Go instead. MongoDB Atlas connection is not tested so that tests are run reliably without depending on shared cloud database credentials.

# 2.6 
## Plan-vs-implementation gap

| What the plan called for                       | What we shipped                           | What we blocked/added                                                                                                                               |
| ---------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integration tests with a test MongoDB database | Mocked database behavior in backend tests | Didnt' use a live MongoDB Atlas test database; everything was mostly mocked due to actual database complexity and test reliability on every machine |


# Part 3
## Reflection
After doing manual frontend tests through Expo Go, there was a bug in the blocking feature. Blocked users were still visible in the nearby users section even though they should have been hidden. We fixed this by filtering blocked relationships out of nearby-user results and adding a blocked-users page with an unblock action. We also noticed a minor UI bug such that the chat message bar would raise a bit after dismissing the keyboard. Since it didn't block the main chat flow, we treated it as a low-priority cosmetic bug and moved on.

Testing the live MongoDB Atlas connection was the hardest as we couldn’t figure out how to test the connection effectively. Instead, our database-related tests use mocked model behavior instead of depending on an external Atlas cluster. Though a bit of front-end testing was done through Expo Go manually, a bit more of front-end testing would work wonders, but with the little time we had, we had to cut it to meet the deadline. 

Additionally, if we could have found a proper way to test our program with a real database, it would have been much better and to test the limits of it. However, this was also not possible within our time, as the implementation for testing this required more thought process and setup because everyone who tested the database would need a MongoDB Atlas connection. Claude and other LLMs such as Codex had to help with a lot of the test writing process. Some of the team members were absent almost throughout the whole assignment without communication. And for the rest of us, a few of us haven’t written in JavaScript before or were having issues connecting to the repository to begin. Of the few times that things went a bit wrong was that tests required some Mocking, which hasn’t been done. So we had to course correct the LLMs a bit to generate the correct tests we needed.
