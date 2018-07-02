const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const app = express();

var models = require('./models');

app.engine('mustache',mustacheExpress());

app.use(logger('dev'));

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(cookieParser());

app.use(session({
  key: 'user_sid',
  secret: 'kittykat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}))

app.use((req,res,next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid')
  }
  next()
})


var sessionChecker = (req,res,next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect('/')
  }
  else {
    next()
  }
}


app.set('views','./views')
app.set('view engine','mustache')



app.get('/', (req,res) => {
  res.render('home')
})



app.post('/registerUser', (req,res) => {
  bcrypt.hash(req.body.registerPassword, 10, function(err, hash) {
    let newUser = {
      email : req.body.registerEmail,
      password : hash
    }
    models.User.findAll({
      where: {
        email : req.body.registerEmail,
      }
    })
    .then(function(result) {
      console.log(result)
      if (!result) {
        models.User.create(newUser).then(function(user){
          req.session.user = user.dataValues
          res.render('userinfoform')
        })
      }
      else {
        res.render('userexists')
      }
    })
  })
})





app.post('/login',(req,res) => {

  models.User.findOne({
    where: {
      email : req.body.loginEmail
    }
  })
  .then(function(user) {
    bcrypt.compare(req.body.loginPassword, user.password, function(err, result) {
      if(result) {
        if(req.session) {
          req.session.user = user.dataValues
        }
        res.render('userprofile', {'users' : user})
      }

      else {
        res.render('badlogin')
      }
    })
  })
})




app.post('/userUpdateForm', (req,res) => {

  let updatedUser = {
    firstname : req.body.firstName,
    lastname : req.body.lastName,
    age : req.body.age,
    gender : req.body.gender,
    weight : req.body.weight,
    height : req.body.height,
    activitylevel : req.body.activityLevel,
    city : req.body.city,
    state : req.body.state,
    goals : req.body.goals,
  }

  models.User.findOne({
    where: {
      email : req.session.user.email
    }
  })

  .then(function(user) {
    user.update(updatedUser)
    res.render('userprofile', {'users' : user})
  })
})

app.get('/userprofile', (req,res) => {
  let userId = req.session.user.id

  models.User.findOne({
    where: {
      id : userId
    }
  })

  .then(function(user){
    res.render('userprofile',{'users' : user})
  })
})


app.get('/userworkouts/:id', (req,res) => {

  let userId = req.session.user.id

  models.Workout.findAll({
    where: {
      userid : userId
    }
  })

  .then(function(workouts){
    res.render('userworkouts',{'workouts' : workouts})
  })
})


app.post('/addUserWorkout', (req,res) => {

  let workout = {
    exercise: req.body.exercise,
    time: req.body.time,
    miles: req.body.miles,
    weight: req.body.weight,
    reps: req.body.reps,
    userid: req.session.user.id

  }

  models.Workout.create(workout).then(function(workout) {
    let userid = workout.userid
    res.redirect('/userworkouts/'+userid+'')
  })
})


app.get('/logout', (req,res) => {
  if(req.session.user && req.cookies.user_sid){
    res.clearCookie('user_sid')
    res.render('loggedout')
  }

  else {
    res.redirect('/')
  }
})


app.post('/deleteWorkout', (req,res) => {

  models.Workout.destroy({
    where: {
      id : req.body.deleteWorkout
    }
  })

  .then(function(){
    let userid = req.body.userId
    res.redirect('/userworkouts/'+userid+'')
  })
})


app.get('/editWorkout/:id', (req,res) => {

  let id = req.params.id

  models.Workout.findAll({
    where: {
      id : id
    }
  })
  .then(function(workout){
    res.render('edituserworkout', {'workout' : workout})
  })
})


app.post('/editUserWorkout', (req,res) => {

  let updatedWorkout = {
    time: req.body.time,
    miles: req.body.miles,
    weight: req.body.weight,
    reps: req.body.reps,
  }

  models.Workout.findOne({
    where: {
      exercise: req.body.exercise
    }
  })

  .then(function(workout) {
    workout.update(updatedWorkout)
    let userid = workout.userid
    res.redirect('/userworkouts/'+userid+'')
  })
})


// about-us page

app.get('/about-us', (req,res) => {
  res.render('about-us')
})

// things-todo page

app.get('/things', (req,res) => {
  res.render('things')
})


app.all('/*',sessionChecker, (req,res,next) => {
  next()
})



app.get('*', (req,res) => {
  res.render('home')
})


app.listen(3000,function(){
  console.log("node server has started")
})
