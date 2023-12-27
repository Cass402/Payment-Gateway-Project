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

The hash_sensitive_info file has been modified to introduce a new function called compareInfo where bcrypt is used to check whether the entered password by a user logging in is the same as the stored hashed password in the database. The bcrypt compare() function extracts the salt from the hashed password and hashes the entered password with the same salt and checks if both match. The username and email are not going to be stored encrypted as it is usally not necessary and is necessary for other uses in the application and to ensure secure usage of it, any kind of data will be transferred via HTTPS only.

The SSL connection for the database is not able to connect and has some issues but without the SSL, the database connects fine and queries work as expected. Jest and Supertest (used for sending HTTPS requests to the server) are used to test the functionality of the code logic. The db_connection.test.js is created to test this functionality and the test PASSED. The login_logout.test.js was created to the test the functionality of the /login_logout route and it tests all the functionalities of it. Both the tests have currently PASSED. Minor changes have been made across all routes (exporting the router object) in order to accomodate the testing of functionalities.

A new file called start.js is created and the server.js app is imported in it and the file is used to officially start the HTTPS server and start the application. The server.js is exported as 'app' to allow for using it while testing. The cookie-parser has been installed and been imported as a middleware in the server.js file.

![Visualization of the codebase](./diagram.svg)
