/** This javascript file is used as an endpoint to authenticate users into the payment gateway
 * system. It will handle all the requests sent to the /login route. This endpoint is also added
 * to the server.js file. */

// Import express and create the router object
require("dotenv").config(); // Importing the dotenv package to use the environment variables
const express = require("express");
const router = express.Router(); // the router object is used to handle the requests
const pool = require("../db_connection"); // Importing the pool object to connect to the database
const { hashInfo, compareInfo } = require("../hash_sensitive_info"); // Importing the hashInfo function to hash the password
const {
  jwtTokenGenerator,
  jwtRefreshTokenGenerator,
} = require("../jwtGenerator"); // Importing the jwtTokenGenerator and jwtRefreshTokenGenerator functions to generate the JWT token and refresh token
const jwt = require("jsonwebtoken"); // Importing the json2webtoken package to verify the JWT token
const rateLimit = require("express-rate-limit"); // Importing the express-rate-limit package to limit the number of requests from a client

// Setting the rate limit for the login_logout route to prevent brute force attacks
const login_logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Setting the time window to 15 minutes
  max: 100, // Setting the maximum number of requests to 1000
  message: "Error 429: Too many requests. Please try again in 15 minutes", // Sending a response with a status code of 429 and a message of "Error 429: Too many requests. Please try again in 15 minutes"
});

