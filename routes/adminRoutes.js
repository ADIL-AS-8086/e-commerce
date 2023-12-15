const express = require('express');
const admin = express.Router();
const adminController = require('../controller/adminController');
const catogeryController = require('../controller/catogeryController');
const upload = require('../middleware/multer');
const editmulter = require('../middleware/edilMulter');
const productController = require('../controller/productController');
const uploadproduct = require('../middleware/productmulter');

// <<--------------------------------------------------------------------------------------------------------------------------->>
// <<--------------------------------------------------------------------------------------------------------------------------->>




// <<--------------------------------------------------------------------------------------------------------------------------->>
// user mangement
admin.get('/', adminController.adminpage);
admin.get('/users', adminController.userpage);

admin.post('/block/:userId',adminController.blockUser)
admin.post('/unblock/:userId',adminController.unBlockUser)

// <<--------------------------------------------------------------------------------------------------------------------------->>
// catogerymanagent


admin.get('/catogeryList', catogeryController.categoryListPage);
admin.get('/addCategory', catogeryController.addCategorypage);
admin.post('/toaddCatogery', upload.single('image'), catogeryController.addCategory);

admin.get('/editcategory/:id', catogeryController.editCategory);
admin.post('/editcategory/:id', editmulter.single('image'), catogeryController.afterEditCategory);


admin.post('/deleteCategory/:id', catogeryController.deleteCategory);

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
// <<--------------------------------------------------------------------------------------------------------------------------->>
// <<--------------------------------------------------------------------------------------------------------------------------->>


module.exports = admin;
