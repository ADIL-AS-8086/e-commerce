const ejs = require('ejs');
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');
const path=require('path')
const morgan=require('morgan')
const app = express();
const multer = require("multer");
const port = process.env.PORT || 4000;
const host=process.env.HOST
connectDB=require('./config/connectionDB')
// const FileType = require('file-type');
const { validationResult } = require('express-validator');


// Set view engine
app.use(express.static('public'));
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('tiny'));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
// app.use(express.static('views'))

// Use the express-session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a secure, randomly generated string
    resave: true,
    saveUninitialized: true
}));

const userRouter=require("./routes/userRoutes")
const adminRouter=require("./routes/adminRoutes");

// app.get('/',(req,res)=>{
//     res.render('./user/signup')
// })

app.use('/',userRouter)
app.use('/admin', adminRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

