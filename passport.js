var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


module.exports = function(db) {
  passport.serializeUser(function(user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function(user, cb) {
    cb(null, user);
  });

  passport.use('local-username-n-password', new LocalStrategy(
    function(username, password, next) {

      // TODO: add the lib 'bcrypt'

      var _username = "'" + username + "'";
      db.query("SELECT * FROM passwords WHERE username = " + _username)
        .then(function(results) {
          var user = results[0][0];

          if (!user) {
            return next({
              err: 'User with this name not found'
            });
          };

          // this should use 
          /*bcrypt.compare(myPlaintextPassword, hash).then(function(res) {
            // res == true
          });*/

          if (user.password !== password) {
            return next({
              err: 'Wrong password'
            });
          }
          next(null, user);
        })
        .catch(function(err) {
          console.log('err', err)
          next({err: err});
        });
    }
  ));
}
