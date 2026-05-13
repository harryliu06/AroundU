# Component Functions + Connectors Examples

## Radius Chat Function - Basic Flow (Jacob)

| Use Case Step                   | Component Function                                            | Connector                 | Data Communicated                               |
| ------------------------------- | ------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| User sets radius (10 miles)     | Client Controller: `SettingsController.update_radius(10)`     | HTTPS PUT                 | User radius preference and user ID              |
| System saves radius setting     | Profile Service: `ProfileManager.save_preferences()`          | Database Connection (SQL) | User radius preference and user ID              |
| User receives message request   | Chat/Friends Service: `RequestManager.trigger_notification()` | Push Notification         | Message request, sender user ID, and request ID |
| User accepts request            | Chat Interface: `ChatController.respond_to_request(True)`     | REST API                  | Request ID and request status                   |
| System initializes chat session | Chat/Friends Service: `SessionManager.create_web_socket()`    | WebSocket Connection      | Connection URL                                  |
| Users exchange messages         | Chat Interface: `ChatUI.send_message("Hello!")`               | WebSocket Frame           | Recipient ID, message content, and timestamp    |

---

## Radius Chat Function - Alternative Flow (Jacob)

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

## Radius Chat Function - Exception Flow (Jacob)

| Use Case Step                   | Component Function                                               | Connector                 | Data Communicated                                          |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| User sets radius (20 miles)     | Client Controller: `SettingsController.update_radius(20)`        | HTTPS PUT                 | User radius preference and user ID                         |
| System saves radius setting     | Profile Service: `ProfileManager.save_preferences()`             | Database Connection (SQL) | User radius preference and user ID                         |
| User browses nearby users       | Matching/Discovery Service: `Discovery.find_nearby_users()`      | REST API                  | Nearby user IDs and distances                              |
| User sends message request      | Chat Interface: `ChatController.send_request()`                  | REST API                  | Request message, sender ID, target user ID, and request ID |
| Other user denies request       | Chat Interface: `RequestManager.update_request_status("denied")` | Database Connection (SQL) | Request ID and denied status                               |
| System blocks repeated requests | Blocking Service: `RestrictionManager.prevent_repeat()`          | Database Connection (SQL) | Block actor ID, block target ID, and block reason          |



## Location Access Toggle - Basic Flow (Dorian)

| Use Case Step                  | Component Function                                                                                                      | Connector                                    | Data Communicated                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| User clicks the settings icon  | Navigation Controller: `NavigationController.openSettings()`                                                            | User Input Event                             | Click/tap event                                                        |
| User opens the permissions tab | Client Controller: `SettingsController.openPermissionsTab()`                                                            | Internal Client Navigation / UI State Update | Selected tab value: Permissions                                        |
| User disables location sharing | Client Controller: `SettingsController.location_permission(False)`                                                      | Internal Client State Update                 | `locationSharingEnabled = False`                                       |
| User applies updated settings  | Client Controller + Location Service: `SettingsController.applySettings()` / `LocationService.updateLocationSettings()` | REST API / Database Connection (SQL)         | User ID, location sharing status, timestamp, optional disable duration |

---

## Location Access Toggle - Alternative Flow (Dorian)

| Use Case Step                     | Component Function                                                                                                      | Connector                               | Data Communicated                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| User clicks “Disable For”         | Client Controller: `SettingsController.openDisableDurationMenu()`                                                       | Internal Client UI Event / State Update | Selected temporary disable option                                |
| User selects “Disable for 1 hour” | Client Controller: `SettingsController.setLocationSharingDuration(1_hour)`                                              | Internal Client State Update            | `locationSharingEnabled = False`, duration, expiration timestamp |
| User applies updated settings     | Client Controller + Location Service: `SettingsController.applySettings()` / `LocationService.updateLocationSettings()` | REST API / Database Connection (SQL)    | User ID, temporary disable duration, expiration time             |

---

## Location Access Toggle - Exception Flow (Dorian)

| Use Case Step                         | Component Function                                                      | Connector                                              | Data Communicated                                      |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| App checks device location permission | Client Controller: `SettingsController.checkDeviceLocationPermission()` | Device Permission API / Mobile OS Permission Connector | System permission status: granted, denied, or disabled |
| System detects permission denied      | Permission Service: `PermissionManager.handlePermissionDenied()`        | Internal Client Logic                                  | Permission denial state                                |
| App displays permission error message | Client View: `PermissionView.showPermissionError()`                     | Internal Client UI State Update                        | Error message and permission instructions              |



## Open-ended Filtering - Basic Flow (Dorian Ramirez)

