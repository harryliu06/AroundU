# Title: GEOLOCATOR (AroundU)
## Team Member: 
- Harry Lwin (hlwin1)
- Jacob Ryan Almaria (jalmaria)
- Dorian Steve Ramirez (doriansr)
- Swaraag Sistla (swaraags)
- Tatiana Anahi Gutierrez (tagutie2)

## Executive Summary:
The main goal is to gather like-minded people in one place based on their interests and hobbies. This application intends to promote socialization in real life in this technology age, where in-person contacts are becoming rare. A key feature of this application is locating people within a radius of a user based on the selected hobbies or interests. Users can filter by interests and hobbies, and a chatting feature to chat with users nearby is integrated to talk with new people or schedule meetups. To make the meetups more convenient, we have implemented an interactive map that can provide directions to the arranged location spot that could be determined through the chat feature. There are certain risks of stalking or private information leakage; therefore, the ability to block people and limit location sharing is the priority feature of the application to negate these risks. 

## Application Context
The application is designed for individuals who are trying to build meaningful connections with new people that share similar interests and hobbies. In this technological age, it’s becoming more difficult to connect with new people and face-to-face interactions are becoming rarer than ever. This app targets students and young working professionals, especially those who are in new areas, to expand their social network by providing a platform that allows online discovery of new friends to interact in offline places. 

This application is available on both IOS and android systems so it’s free to download from the Google Store and Apple Store. Since this application primarily runs on a smartphone's location access to connect with other people nearby, it’s necessary to turn on location access and the internet is mandatory to chat with other people in the app. 

## Environmental Constraints
- The system will operate as a mobile application on both Android (14+) and iOS (17+) devices.
- Devices must include functional GPS hardware to support real‑time location tracking.
- The application requires an active internet connection (Wi‑Fi or mobile data) for map rendering, user discovery, and messaging.
- The system depends on external mapping and geolocation APIs, and must comply with their rate limits, availability, and usage policies (Might be a Google Maps API).
- The app must gain permission on Android and iOS for accessing location, notifications, and camera features.
- The system must function in varying physical environments, including areas with weak GPS signals or inconsistent network coverage.

## Functional Requirements
- **Chat function within the radius of the circle**
  - Needs Radius Agreement to chat each other
  - Radius: 0 - 25 miles, 
  - Message Request for the first time interaction, 
    - For out of range, have to follow each other/ become friends to continue conversation (Friend Request should still be valid after out of range)
  - "Meet-up" request available in chat box (Leads to Meet-up Direction feature)

    - Pros:
      - Can interact with other people in the application for future meetups
      - Getting to know other people before seeing them in person.
      - Plan the schedule or meet-up place with other people for gatherings.  
    - Cons:
      - Spam requests or unwanted requests from other users
      - Texting abuse or Inappropriate content from strangers

--------------
Use Cases:
- Basic Flow -
  1. User establishes their radius as 10 miles.
  2. User receives a message request from another user.
  3. User accepts message request.
  4. User and other user chat.
- Alternative Flow -
  1. User establishes their radius as 5 miles.
  2. User notices another user within their radius, and sends them a message request.
  3. Other user accepts message request.
  4. User and other user chat.
- Exception Flow -
  1. User establishes their radius as 20 miles.
  2. User notices another user within their radius, and sends them a message request.
  3. Other user denies message request.
  4. User and other user do not chat.

------------------------------------
  
- **Blocking users**
  - Users can block other users to prevent messaging, location tracking, and profile viewing.
  - Users can unblock if they change their mind later on.
  - Users can report the inappropriate behaviors when blocking so that the support team can look into the issue.
    - Pros: 
      - Can protect the security and privacy of certain users who wish to avoid certain people.
      - Upholding the safety of the overall community through reports.
    - Cons: 
      - Nothing prevents a user from creating another account.
      - Reports can be abused and spammed, wasting the time of the support team.

----------------------
Use Cases:
- Basic Flow - 
  1. User navigates to the offending user’s profile
  2. User selects, “Block user”
  3. System removes the blocked user’s ability to message, track location, or view user’s profile
  4. System confirms the block to the user
- Alternative Flow - 
  1. User navigates to the offending user’s profile
  2. User selects “Block User” and opts in to include a report
  3. System prompts the user to select a category of violation
  4. User selects a category, provides some detail, and then submits
  5. System applies the block and forwards the report to the support team
  6. System confirms both actions to the user
- Exception Flow - 
  1. User navigates to the offending user’s profile
  2. User selects “Block User”
  3. A network error occurs and the system fails to process the request
  4. System displays an error message and the block isn’t applied
  5. User retries the action

----------------------

- **Location Access toggle**
  - A user can toggle between enabling and disabling location access to their location on the app under settings.
  - Can enable/disable location sharing for a set amount of time.
  - A user can change the Active/Inactive status along with location access.
    - Pros: 
      - Can be a moment of privacy and security, preventing a person from being seen or viewed 24/7 for their location.
      - Allow more flexible location sharing and chatting with active users.
    - Cons: 
      - Disabled permission means the app's features are diminished.

------------------
Use Cases:
- Basic Flow - 
  1. User wants to disable their permission for sharing their location.
  2. User heads to the settings tab marked by either 3 lines or 3 dots.
  3. The Permissions tab is opened within settings.
  4. The user scrolls over to the location sharing toggle and disables sharing.
  5. The app no longer shares the user’s location on the map screen or profile, hiding their location from sight.
