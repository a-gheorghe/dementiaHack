// const $ = require('jquery');
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
  res.render('landing', {css: ['login.css']})
});




app.get('/register', (req,res) => {
  res.render('register', {css:['login.css']})
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
          // MUS CHANGE
          // req.session.currId = req.user.dataValues.id
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
  res.render('quiz', {css:['cognition.css']})
})

app.post('/quiz', (req, res) => {
  // check degree one
  var degreeOneScore;
  var degreeTwoScore;
  var smokingScore;
  var sugarScore;
  var exerciseScore;

  var degreeOne = req.body.degreeOne.toLowerCase()
  if (degreeOne === 'n' || degreeOne === 'no'){
    degreeOneScore = 0
  }
  if (degreeOne === 'y' || degreeOne === 'yes'){
    degreeOneScore = 2
  }

  // check degree two
  var degreeTwo = req.body.degreeTwo.toLowerCase()
  if (degreeTwo === 'n' || degreeTwo === 'no'){
    degreeTwoScore = 0
  }
  if (degreeTwo === 'y' || degreeTwo === 'yes'){
    degreeTwoScore = 1
  }

  // check smoking
  var smoking = parseFloat(req.body.cigarettes)
  if (smoking === 0){
    smokingScore = 0
  } else if (smoking > 0 && smoking < 20){
    smokingScore = 1
  } else if (smoking > 20){
    smokingScore = 2
  }

  // check sugar
  var sugar = parseFloat(req.body.food)
  if (sugar === 0){
    sugarScore = 0
  } else if (sugar > 0 && sugar < 6){
    sugarScore = 1
  } else if (sugar > 6){
    sugarScore = 2
  }

  //check exercise
  var exercise = parseFloat(req.body.exercise)

  if (exercise >= 2){
    exerciseScore = 2
  } else if (exercise > 0 && exercise < 2){
    exerciseScore = 1
  } else if (exercise === 0){
    exerciseScore = 0
  }

  User.update({
    age: req.body.age,
    degreeOne: degreeOneScore,
    rawDegreeOne: req.body.degreeOne,
    degreeTwo: degreeTwoScore,
    rawDegreeTwo: req.body.degreeTwo,
    smoking: smokingScore,
    rawSmoking: req.body.cigarettes,
    sugarIntake: sugarScore,
    rawSugarIntake: req.body.food,
    exercise: exerciseScore,
    rawExercise: req.body.exercise
  }, { where: { id: req.session.currId }})
  .then(user => {
    res.redirect('/cognition')
  })
})

app.get('/cognition', (req, res) => {
  res.render('cognition', {css:['cognition.css']})
})

app.get('/cognition/1', (req, res) => {
  res.render('cognitionOne', {css:['cognition.css']})
})

app.get('/cognition/2', (req, res) => {
  res.render('cognitionTwo', {css:['cognition.css']})
})




app.get('/genome', (req, res) => {
  const scope = 'report:mathematical-ability report:word-reading-ability report:reading-and-spelling-ability report:folate report:vitamin-b12 report:hippocampal-volume report:depression report:longevity report:intelligence report:caffeine-consumption report:blood-glucose report:bmi report:carbohydrate-intake report:smoking-behavior report:vitamin-a report:vitamin-e';
  const authorizeUrl = genomeLink.OAuth.authorizeUrl({ scope: scope });

  // Fetching a protected resource using an OAuth2 token if exists.
  // let reports = [];
  // if (req.session.oauthToken) {
  //   console.log('in here')
  //   const scopes = scope.split(' ');
  //   reports = await Promise.all(scopes.map( async (name) => {
  //     return await genomeLink.Report.fetch({
  //       name: name.replace(/report:/g, ''),
  //       population: 'european',
  //       token: req.session.oauthToken
  //     });
  //   }));
  //   req.session.reports = reports
  //   console.log('what about now???????', req.session.reports)
  // }

  res.render('authrequest', {
    authorize_url: authorizeUrl,
    css: ['auth.css']
    // reports: reports,
  });
});

app.get('/callback', async (req, res) => {
  // The user has been redirected back from the provider to your registered
  // callback URL. With this redirection comes an authorization code included
  // in the request URL. We will use that to obtain an access token.
  req.session.oauthToken = await genomeLink.OAuth.token({ requestUrl: req.url });

  // At this point you can fetch protected resources but lets save
  // the token and show how this is done from a persisted token in index page.
  res.redirect('/genetic-profile');
});

