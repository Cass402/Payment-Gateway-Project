# Payment-Gateway-Project

This is an individual project that simulates a payment gateway to demonstrate expertise in related concepts.

The project uses node.js packages and uses express, pg and dotenv.
All dependencies are in the pacakge.json file with their versions.
Environment variables are used to promote security and removing any sensitive hardcoded data.
Server.js is the application start point.
PostgreSQL is installed and the database has been created. SSL has been set up to encrypt the tranmission of data between client and server. Client certificate authentication has also been added for a signficant security improvement.

In Node.js, which is single-threaded, asynchronous operations make sure that the entire server isn't blocked. This makes sure that while one user is waiting for their password to be hashed during registration or logging in (which uses promises), other users can still continue making requests which allows the application to be scalable. This is possbile because Node.js is event-driven and uses a mechanism called the event loop which enables it to handle multiple connections concurrently.

Encryption and decryption are CPU-bound operations which don't benefit much asynchronicity because they typically complete quickly. The bcrypt hashing function, though CPU-bound, is designed to be slow so it can block the event loop if not handled properly and therefore, benefits from asynchronicity.

To make it easier to authenticate and authorize, a token (specifically, a JSON Web Token(JWT)) is going to be used. When a user logs in, the server verifies the credentials and generates a JWT and sends it back to the client. The client will store it (usually in cookies) and includes it in the Authorization header of every subsequent request which the server verifies and uses. This approach is called stateless authentication and is well-suited for scalable applications. The benefit of this approach is that a session doesn't need to be created and maintained for each user.

The authentication middleware is currently set-up to handle the authentication of logged in users. The middleware can now handle revoked tokens by checking the database whether the token is revoked and then verifying. If the token is invalid due to the token being expired, the client will then send a request to the /login_logout/refresh_auth to check the refresh token.

The JWT generator has been modified to add a new function for generating refresh tokens and when the client logs in, they are sent two cookies - one for an authentication token and another for a refresh token - via HTTPS which they will use for authenticating themselves. The refresh token is also hashed and stored in the database for additonal security for checking the validity of the refresh token while refreshing the client's authentication.

![Visualization of the codebase](./diagram.svg)
