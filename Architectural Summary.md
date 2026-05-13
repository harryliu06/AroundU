# Architecture

## Architectural Summary

  Our application system’s design is made up of many components and connectors within a Client-server architecture style, with the client side also holding a Model-View-Controller style. For the server, its job would be to offer the clients the various services available for the best experience. From authentication services to protect their accounts, a chat and friending service to connect with friends, an API service allowing users access to an interactive map, and more coming from a server. As for the client side, it holds a lot of the user interfaces a user will see when interacting with the app. The benefits of using a client to server style is that there will be centralized control that will have a client communicate with the server for information, and with the possible use of a third party server, it will allow service to be scalable. However, the tradeoffs mean that if we use a third party, there could be potential security and privacy issues, additionally it will mean the users are required to have internet access. Connectors between these two will require a WebSocket connection, especially for such features like chatting, and HTTPS requests and Rest API endpoints for API.
  
  Additionally, the client side will hold an MVC style. The view side will be what a user is capable of seeing, which is a lot of the interface from messages, maps, accounts, and login. Its model will hold a lot of local data, from some messages, certain settings, and some local data. Finally, its controller will make use of various actions from the user, buttons, text boxes, swipes, presses, and more. All these components will be connected with user inputs, function calls, and more things that will run on their laptop, or in this case, mobile device. The benefits of an MVC style would mean there is modularity and would allow for good maintenance. However, the tradeoff would be that there can be some complexity in this style, and components would be very dependent on other components.
  
  Lastly, there will be a database that will be accessible from a cloud, holding a lot of important data that the server can access and distribute to its clients. A lot of this data will be held in certain databases such as SQLite and PostgreSQL (SQLite for prototypes, PostgreSQL for the full thing). Much of the data will consist of current users, their profiles, conversations with people, friends, blocks, and more. Connection to this database will require such connections like a direct sqlite connection from python or the chosen language. The benefits would be that data will be secure, accessible, and scalable to a degree. However, the main tradeoff would be that there must be a connection to the database for writing and reading, and hoping the data in the cloud is not lost.

-------------

## Client-Server\MVC style for our architecture.
### Components: 
Clients:
- Frontend UI components (Views)
- Client Models
- Client Controllers
- Interactive Map for directions
- Chat Interface

Server:
- Authentication service
- Profile Service
- API services
- Matching/Discovery Service
- Location service
- Chat/Friends Service
- Blocking/Reporting Service

Database:
- SQLite
- Users
- Profiles
- Interests
- Locations
- Friends
- Conversations/ Messages
- Blocks/Reports

### Structure
Client-Side Components:
- Model:
  - Messages
  - Privacy settings.
  - Blocked Users
  - Radius Settings
  - Interest data
  - Profile data
- View: 
  - UI Interface
  - Home Interactive Map
  - User Profile
  - Login/Registration
  - Settings/ Privacy
  - Chat
  - Interests filter
- Controllers:
  - User Actions
    - Buttons/Text box
      - Login/register
      - Profile edit
      - Message
      - Meetup directions
    - Buttons
      - Location toggle
      - Radius selection
      - Block/report
    - Swipes/Gestures
      - Screen changing

Server Side:
  - All services mentioned above.

Database:
  - Users
  - Profiles
  - Interests
  - Locations
  - Friends
  - Messages
  - Conversations
  - Blocks
  - Reports

Connectors
  - HTTPS requests 
  - Database connection to SQL
  - Push notifications for messages.
  - Rest API endpoints: 
    - login
    - Profile
    - Settings
    - Home
    - Match
      - Map
      - Chat
  - WebSocket connection for the chatting function
  - Database Connection

## Benefits of Client-Server Style
  - A centralized control of all information
  - Using certain third-party services makes it scalable.
  - Direct service
## Tradeoffs of Client-Server
  - Possible security and privacy issues.
  - Network and internet connection required.

## Benefits of MVC Style:
  - Modularity
  - Good maintenance
## Tradeoffs of MVC
  - Some complexity
  - Dependence of some components.

