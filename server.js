const express = require('express');
const app = express();
const genomeLink = require('genomelink-node');
const { Sequelize, User } = require('./models');
const passport = require('passport');
const LocalStrategy = require('passport-local') // maybe .Strategy

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
  .then (user => done (null, user))
  .catch(error => console.log(error));
});

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ where: { username } })
  .then(user => {
    if (!user) {
      done(null, false, { error: 'No such username/password combination' });
    }
    else if (user.password === password) done(null, user);
    else done(null, false);
  })
  .catch(error => {
    done(error)
  });
}));

const path = require('path');
const bodyParser = require('body-parser');
const expressSession = require('express-session')
const sequelize = new Sequelize(process.env.DATABASE_URL)
const hbs = require('express-handlebars');

app.engine('.handlebars', hbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({ secret: process.env.SESSION_PASS}));

// generic error handler
// app.get('/', (req, res) => {
//   res.render('landing')
// })


app.get('/', (req,res) => {
  console.log('home page req.session', req.session.currId)
  res.render('landing')
});

app.get('/genome', async (req, res) => {
  const scope = 'report:gambling report:anger report:sleep-duration';
  const authorizeUrl = genomeLink.OAuth.authorizeUrl({ scope: scope });
  console.log('here here her ehe hre hre hre rhehre', authorizeUrl)

  // Fetching a protected resource using an OAuth2 token if exists.
  let reports = [];
  if (req.session.oauthToken) {
    const scopes = scope.split(' ');
    reports = await Promise.all(scopes.map( async (name) => {
      return await genomeLink.Report.fetch({
        name: name.replace(/report:/g, ''),
        population: 'european',
        token: req.session.oauthToken
      });
    }));
  }

  res.render('index', {
    authorize_url: authorizeUrl,
    reports: reports,
  });
});



app.get('/register', (req,res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  if (req.body.username === "" && req.body.password === ""){
    res.render('register', { error: 'Must enter a username and password' })
  } else if (req.body.password === "") {
    res.render('register', { usernameValue: req.body.username, error: 'Must enter a password' })
  } else if (req.body.username === ""){
    res.render('register', { error: 'Must enter a username' })
  } else {
    User.findOne({ where: { username: req.body.username }})
    .then(student => {
      if (student){
        res.render('register', { error: 'Username already taken' })
      } else if (!student){
        User.create({ username: req.body.username, password: req.body.password })
        .then(user => {
          req.session.currId = user.dataValues.id
          console.log('currId here!!!!!!!!!!!!!!!', req.session.currId)
          res.redirect('/')
        })
        .catch(error => {
          console.log('Error registering: ', error)
        })
      }
    })
    .catch(error => {
      console.log('Error searching for username', error)
    })
  }
});


// app.post('/login', passport.authenticate('local',{
//     successRedirect: '/quiz',
//     failureRedirect: '/'
//   }));

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log('hellooooooo', req.user)
    req.session.currId = req.user.dataValues.id
    res.redirect('/quiz')
  });



// app.use((req, res, next) => {
//   console.log('in middleware', req.user)
//   if (!req.user) {
//     res.redirect('/login');
//   } else {
//     return next();
//   }
// });

app.get('/quiz', (req, res) => {
  console.log('inside quiz', req.session)
  res.render('quiz')
})

app.post('/quiz', (req, res) => {
  console.log('inside post quiz', req.session)
  User.update({age: req.body.age}, { where: { id: req.session.currId }})
  .then(user => {
    res.render('quiz')
  })
})




app.get('/callback', async (req, res) => {
  // The user has been redirected back from the provider to your registered
  // callback URL. With this redirection comes an authorization code included
  // in the request URL. We will use that to obtain an access token.
  req.session.oauthToken = await genomeLink.OAuth.token({ requestUrl: req.url });

  // At this point you can fetch protected resources but lets save
  // the token and show how this is done from a persisted token in index page.
  res.redirect('/');
});

//
// // at end
// app.use((req, res, next) => {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err)
// });
// at end, listen on port 3000
app.listen(3000, () => console.log('Listening on port 3000!'));