| Use Case Step                          | Component Function                                                                                                   | Connector                                       | Data Communicated                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| User types “#Biking” into search bar   | Client Controller: `SearchController.updateInterestFilter("#Biking")`                                                | User Input Event / Internal Client State Update | Search text and normalized interest                               |
| System searches nearby users           | Search Controller + Discovery Service: `SearchController.searchNearbyUsers()` / `DiscoveryService.findNearbyUsers()` | REST API                                        | User ID, selected interest, radius, location                      |
| System returns matching nearby users   | Discovery Service: `DiscoveryService.returnMatchingUsers()`                                                          | REST API                                        | Matching user IDs, shared interests, estimated location, distance |
| User selects a map pin to open profile | Map Controller: `MapController.openUserProfile(userId)`                                                              | REST API                                        | Selected user ID and returned profile information                 |

---

## Open-ended Filtering - Alternative Flow (Dorian Ramirez)

| Use Case Step                               | Component Function                                                                                                | Connector                       | Data Communicated                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------- |
| System cannot find users with matching tags | Discovery Service + Map Controller: `DiscoveryService.findNearbyUsers()` / `MapController.showNoResultsMessage()` | REST API                        | Empty results list               |
| App displays “No Results Found” message     | Map View: `MapView.renderEmptyResults()`                                                                          | Internal Client UI State Update | No nearby matching users message |

---

## Open-ended Filtering - Exception Flow (Dorian Ramirez)

| Use Case Step                              | Component Function                                                                                             | Connector                              | Data Communicated                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| User enters explicit or inappropriate text | Client Controller: `SearchController.validateSearchText(input)`                                                | User Input Event / Internal Validation | Raw search text                                     |
| System filters inappropriate content       | Moderation Service: `ContentFilterService.sanitizeSearchText(input)`                                           | HTTPS Request                          | Filtered text, blocked term flag, validation result |
| Map service encounters scanning error      | Map Controller + Discovery Service: `MapController.loadSearchResults()` / `DiscoveryService.findNearbyUsers()` | REST API                               | Error code                                          |
| App hides map and displays error           | Map View: `MapView.showMapErrorMessage()`                                                                      | Internal Client UI State Update        | Error message text                                  |



## Meet-up Directions - Basic Flow (Harry)

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

## Meet-up Directions - Alternative Flow (Harry)

| Use Case Step                            | Component Function                                     | Connector            | Data Communicated                                    |
| ---------------------------------------- | ------------------------------------------------------ | -------------------- | ---------------------------------------------------- |
| User A shares location with User B       | Chat Service: `ChatController.sendLocation()`          | WebSocket Connection | Shared location coordinates, User A ID and User B ID |
| User B selects transportation method     | Map Controller: `MapController.selectTransportation()` | HTTPS POST           | Transportation type                                  |
| System updates ETA and route information | Map Service: `DirectionService.updateRoute()`          | External Map API     | Updated route information, distance and ETA          |
| User B suggests another meet-up location | Chat Service: `ChatController.requestLocationChange()` | WebSocket Connection | Suggested location and request message               |

---

## Meet-up Directions - Exception Flow (Harry)

| Use Case Step                                     | Component Function                                                      | Connector                                              | Data Communicated                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| Directions fail to load because of network issues | Network Service: `ConnectionManager.checkConnection()`                  | Network Status API                                     | Internet connection status                             |
| Location access disabled by user                  | Client Controller: `SettingsController.checkDeviceLocationPermission()` | Device Permission API / Mobile OS Permission Connector | System permission status: granted, denied, or disabled |



## User Profile Customization/Biography - Basic Flow (Jacob)

| Use Case Step              | Component Function                                    | Connector                 | Data Communicated                    |
| -------------------------- | ----------------------------------------------------- | ------------------------- | ------------------------------------ |
| User opens profile page    | Client Controller: `ProfileController.load_profile()` | HTTPS GET                 | User ID and existing bio information |
| User selects “Edit”        | Frontend UI: `EditProfileView.toggle_edit_mode(True)` | Internal Client Logic     | Edit mode state change               |
| User updates and saves bio | Profile Service: `ProfileManager.update_bio(message)` | REST API                  | Updated bio message                  |
| System stores updated bio  | Database Service: `SQLite.execute_query()`            | Database Connection (SQL) | User ID and updated bio content      |

---

## User Profile Customization/Biography - Alternative Flow (Jacob)

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

## User Profile Customization/Biography - Exception Flow (Jacob)

| Use Case Step                        | Component Function                                              | Connector                 | Data Communicated                    |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------- | ------------------------------------ |
| User opens profile page              | Client Controller: `ProfileController.load_profile()`           | HTTPS GET                 | User ID and existing bio information |
| User selects “Edit”                  | Frontend UI: `EditProfileView.toggle_edit_mode(True)`           | Internal Client Logic     | Edit mode state change               |
| User clears bio text                 | Frontend UI: `BioTextArea.clear()`                              | Internal Client Logic     | Empty bio string                     |
| System validates optional bio field  | Validation Service: `ValidationService.check_optional_fields()` | Internal Server Logic     | Validation result for empty bio      |
| System updates empty bio in database | Profile Service: `ProfileManager.set_bio_null()`                | Database Connection (SQL) | User ID and null bio value           |
| System renders empty profile bio     | Frontend UI: `ProfileView.render(data)`                         | HTTPS GET                 | Updated profile with empty bio       |