// Route to login a user (POST request)
router.post("/login", login_logoutLimiter, async (req, res) => {
  // The function is declared as async to use the await keyword for asynchronous operations (promises and database queries)
  try {
    const { username, password } = req.body; // Destructuring the request body to get the username and password
    if (!username || !password) {
      // If the username or password is not found in the request body
      return res
        .status(400)
        .json({ message: "Username or password not found" }); // Sending a response with a status code of 400 and a message of "Username or password not found"
    }
    const user = await pool.query(
      // Getting the user from the database
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (user.rows.length === 0) {
      // If the user is not found, let the client know that the username or password is incorrect (to prevent brute force attacks)
      return res.status(401).json("Username or password is incorrect"); // Sending a response with a status code of 401 and a message of "Username or password is incorrect"
    } else if (user.rows[0].deleted_at !== null) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect" }); // Sending a response with a status code of 401 and a message of "Username or password is incorrect"
    }
    const hashedPassword = user.rows[0].password; // Getting the hashed password from the database
    const match = await compareInfo(password, hashedPassword); // Comparing the password with the hashed password using the compareInfo function which returns a promise
    if (!match) {
      // If the password does not match, let the client know that the username or password is incorrect (to prevent brute force attacks)
      return res
        .status(401)
        .json({ message: "Username or password is incorrect" }); // Sending a response with a status code of 401 and a message of "Username or password is incorrect"
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
      httpOnly: true, // Setting the cookie to be accessible only by the web server
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
router.post("/refresh_auth", login_logoutLimiter, async (req, res) => {
  // The function is declared as async to use the await keyword for asynchronous operations (promises and database queries)
  try {
    const refreshToken = req.cookies.refreshToken; // Getting the refresh token from the request cookie
    if (refreshToken == null) {
      // If the refresh token is null (not found), let the client know that the refresh token is not found in the cookie
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
      // If the refresh token is not found in the database, let the client know that the refresh token is not found in the database
      return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
    } else if (refreshTokenFromDB.rows[0].expire_at < new Date()) {
      // If the refresh token is expired, let the client know that the refresh token is expired
    }

    // If the refresh token is exists and is not revoked, now verify the JWT token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      async (err, user) => {
        if (err) {
          // If there is an error
          return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
        }

        // Check if the userid in the JWT token is the same as the userid in the refresh token database
        if (user.user !== refreshTokenFromDB.rows[0].user_id) {
          return res.status(401).json("Authentication failed"); // Sending a response with a status code of 401 and a message of "Authentication failed"
        }

        //If the refresh token is valid, generate a new JWT token for authentication and another refresh token
        const token = jwtTokenGenerator(user.user); // Generating a JWT token using the jwtGenerator function
        const newRefreshToken = jwtRefreshTokenGenerator(user.user); // Generating a refresh token using the jwtRefreshTokenGenerator function
        const newHashedRefreshToken = await hashInfo(newRefreshToken); // Hashing the refresh token using the hashInfo function which returns a promise

        //Updating the refresh token in the database for the user
        await pool.query(
          "UPDATE refresh_tokens SET hashed_refresh_token = $1, expire_at = $2 WHERE user_id = $3",
          [
            // Updating the hashed refresh token and expire_at column in the refresh_tokens table
            newHashedRefreshToken, // inserting the hashed refresh token
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Setting the expire_at column to 7 days from now
            user.user, // inserting the user id
          ]
        );

        // Sending the a response cookie of the token
        res.cookie("token", token, {
          // Setting the cookie name to "token"
          httpOnly: true, // Setting the cookie to be accessible only by the web server
          secure: true, // Setting the cookie to be sent only over HTTPS
          maxAge: 60 * 60 * 1000, // Setting the cookie to expire in 1 hour
        });

        // Sending the a response cookie of the refresh token
        res.cookie("refreshToken", newRefreshToken, {
          // Setting the cookie name to "refreshToken"
          httpOnly: true, // Setting the cookie to be accessible only by the web server
          secure: true, // Setting the cookie to be sent only over HTTPS
          maxAge: 7 * 24 * 60 * 60 * 1000, // Setting the cookie to expire in 7 days
        });

        res.status(200).json({ message: "Reauthentication successful" }); // Sending a response with a status code of 200 and a message of "Reauthentication successful"
      }
    );
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});

// Route to logout a user (POST request)
router.post("/logout", login_logoutLimiter, async (req, res) => {
  // The function is declared as async to use the await keyword for asynchronous operations (promises and database queries)
  try {
    const token = req.cookies.token; // Getting the token from the request cookie
    const refreshToken = req.cookies.refreshToken; // Getting the refresh token from the request cookie
    if (token == null || refreshToken == null) {
      // If either the token or refresh token is null (not found), let the client know that the tokens were not found in the cookies
      return res.status(401).json("Tokens not found in cookies"); // Sending a response with a status code of 412 and a message of "Tokens not found in cookies"
    }

    // If the token and refresh token are found in the cookies, verify the JWT tokens
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY); // Verifying the JWT token
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY); // Verifying the JWT refresh token
    } catch (error) {
      // Error Handling for the JWT tokens
      console.error(error.message); // Logging the error message to the console
      return res.status(401).json("Tokens invalid"); // Sending a response with a status code of 401 and a message of "Tokens invalid"
    }

    // If the JWT tokens are valid, first revoke the token and then revoke the refresh token
    // Revoking the token
    await pool.query(
      "INSERT INTO revoked_tokens (revoked_token, expires_at) VALUES ($1, $2)",
      [
        // Inserting the revoked token and expires_at column into the revoked_tokens table
        token, // inserting the revoked token
        new Date(Date.now() + 60 * 60 * 1000), // Setting the expires_at column to 1 hour from now
      ]
    );

    // Hashing the refresh token
    const hashed_refresh_token = await hashInfo(refreshToken); // Hashing the refresh token using the hashInfo function which returns a promise
    // Deleting the refresh token from the database
    await pool.query(
      "DELETE FROM refresh_tokens WHERE hashed_refresh_token = $1",
      [
        // Deleting the refresh token rom the the database
        hashed_refresh_token, // inserting the hashed refresh token
      ]
    );

    // Deleting the cookies from the client
    res.clearCookie("token"); // Clearing the token cookie
    res.clearCookie("refreshToken"); // Clearing the refresh token cookie

    res.status(200).json({ messsage: "Logout successful" }); // Sending a response with a status code of 200 and a message of "Logout successful"
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});

module.exports = router; // Exporting the router object
