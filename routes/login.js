/** This javascript file is used as an endpoint to authenticate users into the payment gateway
 * system. It will handle all the requests sent to the /login route. This endpoint is also added
 * to the server.js file. */

// Import express and create the router object
const express = require("express");
const router = express.Router(); // the router object is used to handle the requests
const pool = require("../db_connection"); // Importing the pool object to connect to the database

//TODO: write the code for the login endpoint
