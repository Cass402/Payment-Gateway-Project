/** This javascript file tests the connections to the database established by the
 * db_connection.js file. The tests are written to find bugs in the code and to
 * ensure that the code is working as expected.
 */

const pool = require("../db_connection"); // replace with path to your db_connection.js file

describe("Database Connection", () => {
  // The describe function is used to group related tests
  it("should connect to the database successfully", async () => {
    // The it function is used to write a test
    let client; // The client object is used to connect to the database
    try {
      client = await pool.connect(); // Connecting to the database
      await client.query("SELECT 1"); // simple query to check the connection
    } catch (err) {
      // If there is an error, the test fails
      throw err;
    } finally {
      // Make sure to release the client before any assertions that might throw
      if (client) {
        client.release(); // Releasing the client
      }
    }
  });
});

afterAll(async () => {
  // the afterAll function is used to run code after all the test cases are executed
  await pool.end(); // the end function is used to end the database connection
});
