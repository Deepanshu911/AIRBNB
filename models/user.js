const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default; // import the default export of passport-local-mongoose to handle error

// console.log(passportLocalMongoose);
// console.log(typeof passportLocalMongoose);

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
    // username and password will be added by passport-local-mongoose automatically
});

userSchema.plugin(passportLocalMongoose); // username password salt and has automatically create

module.exports = mongoose.model("User", userSchema);