# Prototype Documentation: 

We set up our prototype in the Expo React Native framework for our mobile application. Setting up, we encounter the difficulty of setting up mobile app preview for what’s coded. The latest Expo framework version 55.0.6 is incompatible with the mobile application “Expo Go” to preview the updated version of the project. After reading the github repository about this issue, we decided to roll back the version to 54.0.0 so that “Expo Go”  is available for preview of our “AroundU” application. 

In the process of creating “login” functionality, we set up the dummy database inside the “server.js” to stimulate the login process of authenticated users. As of now, we use ‘bcrypt’ to encrypt the password for safety. JWT (Json Web Token) is also used to securely identify the users after they log in so that they don’t have to go through the login credential process every time again.
