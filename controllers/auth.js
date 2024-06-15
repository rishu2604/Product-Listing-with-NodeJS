const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error("Validation failed");
        err.statusCode = 422;
        err.data = errors.array();
        throw err;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    // Hash the password with a salt of 12
    bcrypt
        .hash(password, 12)
        .then((hashedPw) => {
        const user = new User({
            name: name,
            email: email,
            password: hashedPw,
        });
        return user.save();
        })
        .then((result) => {
            res.status(201).json({ message: "User created", userId: result._id });
        })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
