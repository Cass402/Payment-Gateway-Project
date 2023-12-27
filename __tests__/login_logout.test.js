/** This javascript file uses jest and supertest to write tests to test the functionalities
 * of the login_logout routes of the server which is defined in the ./routes/login_logout.js file.
 * The tests are written to find bugs in the code and to ensure that the code is working as expected.
 */
require("dotenv").config(); // Import dotenv to use environment variables
const request = require("supertest"); // Import supertest to test HTTP requests/responses
const app = require("../server"); // Import server to test the login_logout routes
const fs = require("fs"); // Import fs to read and write files
const cert = fs.readFileSync(process.env.CA_PATH); // Read the certificate file
const pool = require("../db_connection"); // Import db_connection to use the pool object
const e = require("express");

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
    expect(
      res.headers["set-cookie"].some((cookie) => cookie.startsWith("token="))
    ).toBe(true); // the expect function is used to check if the response has a cookie with the name "token"
    expect(
      res.headers["set-cookie"].some((cookie) =>
        cookie.startsWith("refreshToken=")
      )
    ).toBe(true); // the expect function is used to check if the response has a cookie with the name "refreshToken"
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

let token; // variable to store the token cookie
let refreshToken; // variable to store the refresh token cookie

// Testing the logout route (/login_logout/logout) functionality
describe("POST /login_logout/logout", () => {
  // the describe function is used to group together related tests
  // executing the beforeAll function to login the user to get the token and refresh token cookies
  beforeAll(async () => {
    // the beforeAll function is used to run code before all the test cases are executed
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/login") // the post function is used to make a POST request to the server
      .send({ username: "test", password: "test" }) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    token = res.headers["set-cookie"].find(
      (
        cookie // the find function is used to find the cookie with the name "token" and store it in the token variable
      ) => cookie.startsWith("token")
    );
    refreshToken = res.headers["set-cookie"].find(
      (
        cookie // the find function is used to find the cookie with the name "refreshToken" and store it in the refreshToken variable
      ) => cookie.startsWith("refreshToken")
    );
  });

  // Test case 1: Testing the logout route provided both the token and refresh token
  // Expected output: The response should be a status code of 200 with json message of "Logout successful"
  // and the cookies should be cleared
  it("should logout provided both the token and refresh token", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/logout") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Cookie", `${token}; ${refreshToken}`) // the set function is used to set the cookies of the request
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    expect(res.statusCode).toEqual(200); // the expect function is used to check if the response status code is 200
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Logout successful"); // the expect function is used to check if the response body has the property "message" with the value "Logout successful"
    expect(
      res.headers["set-cookie"].some((cookie) => cookie.startsWith("token=;"))
    ).toBe(true); // the expect function is used to check if the response has a cookie with the name "token" which essentially checks if the cookie is cleared
    expect(
      res.headers["set-cookie"].some((cookie) =>
        cookie.startsWith("refreshToken=;")
      )
    ).toBe(true); // the expect function is used to check if the response has a cookie with the name "refreshToken" which essentially checks if the cookie is cleared
  });

  // Test case 2: Testing the logout route provided no cookies
  // Expected output: The response should be a status code of 400 with a json message of "Tokens not found in cookies"
  it("should not logout provided no cookies", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/logout") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    expect(res.statusCode).toEqual(400); // the expect function is used to check if the response status code is 400
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Tokens not found in cookies"); // the expect function is used to check if the response body has the property "message" with the value "Tokens not found in cookies"
  });

  // Test case 3: Testing the logout route provided with invalid token or invalid refresh token
  it("should not logout provided with invalid token or invalid refresh token", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/logout") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Cookie", `${token}; refreshToken=invalid`) // the set function is used to set the cookies of the request
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request

    expect(res.statusCode).toEqual(401); // the expect function is used to check if the response status code is 401
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Tokens invalid"); // the expect function is used to check if the response body has the property "message" with the value "Tokens invalid"
  });
});

// Testing the refresh route (/login_logout/refresh_auth) functionality
describe("POST /login_logout/refresh_auth", () => {
  // the describe function is used to group together related tests
  // executing the beforeAll function to login the user to get the token and refresh token cookies
  beforeAll(async () => {
    // the beforeAll function is used to run code before all the test cases are executed
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/login") // the post function is used to make a POST request to the server
      .send({ username: "test", password: "test" }) // the send function is used to send data to the server
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request
    token = res.headers["set-cookie"].find(
      (
        cookie // the find function is used to find the cookie with the name "token" and store it in the token variable
      ) => cookie.startsWith("token")
    );
    refreshToken = res.headers["set-cookie"].find(
      (
        cookie // the find function is used to find the cookie with the name "refreshToken" and store it in the refreshToken variable
      ) => cookie.startsWith("refreshToken")
    );
  });

  // Test case 1: Testing the refresh_auth route provided with valid refresh token
  // Expected output: The response should be a status code of 200 with a json message of "Reauthentication successful"
  // and the response should have two cookies - one for a token and one for a refresh token
  it("should refresh provided with valid refresh token", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/refresh_auth") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Cookie", refreshToken) // the set function is used to set the cookies of the request
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request

    expect(res.statusCode).toEqual(200); // the expect function is used to check if the response status code is 200
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Reauthentication successful"); // the expect function is used to check if the response body has the property "message" with the value "Reauthentication successful"
    expect(res.headers["set-cookie"].length).toBe(2); // the expect function is used to check if the response has two cookies
    expect(
      res.headers["set-cookie"].some((cookie) => cookie.startsWith("token="))
    ).toBe(true); // the expect function is used to check if the response has a cookie with the name "token"
    expect(
      res.headers["set-cookie"].some((cookie) =>
        cookie.startsWith("refreshToken=")
      )
    ).toBe(true); // the expect function is used to check if the response has a cookie with the name "refreshToken"
  });

  // Test case 2: Testing the refresh_auth route provided with invalid refresh token
  // Expected output: The response should be a status code of 401 with a json message of "Refresh token invalid"
  it("should not refresh provided with invalid refresh token", async () => {
    // the it function is used to define a test case
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/refresh_auth") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Cookie", "refreshToken=invalid") // the set function is used to set the cookies of the request
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request

    expect(res.statusCode).toEqual(401); // the expect function is used to check if the response status code is 401
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Refresh token invalid"); // the expect function is used to check if the response body has the property "message" with the value "Refresh token invalid"
  });

  // Test case 3: Testing the refresh_auth if the refresh token is not in the database
  // Expected output: The response should be a status code of 401 with a json message of "Authentication failed"
  it("should not refresh if the refresh token is not in the database", async () => {
    // the it function is used to define a test case
    await pool.query("DELETE FROM refresh_tokens"); // the query function is used to execute a SQL query to delete all the refresh tokens from the database
    const res = await request(app) // the request function is used to make a HTTP request to the server
      .post("/login_logout/refresh_auth") // the post function is used to make a POST request to the server
      .send({}) // the send function is used to send data to the server
      .set("Cookie", refreshToken) // the set function is used to set the cookies of the request
      .set("Accept", "application/json") // the set function is used to set the content type of the request
      .ca(cert); // the ca function is used to set the certificate of the request

    expect(res.statusCode).toEqual(401); // the expect function is used to check if the response status code is 401
    expect(res.body).toHaveProperty("message"); // the expect function is used to check if the response body has the property "message"
    expect(res.body.message).toBe("Authentication failed"); // the expect function is used to check if the response body has the property "message" with the value "Authentication failed"
  });
});

afterAll(async () => {
  // the afterAll function is used to run code after all the test cases are executed
  await pool.end(); // the end function is used to end the database connection
});
