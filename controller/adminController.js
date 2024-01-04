
const User=require('../model/userSchema')


const credentail={
    email:"admin@gmail.com",
    password:"123456789"
}

const adminpage = (req, res) => {
    res.render('./admin/adminHome');
};

const login= (req,res) =>{
res.render('./admin/adminLogin')
}

const loginPost=(req,res)=>{
    try {
        const{email,pass}=req.body
        console.log(email,pass,'.....................................');
        if(credentail.email==email && credentail.password==pass){
            req.session.adminlogged=true
            res.render('./admin/adminHome');
        }else{
            res.render('./admin/adminLogin',{error:'password or email wrong'})
        }
    } catch (error) {
        console.error(error)
    }
}


const userpage = async (req, res) => {
    try {
        const userData = await User.find().sort({ username: 1, email: 1, status: 1 });
        const totalUsersCount = userData.length;
        const activeUsersCount = userData.filter(user => user.status).length;
        const blockedUsersCount = totalUsersCount - activeUsersCount;

        res.render('./admin/users', {
            userData,
            totalUsersCount,
            activeUsersCount,
            blockedUsersCount
        });
    } catch (error) {
        console.error('Error while fetching user data:', error);

        res.status(500).send('Internal Server Error');
    }
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
    unBlockUser,
    login,
    loginPost
    // productsPage,
   // Add the new method

};