<img width="1192" height="1039" alt="Geo-Friends_Architecturev2 drawio" src="https://github.com/user-attachments/assets/071ff061-9a13-4213-81fd-1cad8e8c4eda" />

# Platforms and Languages
## Platform: 
- Client Side: iOS 17+ and Android 14+
  - Benefits:
    - Supporting modern mobile operating systems such as iOS 17+ and Android 14+ allows the application to use the latest mobile technology. These platforms provide enhanced security and privacy controls, especially for features such as location sharing, which is central to the app’s functionality. Additionally, newer operating systems offer improved performance, smoother user interfaces, and access to updated APIs for maps, notifications, and real time services. This results in a more responsive and reliable user experience. 
  - Downsides:
     - Restricting the application to newer operating systems may limit accessibility for users with older devices who are unable or unwilling to update their software. This could reduce the potential user base, particularly during the early stages of the app release. Furthermore, despite targeting newer versions, device variability, especially within the Android ecosystem, can still introduce inconsistencies in performance and behavior. Finally, users on modern platforms often have higher expectations for performance and design quality, increasing the pressure to deliver a highly polished and bug-free experience upon first release.

- Backend server: SQLite 3 for local development and PostgreSQL Cloud later
  - Benefits:
    - The application will use SQLite 3 during development because it is lightweight, simple to set up, and works well for testing features early on without needing a full server. This allows the team to quickly develop and test important features such as user profiles, chat functions, and location based matching. SQLite also makes debugging easier during the early stages of development. As the app grows, the backend can transition to a cloud hosted PostgreSQL database. PostgreSQL is better suited for handling larger amounts of data and more active users at the same time. It also provides stronger security, better performance, and improved reliability for features such as real time messaging and user matching.

  - Downsides:
    - SQLite works well for development, but it is not ideal for a large-scale social application because it cannot efficiently handle many users interacting at once. As user activity increases, performance may slow down. Transitioning from SQLite to PostgreSQL later may also require additional testing and database migration to make sure everything continues working correctly. Using a cloud hosted PostgreSQL server can also increase costs over time due to server hosting, storage, and maintenance. Since the app handles user accounts, messages, and location sharing, stronger security measures will also be necessary as the platform grows.

  - Future Growth:
    - Starting with SQLite helps keep development simple and cost effective during the early stages of the project. As the application gains more users, PostgreSQL Cloud will allow the app to scale more efficiently and support future features such as improved messaging systems, moderation tools, and larger user activity.



## Programming Languages
- Backend: Python, FastAPI
  - Pros:
    - Great for rapid development and prototyping; we can achieve more with less code written
    - Large variety of libraries and tools, such as FastAPI, a modern, fast (high-performance), web framework for building APIs in Python
    - High scalability and flexibility; can easily be integrated with a wide range of databases, technologies, and outside services
    - Readability and simplicity; relatively easy-to-understand syntax
  - Cons
    - Generally a slower execution speed than compiled languages, like Java or C++
    - High memory consumption
    - Limited support for frontend and mobile app development
- Frontend: Typescript, React
  - Pros:
    - Able to catch bugs at early stages of development
    - Great IDE support; easy for refactoring and provides a highly accurate autocompletion tool
    - Inherits major pros of Javascript
    - Supports object-oriented programming
  - Cons:
    - More code required to write; can slow down development process
    - Learning curve; although it’s a variant of Javascript, Typescript takes time to learn its advanced features
- Middleware: Node.js
  - Pros:
    - Fast processing for web tasks; Node.js has an event-driven nature that makes it great for middleware operations without stalling the rest of the application
    - Scalable technology for microservices; it’s a lightweight technology tool that improves modularity and separation of concerns
    - Gentle learning curve and large community support
  - Cons:
    - Performance can bottleneck when it comes to heavy computation tasks
    - Dependency and security risks; relying on third-party middleware introduces vulnerabilities
