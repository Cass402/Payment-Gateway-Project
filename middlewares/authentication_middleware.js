/** This javascript file is used as a middleware that authenticates a user based on JWT tokens
 * in order to access routes that require authentication and authorization. This is used for establishing
 * stateless authentication. */

const jwt = require("jsonwebtoken"); // Importing the jsonwebtoken package to verify the JWT token
const SECRET_KEY = process.env.JWT_SECRET_KEY; // Getting the JWT secret key from the .env file

// Middleware function to authenticate a user
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Getting the authorization header from the request
  const token = authHeader && authHeader.split(" ")[1]; // Getting the token from the authorization header
  if (token == null) {
    // If the token is null
    return res.status(401).json("Unauthorized"); // Sending a response with a status code of 401 and a message of "Unauthorized"
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    // Verifying the token
    if (err) {
      // If there is an error
      return res.status(403).json("Forbidden"); // Sending a response with a status code of 403 and a message of "Forbidden"
    }
    req.user = user; // Setting the user to the user in the request
    next(); // Calling the next middleware
  });
}
