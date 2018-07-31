var AuthService = require('./AuthService.js');

module.exports = function(db) {
	var controllers = {
        adminLogin: function(req, res, next) {      

            console.log('controllers.adminLogin body', req.body);
            AuthService.login(req, res, next);      
        },
        adminLogout: function(req, res) {
            req.logOut();
            res.status(200);
            res.send();
        },
        adminReg: function(req, res, next) {
            console.log('username and password:')
            console.log(req.body.username);
            console.log(req.body.password);

            // TODO: use bcrypt
            /*bcrypt.hash(myPlaintextPassword, saltRounds).then(function(hash) {
                // Store hash in your password DB.
            });*/

            db.query("CALL RegUser('"+req.body.username+"','"+req.body.password+"');") 
             .then(function() {

                 console.log('___Status_OK');

                 AuthService.login(req, res, next);

                 console.log('___After_Auth')
             })
             .catch(function(err) {
                console.log(err) 
             });
        }
    };
    return controllers;
}