- Database: SQL 
  - Pros:
    - Very strong for handling structured data with clear relationships
    - Reinforces data integrity; follows ACID properties (Atomicity, Consistency, Isolation, Durability) that ensures transactions are processed reliably
    - Great and easy-to-use for powerful and complex queries
    - Large community support; SQL has been a standard language since the 1970s
  - Cons:
    - Databases scale vertically; a more powerful server is required to handle more data
    - Can struggle with unstructured data
    - Rigid schema required; data structure must be defined before it can be worked with
    - Complex queries can slow down performance on massive datasets if not optimized properly


# Communication Protocols:
Our application system uses a client-server architecture where the mobile client communicates with the backend server and external APIs such as Google Maps through protocols. The web interface (client) sends data such as user inputs, login credentials and location information to the backend server using HTTPS requests. We plan to create RESTful API endpoint routes like ‘/login’, ‘/profile’, and ‘/home’ to receive such requests. For instance, clients will send the login credentials to ‘/login’ for authentication and request profile information to ‘/profile’ when the profile page is loaded up. These requests and data will be sent in JSON format, to ensure consistency between the client and server. 

Express.js framework will be the intermediate middleware to handle routes for these requests from the client side and sends JSON responses back after performing CRUD operations and validating data in the backend side. The backend will communicate with external APIs like Google Map API to request location data, place information and distance information for the implementation of interactive maps in our application.

On the other hand, WebSocket protocols will be used for real-time communication since we plan to implement the chatting function where multiple continuous data from different users are updated. This protocol allows open connections between the client and the server so messages can be exchanged instantly between users. For instance, a message from User A is sent through WebSocket to the server and the server will forward it to User B in real time. 

# Component Functions + Connectors Examples

## Radius Chat Function - Basic Flow

| Use Case Step                   | Component Function                                            | Connector                 | Data Communicated                               |
| ------------------------------- | ------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| User sets radius (10 miles)     | Client Controller: `SettingsController.update_radius(10)`     | HTTPS PUT                 | User radius preference and user ID              |
| System saves radius setting     | Profile Service: `ProfileManager.save_preferences()`          | Database Connection (SQL) | User radius preference and user ID              |
| User receives message request   | Chat/Friends Service: `RequestManager.trigger_notification()` | Push Notification         | Message request, sender user ID, and request ID |
| User accepts request            | Chat Interface: `ChatController.respond_to_request(True)`     | REST API                  | Request ID and request status                   |
| System initializes chat session | Chat/Friends Service: `SessionManager.create_web_socket()`    | WebSocket Connection      | Connection URL                                  |
| Users exchange messages         | Chat Interface: `ChatUI.send_message("Hello!")`               | WebSocket Frame           | Recipient ID, message content, and timestamp    |

---

## Radius Chat Function - Alternative Flow

| Use Case Step                   | Component Function                                                 | Connector                 | Data Communicated                                          |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------- |
| User sets radius (5 miles)      | Client Controller: `SettingsController.update_radius(5)`           | HTTPS PUT                 | User radius preference and user ID                         |
| System saves radius setting     | Profile Service: `ProfileManager.save_preferences()`               | Database Connection (SQL) | User radius preference and user ID                         |
| User browses nearby users       | Matching/Discovery Service: `Discovery.find_nearby_users()`        | REST API                  | Nearby user IDs and distances                              |
| User sends message request      | Chat Interface: `ChatController.send_request()`                    | REST API                  | Request message, sender ID, target user ID, and request ID |
| Other user accepts request      | Chat Interface: `RequestManager.update_request_status("accepted")` | Database Connection (SQL) | Request ID and accepted status                             |
| System initializes chat session | Chat/Friends Service: `SessionManager.create_web_socket()`         | WebSocket Connection      | Connection URL                                             |
| Users exchange messages         | Chat Interface: `ChatUI.send_message("Hello!")`                    | WebSocket Frame           | Recipient ID, message content, and timestamp               |

---

## Radius Chat Function - Exception Flow