app.get('/genetic-profile', async (req, res) => {
  // console.log(req.session.currId)
  var scope = 'report:mathematical-ability report:word-reading-ability report:reading-and-spelling-ability report:folate report:vitamin-b12 report:hippocampal-volume report:depression report:longevity report:intelligence report:caffeine-consumption report:blood-glucose report:bmi report:carbohydrate-intake report:smoking-behavior report:vitamin-a report:vitamin-e';
  var reports = [];
  if (req.session.oauthToken) {
    console.log('in here')
    var scopes = scope.split(' ');
    reports = await Promise.all(scopes.map(async (name) => {
      return await genomeLink.Report.fetch({
        name: name.replace(/report:/g, ''),
        population: 'european',
        token: req.session.oauthToken
      });
    }));
    req.session.reports = reports
  }

  console.log('inside genetic profile req.session.reports.length ', req.session.reports.length)
  for (var i = 0; i < req.session.reports.length; i++){
    // console.log('i is: ', i, 'and report obj is: ', req.session.reports[i])
    if (req.session.reports[i]._data.phenotype.url_name === 'blood-glucose'){
      console.log('inside this if')
      var genome_glucose_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'bmi'){
      var genome_bmi_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'carbohydrate-intake'){
      var genome_carb_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'smoking-behavior'){
      var genome_smoking_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'vitamin-a'){
      var genome_vit_a_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'vitamin-e'){
      var genome_vit_e_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'folate'){
      var genome_folate_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'vitamin-b12'){
      var genome_vitamin_b12_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'caffeine-consumption'){
      var genome_caffeine_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'hippocampal-volume'){
      var genome_hippo_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'intelligence'){
      var genome_intelligence_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'depression'){
      var genome_depression_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'longevity'){
      var genome_longevity_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'mathematical-ability'){
      var genome_math_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'word-reading-ability'){
      var genome_reading_score = req.session.reports[i]._data.summary.score
    } else if (req.session.reports[i]._data.phenotype.url_name === 'reading-and-spelling-ability'){
      var genome_spelling_score = req.session.reports[i]._data.summary.score
    }
  }

    User.update({
      genome_blood_glucose: genome_glucose_score,
      genome_bmi: genome_bmi_score,
      genome_carb_intake: genome_carb_score,
      genome_smoking: genome_smoking_score,
      genome_vit_a: genome_vit_a_score,
      genome_vit_e: genome_vit_e_score,
      genome_folate: genome_folate_score,
      genome_vit_b12: genome_vitamin_b12_score,
      genome_caffeine: genome_caffeine_score,
      genome_hippo: genome_hippo_score,
      genome_intelligence: genome_intelligence_score,
      genome_depression: genome_depression_score,
      genome_longevity: genome_longevity_score,
      genome_math: genome_math_score,
      genome_word_reading: genome_reading_score,
      genome_spelling: genome_spelling_score
    }, { where: { id: req.session.currId }})
    .then(user => {
      console.log('THIS IS THE USER INSIDE USER UPDATE', user)
      res.render('genetic-profile', {reports: req.session.reports, css:['genetic-profile.css']})
    })
    .catch(err => {
      console.log(err)
    })
  })

  app.get('/results', (req,res) => {
    var degRisk;
    var vascRisk;
    var pseudoRisk;

  User.findOne({
    where: {id: req.session.currId},
    attributes: ['genome_blood_glucose', 'genome_bmi', 'genome_carb_intake', 'genome_smoking', 'genome_vit_a', 'genome_vit_e', 'smoking', 'sugarIntake', 'exercise']
  })
  .then(user => {
    var vasc_glucose = user.dataValues.genome_blood_glucose
    var vasc_bmi = user.dataValues.genome_bmi
    var vasc_carb = user.dataValues.genome_carb_intake
    var vasc_genome_smoking = user.dataValues.genome_smoking
    var vasc_vit_a = user.dataValues.genome_vit_a
    var vasc_vit_e = user.dataValues.genome_vit_e
    var vasc_self_smoking = user.dataValues.smoking
    var vasc_self_sugar = user.dataValues.sugarIntake
    var vasc_exercise = user.dataValues.exercise

    vascRisk = vasc_glucose + vasc_bmi + vasc_carb + vasc_genome_smoking - vasc_vit_a - vasc_vit_e + vasc_self_sugar + vasc_self_smoking - vasc_exercise
    console.log('vascular risk is', vascRisk)
    console.log('inside finding user', user)
    res.render('results',{vascRisk: vascRisk, css:['speedometer.css']})
  })
  .catch(err => {
    console.log('oh no there is an error', err)
  })
})

app.post('/sage', (req, res) => {
  if (parseInt(req.body.yearQuestion) === 2018){
    var sage_year_score = 0
  } else {
    var sage_year_score = 1
  }

  if (parseInt(req.body.starsQuestion) === 3){
    var sage_stars_score = 0
  } else {
    var sage_stars_score = 1
  }

  if (req.body.pictureQuestion === 'basketball'){
    var sage_picture_score = 0
  } else {
    var sage_picture_score
  }
  User.update({
    sage_year: sage_year_score,
    sage_picture: sage_picture_score,
    sage_stars: sage_stars_score
  }, { where: { id: req.session.currId }})
  .then(user => {
    res.redirect('/genome')
  })
  .catch(err => {
    console.log('error in here', err)
  })
})


//
// // at end
// app.use((req, res, next) => {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err)
// });
// at end, listen on port 3000
app.listen(3000, () => console.log('Listening on port 3000!'));
