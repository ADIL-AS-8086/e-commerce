// adminController.js
const adminpage = (req, res) => {
    res.render('./admin/adminHome');
};

const userpage = (req, res) => {
    res.render('./admin/users');
};





module.exports = {
    adminpage,
    userpage,
    // productsPage,
   // Add the new method

};