| Use Case Step                   | Component Function                                               | Connector                 | Data Communicated                                          |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| User sets radius (20 miles)     | Client Controller: `SettingsController.update_radius(20)`        | HTTPS PUT                 | User radius preference and user ID                         |
| System saves radius setting     | Profile Service: `ProfileManager.save_preferences()`             | Database Connection (SQL) | User radius preference and user ID                         |
| User browses nearby users       | Matching/Discovery Service: `Discovery.find_nearby_users()`      | REST API                  | Nearby user IDs and distances                              |
| User sends message request      | Chat Interface: `ChatController.send_request()`                  | REST API                  | Request message, sender ID, target user ID, and request ID |
| Other user denies request       | Chat Interface: `RequestManager.update_request_status("denied")` | Database Connection (SQL) | Request ID and denied status                               |
| System blocks repeated requests | Blocking Service: `RestrictionManager.prevent_repeat()`          | Database Connection (SQL) | Block actor ID, block target ID, and block reason          |



## Location Access Toggle - Basic Flow

| Use Case Step                  | Component Function                                                                                                      | Connector                                    | Data Communicated                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| User clicks the settings icon  | Navigation Controller: `NavigationController.openSettings()`                                                            | User Input Event                             | Click/tap event                                                        |
| User opens the permissions tab | Client Controller: `SettingsController.openPermissionsTab()`                                                            | Internal Client Navigation / UI State Update | Selected tab value: Permissions                                        |
| User disables location sharing | Client Controller: `SettingsController.location_permission(False)`                                                      | Internal Client State Update                 | `locationSharingEnabled = False`                                       |
| User applies updated settings  | Client Controller + Location Service: `SettingsController.applySettings()` / `LocationService.updateLocationSettings()` | REST API / Database Connection (SQL)         | User ID, location sharing status, timestamp, optional disable duration |

---

## Location Access Toggle - Alternative Flow

| Use Case Step                     | Component Function                                                                                                      | Connector                               | Data Communicated                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| User clicks “Disable For”         | Client Controller: `SettingsController.openDisableDurationMenu()`                                                       | Internal Client UI Event / State Update | Selected temporary disable option                                |
| User selects “Disable for 1 hour” | Client Controller: `SettingsController.setLocationSharingDuration(1_hour)`                                              | Internal Client State Update            | `locationSharingEnabled = False`, duration, expiration timestamp |
| User applies updated settings     | Client Controller + Location Service: `SettingsController.applySettings()` / `LocationService.updateLocationSettings()` | REST API / Database Connection (SQL)    | User ID, temporary disable duration, expiration time             |

---

## Location Access Toggle - Exception Flow

| Use Case Step                         | Component Function                                                      | Connector                                              | Data Communicated                                      |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| App checks device location permission | Client Controller: `SettingsController.checkDeviceLocationPermission()` | Device Permission API / Mobile OS Permission Connector | System permission status: granted, denied, or disabled |
| System detects permission denied      | Permission Service: `PermissionManager.handlePermissionDenied()`        | Internal Client Logic                                  | Permission denial state                                |
| App displays permission error message | Client View: `PermissionView.showPermissionError()`                     | Internal Client UI State Update                        | Error message and permission instructions              |



## Open-ended Filtering - Basic Flow

| Use Case Step                          | Component Function                                                                                                   | Connector                                       | Data Communicated                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| User types “#Biking” into search bar   | Client Controller: `SearchController.updateInterestFilter("#Biking")`                                                | User Input Event / Internal Client State Update | Search text and normalized interest                               |
| System searches nearby users           | Search Controller + Discovery Service: `SearchController.searchNearbyUsers()` / `DiscoveryService.findNearbyUsers()` | REST API                                        | User ID, selected interest, radius, location                      |
| System returns matching nearby users   | Discovery Service: `DiscoveryService.returnMatchingUsers()`                                                          | REST API                                        | Matching user IDs, shared interests, estimated location, distance |
| User selects a map pin to open profile | Map Controller: `MapController.openUserProfile(userId)`                                                              | REST API                                        | Selected user ID and returned profile information                 |

---

## Open-ended Filtering - Alternative Flow

