# Payment-Gateway-Project

This is an individual project that simulates a payment gateway to demonstrate expertise in related concepts.

The project uses node.js packages and uses express, pg and dotenv.
All dependencies are in the pacakge.json file with their versions.
Environment variables are used to promote security and removing any sensitive hardcoded data.
Server.js is the application start point.
PostgreSQL is installed and the database has been created. SSL has been set up to encrypt the tranmission of data between client and server. Client certificate authentication has also been added for a signficant security improvement.

In Node.js, which is single-threaded, asynchronous operations make sure that the entire server isn't blocked. This makes sure that while one user is waiting for their password to be hashed during registration or logging in (which uses promises), other users can still continue making requests which allows the application to be scalable. This is possbile because Node.js is event-driven and uses a mechanism called the event loop which enables it to handle multiple connections concurrently.

Encryption and decryption are CPU-bound operations which don't benefit much asynchronicity because they typically complete quickly. The bcrypt hashing function, though CPU-bound, is designed to be slow so it can block the event loop if not handled properly and therefore, benefits from asynchronicity.
