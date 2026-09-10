require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// routes require
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // expires in 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, // max age in milliseconds
        httpOnly: true,
    },
};


// app.get("/", (req,res)=> {
//     res.send("Hi, I am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate method is added by passport-local-mongoose

passport.serializeUser(User.serializeUser()); // serializeUser method is added by passport-local-mongoose
passport.deserializeUser(User.deserializeUser()); // deserializeUser method is added by passport-local-mongoose

app.use((req,res,next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; 
    // console.log(res.locals.success);
    next();  // required to pass control to next middleware or route handler
});

// Demo for Authentication 
app.get("/demouser", async(req,res)=> {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });
    
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all("/*splat", (req,res,next)=> {
   next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=> {
    let {statusCode=500, message="Something went wrong!"} = err; // deconstruct
    res.status(statusCode).render("error.ejs", {err}); // we can pass full error also
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});