| Use Case Step                               | Component Function                                                                                                | Connector                       | Data Communicated                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------- |
| System cannot find users with matching tags | Discovery Service + Map Controller: `DiscoveryService.findNearbyUsers()` / `MapController.showNoResultsMessage()` | REST API                        | Empty results list               |
| App displays “No Results Found” message     | Map View: `MapView.renderEmptyResults()`                                                                          | Internal Client UI State Update | No nearby matching users message |

---

## Open-ended Filtering - Exception Flow

| Use Case Step                              | Component Function                                                                                             | Connector                              | Data Communicated                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| User enters explicit or inappropriate text | Client Controller: `SearchController.validateSearchText(input)`                                                | User Input Event / Internal Validation | Raw search text                                     |
| System filters inappropriate content       | Moderation Service: `ContentFilterService.sanitizeSearchText(input)`                                           | HTTPS Request                          | Filtered text, blocked term flag, validation result |
| Map service encounters scanning error      | Map Controller + Discovery Service: `MapController.loadSearchResults()` / `DiscoveryService.findNearbyUsers()` | REST API                               | Error code                                          |
| App hides map and displays error           | Map View: `MapView.showMapErrorMessage()`                                                                      | Internal Client UI State Update        | Error message text                                  |



## Meet-up Directions - Basic Flow

| Use Case Step                                                          | Component Function                                          | Connector                               | Data Communicated                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| Users A and B agree to meet after chatting                             | Chat Interface: `ChatUI.confirmMeetUp()`                    | WebSocket Connection                    | Meetup intent between User A and User B, User A ID and User B ID |
| User A selects “Share Direction”                                       | Chat Interface: `ChatController.openSharedDirection()`      | REST API                                | User A ID and action request to choose location                  |
| User A chooses current location                                        | Location Service: `LocationController.getCurrentLocation()` | External Map API / React Native Library | User A’s current latitude and longitude                          |
| User A chooses selected location                                       | Map Service: `MapController.searchSelectedPlace()`          | External Map API                        | Selected location, address, latitude and longitude               |
| System generates routes, directions and ETA                            | Map Service: `DirectionService.generateRoute()`             | External Map API                        | Origin, destination, route options, direction, distance and ETA  |
| User A sends meet-up location to User B                                | Chat Service: `ChatController.send_meetup_location()`       | WebSocket Connection                    | Meet up location, route link, ETA, User A ID and User B ID       |
| User B opens directions using built-in map or external map application | Direction Service: `DirectionController.open_navigation()`  | Built-in Map Tool / External App Link   | Destination link, map link and navigation options                |

---

## Meet-up Directions - Alternative Flow

| Use Case Step                            | Component Function                                     | Connector            | Data Communicated                                    |
| ---------------------------------------- | ------------------------------------------------------ | -------------------- | ---------------------------------------------------- |
| User A shares location with User B       | Chat Service: `ChatController.sendLocation()`          | WebSocket Connection | Shared location coordinates, User A ID and User B ID |
| User B selects transportation method     | Map Controller: `MapController.selectTransportation()` | HTTPS POST           | Transportation type                                  |
| System updates ETA and route information | Map Service: `DirectionService.updateRoute()`          | External Map API     | Updated route information, distance and ETA          |
| User B suggests another meet-up location | Chat Service: `ChatController.requestLocationChange()` | WebSocket Connection | Suggested location and request message               |

---

## Meet-up Directions - Exception Flow

| Use Case Step                                     | Component Function                                                      | Connector                                              | Data Communicated                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| Directions fail to load because of network issues | Network Service: `ConnectionManager.checkConnection()`                  | Network Status API                                     | Internet connection status                             |
| Location access disabled by user                  | Client Controller: `SettingsController.checkDeviceLocationPermission()` | Device Permission API / Mobile OS Permission Connector | System permission status: granted, denied, or disabled |



## User Profile Customization/Biography - Basic Flow

