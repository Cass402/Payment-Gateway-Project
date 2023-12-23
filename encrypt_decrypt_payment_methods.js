/** This javascript file handles the encryption and decryption of payment details
 * for the payment methods. The payment details are first tokenized via an API call (done elsewhere)
 * and the tokenized JSON data is encrypted and decrypted here to store and read
 * from the database.
 */
require("dotenv").config(); // Importing the dotenv module for local environment variables
const crypto = require("crypto"); // Importing the crypto module for encryption and decryption
const algorithm = "aes-256-cbc"; // Defining the encryption algorithm
const key = process.env.ENCRYPTION_KEY; // Importing the encryption key from the .env file

// Function to encrypt the JSON data
function encrypt(text) {
  let iv = crypto.randomBytes(16); // Generating a random initialization vector for encryption
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv); // Creating a cipher object with the algorithm, key and initialization vector
  let encrypted = cipher.update(text); // Updating the cipher object with the text to be encrypted
  encrypted = Buffer.concat([encrypted, cipher.final()]); // Finalizing the cipher object
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") }; // Returning the encrypted data and the initialization vector
}

// Function to decrypt the JSON data
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex"); // Converting the initialization vector from hex to a buffer
  let encryptedText = Buffer.from(text.encryptedData, "hex"); // Converting the encrypted data from hex to a buffer
  let decipher = crypto.createDecipherivs(algorithm, Buffer.from(key), iv); // Creating a decipher object with the algorithm, key and initialization vector
  let decrypted = decipher.update(encryptedText); // Updating the decipher object with the encrypted text
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString(); // Returning the decrypted text
}

module.exports = { encrypt, decrypt }; // Exporting the functions to be used in other files
