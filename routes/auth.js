const express = require("express");
const bcrypt = require("bcrypt");

const { User } = require("../model")
const router = express.Router();

const saltRounds = 10; 

// GET the Website Homepage ( If we log in directly to the tasks )
router.get( "/", ( req, res ) => {
    if(req.session.user) return res.redirect( "/tasks");
    res.render( "index" );
});

// GET the register page
router.get( "/register", ( req, res ) => { res.render( "register" )});

// POST to the register page
router.post( "/register", async (req, res, next) => {
    try {
        const { username, password} = req.body;
        if( !username || !password ) throw { status: 400, message: "Please Input Missing Credentials"};
        const existing = await User.findOne({ username }); 
        if( existing ) throw { status: 400, message: "This Username is already in Use, Pick Another"};
        const hash = await bcrypt.hash( password, saltRounds ); 
        const user = await User.create({ username, passwordHash: hash });
        req.session.user = { id: user_id, username: user.username };
        res.redirect( "/tasks" );
    } catch(err) {
        next(err);
    };
});


// GET login webpage 
router.get( "/login", (req, res) => res.render( "login" ));

// POST logging details
router.post( "/login", async (req, res) => {
    try {
        const { username, password } = req.body; 
        const user = await User.findOne({ username }); 
        if( !user ) throw { status: 401, message: "Your credentials are Invalid Eje"};
        const ok = await bcrypt.compare( password, user.passwordHash);
        if( !ok ) throw { status: 401, message: "Your credentials are Invalid again Eje"};
        req.session.user = { id: user_id, username: user.username };
        res.redirect( "/tasks" );
    } catch( err ) {
        next(err);
    }
});


// GET logout Request 
router.get( "/logout", (req, res) => {
    req.session.destroy(err => {
        if( err ) console.error(err);
        res.redirect( "/" );
    });
});

module.exports = router;
