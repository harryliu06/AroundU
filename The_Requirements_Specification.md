# Title: GEOLOCATOR
## Team Member: 
- Harry Lwin (hlwin1)
- Jacob Ryan Almaria (jalmaria)
- Dorian Steve Ramirez (doriansr)
- Swaraag Sistla (swaraags)

## Executive Summary:
The main goal is to gather like-minded people in one place based on their interests and hobbies. This application intends to promote socialization in real life in this technology age, where in-person contacts are becoming rare. A key feature of this application is locating people within a radius of a user based on the selected hobbies or interests. Users can filter by interests and hobbies, and a chatting feature to chat with users nearby is integrated to talk with new people or schedule meetups. To make the meetups more convenient, we have implemented an interactive map that can provide directions to the arranged location spot that could be determined through the chat feature. There are certain risks of stalking or private information leakage; therefore, the ability to block people and limit location sharing is the priority feature of the application to negate these risks. 

## Application Context
The application is designed for individuals who are trying to build meaningful connections with new people that share similar interests and hobbies. In this technological age, it’s becoming more difficult to connect with new people and face-to-face interactions are becoming rarer than ever. This app targets students and young working professionals, especially those who are in new areas, to expand their social network by providing a platform that allows online discovery of new friends to interact in offline places. 

This application is available on both IOS and android systems so it’s free to download from the Google Store and Apple Store. Since this application primarily runs on a smartphone's location access to connect with other people nearby, it’s necessary to turn on location access and the internet is mandatory to chat with other people in the app. 

## Environmental Contraints
- A mobile app that will function on Android and IOS devices.

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

- **Location Access toggle**
  - A user can toggle between enabling and disabling location access to their location on the app under settings.
  - Can enable/disable location sharing for a set amount of time.
  - A user can change the Active/Inactive status along with location access.
    - Pros: 
      - Can be a moment of privacy and security, preventing a person from being seen or viewed 24/7 for their location.
      - Allow more flexible location sharing and chatting with active users.
    - Cons: 
      - Disabled permission means the app's features are diminished.

- **User profile customization (Biography)**
  - A user can customize their profile and bio any way they like (as in, anything they wish to write.)
  - Can implement hashtags and open-ended/user-defined interests in the bio.
    - Pros: 
      - Extra customization to stand out and introduce themselves.
      - A way to find more common interests with other people.
    - Cons: 
      - Users can possibly be very inappropriate in their customization.
      - Empty bio can make it hard for other users to know each other.


- **Open-ended filtering**
  - Users can filter for people given interests and hobbies of their liking, it’s very open-ended and anyone can add anything they want, like hashtag in other social media platforms.
  - Suggest popular hobbies or interests other users have.
    - Pros: 
      - No limits to finding people and filtering.
      - Allows for the introduction of "niche" interests to other users.
    - Cons: 
      - People can still also behave terribly and write inappropriate stuff. (Some form of filtering and/or censoring could be necessary)

- **Adding friends and community**
  - Users can make friends with other users in a community of interest. They can become friends for extra conversations aside from the meetups. (Friend requests must be sent and mutually agreed on to become friends)
  - Displaying users their "Community" (friend count).
  - Friend-exclusive chatting.
  - Create group chat with friends (can't join if not friends).
    - Pros: 
      - More ways to keep in touch with a friend or community of people with the same interests, maybe even able to get together and plan events.
    - Cons: 
      - There’s the usual chance of running into toxic, bad, or inappropriate friends.

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

<img width="3290" height="1379" alt="Use Case Diagram Team Whiteboard in Blue Green Yellow Simple Colorful Style (1)" src="https://github.com/user-attachments/assets/e6d2434c-c0c1-4f70-a548-266531a16085" />
