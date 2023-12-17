/** This file takes care of the connection to the database using the
 * pool object. The pool object is created using the Pool class from
 * the node-postgres module. The pool object is created using the
 * connection string from the .env file. The pool object is exported
 * so that it can be used in other files.  */

const { Pool } = require("pg"); // Importing the node-postgres module
require("dotenv").config(); // Importing the dotenv module for local environment variables
const fs = require("fs"); // Importing the fs module for file system related tasks

const pool = new Pool({
  // Creating a new pool object
  user: process.env.DB_USER, // The user name for the database
  host: process.env.DB_HOST, // The host where the database server is running
  database: process.env.DB_DATABASE, // The database name
  password: process.env.DB_PASSWORD, // The password for the database user
  port: process.env.DB_PORT, // The port where the database server is listening
  idleTimeoutMillis: 30000, // The time to wait before terminating the connection
  ssl: {
    // The SSL configuration
    rejectUnauthorized: false, // This is to accept the self-signed certificate
    ca: fs.readFileSync(process.env.CA_PATH), // The CA certificate (self-signed)
    key: fs.readFileSync(process.env.KEY_PATH), // The private key of the client
    cert: fs.readFileSync(process.env.CERT_PATH), // The certificate of the client
  },
});

module.exports = pool; // Exporting the pool object
