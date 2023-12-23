/** This javascript file is used as an endpoint to access the failed_login_attempts table in the
 * payment_gateway_system database in the PostgreSQL database server. It will handle all the
 * requests sent to the /failed_login_attempts route. This endpoint is also added to the server.js file. */

//TODO: write the code for the failed_login_attempts endpoint
const express = require("express"); // Import express and create the router object
const router = express.Router(); // the router object is used to handle the requests

module.exports = router; // Exporting the router object
