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

| Area | Why it's risky / costly | Priority (H / M / L) |
| --- | --- | --- |
| Concurrent signups → duplicate emails | Race condition; data corruption | H |
| Auth token expiry edge cases | Security implications | H |
| Exact GPS coordinates leaking to blocked/unmatched users | Direct stalking/harassment risk; stated in project brief as a top concern | H |
| Block bypass — blocked user can still query target's data | Privacy/safety failure; could expose users to harm | H |
| Location radius query returning wrong users | Core feature failure; erodes trust immediately | H |
| Chat messages lost or duplicated under concurrent send | Data integrity; confusing user experience | M |
| Interest filter returning no results when matches exist | Discoverable bug; users churn | M |
| Map directions linking to wrong coordinates | Meetup failure; user frustration | M |
| Pagination on large user lists | Cosmetic; recoverable by refreshing | L |
| Profile photo upload edge cases | Non-critical; fallback to default avatar | L |
| Message bar raising up a bit after the keyboard is dismissed in the chat page | Cosmetic; recoverable | L |

# 1.4 Strategy — Test Types and Approach per Component

| Component | Test Types You'll Apply | Framework | Why This Fits |
| --- | --- | --- | --- |
| **React Native frontend** | Manual UI testing, component-level validation checks | Expo Go / Android Emulator, React Native testing later if time allows | The app is mobile-first, so testing on an actual Android device/emulator best matches the user experience. |
| **Express backend** | Unit tests for logic, integration tests for API routes | Jest + Supertest | Jest can test backend functions, while Supertest can send requests to Express endpoints like `/signup` and `/login`. |
| **Database** | Integration tests with test MongoDB database | MongoDB Atlas test database / Mongoose | AroundU needs to confirm user accounts persist and can be retrieved after signup/login. |
| **Cross-cutting concurrency/load** | Basic API response-time testing | Postman Runner or k6 if time allows | Signup/login and read endpoints should remain responsive under repeated local requests. |

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

| Member    | Test Categories / Components                                                                 |
|-----------|----------------------------------------------------------------------------------------------|
| Harry     | Auth unit & integration tests (signup, login, token expiry, protected routes)             |
| Swaraag   | Location logic unit tests; radius filtering integration tests                            |
| Jacob     | Chat integration tests; message ordering and persistence                                   |
| Dorian    | Blocking & privacy enforcement integration tests; frontend component unit tests          |
| Tatiana   | Database persistence and security                                                          |
