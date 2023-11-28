const products = require('../model/prodectSchema');
const Category = require('../model/categorySchema');

const productsPage = async (req, res) => {
  try {
    // Fetch product data from the database
    const productData = await products.find().populate('categoryId');;

    // Render the product list page with product data
    console.log("dfghj",productData);
    res.render('./admin/products', { productData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const addproduct = async (req, res) => {
  try {
    // Fetch categories from the database
    const categories = await Category.find();

    // Render the add product page with categories
    res.render('./admin/addproduct', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const toaddProduct = async (req, res) => {
  try {
    // Extract form data
    const { productname, colour, brand, price, stock, category, sizes, Spec1, Spec2, Spec3, Spec4 } = req.body;

  

    // Extract images
    const imageFields = ['productImages', 'image1', 'image2', 'image3', 'image4'];
    const images = [];

    for (const field of imageFields) {
      if (req.files[field]) {
        images.push({  filename: req.files[field][0].filename });
      }
    }
      console.log(images);
    // Create new product
    const newProduct = await products.create({
      name: productname,
      colour: colour, 
      brand: brand,
      price: price,
      stock: stock,
      categoryId: category,
      images: images,
      highlight1:Spec1,
      highlight2:Spec2,
      highlight3:Spec3,
      highlight4:Spec4,
      sizes: sizes,

      


      // Add other fields as needed
    });
    
    

    console.log('Product added successfully',newProduct);

    // Redirect to the product list page or another appropriate page
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


//editpoduct form rendering and detaills

const editproduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = await products.findById(productId);
    // Render the edit product form with the product data
    res.render('./admin/editProduct', { productData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};







module.exports = {
  productsPage,
  addproduct,
  toaddProduct,
  editproduct
};
