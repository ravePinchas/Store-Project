const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user');

/**
 * -------------- POST ROUTES ----------------
 */

router.post('/register', function(req, res) {
    const newUser = new User({
        email: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        role: "user"
    });
    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            req.session.isLogged = true;
            res.redirect('/login');
        }
    });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/');
});

/**
 * -------------- GET ROUTES ----------------
 */

// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// router.get(
//     '/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     function (req, res) {
//         res.redirect('/products');
//     }
// );

router.get('/login', (req, res) => {
    res.render('users/login', { user: req.user });
});

router.get('/register', (req, res) => {
    res.render('users/register', { user: req.user });
});

router.get('/logout', (req, res, next) => {
    req.logout();
    console.log(req.user);
    return res.redirect('/login');
});

module.exports = router;