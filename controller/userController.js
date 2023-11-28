const user = require('../model/userSchema');
const OTP = require('../model/otpSchema');
const { sendOTP } = require("../util/otp");
const bcrypt = require('bcrypt');
const Category = require('../model/categorySchema');

let _email;
let _password;
let _name;



const home = async (req, res) => {
  try {
    // Fetch categories
    const categories = await Category.find().limit(3);

    res.render('./user/home', {
      category: categories,  // Update the variable name here
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




const loginpage = (req, res) => {
  res.render('./user/signin');
};
const signuppage = (req, res) => {
  res.render('./user/signup');
};
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    _email = email;
    _name = name,
    _password = password;
    const data={
    name:req.session.body,
    email:req.session.body,
    password:req.session.body
    }

    const userExist = await user.findOne({ email: email });

    if (userExist) {
      return res.render('./user/signup', { message: 'Email already exists' });
    }

    console.log('This is OTP sending..');
    const otpInfo = await sendOTP(email);

    try {
      // Try to insert OTP document
      await OTP.create({
        email: email,
        otp: otpInfo.otp,
      });

      res.render('./user/otpuser', { email: email,message:false });
    } catch (error) {
      if (error.code === 11000 && error.keyValue && error.keyPattern) {
        // Duplicate key error, update existing OTP
        console.log('Duplicate key error:', error.keyValue);

        await OTP.updateOne(
          { email: email },
          { $set: { otp: otpInfo.otp, isExpired: false } },
          { upsert: true }
        );

        res.render('./user/otpuser', { email: email ,message:false});
      } else {
        // Handle other errors
        console.error('Error during OTP insertion:', error);
        res.render('./user/signup', { message: 'Error during signup' });
      }
    }
  } catch (error) {
    console.error('Error during signup:', error);
    res.render('./user/signup', { message: 'Error during signup' });
  }
};












const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp, '..................................................................');

    // Find the OTP in the database
    const otpData = await OTP.findOne({ email: email, otp: otp, isExpired: false });
    console.log('-----------', otpData);
    if (otpData) {
      // Mark the OTP as expired
      otpData.isExpired = true;
      await otpData.save();
      console.log('otp saved.............');

      // Continue with user registration or any other action
      try {
        // Insert user data into the User schema
        await user.create({
          username: _name,
          email: _email,
          password: _password,
        });

        // Set user session to true
        req.session.username = _name;
        req.session.email = _email;
        req.session.userlogged = true;

        res.redirect('/'); // Redirect to home or any other page
      } catch (error) {
        console.error('Error during user data insertion:', error);
        return res.render('./user/otpuser', { email: _email, message: 'Error during user data insertion' });
      }
    } else {
      return res.render('./user/otpuser', { email: _email, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return res.render('./user/otpuser', { email: _email, message: 'Error during OTP verification' });
  }
};













const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(".........", email, password);
    const userFound = await user.findOne({ email: email });
    console.log(userFound);

    if (!userFound) {
      res.render('./user/signin', { message: 'Invalid email or password' });
    } else {
      const isPasswordValid = await bcrypt.compare(password, userFound.password);
      console.log("..........,pass valid");

      if (isPasswordValid) {
        // Password is correct
        req.session.username = userFound.username;
        req.session.email = userFound.email;
        req.session.userlogged = true;

        res.redirect('./user/home');
      } else {
        // Password is incorrect
        res.render('./user/signin', { message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.render('./user/signin', { message: 'Error during login' });
  }
};

const otppage = (req, res) => {
  res.render('./user/otpuser');
};

module.exports = {
  home,
  loginpage,
  signuppage,
  signup,
  login,
  otppage,
  verifyOTP
};
