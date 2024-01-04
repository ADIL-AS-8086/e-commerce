const express = require('express');
const admin = express.Router();
const adminController = require('../controller/adminController');
const catogeryController = require('../controller/catogeryController');
const upload = require('../middleware/multer');
const editmulter = require('../middleware/edilMulter');
const productController = require('../controller/productController');
const uploadproduct = require('../middleware/productmulter');
const orderController=require('../controller/ordercontroller')
const adminAuth=require('../middleware/adminAuth')
// <<--------------------------------------------------------------------------------------------------------------------------->>
// <<--------------------------------------------------------------------------------------------------------------------------->>




// <<--------------------------------------------------------------------------------------------------------------------------->>
// user mangement

admin.get('/', adminAuth.adminExist,adminController.login);
admin.get('/users',adminAuth.verifyAdmin,adminController.userpage);
admin.post('/adminLogin',adminAuth.adminExist,adminController.loginPost)



admin.post('/block/:userId',adminAuth.verifyAdmin,adminController.blockUser)
admin.post('/unblock/:userId',adminAuth.verifyAdmin,adminController.unBlockUser)

// <<--------------------------------------------------------------------------------------------------------------------------->>
// catogerymanagent


admin.get('/catogeryList',adminAuth.verifyAdmin, catogeryController.categoryListPage);
admin.get('/addCategory',adminAuth.verifyAdmin, catogeryController.addCategorypage);
admin.post('/toaddCatogery',upload.single('image'), catogeryController.addCategory);

admin.get('/editcategory/:id',adminAuth.verifyAdmin, catogeryController.editCategory);
admin.post('/editcategory/:id', editmulter.single('image'), catogeryController.afterEditCategory);

admin.post('/blockCategory/:id', adminAuth.verifyAdmin, catogeryController.blockcatogery);




admin.post('/deleteCategory/:id',adminAuth.verifyAdmin, catogeryController.deleteCategory);

// <<--------------------------------------------------------------------------------------------------------------------------->>












// <<--------------------------------------------------------------------------------------------------------------------------->>
// <<--------------------------------------------------------------------------------------------------------------------------->>
// products managment
admin.get('/products', productController.productsPage);
admin.get('/addproduct', productController.addproduct);

admin.post('/addproduct', uploadproduct.fields([
  { name: 'productImages', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]), productController.toaddProduct);



//editproduct
admin.get('/editProduct/:id', productController.editproduct);

// admin.post('/editproduct/:id', uploadproduct.fields([
//   { name: 'productImages', maxCount: 1 },
//   { name: 'image1', maxCount: 1 },
//   { name: 'image2', maxCount: 1 },
//   { name: 'image3', maxCount: 1 },
//   { name: 'image4', maxCount: 1 },
// ]), productController.updateProduct);

admin.post('/editproduct/:id',uploadproduct.any(),productController.updateProduct)



admin.get('/blockproduct/:id', productController.blockproducts);

admin.post('/delete-product/:id', productController.softDeleteProduct);
// <<--------------------------------------------------------------------------------------------------------------------------->>


admin.get('/offer-list',productController.offerpage)
admin.post('/add-offer/:id', productController.addoffer);
// <<--------------------------------------------------------------------------------------------------------------------------->>


// orderadmin

admin.get('/order-list', orderController.OrderList);

admin.post('/updateOrderStatus',orderController.updateOrderStatus);


module.exports = admin
