const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const { User } = require("../../models");
require("dotenv").config();

const { DB_TEST_HOST, PORT = 3000 } = process.env;

describe("users authentication", () => {
  let server;

  beforeAll(() => {
    server = app.listen(PORT);
  });
  afterAll(() => {
    server.close();
  });

  beforeEach((done) => {
    mongoose.connect(DB_TEST_HOST).then(() => {
      done();
    });
  });

  afterEach((done) => {
    mongoose.connection.db.dropCollection("users").then(() => {
      mongoose.connection.close(() => {
        done();
      });
    });
  });

  test("users login", async () => {
    const data = {
      email: "myemail@gmail.com",
      password: "mypassword",
    };

    await request(app).post("/api/users/signup").send(data);
    const response = await request(app).post("/api/users/login").send(data);

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();

    const user = await User.findById(response.body.user.id);
    expect(user).toBeTruthy();
    expect(typeof user.email).toBe("string");
    expect(typeof user.subscription).toBe("string");
  });
});
