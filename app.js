var express                 = require("express"),
    app                     = express(),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    localStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    User                    = require("./models/user");
    
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "i am the best",
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
mongoose.connect("mongodb://localhost:27017/auth_demo_app", {useNewUrlParser: true});
app.use(express.static("public"));

//=======================================================================================
//ROUTES
//=======================================================================================

app.get("/", function(req, res){
    res.render("home");
})

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
})

//Auth Routes

//show sign up form
app.get("/register", function(req, res){
    res.render("register");
});
//handling user sign up
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        });
        
    });
});

//login routes
//render login form
app.get("/login", function(req, res){
    res.render("login");
})

//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}),function(req, res){
});

//log out
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function(){
    console.log("server started");
})