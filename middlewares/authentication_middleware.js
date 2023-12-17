/** This javascript file is used as a middleware that authenticates a user based on JWT tokens
 * in order to access routes that require authentication and authorization. This is used for establishing
 * stateless authentication. */

const jwt = require("jsonwebtoken"); // Importing the json2webtoken package to verify the JWT token
const SECRET_KEY = process.env.JWT_SECRET_KEY; // Getting the JWT secret key from the .env file
const pool = require("../db_connection"); // Importing the database connection pool

// Middleware function to authenticate a user
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Getting the authorization header from the request
  const token = authHeader && authHeader.split(" ")[1]; // Getting the token from the authorization header
  if (token == null) {
    // If the token is null
    return res.status(401).json("Unauthorized"); // Sending a response with a status code of 401 and a message of "Unauthorized"
  }

  // Check if the token is already revoked (check in the revoked_tokens table in the database)
  pool.query(
    "SELECT * FROM revoked_tokens WHERE revoked_token = $1", // Query to check if the token is revoked
    [token], // Passing the token as a parameter
    (err, results) => {
      // Callback function
      if (err) {
        // If there is an error
        throw err;
      }

      if (results.rows.length > 0) {
        // if the token is already revoked
        return res.status(403).json("This token has already been revoked"); // Sending a response with a status code of 403 and a message of "This token has already been revoked"
      }

      // If the token is not revoked
      jwt.verify(token, SECRET_KEY, (err, user) => {
        // Verifying the token
        if (err) {
          // If there is an error
          //if the error is because of an expired token
          if (err.name === "TokenExpiredError") {
            return res.status(401).json("Token Expired"); // Sending a response with a status code of 401 and a message of "Token Expired"
          }
          return res.status(403).json("Forbidden"); // Sending a response with a status code of 403 and a message of "Forbidden"
        }
        req.user = user; // Setting the user to the user in the request
        next(); // Calling the next middleware
      });
    }
  );
}
