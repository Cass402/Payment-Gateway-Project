/**The server.js file is used to set up the express server and will
 * serve as the entry point for the application. */

// Importing the express module
const express = require("express");
const { Pool } = require("pg"); // Importing the node-postgres module
require("dotenv").config(); // Importing the dotenv module for local environment variables

const app = express(); // Creating an express application
const pool = new Pool({
  // Creating a new pool object
  user: process.env.DB_USER, // The user name for the database
  host: process.env.DB_HOST, // The host where the database server is running
  database: process.env.DB_DATABASE, // The database name
  password: process.env.DB_PASSWORD, // The password for the database user
  port: process.env.DB_PORT, // The port where the database server is listening
  idleTimeoutMillis: 30000, // The time to wait before terminating the connection
  //TODO - Add SSL
});

app.use(express.json()); // Adding the express.json middleware

//TODO - Add routes

app.get("/", (eq, res) => {
  // Defining the handler function for the / route
  res.send("Hello World!"); // Sending the response
});

pool.on("error", (err, client) => {
  // Handling unexpected errors
  console.error("Unexpected error on idle client", err); // Displaying the error message
  process.exit(-1); // Exiting the application
});

process.on("exit", (code) => {
  // Handling the application exit
  pool.end(); // Disconnecting all the connections
  console.log(`About to exit with code: ${code}`); // Displaying the exit code for debugging
});

const port = process.env.PORT || 3000; // Setting the port
app.listen(port, () => {
  console.log(`Listening on port ${port}...`); // Displaying the port number
});
