require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const {TEMPLATE_MONGDB} = process.env;
const app = express();

mongoose.Promise = global.Promise;
if(process.env.NODE_ENV !== 'test') {
    mongoose.connect(TEMPLATE_MONGDB, {useNewUrlParser: true, useUnifiedTopology: true});
} else {
    mongoose.connect(TEMPLATE_MONGDB, {useNewUrlParser: true, useUnifiedTopology: true});
}


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cors({
    exposedHeaders: ['X-Total-Count'],
    origin: "*"
}));
app.use(express.static(__dirname + '/uploads'));
app.use('/uploads', express.static('uploads'));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//      });

routes(app);

app.use((err, req, res, next) => {
    res.status(422).send({error: err.message});
});

module.exports = app;

//process.env.TEMPLATE_MONGDB