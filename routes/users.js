/** This javascript file is used as an endpoint to access the users table in the
 * payment_gateway_system database in the PostgreSQL database server. It will handle all the
 * requests sent to the /users route. This endpoint is also added to the server.js file. */

// Import express and create the router object
const express = require("express");
const router = express.Router(); // the router object is used to handle the requests
const pool = require("../db_connection"); // Importing the pool object to connect to the database
const { hashInfo, compareInfo } = require("../hash_sensitive_info"); // Importing the hashInfo and compareInfo functions from the hashInfo.js file
const authenticateToken = require("../middlewares/authentication_middleware"); // Importing the authenticateToken function from the authentication_middleware.js file

//Route to register a new user (POST request)
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body; // Destructuring the request body to get the username, password, and email
    const hashedPassword = await hashInfo(password); // Hashing the password using the hashInfo function which returns a promise
    const newUser = await pool.query(
      // Creating a new user in the database
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
      [username, hashedPassword, email]
    );
    res.status(201).json(newUser.rows[0]); // Sending a response with a status code of 201 and the new user object
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});

//Route to get the user profile (GET request)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      // Getting the user profile from the database
      "SELECT * FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.status(200).json(user.rows[0]); // Sending a response with a status code of 200 and the user object
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});

module.exports = router; // Exporting the router object
