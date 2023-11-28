// const { log } = require('console')
const { log } = require('console')
const category = require('../model/categorySchema')
require('dotenv').config()


//get method for category management

const categoryListPage = async (req, res) => {
    var i = 0
    const categoryData = await category.find()
    res.render("./admin/CategoryList", { categoryData, i })
}

//get method for add category

const    addCategorypage = (req, res) => {
    res.render('./admin/addCategory')
}


//post method for add category

const addCategory = async (req, res) => {
    console.log("..............");
    try {
        const{name}=req.body
        console.log(name);
        const categoryName=name
        const image = req.file.filename
        console.log("aaaaaaaaaa",req.file)

            const newCategory = await category.create({
                categoryname: categoryName,
                image: image
            })
            console.log("catedddddddddddddddddddddddddddddgptu",newCategory);
            res.redirect('/admin/catogeryList')
        
    } catch (error) {
        console.log(error);
    }
}





const editCategory = async (req, res) => {
    const id = req.params.id;
  
    const categoryData = await category.findOne({ _id: id });
    res.render('./admin/editCategory', { categoryData});
};

const afterEditCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;
        const newImage = req.file ? req.file.filename : undefined;

        const updatedCategory = await category.findByIdAndUpdate(
            id,
            {
                $set: {
                    categoryname: name,
                    image: newImage
                }
            },
            { new: true } // Ensure to get the updated document
        );

        console.log(updatedCategory);
        res.redirect('/admin/catogeryList');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        // Find the category by ID and remove it

        
        const deletedCategory = await category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).send('Category not found');
        }

        // Redirect to the admin category list
        res.redirect('/admin/catogeryList');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    addCategorypage,
    addCategory ,
    categoryListPage ,
    editCategory,
    afterEditCategory,
    deleteCategory
     
    // editCategorypage
}