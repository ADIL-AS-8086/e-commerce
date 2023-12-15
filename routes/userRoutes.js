const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const userAuth=require('../middleware/userAuth')
const uploadProfile=require('../middleware/profilemulter')

const cartController=require('../controller/cartcontroller')



// <<--------------------------------------------------------------------------------------------------------------------------->>


router.get('/',userAuth.userExist,userController.home);
router.get('/user/signin',userAuth.userExist,userController.loginpage);
router.get('/user/signup',userAuth.userExist,userController.signuppage);
router.post('/user/usersignup',userAuth.userExist,userController.signup);
router.post('/user/login',userAuth.userExist,userController.login);
router.get('/user/otpuser',userAuth.userExist,userController.otppage);

// Add this route for OTP verification
// <<--------------------------------------------------------------------------------------------------------------------------->>
router.post('/user/verifyotp',userAuth.userExist,userController.verifyOTP);



// <<--------------------------------------------------------------------------------------------------------------------------->>
router.get('/user/shop',userAuth.verifyUser,userController.shoppage)
router.get('/user/user-home',userAuth.verifyUser,userController.userHome)
router.get('/user/product-view/:id',userAuth.verifyUser,userController.productdetailpage)
router.get('/user/logout',userAuth.verifyUser,userController.logOut)






// userptofilemanagment
// <<--------------------------------------------------------------------------------------------------------------------------->>

router.get('/user/profile',userAuth.verifyUser,userController.profilepage)
router.get('/user/adress',userAuth.verifyUser,userController.adresspage)

router.post('/user/addadress/:id', userAuth.verifyUser,userController.addadress);
router.post('/user/editaddress/:id',userAuth.verifyUser,userController.editaddress)
router.delete('/user/deleteAddress/:id', userAuth.verifyUser, userController.deleteAddress);
router.post('/user/editname', userAuth.verifyUser, userController.editUsername);


router.post('/addprofilepic', userAuth.verifyUser,uploadProfile.single('profileImage'), userController.profile);




// userartgetpageroute

router.get('/user/user-cart',userAuth.verifyUser,cartController.cartpage)



router.post('/user/add-to-cart/:id', userAuth.verifyUser, cartController.addToCart_post);
router.patch('/user/update-cart/:id', userAuth.verifyUser, cartController.updateCartItemQuantity);
router.delete('/user/delete-cart/:id', userAuth.verifyUser, cartController.deleteCartItem);




module.exports = router;
