var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var http = require('http');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer = require('multer');
var flash = require('connect-flash');
var expressMessages = require('express-messages');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// handle file uploads
var uploads = multer({
    dest: './uploads'
});
app.use(uploads);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// handle sessions
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// flash
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = expressMessages(req, res);
    next();
});

// make user session data available in all views
// doing this avoids passing the user data in all views explictly in render function
app.get('*', function (req, res, next) {
    res.locals.user = req.user;
    next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Server is created here
app.set('port', process.env.PORT || 8080);
var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port') + '...');
});

module.exports = app;