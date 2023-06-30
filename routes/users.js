const express = require('express');
const router = express.Router();
const auth = require('../middlewares/middleware')
const controllers = require("../controller/userController/userController")
const cartController = require ('../controller/userController/cartController')
const orderController = require('../controller/userController/orderController')




// router.get("/",function(req,res,next){
//   res.render("user/signup")
// })






//------------------Login & Singup-----------------

// GET HOME 
router.get("/",controllers.getHome)

// GET USER LOGIN
router.get("/login",auth.userauth, controllers.getUserLogin)

// POST UER LOGIN
router.post("/login",controllers.postUserLogin)

// GET SIGNUP
router.get("/signup", controllers.getSignUp)

// POST SIGNUP
router.post("/signup", controllers.postSignup)

// GET LOGOUT
router.get("/logout", controllers.getLogout);







//-------------------------OTP--------------------------
// router.post('/otp-login', controllers.otpLogin)

// router.post('/otp-verify', controllers.otpVerify)

// router.post('/resend-otp', controllers.resendOtp)






//---------------------Product-------------------

//  USER PRODUCT
router.get('/shop',controllers.getShopPage)

// PRODUCT DETAILS
router.get('/product-detail/:id',controllers.getProductDetail)






//---------------------    CART    ------------------------//

// ADD TO CART
router.get('/cart',cartController.getCart)

// POST ADD TO CART
router.post('/addToCart/:id',cartController.addToCart)

//  DELETE PRODUCT IN CART
 router.delete('/deleteCart/:id',cartController.deleteProduct)






 //  GET CHECKOUT
 router.get('/check-out',auth.userauth,orderController.getCheckout)

 // POST CHECKOUT
 router.post('/check-out',orderController.postCheckOut)



//---------------PROFILE--------------------

//  GET PROFILE
router.get('/get-profile',auth.userauth,orderController.getProfile)





// POST ADD ADDRESS
router.post('/add-address',auth.userauth,orderController.postAddress)

// GET EDIT ADDRESS
router.route('/edit-address/:id').get(orderController.getEditAddress).patch(orderController.patchEditAddress)





// CANCEL ORDER
router.post('/cancel-order',orderController.cancelOrder)

// GER ORDER DETAILS
router.get('/order-details/:id',auth.userauth,orderController.orderDetails)


// VERIFY PAYMENTS
router.post('/verify-payment',auth.userauth,orderController.verifyPayment)





// RETURN ORDER 
router.route('/return-order/').post(orderController.returnOrder)




module.exports = router;


