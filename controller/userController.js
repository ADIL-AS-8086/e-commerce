const user = require('../model/userSchema');
const OTP = require('../model/otpSchema');
const { sendOTP } = require("../util/otp");
const bcrypt = require('bcrypt');
const Category = require('../model/categorySchema');
const Product= require('../model/prodectSchema')


let _email;
let _password;
let _name;



const home = async (req, res) => {
  try {
   
    const categories = await Category.find();
    const proctData= await Product.find().limit(8);


    res.render('./user/home', {
      category: categories,proctData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const userHome=async (req,res)=>{
  try {
    const categories = await Category.find();
    const proctData= await Product.find().limit(8);
    res.render('./user/homeuser', {
      category: categories,proctData 
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


const loginpage = (req, res) => {
  res.render('./user/signin',{message:false});
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
      
      await OTP.create({
        email: email,
        otp: otpInfo.otp,
      });

      res.render('./user/otpuser', { email: email,message:false });
    } catch (error) {
      if (error.code === 11000 && error.keyValue && error.keyPattern) {
        
        console.log('Duplicate key error:', error.keyValue);

        await OTP.updateOne(
          { email: email },
          { $set: { otp: otpInfo.otp, isExpired: false } },
          { upsert: true }
        );

        res.render('./user/otpuser', { email: email ,message:false});
      } else {
   
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

    
    const otpData = await OTP.findOne({ email: email, otp: otp, isExpired: false });
    console.log('-----------', otpData);
    if (otpData) {
     
      otpData.isExpired = true;
      await otpData.save();
      console.log('otp saved.............');

     
      try {
        
        await user.create({
          username: _name,
          email: _email,
          password: _password,
    

        });

        
        req.session.username = _name;
        req.session.email = _email;
        req.session.userlogged = true;

        res.redirect('/user/user-home'); 
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
      
      return res.render('./user/signin', { message: 'Invalid email or password' });
    }

    
    if (!userFound.status) {
      
      return res.render('./user/signin', { message: 'Admin blocked your account' });
    }
    if (password === userFound.password) {
      console.log(userFound.email);
     
      req.session.email = userFound.email;
      req.session.userlogged = true;

      return res.redirect('/user/user-home');
    } else {
      return res.render('./user/signin', { message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.render('./user/signin', { message: 'Error during login' });
  }
};


const otppage = (req, res) => {
  res.render('./user/otpuser');
};


const shoppage =async (req, res) => {
  try {
      const proctData =await Product.find({}).exec()
      console.log('........................................................:', proctData);
      res.render('./user/shop', { proctData });
  } catch (error) {
      console.error('Error:', error,'..............................................');
      res.status(500).send('Internal Server Error');
  }
}




const productdetailpage =async(req,res)=>{
  try {
    console.log('adilsdfghjklttttttttttttttttttttttttttttttttttttttttttttttttttt');
    const id=req.params.id
    const productData=await Product.findOne({_id:id})
    console.log('mmmmmmmmmm',productData);
    

res.render('./user/productdetail',{productData})


    
  } catch (error) {
    console.log(error)
    
  }
}


const logOut=async(req,res)=>{
  try {
    req.session.userlogged = false;
    res.redirect('/user/login')
  } catch (error) {
    console.error('error while logout:',error)
  }
}



module.exports = {
  home,
  loginpage,
  signuppage,
  signup,
  login,
  otppage,
  verifyOTP,
  shoppage,
  userHome,
  productdetailpage,
  logOut
};