| Use Case Step              | Component Function                                    | Connector                 | Data Communicated                    |
| -------------------------- | ----------------------------------------------------- | ------------------------- | ------------------------------------ |
| User opens profile page    | Client Controller: `ProfileController.load_profile()` | HTTPS GET                 | User ID and existing bio information |
| User selects “Edit”        | Frontend UI: `EditProfileView.toggle_edit_mode(True)` | Internal Client Logic     | Edit mode state change               |
| User updates and saves bio | Profile Service: `ProfileManager.update_bio(message)` | REST API                  | Updated bio message                  |
| System stores updated bio  | Database Service: `SQLite.execute_query()`            | Database Connection (SQL) | User ID and updated bio content      |

---

## User Profile Customization/Biography - Alternative Flow

| Use Case Step                             | Component Function                                     | Connector                 | Data Communicated                    |
| ----------------------------------------- | ------------------------------------------------------ | ------------------------- | ------------------------------------ |
| User opens profile page                   | Client Controller: `ProfileController.load_profile()`  | HTTPS GET                 | User ID and existing bio information |
| User selects “Edit”                       | Frontend UI: `EditProfileView.toggle_edit_mode(True)`  | Internal Client Logic     | Edit mode state change               |
| User enters bio with hashtags             | Client Model: `ProfileModel.set_text(message)`         | Internal Client Logic     | Bio text containing hashtags         |
| User saves profile update                 | Client Controller: `ProfileController.submit_update()` | HTTPS POST                | Bio message and tag parsing flag     |
| System extracts hashtags from bio         | Profile Service: `TagParser.extract(message)`          | Internal Server Logic     | Parsed hashtag interests             |
| System stores interests                   | Profile Service: `InterestManager.add_interest()`      | Database Connection (SQL) | Interest/tag name                    |
| System updates user-interest relationship | Database Service: `SQLite.execute_query()`             | Database Connection (SQL) | User ID and associated interests     |

---

## User Profile Customization/Biography - Exception Flow

| Use Case Step                        | Component Function                                              | Connector                 | Data Communicated                    |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------- | ------------------------------------ |
| User opens profile page              | Client Controller: `ProfileController.load_profile()`           | HTTPS GET                 | User ID and existing bio information |
| User selects “Edit”                  | Frontend UI: `EditProfileView.toggle_edit_mode(True)`           | Internal Client Logic     | Edit mode state change               |
| User clears bio text                 | Frontend UI: `BioTextArea.clear()`                              | Internal Client Logic     | Empty bio string                     |
| System validates optional bio field  | Validation Service: `ValidationService.check_optional_fields()` | Internal Server Logic     | Validation result for empty bio      |
| System updates empty bio in database | Profile Service: `ProfileManager.set_bio_null()`                | Database Connection (SQL) | User ID and null bio value           |
| System renders empty profile bio     | Frontend UI: `ProfileView.render(data)`                         | HTTPS GET                 | Updated profile with empty bio       |



## Blocking Users - Basic Flow

| Use Case Step                     | Component Function                                          | Connector                 | Data Communicated                                       |
| --------------------------------- | ----------------------------------------------------------- | ------------------------- | ------------------------------------------------------- |
| User opens another user’s profile | Profile Service: `ProfileService.get_profile(userId)`       | REST API                  | Target user ID and profile information                  |
| User selects “Block User”         | Block Interface: `BlockController.block_user(targetId)`     | REST API                  | Requesting user ID and target user ID                   |
| System applies block restrictions | Block Service: `BlockManager.apply_block(targetId)`         | Database Connection (SQL) | Block actor ID, blocked user ID, restricted permissions |
| System confirms successful block  | Client Controller: `NotificationController.confirm_block()` | HTTPS Response            | Block confirmation status                               |

---

## Blocking Users - Alternative Flow

| Use Case Step                               | Component Function                                                                                      | Connector                 | Data Communicated                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------- |
| User opens another user’s profile           | Profile Service: `ProfileService.get_profile(userId)`                                                   | REST API                  | Target user ID and profile information             |
| User selects “Block and Report”             | Block Interface: `BlockController.block_with_report(targetId)`                                          | REST API                  | Requesting user ID, target user ID, report flag    |
| System prompts report category selection    | Client Controller: `ReportUI.prompt_category()`                                                         | HTTPS Response            | Available violation categories                     |
| User submits report details                 | Report Interface: `ReportController.submit_report(category, detail)`                                    | REST API                  | Violation category, detail message, target user ID |
| System applies block and forwards report    | Block Service + Report Service: `BlockManager.apply_block(targetId)` / `ReportManager.forward_report()` | Database Connection (SQL) | Block record and report information                |
| System confirms successful block and report | Client Controller: `NotificationController.confirm_block_and_report()`                                  | HTTPS Response            | Block and report confirmation status               |

