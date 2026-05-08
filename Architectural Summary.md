# Architectural Summary

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
