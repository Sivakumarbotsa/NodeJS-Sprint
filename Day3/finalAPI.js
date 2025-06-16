const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const { PORT, DB_PASSWORD, DB_USER } = process.env;
const app = express();

const dbURL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.9quhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(dbURL).then(function () {
    console.log("Connection Success");
}).catch(err => console.log(err));

const userSchemaRules = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    confirmPassword: {
        type: String,
        required: true,
        minlength: 8,
        validate: function () {
            return this.password == this.confirmPassword
        }
    },
    createdAt: { // fixed typo here
        type: Date,
        default: Date.now
    },
}

const userSchema = new mongoose.Schema(userSchemaRules);
const UserModel = mongoose.model("UserModel", userSchema); // fixed typo here

app.use(express.json());

app.use(function (req, res, next) {
    if (req.method == "POST") {
        const userDetails = req.body;
        const isEmpty = Object.keys(userDetails).length == 0;
        if (isEmpty) {
            res.status(404).json({
                status: "failure",
                message: "user Details are empty"
            })
        } else {
            next()
        }
    } else {
        next();
    }
});

/*****API's*****/
app.get("/api/user", getAllUsers);
app.post("/api/user", createUserHandler);
app.get("/api/user/:userId", getUserById)

/***Handler Functions***/
async function createUserHandler(req, res) {
    try {
        const userDetails = req.body;
        const user = await UserModel.create(userDetails);
        res.status(200).json({
            status: "success",
            message: `added the user`,
            user,
        })
    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: err.message
        })
    }
}

async function getUserById(req, res) {
    try {
        const userId = req.params.userId;
        const userDetails = await UserModel.findById(userId);
        if (!userDetails) { // fixed logic here
            throw new Error(`user with ${userId} not found`)
        } else {
            res.status(200).json({
                status: "success",
                message: userDetails
            })
        }
    } catch (err) {
        res.status(404).json({
            status: "failure",
            message: err.message
        })
    }
}

async function getAllUsers(req, res) {
    try {
        console.log("I am inside get method");
        const userDataStore = await UserModel.find();
        if (userDataStore.length == 0) {
            throw new Error("No Users Found");
        }
        res.status(200).json({
            status: "success",
            message: userDataStore
        })
    } catch (err) {
        res.status(404).json({
            status: "failure",
            message: err.message
        })
    }
}

app.use(function (req, res) {
    res.status(404).json({
        status: "failure",
        message: "404 Page Not Found"
    })
})

app.listen(PORT, function () {
    console.log(`server is running at this port ${PORT}`);
})