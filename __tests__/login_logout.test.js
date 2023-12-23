/** This javascript file uses jest and supertest to write tests to test the functionalities
 * of the login_logout routes of the server which is defined in the ./routes/login_logout.js file.
 * The tests are written to find bugs in the code and to ensure that the code is working as expected.
 */
require("dotenv").config(); // Import dotenv to use environment variables
const request = require("supertest"); // Import supertest to test HTTP requests/responses
const app = require("../server"); // Import server to test the login_logout routes
const fs = require("fs"); // Import fs to read and write files
const cert = fs.readFileSync(process.env.CA_PATH); // Read the certificate file

// Testing the login route (/login_logout/login) functionality
describe("POST /login_logout/login", () => {
  // the describe function is used to group together related tests
  // Test case 1: Testing the login route with correct credentials
  // Expected output: The response should be two cookies - one for a token and one for a refresh token - and a
  // status code of 200 with a json message saying "Authentication successful"
  it("should login with correct credentials", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/login") // the post function is used to make a POST request to the server
      .send({ username: "test", password: "test" }) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    expect(res.statusCode).toEqual(200); // the expect function is used to check if the response status code is 200
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Authentication successful"); // the expect function is used to check if the response body has the property "message" with the value "Authentication successful"
    expect(res.headers["set-cookie"].length).toBe(2); // the expect function is used to check if the response has two cookies
    expect(res.headers["set-cookie"][0]).toContain("token"); // the expect function is used to check if the response has a cookie with the name "token"
    expect(res.headers["set-cookie"][1]).toContain("refreshToken"); // the expect function is used to check if the response has a cookie with the name "refreshToken"
  });

  // Test case 2: Testing the login route with incorrect credentials
  // Expected output: The response should be a status code of 401 with json message of "Username or password is incorrect"
  it("should not login with incorrect credentials", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/login") // the post function is used to make a POST request to the server
      .send({ username: "test", password: "wrongpassword" }) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    expect(res.statusCode).toEqual(401); // the expect function is used to check if the response status code is 401
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Username or password is incorrect"); // the expect function is used to check if the response body has the property "message" with the value "Username or password is incorrect"
    expect(res.headers["set-cookie"]).toBe(undefined); // the expect function is used to check if the response has no cookies
  });

  // Test case 3: Testing the login route with no credentials
  // Expected output: The response should be a status code of 400 with json message of "Username or password not found"
  it("should not login with non credentials", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/login") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    expect(res.statusCode).toEqual(400); // the expect function is used to check if the response status code is 400
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Username or password not found"); // the expect function is used to check if the response body has the property "message" with the value "Username or password not found"
    expect(res.headers["set-cookie"]).toBe(undefined); // the expect function is used to check if the response has no cookies
  });

  // Test case 4: Testing the login route with correct credentials but the user was previously deleted
  // Expected output: The response should be a status code of 401 with json message of "Username or password is incorrect"
  it("should not login with correct credentials but the user was previously deleted", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/login") // the post function is used to make a POST request to the server
      .send({ username: "test1", password: "test1" }) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    expect(res.statusCode).toEqual(401); // the expect function is used to check if the response status code is 401
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Username or password is incorrect"); // the expect function is used to check if the response body has the property "message" with the value "Username or password is incorrect"
    expect(res.headers["set-cookie"]).toBe(undefined); // the expect function is used to check if the response has no cookies
  });
});