## Blocking Users - Basic Flow (Swaraag)

| Use Case Step                     | Component Function                                          | Connector                 | Data Communicated                                       |
| --------------------------------- | ----------------------------------------------------------- | ------------------------- | ------------------------------------------------------- |
| User opens another user’s profile | Profile Service: `ProfileService.get_profile(userId)`       | REST API                  | Target user ID and profile information                  |
| User selects “Block User”         | Block Interface: `BlockController.block_user(targetId)`     | REST API                  | Requesting user ID and target user ID                   |
| System applies block restrictions | Block Service: `BlockManager.apply_block(targetId)`         | Database Connection (SQL) | Block actor ID, blocked user ID, restricted permissions |
| System confirms successful block  | Client Controller: `NotificationController.confirm_block()` | HTTPS Response            | Block confirmation status                               |

---

## Blocking Users - Alternative Flow (Swaraag)

| Use Case Step                               | Component Function                                                                                      | Connector                 | Data Communicated                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------- |
| User opens another user’s profile           | Profile Service: `ProfileService.get_profile(userId)`                                                   | REST API                  | Target user ID and profile information             |
| User selects “Block and Report”             | Block Interface: `BlockController.block_with_report(targetId)`                                          | REST API                  | Requesting user ID, target user ID, report flag    |
| System prompts report category selection    | Client Controller: `ReportUI.prompt_category()`                                                         | HTTPS Response            | Available violation categories                     |
| User submits report details                 | Report Interface: `ReportController.submit_report(category, detail)`                                    | REST API                  | Violation category, detail message, target user ID |
| System applies block and forwards report    | Block Service + Report Service: `BlockManager.apply_block(targetId)` / `ReportManager.forward_report()` | Database Connection (SQL) | Block record and report information                |
| System confirms successful block and report | Client Controller: `NotificationController.confirm_block_and_report()`                                  | HTTPS Response            | Block and report confirmation status               |

---

## Blocking Users - Exception Flow (Swaraag)

| Use Case Step                                  | Component Function                                      | Connector                 | Data Communicated                             |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------- | --------------------------------------------- |
| User opens another user’s profile              | Profile Service: `ProfileService.get_profile(userId)`   | REST API                  | Target user ID and profile information        |
| User selects “Block User”                      | Block Interface: `BlockController.block_user(targetId)` | REST API                  | Requesting user ID and target user ID         |
| System encounters network error while blocking | Block Service: `BlockManager.apply_block(targetId)`     | Database Connection (SQL) | Error code and failed block request details   |
| System displays error notification             | Client Controller: `ErrorController.display_error()`    | HTTPS Response            | Error message and failure status              |
| User retries block action                      | Block Interface: `BlockController.block_user(targetId)` | REST API                  | Retried requesting user ID and target user ID |



## Adding Friends - Basic Flow (Tatiana)

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

## Adding Friends - Alternative Flow (Tatiana)

| Use Case Step                             | Component Function                                            | Connector                 | Data Communicated                    |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------------- | ------------------------------------ |
| User receives friend request notification | Notification Service: `NotificationManager.receive_request()` | Push Notification         | Sender ID and request ID             |
| User opens friend request                 | Friends Interface: `FriendController.open_request()`          | REST API                  | Request ID                           |
| User accepts friend request               | Friends Service: `FriendManager.accept_request()`             | HTTPS POST                | Request ID and accepted status       |
| System updates friendship status          | Database Service: `FriendDatabase.update_friendship()`        | Database Connection (SQL) | User IDs and friendship confirmation |
| Users access friend-only messaging        | Chat Service: `ChatAccess.enable_private_chat()`              | WebSocket Connection      | Friend IDs and messaging permissions |

---

## Adding Friends - Exception Flow (Tatiana)

| Use Case Step                         | Component Function                                            | Connector                 | Data Communicated                   |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------- | ----------------------------------- |
| User receives friend request          | Notification Service: `NotificationManager.receive_request()` | Push Notification         | Sender ID and request ID            |
| User denies friend request            | Friends Interface: `FriendController.deny_request()`          | REST API                  | Request ID and denied status        |
| System removes pending request        | Database Service: `FriendDatabase.remove_request()`           | Database Connection (SQL) | Request ID and denial status        |
| System restricts friend-only features | Chat Service: `ChatAccess.block_private_features()`           | Internal System Call      | User IDs and restricted permissions |