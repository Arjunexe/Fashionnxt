const session = require('express-session')
const orderHelper = require ('../../helpers/userHelpers/orderHelper')
const cartHelper = require ('../../helpers/userHelpers/cartHelper')
const userHelper = require ('../../helpers/userHelpers/userHelpers')
const { ObjectId } = require('mongodb');


module.exports = {



  // GET PROFILE
  getProfile:async (req, res) => {
    var count = null
   
    let userSession = req.session.user
    if (userSession) {
        var count = await cartHelper.getCartCount(userSession._id)

        let userData = await userHelper.getUser(userSession._id)
        let address = await orderHelper.getAddress(userSession._id)
        let orders = await orderHelper.getOrders(userSession._id)
        // let product = await orderHelpers.getProduct()
        res.render('user/profile', { layout: 'Layout', userSession, userData, count, address, orders })
    }

},

// getProfile: (req, res) => {
//   var count = null;

//   let userSession = req.session.user;
//   if (userSession) {
//     cartHelper
//       .getCartCount(userSession._id)
//       .then((cartCount) => {
//         count = cartCount;
//         return userHelper.getUser(userSession._id);
//       })
//       .then((userData) => {
//         return orderHelper.getAddress(userSession._id).then((address) => {
//           return [userData, address];
//         });
//       })
//       .then(([userData, address]) => {
//         return orderHelper.getOrders(userSession._id).then((orders) => {
//           res.render('user/profile', {
//             layout: 'Layout',
//             userSession,
//             userData,
//             count,
//             address,
//             orders,
//           });
//         });
//       })
//       .catch((error) => {
//         console.log(error.message);
//         // Handle the error and send an appropriate response
//         res.status(500).send('An error occurred');
//       });
//   }
// },







  

  // POST ADDRESS
  postAddress: (req, res) => {
    
    let data = req.body
    let userId = req.session.user._id
  
    orderHelper.postAddress(data, userId).then((response) => {
      
        res.send(response)
    })
},



//  GET CHECKOUT
getCheckout: async (req, res) => {

  let userSession = req.session.user

  if(userSession){

    let userId = req.session.user._id
    let total = await cartHelper.totalCheckOutAmount(userId)
    let count = await cartHelper.getCartCount(userId)
  
    let address = await orderHelper.getAddress(userId)
    cartHelper.getCartItems(userId).then((cartItems) => {
        res.render('user/checkout', { cartItems, total, count, address, userSession })
    })

  }
  
},



// POST CHECKOUT
// postCheckOut: async (req, res) => {
  
//   try {
     
//       let data = req.body;
      
     
     
      
//       try {
//           const response = await orderHelper.placeOrder(data);
         
//           if (data.payment_option === "COD") {
//               res.json({ codStatus: true });
//           } 
//       } catch (error) {
          

//           console.log({error : error.message},'22');
//           res.json({status : false , error : error.message})
//       }
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: error.message });
//   }
// },


postCheckOut: async (req, res) => {
  let userId = req.session.user._id
  
  
  try {
    const data = req.body;
      
    try {
      const response = await orderHelper.placeOrder(data,userId);
      const total = data.total
      

     

      if (data.payment_option === "COD") {
        res.json({ codStatus: true })

      }else if(data.payment_option === "razorpay"){

        orderHelper.generateRazorpay('hi',response.total).then((result)=>{
          result.codeStatus = false;
          res.json(result)
        })
       } else if (data.payment_option === 'wallet') {
        res.json({ orderStatus: true, message: 'order placed successfully' })
    }


    } catch (error) {
      console.error({ error: error.message });
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
},




// GET EDIT ADDRESS
getEditAddress:(req,res)=>{
  let userId = req.session.user._id
  let addressId = req.params.id
  orderHelper.getEditAddress(addressId,userId).then((currentAddress)=>{
      res.send(currentAddress)
  })
},






// PATCH EDIT ADDRESS
patchEditAddress:(req,res)=>{
  let addressId = req.params.id
  let userId = req.session.user._id
  let userData = req.body
  orderHelper.patchEditAddress(userId,addressId,userData).then((response)=>{
      res.send(response)
  })
},



//CANCEL ORDER
cancelOrder: (req, res) => {
  let orderId = req.query.id;
  let total = req.query.total;
  let userId = req.session.user._id
 
  orderHelper.cancelOrder(orderId).then((canceled) => {
     orderHelper.addWallet(userId, total).then((walletStatus) => {
      res.send(canceled)
      })
  })
},


// RETURN ORDER
returnOrder: (req, res) => {
  let orderId = req.query.id
  let total = req.query.total
  let userId = req.session.user._id
  orderHelper.returnOrder(orderId, userId).then((returnOrderStatus) => {
      orderHelper.addWallet(userId, total).then((walletStatus) => {
          orderHelper.updatePaymentStatus(orderId, userId).then((paymentStatus) => {
          res.send(returnOrderStatus)
          })
      })
  })
},






// ORDER DETAILS
orderDetails: async (req, res) => {
  let user = req.session.user;
  
  let count = await cartHelper.getCartCount(user._id)
  let userId = req.session.user._id;
  let orderId = req.params.id;
  orderHelper.findOrder(orderId, userId).then((orders) => {
      orderHelper.findAddress(orderId, userId).then((address) => {
          orderHelper.findProduct(orderId, userId).then((product) => {

            let data = orderHelper.createData(orders, product, address)
             
              res.render('user/order-details', { layout: 'layout' , data, user, count, product, address, orders, orderId })
          })
      })
  })
},


// CANCEL ORDER STATUS
changeOrderStatus: (req, res) => {
  let orderId = req.body.orderId
  let status = req.body.status
  orderHelper.changeOrderStatus(orderId, status).then((response) => {
    
      res.send(response)
  })
},



verifyPayment: (req, res) => {
  // orderHelper.verifyPayment(req.body).then(() => {
  //     orderHelper.changePaymentStatus(req.session.user._id, req.body["order[receipt]"], req.body["payment[razorpay_payment_id]"])
  //         .then(() => {
  //             res.json({ status: true })
  //         })
  //         .catch((err) => {
  //             res.json({ status: false })
  //         })
  // })

  res.status(200).json({status: true});

},





// RETURN ORDER POST
returnOrder: (req, res) => {
  let orderId = req.query.id
  let total = req.query.total
  let userId = req.session.user._id
  orderHelper.returnOrder(orderId, userId).then((returnOrderStatus) => {
      // orderHelpers.addWallet(userId, total).then((walletStatus) => {
          // orderHelpers.updatePaymentStatus(orderId, userId).then((paymentStatus) => {
          res.send(returnOrderStatus)
          // })
      // })
  })
},


















}