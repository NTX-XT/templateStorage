const User = require('../models/user');
const helpers = require('../helpers');

module.exports = {
    index(req, res, next) {
        User.find({}, { _id: 1, firstname: 1, lastname: 1, email: 1 })
        .then((users) =>
          res.status(200).set({ "X-Total-Count": users.length }).send(users)
        )
        .catch(next);
    },
    getOne(req, res, next) {
        const userId = req.params.id;        
        User.findById({ _id: userId })
          .then((user) => res.send(user))
          .catch(next);
    },
    login(req, res, next) {
        const {email, password} = req.params;
        User.find({email: email}).then(user => {            
            if(user.length > 0) {
                if(helpers.decrypt(user[0].password) === password) {
                    res.status(200).send({status: 200, data: user, message: 'Login Successful.', error: false});
                } else {
                    res.status(200).send({status: 422, data: [], message: 'Invalid Credentials!', error: false});
                }
            } else {
                res.status(200).send({status: 404, data: [], message: 'User not found.', error: true});
            }
        }).catch(err => {
            console.log("Login Error ", err);
            res.status(200).send({status: 500, data: [], message: 'Unexpected error.', error: true});
        });
    },
    signup(req, res, next) {
        const {firstname, lastname, email, password, confirm_password} = req.params;        
        const errors = [];
        const lengthError = [];
        if(firstname) {
            if(firstname === "" && firstname.trim().length === 0) {
                errors.push("First Name");
            }
        } else {
            errors.push("First Name");
        }
        if(lastname) {
            if(lastname === "" && lastname.trim().length === 0) {
                errors.push("Last Name");
            }
        } else {
            errors.push("Last Name");
        }
        if(email) {
            if(email === "" && email.trim().length === 0) {
                errors.push("Email");
            }
        } else {
            errors.push("Email");
        }
        if(password) {
            if(password === "" && password.trim().length === 0) {
                errors.push("Password");
            }
        } else {
            errors.push("Password");
        }  
        if(confirm_password) {
            if(confirm_password === "" && confirm_password.trim().length === 0) {
                errors.push("Confirm Password");
            }
        } else {
            errors.push("Confirm Password");
        }

        if(firstname.trim().length > 10) {
            lengthError.push("First Name(10)");
        }
        if(lastname.trim().length > 10) {
            lengthError.push("Last Name(10)");
        }
        if(email.trim().length > 50) {
            lengthError.push("Email(50)");
        }
        if(password.trim().length > 12) {
            lengthError.push("Password(12)");
        }
        if(confirm_password.trim().length > 12) {
            lengthError.push("Confirm Password(12)");
        }        
        
        if(errors.length > 0 || lengthError.length > 0) {
            res.status(200).send({status: 201, message: [`Missing fields are: ${errors.length > 0 ? errors.join() : null}`, `Invalid character length: ${lengthError.length > 0 ? lengthError.join() : null}`], error: true})
            return;
        }
        const userDetails = {firstname: firstname, lastname: lastname, email: email, password: helpers.encrypt(password), confirm_password: helpers.encrypt(confirm_password)};
        User.create(userDetails).then(result => {    
            res.status(200).send({status: 200, message: 'Account Created Successfully.', error: false});
        }).catch(err => {
            console.log("Signup Error ", err);
            if(err) {
                if(err.keyPattern) {
                    if(err.keyPattern.email === 1) {
                        res.status(200).send({status: 1062, message: 'User already exists with this email', error: true});
                        return;
                    }
                } else {
                    res.status(200).send({status: 500, message: 'Unexpected Error', error: true});
                }
            } else {
                res.status(200).send({status: 500, message: 'Unexpected Error', error: true});
            }
        });
    },
    resetPassword(req, res, next) {
        console.log(req.body);
    },
    edit(req, res, next) {
        // get partner id to update
        const userId = req.params.id;
        const userProps = req.body;        
        if(!userProps.password) {
            delete userProps.password;
            delete userProps.confirm_password;
        } else {
            userProps.password = helpers.encrypt(userProps.password);
            userProps.confirm_password = helpers.encrypt(userProps.confirm_password);
        }
        User.findByIdAndUpdate({ _id: userId }, userProps)
          .then(() => User.findById({ _id: userId }))
          .then((user) => res.status(200).send({status: 200, data: user}))
          .catch(next);
    },
    delete(req, res, next) {
        const userId = req.params.id;
        User.findByIdAndRemove({ _id: userId })
          .then((user) => res.status(200).send({status: 200, data: user}))
          .catch(next);
    }
}