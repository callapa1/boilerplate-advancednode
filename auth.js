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
        myDataBase.findOneAndUpdate(
            {id: profile.id},
            {
                $setOnInsert: {
                    id: profile.id,
                    username: profile.username,
                    name: profile.displayName || 'John Doe',
                    photo: profile.photos[0].value || '',
                    email: Array.isArray(profile.emails)
                    ? profile.emails[0].value
                    : 'Np public email',
                    provider: profile.provider || ''
                },
                $set: {
                    last_login: new Date()
                },
                $inc: {
                    login_count: 1
                }
            },
            { upsert: true, new: true },
            (err, doc) => {
                return cb(null, doc.value)
            }
        )
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