/**The server.js file is used to set up the express server and will
 * serve as the entry point for the application. */

// Importing the express module
const express = require("express");
const { Pool } = require("pg"); // Importing the node-postgres module

const app = express(); // Creating an express application
const pool = new Pool({
  // Creating a new pool object
  user: "dbuser", // The user name for the database
  host: "localhost", // The host where the database server is running
  database: "my_database", // The database name
  password: "secret", // The password for the database user
  port: 5432, // The port where the database server is listening
  idleTimeoutMillis: 30000, // The time to wait before terminating the connection
});

app.use(express.json()); // Adding the express.json middleware

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
