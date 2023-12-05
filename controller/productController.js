const products = require('../model/prodectSchema');
const Category = require('../model/categorySchema');

const productsPage = async (req, res) => {
  try {
    
    const productData = await products.find().populate('categoryId');;

        
    res.render('./admin/products', { productData ,errorMessage:null});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addproduct = async (req, res) => {
  try {
    
    
    const categories = await Category.find();

    
    res.render('./admin/addproduct', { categories , errorMessage:null});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const toaddProduct = async (req, res) => {
  try {
  
    const { productname, colour, brand, price, category, sizes, Spec1, Spec2, Spec3, Spec4 } = req.body;

   
   const productNameLower = productname.toLowerCase();

  
   const existingProduct = await products.findOne({
     name: { $regex: new RegExp('^' + productNameLower + '$', 'i') },
   });
      const categories = await Category.find();

   if (existingProduct) {
    
    return res.status(400).render('./admin/addproduct', { errorMessage: 'Product with a similar name already exists.' ,categories });
  }
  

    
    const imageFields = ['productImages', 'image1', 'image2', 'image3', 'image4'];
    const images = [];

    for (const field of imageFields) {
      if (req.files[field]) {
        images.push({  filename: req.files[field][0].filename });
      }
    }

    let Obj = []
    for (let i = 0; i < req.body.variant.size.length; i++) {
        Obj.push({
            size: req.body.variant.size[i],
            quantity: req.body.variant.quantity[i]
        })
    }





      console.log(images);
  
    const newProduct = await products.create({
      name: productname,
      colour: colour, 
      brand: brand,
      price: price,
      variant:Obj,
      categoryId: category,
      images: images,
      highlight1:Spec1,
      highlight2:Spec2,
      highlight3:Spec3,
      highlight4:Spec4,
      

      


    
    });
    
    console.log(newProduct);

    console.log('Product added successfully',newProduct);

    
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




const   editproduct = async (req, res) => {
  const id = req.params.id
  const productData = await products.findOne({ _id: id })
  const variant = productData.variant
  const categories = await Category.find()


  const selectedCategory = await Category.findById(productData.categoryId);
  res.render('./admin/editProduct', { productData, categories, variant,selectedCategory })

}



const  updateProduct = async (req, res) => {
  try {
    console.log(JSON.stringify(req.body),' Body of request_______________________________--')
    const id = req.params.id;
    const productDetails = req.body;
    console.log("product detailssssssssssssssssssssssssssssssssssssssssssssssssssssssssss", productDetails);
    const files = req.files;
    
    let Obj = [];
    console.log(req.body.variant,' Varieants _____________')
    for (let i = 0; i < req.body.variant.size.length; i++) {
      Obj.push({
        size: req.body.variant.size[i],
        quantity: req.body.variant.quantity[i],
      });
    }

    console.log("ggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",Obj)
    const productData = await products.findById(id);

    if (!productData) {
      console.log("Product not found");
      return res.status(404).send("Product not found");
    }

    const updateData = {
      name: req.body.productname,
      highlight1:req.body.Spec1,
      highlight2:req.body.Spec2,
      highlight3:req.body.Spec3,
      highlight4:req.body.Spec4,
      price: req.body.price,
      brand: req.body.brand,
      colour: req.body. colour,
      category: req.body.category,
      variant: Obj,
      images: [],
    };


    if (files && files.productImages) {
      updateData.images[0] = files.productImages[0].filename;
    } else {
      updateData.images[0] = productData.images[0];
    }

    for (let i = 1; i <= 4; i++) {
      const imageName = `image${i}`;
      if (files && files[imageName]) {
        updateData.images[i] = files[imageName][0].filename;
      } else {
        updateData.images[i] = productData.images[i];
      }
    }

    const uploaded = await products.updateOne({ _id: id }, { $set: updateData });

    if (uploaded) {
      console.log("Product Updated");
      res.redirect('/admin/products');
    } else {
      console.log("Failed to update product");
      res.status(500).send("Failed to update product");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};



const blockproducts = async (req, res) => {
  try {
    console.log('--------------------------');
    const id = req.params.id;
    console.log(',,,,,,,,,,,',id);
    const productData=await products.findById(id)
    console.log(productData);
    const newStatus = !productData.Status;
    await products.updateOne(
        { _id: id },
        { $set: { Status: newStatus } }
    );
    console.log('............................................',newStatus);
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};












module.exports = {
  productsPage,
  addproduct,
  toaddProduct,
  editproduct,
  updateProduct,
  blockproducts,
};
