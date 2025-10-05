// Testing Microphone 1... 2... 
const request = require( "supertest" );
const mongoose = require( "mongoose" );

const app = require( "../server" );

describe( "Basic auth flow", () => {
    beforeAll(async () => {
        await mongoose.connect( process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/todo_test", { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll( async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

test( "register page accessible", async () => {
    const res = await request(app).get( "/register" );
    expect(res.statusCode).toBe(200);
});
});