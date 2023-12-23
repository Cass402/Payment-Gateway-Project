/** This javascript file imports the server.js file and starts the server. */

require("dotenv").config(); // Loading the dotenv module for environment variables
const https = require("https"); // Importing the https module
const app = require("./server"); // Importing the server

// Loading the SSL certificates
const options = {
  key: fs.readFileSync(process.env.SERVER_KEY_PATH),
  cert: fs.readFileSync(process.env.CA_PATH),
};

const port = process.env.PORT || 3000; // Setting the port

// Creating an HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Listening on port ${port}...`); // Displaying the port number
});
