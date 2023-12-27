# Payment Gateway Project

## Overview

This project simulates a payment gateway to demonstrate expertise in related concepts. It uses Node.js, Express, pg (PostgreSQL client), and dotenv for environment variable management. The application's entry point is `server.js`.

## Installation

All dependencies are listed in the `package.json` file. To install them, use the following command:

```bash
npm install
```

## Database

The application uses PostgreSQL for data storage. Make sure PostgreSQL is installed and a database is created for the application.

## Security

SSL is set up to encrypt the transmission of data between the client and server. Client certificate authentication is also implemented for improved security.

Sensitive data is removed from the codebase and stored in environment variables for security.

## Asynchronicity in Node.js

Node.js is single-threaded and uses asynchronous operations to prevent blocking the entire server. This allows the application to be scalable, as multiple connections can be handled concurrently.

## Authentication

The application uses JSON Web Tokens (JWT) for stateless authentication. When a user logs in, the server verifies the credentials, generates a JWT, and sends it back to the client. The client stores the token and includes it in the Authorization header of every subsequent request.

The authentication middleware handles the authentication of logged in users and can handle revoked tokens by checking the database.

## Refresh Tokens

The JWT generator includes a function for generating refresh tokens. When the client logs in, they are sent two cookies - one for an authentication token and another for a refresh token. The refresh token is hashed and stored in the database for additional security.

## Password Hashing

The `hash_sensitive_info` file includes a function called `compareInfo` that uses bcrypt to check whether the entered password matches the stored hashed password in the database.

## Testing

Jest and Supertest are used for testing the application. The `db_connection.test.js` and `login_logout.test.js` files contain tests for the database connection and the `/login_logout` route, respectively.

## Known Issues

The SSL connection for the database is currently not working, but the database connects fine and queries work as expected without SSL.

## Starting the Application

The `start.js` file is used to start the HTTPS server and the application. The `server.js` is exported as 'app' to allow for using it while testing.

## Middleware

The `cookie-parser` middleware is installed and imported in `server.js`.

## Codebase Visualization

![Visualization of the codebase](./diagram.svg)
