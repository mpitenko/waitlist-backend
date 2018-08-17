var passport = require('passport');

/*
    module.exports = function(req, res, next) {

    passport.authenticate('local-username-n-password', authSuccessCallback)(req, res, next);


    function authSuccessCallback(err, user) {
        console.log('password:' + user.password);
        console.log('username:' + user.username);
        if (err) {
            console.log('-------------ERROR');
            res.status(400);
            return res.send(err);
        }
        if (!user) {
            console.log('-------------!USER');
            res.status(400);
            return res.send({ err: 'User not found' });
        }

        req.logIn(user, function(err) {
            if (err) {
                console.log('-------------ERROR_in_login');
                res.status(400);
                return res.send(err);
            }

            console.log('-------------STATUS_OK');
            res.status(200);
            res.send({ user: user });
        });
    };

}*/

module.exports = {
    login: function (req, res, next) {
        passport.authenticate('local-username-n-password', authSuccessCallback)(req, res, next);

        function authSuccessCallback(err, user) {
            if (err) {
                console.log('-------------ERROR', err);
                res.status(400);
                return res.send(err);
            }
            if (!user) {
                console.log('-------------!USER');
                res.status(400);
                return res.send({ err: 'User not found' });
            }

            req.logIn(user, function(err) {
                if (err) {
                    console.log('-------------ERROR_in_login');
                    console.log(err);
                    res.status(400);
                    return res.send(err);
                }

                console.log('password:' + user.password);
                console.log('username:' + user.username);

                console.log('-------------STATUS_OK');
                res.status(200);
                res.send({ user: user });
            });
        };
    }
};