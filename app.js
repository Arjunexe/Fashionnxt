const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require("express-ejs-layouts");
const session= require('express-session')
const connectDB = require('./models/mongoConnection')
const ConnectMongodbSession = require('connect-mongodb-session')
const mongodbSession = new ConnectMongodbSession(session)
require('dotenv').config()

// DB connection
const db = require("./models/connection");


// const nocache = require('nocache')
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('admin-layout','admin-layout')
app.use(expressLayouts);


// app.use(logger('dev'));
app.use(express.json());

//Session
app.use(session({
  saveUninitialized: false,
  secret: 'sessionSecret',
  resave: false,
  store: new mongodbSession({
    uri: "mongodb://0.0.0.0:27017/ecommerce" ,
    collection: "session"
  }),
  cookie: {
    maxAge: 1000 * 60 * 24 * 10,//10 days
  },
}))


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, "public/admin-assets")));

app.use(session({secret:"key", resave: true,saveUninitialized: true,cookie:{maxAge:600000}}))
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache,private,no-Store,must-revalidate,max-scale=0,post-check=0,pre-check=0');
  next();
})


app.use('/', usersRouter);
app.use('/admin', adminRouter);


const start=function(){
  try{
    connectDB(process.env.MONGO_URL)
  }catch(err){
   // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    console.log(err);
  }
}

start();




// catch 404 and forward to error handler

app.use(function(req, res, next) {
 // console.log("789")
  next(createError(404));
});




// error handler
app.use(function(err, req, res,next) {
  

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  // render the error page
  res.status(err.status || 500);

  let aadmin = req.url.includes('/admin');

  if(aadmin){
    res.render('error',{layout:"empty-layout", aadmin:true });
  }else{
    res.render('error',{layout:"empty-layout", aadmin:false });
  }
});

module.exports = app;
