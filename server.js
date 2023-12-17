/**The server.js file is used to set up the express server and will
 * serve as the entry point for the application. */

require("dotenv").config(); // Loading the dotenv module for environment variables
const https = require("https"); // Importing the https module
const fs = require("fs"); // Importing the fs module
const express = require("express"); // Importing the express module
const pool = require("./db_connection"); // Importing the pool object
const app = express(); // Creating an express application

// Loading the SSL certificates
const options = {
  key: fs.readFileSync(process.env.SERVER_KEY_PATH),
  cert: fs.readFileSync(process.env.CA_PATH),
};

//Middlewares used
const authenticateToken = require("./middlewares/authentication_middleware");
app.use(express.json()); // Adding the express.json middleware to parse the JSON body

// Importing the routes
const usersRoutes = require("./routes/users");
const transactionsRoutes = require("./routes/transactions");
const refundsRoutes = require("./routes/refunds");
const user_sessionsRoutes = require("./routes/user_sessions");
const payment_methodsRoutes = require("./routes/payment_methods");
const failed_login_attemptsRoutes = require("./routes/failed_login_attempts");
const audit_logsRoutes = require("./routes/audit_logs");
const login_logoutRoutes = require("./routes/login_logout");

// Adding the routes to the application
app.use("/users", usersRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/refunds", refundsRoutes);
app.use("/user_sessions", user_sessionsRoutes);
app.use("/payment_methods", payment_methodsRoutes);
app.use("/failed_login_attempts", failed_login_attemptsRoutes);
app.use("/audit_logs", audit_logsRoutes);
app.use("/login_logout", login_logoutRoutes);

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

// Creating an HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Listening on port ${port}...`); // Displaying the port number
});
