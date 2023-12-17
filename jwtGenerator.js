/** This javascript file is used to generate the JWT token which is used after the user logged in
 * and making subsquent requests to the server. It provides stateless authentication for
 * ensuring the right user is accessing the data and authorization */

require("dotenv").config(); // Importing the dotenv package to get the environment variables from the .env file
const jwt = require("jsonwebtoken"); // Importing the jsonwebtoken package
const SECRET_KEY = process.env.JWT_SECRET_KEY; // Getting the JWT secret key from the .env file
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY; // Getting the JWT refresh secret key from the .env file

// Function to generate the JWT token to maintain the stateless authentication
function jwtTokenGenerator(user_id) {
  const payload = {
    user: user_id,
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1hr" }); // Returns the signed JWT token with 1 hour expiry
}

// function to generate the refresh token to maintain the stateless authentication
function jwtRefreshTokenGenerator(user_id) {
  const payload = {
    user: user_id,
  };
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "7d" }); // Returns the signed JWT token with 7 days expiry
}

module.exports = { jwtTokenGenerator, jwtRefreshTokenGenerator }; // Exporting the functions to be used in other files
