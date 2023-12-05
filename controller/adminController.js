
const User=require('../model/userSchema')


// adminController.js
const adminpage = (req, res) => {
    res.render('./admin/adminHome');
};


const userpage = async (req, res) => {
    var i = 0;
    const userData = await User.find().sort({ username: 1, email: 1, status: 1 });
    res.render('./admin/users', { userData, i });
};



const blockUser=async(req,res)=>{
    try {
        const userId=req.params.userId;
        const blockedUser = await User.findByIdAndUpdate(userId, { status: false }, { new: true });
        if (!blockedUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.redirect('/admin/users') 

    } catch (error) {
        console.error('error while block the user:',error)
    }
}
   

const unBlockUser=async(req,res)=>{
    try {
        const userId=req.params.userId;
        const unblockedUser = await User.findByIdAndUpdate(userId, { status: true }, { new: true });
        if (!unblockedUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.redirect('/admin/users') 
    } catch (error) {
        console.error('error while unblock the user:',error)
    }
}






module.exports = {
    adminpage,
    userpage,
    blockUser,
    unBlockUser
    // productsPage,
   // Add the new method

};
