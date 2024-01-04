const user = require('../model/userSchema');
const OTP = require('../model/otpSchema');
const { sendOTP } = require("../util/otp");
const bcrypt = require('bcrypt');
const Category = require('../model/categorySchema');
const Product = require('../model/prodectSchema');
const User = require('../model/userSchema');


let _email;
let _password;
let _name;


// <<--------------------------------------------------------------------------------------------------------------------------->>



const home = async (req, res) => {
  try {

    const categories = await Category.find({ isDeleted: false });
    const proctData = await Product.find({ isDeleted: false,Status: true  }).limit(8);


    res.render('./user/home', {
      category: categories, proctData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// <<--------------------------------------------------------------------------------------------------------------------------->>

const userHome = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false ,Status: true });
    const proctData = await Product.find({ isDeleted: false ,Status: true }).limit(8);
    res.render('./user/homeuser', {
      category: categories, proctData
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// <<----<<<<<<<<<<<<<<<<<<<<<<<<<-----------=================->,....m,.,,----------------->>>>>>>>>>>>>>>>>>>>>>>>>>------>>

const loginpage = (req, res) => {
  res.render('./user/signin', { message: false });
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
    const data = {
      name: req.session.body,
      email: req.session.body,
      password: req.session.body
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

      res.render('./user/otpuser', { email: email, message: false });
    } catch (error) {
      if (error.code === 11000 && error.keyValue && error.keyPattern) {

        console.log('Duplicate key error:', error.keyValue);

        await OTP.updateOne(
          { email: email },
          { $set: { otp: otpInfo.otp, isExpired: false } },
          { upsert: true }
        );

        res.render('./user/otpuser', { email: email, message: false });
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










// <<--------------------------------------------------------------------------------------------------------------------------->>

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











// <<--------------------------------------------------------------------------------------------------------------------------->>
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

// <<--------------------------------------------------------------------------------------------------------------------------->>

const otppage = (req, res) => {
  res.render('./user/otpuser');
};

// <<--------------------------------------------------------------------------------------------------------------------------->>

const shoppage = async (req, res) => {
  try {
    const proctData = await Product.find({ isDeleted: false ,Status: true }).exec()
    console.log('........................................................:', proctData);
    res.render('./user/shop', { proctData });
  } catch (error) {
    console.error('Error:', error, '..............................................');
    res.status(500).send('Internal Server Error');
  }
}










// <<--------------------------------------------------------------------------------------------------------------------------->>

const productdetailpage = async (req, res) => {
  try {
    console.log('adilsdfghjklttttttttttttttttttttttttttttttttttttttttttttttttttt');
    const id = req.params.id
    const productData = await Product.findOne({ _id: id }).populate('categoryId')
    const relatedProducts = await Product.find({
      brand: productData.brand,
       isDeleted: false, 
       Status: true ,
       categoryId: productData.categoryId,
      _id: { $ne: id }, 
    }).limit(4);
    // console.log('mmmmmmmmmm', productData);
console.log(relatedProducts,'+++++++++++++++++++++++++++++++++');

    res.render('./user/productdetail', { productData,relatedProducts })






  } catch (error) {
    console.log(error)  

  }
}

// <<--------------------------------------------------------------------------------------------------------------------------->>

const logOut = async (req, res) => {
  try {
    req.session.userlogged = false;
    res.redirect('/user/signin')
  } catch (error) {
    console.error('error while logout:', error)
  }
}




// <<--------------------------------------------------------------------------------------------------------------------------->>
const profilepage = async (req, res) => {
  try {
    // const user = req.user;
    const email = req.session.email;
    const userData = await user.findOne({ email });
    console.log(userData,'------------------------------------->');
    res.render('./user/profile', { userData });
  } catch (error) {
    console.log(error);
  }
};





const editUsername = async (req, res) => {
  try {
    const { newUserName } = req.body;
    console.log(newUserName,'@@@');
    const email = req.session.email; 
    const updatedUser = await user.findOneAndUpdate({ email }, { username: newUserName }, { new: true });
    console.log(updatedUser);
    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error('Error during name update:', error);
    res.json({ success: false, error: 'Failed to update name' });
  }
};



const profile= async(req,res)=>{
  try {
    const email = req.session.email;
    const profileImage = req.file;

    
    console.log(profileImage,'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp');

    const update=await user.findOneAndUpdate({email},{$set:{profilePhoto:profileImage.filename}})
    res.json({
      success:true,
    })
  } catch (error) {
    
  }


}



// <<--------------------------------------------------------------------------------------------------------------------------->>

const toforget = async(req,res)=>{
  try {
    res.render('./user/forget-pass')
  } catch (error) {
    console.error(error)
  }
}

const forgotpassword = async (req, res) => {
  console.log('????????????????????????????????????????????????????????????????????????????????????????????');
  try {
    const { email } = req.body;
    console.log(req.body, email, 'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm');

    const userExist = await user.findOne({ email: email });

    if (!userExist) {
      return res.render('./user/forget-pass', { message: 'Email not found' });
    }

    const otpInfo = await sendOTP(email);

    try {
      await OTP.updateOne({
        email: email,
        otp: otpInfo.otp,
      });
    } catch (error) {
      console.error('Error during OTP insertion:', error);
      return res.render('./user/forgotpassword', { message: 'Error during OTP generation' });
    }

    res.render('./user/forgetPassOTP', { message: 'OTP sent successfully', email: email });
  } catch (error) {
    console.error('Error during forgot password:', error);

    res.status(500).render('./user/forgotpassword', { errorMessage: 'Internal Server Error' });
  }
};


const forgetPassOtpVerification=async(req,res)=>{
  try {
    const { email, otp } = req.body;
    console.log(email, otp, '..................................................................');


    const otpData = await OTP.findOne({ email: email, otp: otp, isExpired: false });
    console.log('-----------', otpData);
    if (otpData) {

      otpData.isExpired = true;
      await otpData.save();
      console.log('otp saved.............');

      req.session.email = email;
      req.session.userlogged = true;

      res.redirect('/user/user-home');

    } else {
      return res.render('./user/forgetPassOTP', { email: _email, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return res.render('./user/forgetPassOTP', { email: _email, message: 'Error during OTP verification' });
  }
}

// <<--------------------------------------------------------------------------------------------------------------------------->>
const adresspage = async (req, res) => {
  try {
    const email = req.session.email
    const addressData = await user.findOne({ email: email }) || { address: [] };
    res.render('./user/adressManagment', { addressData })


  } catch (error) {
    console.log(error);
  }
}






// <<--------------------------------------------------------------------------------------------------------------------------->>



const addadress = async (req, res) => {
  try {
    const email = req.session.email;

    const userdata = await user.findOne({ email: email });

    if (!userdata) {
      return res.status(404).send("User not found");
    }

    const { name, address, city, state, pincode, mobile } = req.body;
    userdata.address = userdata.address || [];

    userdata.address.push({
      name,
      address,
      city,
      state,
      pincode,
      mobile,
    });

    await userdata.save();
    res.redirect('/user/adress');

  } catch (error) {
    console.error("Error adding address:", error);

    res.status(500).send("Internal Server Error");
  }
};


// <<--------------------------------------------------------------------------------------------------------------------------->>


const editaddress = async (req, res) => {
  try {
    console.log("0q3498y50-8qhawbdijfbhq39pu4gtbkwAJEB");
    const email = req.session.email;
    const addressId = req.params.id;
    const { name, address, city, state, mobile, pincode } = req.body;

    const userData = await user.findOne({ email: email });
    console.log(userData, 'iw34y9hbdk');
    if (!userData) {
      return res.status(404).send("User not found");
    }

    const existingAddress = userData.address.id(addressId);
    console.log(existingAddress, '--------------');
    if (!existingAddress) {
      return res.status(404).send("Address not found");
    }

    existingAddress.name = name;
    existingAddress.address = address;
    existingAddress.city = city;
    existingAddress.state = state;
    existingAddress.mobile = mobile;
    existingAddress.pincode = pincode;
    console.log(existingAddress, '=========================');
    await userData.save();
    console.log(userData, '.............................................');
    res.json({ success: true, message: 'edit address success' })
  } catch (error) {
    console.error("Error editing address:", error);
    res.status(500).send("Internal Server Error");
  }
};




// <<----------............................................---------------============...........;/////////////.;........;;;.;.;';l'l;.l.s->>

const deleteAddress = async (req, res) => {
  try {
    const email = req.session.email;
    const addressId = req.params.id;

    const userData = await user.findOne({ email: email });

    if (!userData) {
      return res.status(404).send("User not found");
    }

    const addressIndex = userData.address.findIndex(address => address._id == addressId);

    if (addressIndex === -1) {
      return res.status(404).send("Address not found");
    }

    userData.address.splice(addressIndex, 1);

    try {
      await userData.save();
      res.json({ success: true, message: 'Delete address success' });
    } catch (validationError) {
      console.error("Validation error:", validationError);
      res.status(422).json({ success: false, message: 'Validation error', errors: validationError.errors });
    }
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).send("Internal Server Error");
  }
};
































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
  logOut,
  profilepage,
  adresspage,
  addadress,
  editaddress,
  deleteAddress,
  editUsername,
profile,
forgotpassword,
toforget,
forgetPassOtpVerification

};
