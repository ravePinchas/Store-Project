const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/user");

passport.use(
    new LocalStrategy(function(username, password, done) {
        User.findOne({ email: username }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                console.log("cant find user");
                return done(null, false, { message: "Incorrect username." });
            }
            if (!(user.password == password)) {
                console.log("incorrect password");
                return done(null, false, { message: "Incorrect password." });
            }
            console.log("found user");
            return done(null, user);
        });
    })
);


// passport.use(new GoogleStrategy({
//         clientID: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         callbackURL: "http://localhost:3000/auth/google/callback",
//         userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
//     },
//     function(accessToken, refreshToken, profile, cb) {
//         User.findOrCreate({ googleId: profile.id, email: profile.emails[0].value, firstName: profile.name.givenName, lastName: profile.name.familyName, role: "user" }, function(err, user) {
//             return cb(err, user);
//         });
//     }
// ));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});