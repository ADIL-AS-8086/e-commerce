const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const userAuth=require('../middleware/userAuth')




router.get('/',userAuth.userExist,userController.home);
router.get('/user/signin',userAuth.userExist,userController.loginpage);
router.get('/user/signup',userAuth.userExist,userController.signuppage);
router.post('/user/usersignup',userAuth.userExist,userController.signup);
router.post('/user/login',userAuth.userExist,userController.login);
router.get('/user/otpuser',userAuth.userExist,userController.otppage);

// Add this route for OTP verification
router.post('/user/verifyotp',userAuth.userExist,userController.verifyOTP);

router.get('/user/shop',userAuth.verifyUser,userController.shoppage)
router.get('/user/user-home',userAuth.verifyUser,userController.userHome)
router.get('/user/product-view/:id',userAuth.verifyUser,userController.productdetailpage)
router.get('/user/logout',userAuth.verifyUser,userController.logOut)


module.exports = router;
