const { log } = require('console')
const mongoose = require('mongoose');
const order = require('../model/ordersShema')
const cart = require('../model/cartSchema')
const User = require('../model/userSchema')
const product = require('../model/prodectSchema')
require('dotenv').config()


const checkoutpage = async (req, res) => {
    try {

        const email = req.session.email;
        const UserData = await User.findOne({ email });
        const userCart = await cart.findOne({ user: UserData._id }).populate('cartItems.products');

        let totalAmount = 0;

        if (userCart && userCart.cartItems) {
            userCart.cartItems.forEach(item => {
                item.totalPrice = item.quantity * item.products.price;
                totalAmount += item.totalPrice;
            });

            userCart.TotalAmount = totalAmount;
            req.session.grandTotal = userCart.TotalAmount;
        }
        console.log(userCart.TotalAmount, '%%%%%%%%%%%%%%%%%%%%%');
        if (!UserData) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.render('./user/userCheckout', { UserData, userCart });
        console.log('@@@@@', UserData);
        console.log('#######', userCart);

    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}

const orderSuccess = async (req, res) => {
    try {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log(req.body);
        const PaymentMethod = req.body.payment;
        const Address = req.body.address;
        const Email = req.session.email;
        const user = await User.findOne({ email: Email });
        const userid = user._id;
        const totalAmount = req.session.grandTotal;

        console.log(totalAmount, userid, Email, Address, PaymentMethod);

        if (PaymentMethod === "COD") {
            const userCart = await cart.findOne({ user: userid }).populate(
                "cartItems.products"
            );

            if (!userCart) {
                console.error("No cart found for the user.");
                return res.render("error/404");
            }

            const newItems = [];

            for (const item of userCart.cartItems) {
                const productId = item.products;
                const quantityInCart = item.quantity;
                const size = item.size;

                const products = await product.findById(productId);

                if (products) {
                    const variant = products.variant.find(v => v.size === size);

                    if (variant) {
                        const availableStock = variant.quantity;

                        if (quantityInCart > availableStock) {
                            console.error(`Not enough stock available for product ${productId}, size ${size}`);
                            return res.json({ error: "Not enough stock available for product" });
                        }

                        newItems.push({
                            productId: productId,
                            quantity: quantityInCart,
                            size: size
                        });
                    } else {
                        console.error(`Size ${size} not found for product ${productId}`);
                        return res.json({ error: "Size not found for product" });
                    }
                } else {
                    console.error(`Product not found with ID ${productId}`);
                    return res.json({ error: "Product not found" });
                }
            }

            const address = await User.findOne({
                _id: userid,
                address: {
                    $elemMatch: { _id: new mongoose.Types.ObjectId(Address) },
                },
            });

            const add = {
                Name: address.address[0].name,
                Address: address.address[0].address,
                Pincode: address.address[0].pincode,
                City: address.address[0].city,
                State: address.address[0].state,
                Mobile: address.address[0].mobile,
            };

            const currentDate = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
            });

            const newOrders = new order({
                UserId: userid,
                Items: newItems,
                OrderDate: currentDate,
                ExpectedDeliveryDate: new Date(
                    Date.now() + 4 * 24 * 60 * 60 * 1000
                ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                TotalPrice: totalAmount,
                Address: add,
                PaymentMethod: PaymentMethod,
                // DeliveryDate: deliveryDate,
            });

            const orders = await newOrders.save();
            console.log(orders, '**!!*!*!*!*!*!*!*!*!*!*!**!*!*!**!*!*');

            for (const item of orders.Items) {
                const productId = item.productId;
                console.log(productId, '222222222222222222222222');

                const products = await product.findById(productId);
                console.log(products);
                if (products) {
                    let size = item.size
                    console.log('======', size);

                    let variants;
                    for (const variant of products.variant) {
                        if (variant.size === size) {
                            variants = variant;
                            break;
                        }
                    }

                    if (variants) {
                        console.log(variants);

                        const updatedQuantity = variants.quantity - item.quantity;
                        console.log(updatedQuantity, '!.!>1>!!>!.!>!>!>>!>!.!>>!.!.!>>`1.!.');
                        if (updatedQuantity < 0) {
                            variants.quantity = 0;
                            products.Status = "Out of Stock";
                        } else {
                            variants.quantity = updatedQuantity;
                            await products.save();
                        }
                    }
                }
            }

            await cart.findByIdAndDelete(userCart._id);

            res.json({ codSuccess: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('error while confirming the order:', error);
        res.status(500).send('Internal Server Error');
    }
};


const successOrder = async (req, res) => {
    try {
        res.render('./user/ordersuccess')
    } catch (error) {
        console.error('error while rendering the order success page:', error)
    }
}




// prodyct listing on adminside
// prodyct listing on adminside
// prodyct listing on adminside

const OrderList = async (req, res) => {
    try {
        const Orderdata = await order.find().populate('Items.productId UserId');
        // console.log(Orderdata, '!!!!!!!!!!!!');
        res.render('./admin/orderList', { Orderdata });
    } catch (error) {
        console.error('MongoDB Error:', error);
        res.status(500).send('Internal Server Error');
    }
};







const orderHistory = async (req, res) => {
    try {
        const email = req.session.email;

        // Find the user based on the email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Now, use the user ID to find orders for that user
        const orders = await order.find({ UserId: user._id }).sort({ OrderDate: -1 }).populate('Items.productId');

        if (!orders) {
            return res.status(404).send('Orders not found');
        }

        res.render('./user/order', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




const updateOrderStatus = async (req, res) => {
    try {
        
        const orderId = req.body.orderId;
        const newStatus = req.body.status;

        const existingOrder = await order.findById(orderId).populate('Items.productId');

        if (!existingOrder) {
            return res.json({ success: false, error: 'Order not found' });
        }

        if (newStatus === 'rejected' && existingOrder.Status !== 'rejected') {
     
            for (const item of existingOrder.Items) {
                const productId = item.productId;
                const size = item.size;
                const quantity = item.quantity;

                const products = await product.findById(productId);

                if (products) {
                    const variant = products.variant.find(v => v.size === size);

                    if (variant) {

                        variant.quantity += quantity;
                        await products.save();
                    }
                }
            }
        }
        console.log("@##$$%$%%");

        await order.findByIdAndUpdate(orderId, {
            Status: newStatus,
            PaymentStatus: "Pending",
        });

        if (newStatus === "delivered") {
            const deliveryDate = new Date();
            await order.findByIdAndUpdate(orderId, {
                Status: newStatus,
                PaymentStatus: "Paid",
                DeliveryDate: deliveryDate,
            });
            
        }
        


        res.json({ success: true });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.json({ success: false, error: 'Internal Server Error' });
    }
};




const Cancelorderstatus =async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        const newStatus = 'cancelled'; 
    
        const existingOrder = await order.findById(orderId).populate('Items.productId');
    
        if (!existingOrder) {
          return res.json({ success: false, error: 'Order not found' });
        }
    
        if (existingOrder.Status === 'cancelled') {
          return res.json({ success: false, error: 'Order is already cancelled' });
        }
  
        for (const item of existingOrder.Items) {
          const productId = item.productId;
          const size = item.size;
          const quantity = item.quantity;
    
          const products = await product.findById(productId);
    
          if (products) {
            const variant = products.variant.find(v => v.size === size);
    
            if (variant) {
              variant.quantity += quantity;
              await products.save();
            }
          }
        }
    
       
        await order.findByIdAndUpdate(orderId, {
          Status: newStatus,
          PaymentStatus: 'Cancelled',
        });
    
        res.json({ success: true });
      } catch (error) {
        console.error('Error updating order status:', error);
        res.json({ success: false, error: 'Internal Server Error' });
      }
    };
















module.exports = {

    checkoutpage,
    orderSuccess,
    successOrder,
    OrderList,
    orderHistory,
    updateOrderStatus,
    Cancelorderstatus

}