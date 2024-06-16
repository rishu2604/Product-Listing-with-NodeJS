const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

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


exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({email: email})
        .then(user => {
            if(!user){
                const error = new Error('User not found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual){
                const error = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                }, 
                'some_super_secret-key(private-key)',
                { expiresIn: '1h' }
            ); 
            // This creates a new signature and packs that into a new json web token.
            // We can add any data we want into the token, like for example we could store the user email and user id.

            res.status(200).json({token: token, userId: loadedUser._id.toString()})
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}