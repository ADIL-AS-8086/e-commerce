const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/', userController.home);
router.get('/user/signin', userController.loginpage);
router.get('/user/signup', userController.signuppage);
router.post('/user/usersignup', userController.signup);
router.post('/user/login', userController.login);
router.get('/user/otpuser', userController.otppage);

// Add this route for OTP verification
router.post('/user/verifyotp', userController.verifyOTP);

module.exports = router;
