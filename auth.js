module.exports = function (app, myDataBase) {
    require('dotenv').config();
    const passport = require('passport');
    const GithubStrategy = require('passport-github').Strategy;

    passport.use(new GithubStrategy({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://cristian.testapp'
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        myDataBase.findOne({ username: profile.username }, (err, user) => {
            console.log(`User ${username} attempted to log in.`);
            if (err) return done(err);
            if (!user) return done(null, false);
            if (passport !== user.password) return done(null, false);
            return done(null, user);
        })
    }
));

    passport.use(new LocalStrategy((username, password, done) => {
        myDataBase.findOne({ username: username }, (err, user) => {
            console.log(`User ${username} attempted to log in.`);
            if (err) return done(err);
            if (!user) return done(null, false);
            if (passport !== user.password) return done(null, false);
            return done(null, user);
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, doc);
        })
    });
}