---

## Blocking Users - Exception Flow

| Use Case Step                                  | Component Function                                      | Connector                 | Data Communicated                             |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------- | --------------------------------------------- |
| User opens another user’s profile              | Profile Service: `ProfileService.get_profile(userId)`   | REST API                  | Target user ID and profile information        |
| User selects “Block User”                      | Block Interface: `BlockController.block_user(targetId)` | REST API                  | Requesting user ID and target user ID         |
| System encounters network error while blocking | Block Service: `BlockManager.apply_block(targetId)`     | Database Connection (SQL) | Error code and failed block request details   |
| System displays error notification             | Client Controller: `ErrorController.display_error()`    | HTTPS Response            | Error message and failure status              |
| User retries block action                      | Block Interface: `BlockController.block_user(targetId)` | REST API                  | Retried requesting user ID and target user ID |



## Adding Friends - Basic Flow

| Use Case Step                             | Component Function                                       | Connector                 | Data Communicated                          |
| ----------------------------------------- | -------------------------------------------------------- | ------------------------- | ------------------------------------------ |
| User views another user’s profile         | Profile Interface: `ProfileController.view_profile()`    | REST API                  | User ID and profile information            |
| User sends a friend request               | Friends Service: `FriendManager.send_request()`          | HTTPS POST                | Sender ID, receiver ID, and request status |
| System stores friend request              | Database Service: `FriendDatabase.store_request()`       | Database Connection (SQL) | Friend request details and timestamp       |
| Other user receives notification          | Notification Service: `NotificationManager.send_alert()` | Push Notification         | Friend request notification and sender ID  |
| Other user accepts friend request         | Friends Interface: `FriendController.accept_request()`   | REST API                  | Request ID and accepted status             |
| System updates friendship relationship    | Friends Service: `FriendManager.add_friend()`            | Database Connection (SQL) | Both user IDs and friendship status        |
| Users gain access to friend-only features | Chat Service: `ChatAccess.enable_private_chat()`         | WebSocket Connection      | Friend IDs and messaging permissions       |

---

## Adding Friends - Alternative Flow

| Use Case Step                             | Component Function                                            | Connector                 | Data Communicated                    |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------------- | ------------------------------------ |
| User receives friend request notification | Notification Service: `NotificationManager.receive_request()` | Push Notification         | Sender ID and request ID             |
| User opens friend request                 | Friends Interface: `FriendController.open_request()`          | REST API                  | Request ID                           |
| User accepts friend request               | Friends Service: `FriendManager.accept_request()`             | HTTPS POST                | Request ID and accepted status       |
| System updates friendship status          | Database Service: `FriendDatabase.update_friendship()`        | Database Connection (SQL) | User IDs and friendship confirmation |
| Users access friend-only messaging        | Chat Service: `ChatAccess.enable_private_chat()`              | WebSocket Connection      | Friend IDs and messaging permissions |

---

## Adding Friends - Exception Flow

| Use Case Step                         | Component Function                                            | Connector                 | Data Communicated                   |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------- | ----------------------------------- |
| User receives friend request          | Notification Service: `NotificationManager.receive_request()` | Push Notification         | Sender ID and request ID            |
| User denies friend request            | Friends Interface: `FriendController.deny_request()`          | REST API                  | Request ID and denied status        |
| System removes pending request        | Database Service: `FriendDatabase.remove_request()`           | Database Connection (SQL) | Request ID and denial status        |
| System restricts friend-only features | Chat Service: `ChatAccess.block_private_features()`           | Internal System Call      | User IDs and restricted permissions |
