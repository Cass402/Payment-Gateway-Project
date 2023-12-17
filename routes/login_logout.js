/** This javascript file is used as an endpoint to authenticate users into the payment gateway
 * system. It will handle all the requests sent to the /login route. This endpoint is also added
 * to the server.js file. */

// Import express and create the router object
const express = require("express");
const router = express.Router(); // the router object is used to handle the requests
const pool = require("../db_connection"); // Importing the pool object to connect to the database
const hashInfo = require("../hash_sensitive_info"); // Importing the hashInfo function to hash the password
const { encrypt, decrypt } = require("../encrypt_decrypt_payment_methods"); // Importing the encrypt and decrypt functions to encrypt and decrypt the username
const {
  jwtTokenGenerator,
  jwtRefreshTokenGenerator,
} = require("../jwt_generator"); // Importing the jwtTokenGenerator and jwtRefreshTokenGenerator functions to generate the JWT token and refresh token

// Route to login a user (POST request)
router.post("/login_logout/login", async (req, res) => {
  try {
    const { username, password } = req.body; // Destructuring the request body to get the username and password
    const hashedPassword = await hashInfo(password); // Hashing the password using the hashInfo function which returns a promise
    const encryptedUsername = encrypt(username); // Encrypting the username using the encrypt function
    const user = await pool.query(
      // Getting the user from the database
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [encryptedUsername, hashedPassword]
    );
    if (user.rows.length === 0) {
      // If the user is not found
      return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
    }
    const token = jwtTokenGenerator(user.rows[0].user_id); // Generating a JWT token using the jwtGenerator function
    const refreshToken = jwtRefreshTokenGenerator(user.rows[0].user_id); // Generating a refresh token using the jwtRefreshTokenGenerator function
    const hashed_refreshToken = await hashInfo(refreshToken); // Hashing the refresh token using the hashInfo function which returns a promise

    //Inserting the refresh token into the database
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, hashed_refresh_token, expire_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET hashed_refresh_token = $2, expire_at = $3",
      [
        // Inserting the user id, hashed refresh token and expire_at column into the refresh_tokens table and if there is a conflict (user_id already exists), update the hashed refresh token and expire_at column
        user.rows[0].user_id, // inserting the user id
        hashed_refreshToken, // inserting the hashed refresh token
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Setting the expire_at column to 7 days from now
      ]
    );

    // Sending the a response cookie of the token
    res.cookie("token", token, {
      // Setting the cookie name to "token"
      httpOnkly: true, // Setting the cookie to be accessible only by the web server
      secure: true, // Setting the cookie to be sent only over HTTPS
      maxAge: 60 * 60 * 1000, // Setting the cookie to expire in 1 hour
    });

    // Sending the a response cookie of the refresh token
    res.cookie("refreshToken", refreshToken, {
      // Setting the cookie name to "refreshToken"
      httpOnly: true, // Setting the cookie to be accessible only by the web server
      secure: true, // Setting the cookie to be sent only over HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // Setting the cookie to expire in 7 days
    });

    res.status(200).json({ message: "Authentication successful" }); // Sending a response with a status code of 200 and a message of "Authentication successful"
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});

// Route to check the refresh token and reauthenticate without logging in again (POST request)
router.post("/login_logout/refresh_auth", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Getting the refresh token from the request cookie
    if (refreshToken == null) {
      // If the refresh token is null (not found)
      return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
    }

    //if the refresh token is not null
    const hashed_refresh_token = await hashInfo(refreshToken); // Hashing the refresh token using the hashInfo function which returns a promise
    const refreshTokenFromDB = await pool.query(
      // Getting the refresh token from the database (to check if the refresh token is valid)
      "SELECT * FROM refresh_tokens WHERE hashed_refresh_token = $1", // Query to get the refresh token from the database
      [hashed_refresh_token]
    );

    if (refreshTokenFromDB.rows.length === 0) {
      // If the refresh token is not found in the database
      return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
    } else if (refreshTokenFromDB.rows[0].expire_at < new Date()) {
      // If the refresh token is expired
      return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
    }

    // If the refresh token is exists and is not revoked
    jwtRefreshTokenGenerator.verify;
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});
