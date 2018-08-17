console.log('Hello world');
console.log(__dirname);

var express = require('express');
var bodyParser = require('body-parser');
var CONFIG = require('./config.json');
var app = express();
var router = express.Router();
var cors = require('cors');
var cookieParser = require('cookie-parser')
var passport = require('passport');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var Sequelize = require('sequelize');

var db = new Sequelize({
  database: 'sys',
  username: 'root',
  password: 'Newpass1',
  dialect: 'mysql'
});

var funct = require('./passport.js');
funct(db);

var controllers = require('./controllers.js')(db);

router.get('/', function (req, res) {
  res.end('It Works!');
});

router.post('/login', controllers.adminLogin);
router.post('/logout', controllers.adminLogout);
router.post('/registration', controllers.adminReg);

router.get('/logout', function (req, res) {
  res.end('It Works!');
});

router.post('/todos/call', function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(401);
    return res.send({err: 'Unauthorized'});
  }

    console.log('req.body.username:' + req.body.username);
    console.log('req.body.password:' + req.body.password);

    var l_check_flag = false;
    /*", username, get_password('"+req.body.username+"','"req.body.password+"') password from passwords pw where pw.username = '"+req.body.username+"'"*/

       db.query("Select check_pass2('"+req.body.username+"', '"+req.body.password+"') permit, get_password('"+req.body.username+"', '"+req.body.password+"') password, get_username('"+req.body.username+"') username")
        .then(function(results) {

          console.log('--------------------------------check_pass2');
          console.log(results);

          var response = results[0];
          var object = response[0];
          object.permit;

          // if (!permit) {
          //   return next({
          //     err: 'Wrong password or user'
          //   });
          // }

          /*var user = { username:'admin',
                       password: 'asd' };

          if (!user) {
            return next({
              err: 'User with this name not found'
            });
          };

          if (user.password !== password) {
            return next({
              err: 'Wrong password'
            });
          }

          next(null, user);*/

        })
        .catch(function(err) {
          console.log('err', err)
          next({err: err});
        });

   res.end('It Works!');

});

router.post('/todos/save', function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(401);
    return res.send({err: 'Unauthorized'});
  }

   var todos = req.body.todos;

   console.log(todos);
   var username = req.user.username;
   var isctasks = req.body.isCtasks;
   console.log('username:' +username);
   console.log('-------------/todos/save');

   db.query("CALL Cleartodoslistitems('"+username+"');") 
      .then(function() {
        console.log('deleted');
      })
      .catch(function(err) {
        console.log(err);
      });

   todos.forEach(function(item, i, arr) {
      let str = JSON.stringify(item);
      console.log(str);

      db.query("CALL saveTodos('"+username+"', '"+str+"', "+isctasks.toString()+", "+ i +");") 
      .then(function() {
        console.log('commited');
      })
      .catch(function(err) {
        console.log(err);
      });
   });

   res.end('It Works!');
});


router.get('/todos/fetch', function (req, res) {
   if (!req.isAuthenticated()) {
      res.status(401);
      return res.send({err: 'Unauthorized'});
   }

   var username = req.user.username;
   console.log('username:' +username);
   console.log('-------------/todos/fetch');

   // do magic
   var todos = [];
   var isCTasks;

   db.query("Select tl.isCompletedTasks from todolist tl, passwords pw where tl.userid = pw.userconstantid" 
            ).then(function(myTableRows) {
               var results = myTableRows[0];
                   if (results[0].isCompletedTasks == 0) {results = false}
                   else {results = true}
                   /*[TextRow {isCompletedTasks: 0}]*/
              console.log('results:' + results);
              isCTasks = results;
              console.log('the data has been gotten');

              return db.query("Select pw.username username, ti.item item, ti.todonumber todonumber from todoslistitems ti, passwords pw where ti.userid = pw.userconstantid and username = '"+username+"' order by todonumber asc" );

            }).then(function(myTableRows) {
                var results = myTableRows[0];
                results.forEach(function(item, i, arr) {
                   let l_todo = JSON.parse(item.item);
                   todos.push(l_todo);  
                   console.log('l_todo:' + l_todo);
                   console.log('-----------------------');
                })
              console.log('the data has been gotten');

               res.status(200);
               console.log('__________!!!_!!!!_!!_!!_!_!!_!!:' + isCTasks);
               res.send({todos: todos, isCTasks: isCTasks}); 

            }).catch(function(err) {
             console.log(err);
            });
   
});


router.get('/loggeduser', function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(200);
    return res.send();
  } else {
    res.status(200);
    res.send(UserToJSON(req.user));
  }
});

function UserToJSON (userObj) {
  return {
    username: userObj.username
  }
}

router.get('/isauthenticated', function (req, res) {
  console.log('req.body', req.body);
  res.send({isAuthenticated: req.isAuthenticated()});
});

/*App*/
var whitelist = ['http://localhost', 'http://localhost:3333', 'http://localhost:8080'];
var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));

app.use(cookieParser());

// connect request body parser to parse data from POST requests
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(function (req, res, next) {
	console.log(req.method, req.url);
	next();
});

var sessionStore = new SequelizeStore({
  db: db,
  //checkExpirationInterval:  60 * 1000, //15min // The interval at which to cleanup expired sessions in milliseconds.
  //expiration:   60 * 1000 //15min // The maximum age (in milliseconds) of a valid session.
});

app.use(session({
  secret: '87hascvuasvb87h2384uvn92',
  resave: false,
  saveUninitialized: true,
  name: 'waitlist.sid',
  cookie: {
    maxAge: 10 * 24 * 60 * 60 * 1000, //10 days
    secure: false
  },
  store: sessionStore,
  resave: false, // we support the touch method so per the express-session docs this should be set to false 
  proxy: true // if you do SSL outside of node.
}));
sessionStore.sync();

app.use(passport.initialize());
app.use(passport.session());

// connect routes
app.use(router);

// run server process
app
  .listen(CONFIG.port, function onServerStart() {
    let fuck = cors();
    console.log('fuck:');
    console.log(fuck);
    console.log('');
    console.log('Server running on: http://localhost:' + CONFIG.port);
    console.log('To shut down server, press <CTRL> + C at any time.');
    console.log('');
  });

process.on('SIGINT', function() {
	console.log('SIGINT');
    process.exit(0);
});

// router.get('/admin/login', controllers.adminLoginPage);

/*
netstat -aon | grep 3000
tskill 3000
*/