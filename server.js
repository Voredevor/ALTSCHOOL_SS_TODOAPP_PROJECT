require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet")
const morgan = require("morgan");


const logger = require("./utils/logger");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");


const app = express();

app.use( morgan( "combined", {stream: logger.stream}));

// Basic Middleware function 
app.use( helmet() );
app.use(express.urlencoded({ extended: true }));
app.use( express.json() );

// View Engines
app.set( "view engine", "ejs" );
app.set( "views", path.join( __dirname, "views" ));

// Logging call 
app.use( morgan( "combined", { stream: logger.stream }));

// STATIC VIEW 
app.use( express.static( path.join( __dirname, "public")));

// Session 
const mongoUrl = process.env.MONGODB_URI 
app.use( session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, 
    store: MongoStore.create({ mongoUrl }), 
    cookie: {maxAge: 1000 * 60 * 60 * 12 } //Half a day
}));

// Attaching users to res.local for views 
app.use((res, req, next) => {
    res.local.currentUser = req.session.user || null;
    next();
});

//  Routes 
app.use( "/", authRoutes ); // We login and register + root here
app.use( "/tasks", taskRoutes ); // task CRUD and UI pages 

// 404 
app.use( ( err, req, res) => {
    res.status(404);
    if( req.accepts( "html" )) return res.render(404);
    return res.join({ success: false, message: "NOT FOUND RAAA" });
});

// Global error Handling 
app.use( ( err, req, res, next ) => {
    logger.error( err.stack || err.message || "Error is not Recognized" );
    const status = err.status || 500;
    if( req.accepts( "html" )) {
        return res.status(status).render( "error", { error: err });
    }

    res.status(status).json({ success: false, message: err.message || "Server Error Noticed" }); 
}); 

// Connecting and starting the server only if we run this file directly 
if( require.main === module ) {
    const PORT = process.env.PORT;
    mongoose.connect( mongoUrl, { tls: true } )
        .then( () => {
            logger.info( "Successfully connected to the Mongo Database" );
            app.listen( PORT, () => {
                logger.info( `Server is listening on Port ${PORT}` );
            });
        })
        .catch( err => {
            logger.error( "MongoDB Connection Error Occured:", err);
            process.exit(1);
        });
};

module.exports = app; // Exported for tests