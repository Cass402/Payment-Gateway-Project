/** This javascript is used to hash sensitive information such as usernames, passwords, and such.
 * It uses the bcryptjs library to hash the information. The hash makes sure that the encyption is
 * a one-way function and sensitive info even if leaked cannot be decrypted. The salt rounds is stored as
 * an environment variable to improve security. */

const bcrypt = require("bcrypt"); //import the bcryptjs library for hashing
require("dotenv").config(); // Importing the dotenv library for environment variables
const saltRounds = parseInt(process.env.SALT_ROUNDS); // importing the salt rounds from the .env file

// Function to hash the sensitive information
function hashInfo(info) {
  return bcrypt.hash(info, saltRounds); // Hashing the info using the bcryptjs library and the salt rounds and returning a promise
}

// Function to compare the sensitive information with the hashed information
function compareInfo(info, hashedInfo) {
  return bcrypt.compare(info, hashedInfo); // Comparing the info with the hashed info using the bcryptjs library and returning a promise
}

module.exports = { hashInfo, compareInfo }; // Exporting the functions for use in other files