- Alternative Flow - 
  - 4a.
    1. User wishes to disable the location for only a specific amount of time.
    2. User clicks the option to “disable for” a certain amount of time from an hour to a day.
    3. User either selects “disable for an hour” or “disable until I turn it back on”
    4. Back to Basic Flow step 5.
  - 4b.
    1. User wishes to display their status of inactivity.
    2. User toggles “display active status” under the same tab and setting with a single click.
    3. If toggled on, their profile now holds their status of location sharing activity.
    4. Back to Basic Flow step 5.
- Exception Flow - 
  1. Location access was not a permission given to the application in the first place under their phone’s app settings.
  2. Any option regarding location sharing in their app will be disabled.

-------------------

- **User profile customization (Biography)**
  - A user can customize their profile and bio any way they like (as in, anything they wish to write.)
  - Can implement hashtags and open-ended/user-defined interests in the bio.
    - Pros: 
      - Extra customization to stand out and introduce themselves.
      - A way to find more common interests with other people.
    - Cons: 
      - Users can possibly be very inappropriate in their customization.
      - Empty bio can make it hard for other users to know each other.

--------------
Use Cases:
- Basic Flow -
  1. User opens up their profile page.
  2. User selects the “Edit Profile” option.
  3. User edits their biography with a clear, understandable message.
- Alternative Flow -
  1. User opens up their profile page.
  2. User selects the “Edit Profile” option.
  3. User edits their biography with a clear, understandable message.
  4. User adds hashtags with their interests.
- Exception Flow - 
  1. User decides not to include a biography; the feature is not used at all.

--------------

- **Open-ended filtering**
  - Users can filter for people given interests and hobbies of their liking, it’s very open-ended and anyone can add anything they want, like hashtag in other social media platforms.
  - Suggest popular hobbies or interests other users have.
    - Pros: 
      - No limits to finding people and filtering.
      - Allows for the introduction of "niche" interests to other users.
    - Cons: 
      - People can still also behave terribly and write inappropriate stuff. (Some form of filtering and/or censoring could be necessary)

----------------
Use Cases:
- Basic Flow - 
  1. User wishes to filter and display people nearby holding the interests they search.
  2. User types into a box on the map selection screen “#[interest]”
  3. The app and map search for other app users with tags under the same search.
  4. The app finds other users holding the same tags, and displays them on the map.
  5. The user can click on each pinpoint of the user and view their profile.
- Alternative Flow - 
  - 3a.
    1. The app cannot find other users holding the same tags.
    2. The map continues to display, but no other users show up on the map.
- Exception Flow - 
  - 2a.
    1. The user types in something explicit or inappropriate.
    2. The app’s automatic filtering and censoring system corrects the text into *.
  - 4a.
    1. The map’s ability to display the geological location raises an issue (the api used from another service goes down or is offline).
    2. The app does not even display a map, and places an error message on screen on the “map” tab where the map is usually displayed.
----------------

- **Adding friends and community**
  - Users can make friends with other users in a community of interest. They can become friends for extra conversations aside from the meetups. (Friend requests must be sent and mutually agreed on to become friends)
  - Displaying users their "Community" (friend count).
  - Friend-exclusive chatting.
  - Create group chat with friends (can't join if not friends).
    - Pros: 
      - More ways to keep in touch with a friend or community of people with the same interests, maybe even able to get together and plan events.
    - Cons: 
      - There’s the usual chance of running into toxic, bad, or inappropriate friends.

---------------
Use Cases:
- Basic Flow - 
  1. A user wishes to become friends with another user.
  2. The user clicks the other user’s profile and views it.
  3. A button is found that they can click to send a friend request.
  4. The other user received the friend request and agrees.
  5. Both users are now considered friends and are able to access other features together, such as messaging.
- Alternative Flow - 
  1. The user instead receives a friend request from another user.
  2. The user can agree to the friend request.
  3. No other action from the user to received and accepted the request.
  4. Back to basic flow 5.
- Exception Flow - 
  1. A user denies the request to become friends.
  2. The other user will not be able to become friends with them, nothing else happens.
  3. Neither user are able to engage in such features together such as messaging.

---------------

- **Meet-up directions.**
  - Users can send their directions/map location to those they agree to meet up with.
  - It can consist of written instructions, typical google maps style path, and/or pictures for referencing locations/landmarks.
  - Suggest best transportation type to go to the meetups.
    - Pros: 
      - Makes meeting up easier.
      - Keeps people aware of where they are heading and what type of location they are going.
      - Helps decide which type of transportation to use to go to meetups.
    - Cons: 
      - Accidentally reveal sensitive data from your location.
      - People can conceal their true selves online. Making meet-ups a potential risk for users.
      - Meet-up directions can be confusing for some users.
     
---------
Use Cases:
- Basic Flow - 
  1. User A and User B agree to meet after chatting.
  2. User A selects “Share Directions”.
  3. User A chooses a location to meet:
      1. Current Location
      2. Selected Location (e.g., public park, cafe)
  4. The system generates optimal map routes, directions and estimated time of arrival to the destination. 
  5. User A sends the meet-up location to User B. 
  6. When User B receives a location in chatbox, they can either use a built-in direction tool or an external application (Google Map, Apple Map, Waze) for direction to the location. 
- Alternative Flow - 
  1. User A shares location with User B. 
  2. User B chooses the preferred transportation method. 
  3. The system updates arrival time and route information accordingly. 
  4. User B may request User A to change the location and suggest another   5. location for the meet-up spot if they want. 
- Exception Flow - 
  1. The directions and map routes to the location may not load up if there is no internet connection. 
  2. If location access is disabled, then optimal map routes to the meet-up location will not show up. 

---------

<img width="3290" height="1379" alt="Use Case Diagram Team Whiteboard in Blue Green Yellow Simple Colorful Style (1)" src="https://github.com/user-attachments/assets/e6d2434c-c0c1-4f70-a548-266531a16085" />
