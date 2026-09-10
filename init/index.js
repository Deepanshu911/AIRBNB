const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    // phle jo bhi data hai usko delete kar do
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, owner: "6a762cae49089f3b48cfa099"
    }));
    // then apne data ko initialize karenge
    await Listing.insertMany(initData.data); // initData apne aap main ek object ha
    console.log("data was initialized");
};

initDB();