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
