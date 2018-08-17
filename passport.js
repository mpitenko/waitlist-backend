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

      // эта функция должна проверять пароли и возвращать юзера из бд
      //
     db.query("Select check_pass2('"+username+"', '"+password+"') permit, get_password('"+username+"', '"+password+"') password, get_username('"+username+"') username")
        .then(function(results) {

          console.log('--------------------------------check_pass2');
          console.log(results);

          var response = results[0];
          var object = response[0];

          if (!object.permit) {
            return next({
              err: 'Wrong password or user'
            });
          }
          
          var user = {username: object.username,
                      password: object.password};

          console.log(user);

          if (!user) {
            return next({
              err: 'User with this name not found'
            });
          };

          next(null, user);

        })
        .catch(function(err) {
          console.log('err', err)
          next({err: err});
        });

    }
  ));

  //  passport.use('local-username-n-password', new LocalStrategy(
  //   function(username, password, next) {
  //     var _username = "'" + username + "'";
  //     db.query("SELECT * FROM passwords WHERE username = " + _username)
  //       .then(function(results) {
  //         // var user = results[0][0];
  //         var user = { username:'admin',
  //                      password: 'asd' };

  //         if (!user) {
  //           return next({
  //             err: 'User with this name not found'
  //           });
  //         };

  //         if (user.password !== password) {
  //           return next({
  //             err: 'Wrong password'
  //           });
  //         }
  //         next(null, user);
  //       })
  //       .catch(function(err) {
  //         next({err: err});
  //       });
  //   }
  // ));
}
