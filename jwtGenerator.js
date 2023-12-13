/** This javascript file is used to generate the JWT token which is used after the user logged in
 * and making subsquent requests to the server. It provides stateless authentication for
 * ensuring the right user is accessing the data and authorization */

require("dotenv").config(); // Importing the dotenv package to get the environment variables from the .env file
const jwt = require("jsonwebtoken"); // Importing the jsonwebtoken package
const SECRET_KEY = process.env.JWT_SECRET_KEY; // Getting the JWT secret key from the .env file

// Function to generate the JWT token
function jwtGenerator(user_id) {
  const payload = {
    user: user_id,
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1hr" }); // Returns the signed JWT token
}

module.exports = jwtGenerator; // Exporting the jwtGenerator function to be used in other files
