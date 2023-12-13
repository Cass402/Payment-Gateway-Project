/** This javascript file is used as an endpoint to access the users table in the
 * payment_gateway_system database in the PostgreSQL database server. It will handle all the
 * requests sent to the /users route. This endpoint is also added to the server.js file. */

// Import express and create the router object
const express = require("express");
const router = express.Router(); // the router object is used to handle the requests
const pool = require("../db_connection"); // Importing the pool object to connect to the database
const hashInfo = require("../hash_sensitive_info"); // Importing the hashInfo function to hash the sensitive information
const { encrypt, decrypt } = require("../encrypt_decrypt_payment_methods"); // Importing the encrypt and decrypt functions to encrypt and decrypt the payment details

//Route to register a new user (POST request)
router.post("/users/register", async (req, res) => {
  try {
    const { username, password, email } = req.body; // Destructuring the request body to get the username, password, and email
    const hashedPassword = await hashInfo(password); // Hashing the password using the hashInfo function which returns a promise
    const encryptedUsername = await encrypt(username); // Encrypting the username using the encrypt function which returns a promise
    //TODO: finish the code for the register endpoint
  } catch (error) {
    // Error handling
    console.error(error.message); // Logging the error message to the console
    res.status(500).send("Server error"); // Sending a response with a status code of 500 and a message of "Server error"
  }
});
