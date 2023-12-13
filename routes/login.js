/** This javascript file is used as an endpoint to authenticate users into the payment gateway
 * system. It will handle all the requests sent to the /login route. This endpoint is also added
 * to the server.js file. */

// Import express and create the router object
const express = require("express");
const router = express.Router(); // the router object is used to handle the requests
const pool = require("../db_connection"); // Importing the pool object to connect to the database
const hashInfo = require("../hash_sensitive_info"); // Importing the hashInfo function to hash the password
const { encrypt, decrypt } = require("../encrypt_decrypt_payment_methods"); // Importing the encrypt and decrypt functions to encrypt and decrypt the username
const jwtGenerator = require("../jwtGenerator"); // Importing the jwtGenerator function to generate a JWT token

// Route to login a user (POST request)
router.post("/login", async (req, res) => {
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
      return res.status(401).json("Invalid credentials"); // Sending a response with a status code of 401 and a message of "Invalid credentials"
    }
    const token = jwtGenerator(user.rows[0].user_id); // Generating a JWT token using the jwtGenerator function
    res.json({ token }); // Sending a response with the JWT token
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});
