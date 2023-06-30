const { response } = require('express')
const session = require('express-session')

const cartHelper = require('../../helpers/userHelpers/cartHelper')









module.exports = {



  // GET CART
  getCart: async (req, res) => {
  try{ 
    
    if (req.session.user) {
      
    
      let userId = req.session.user._id
    
      let userSession = req.session.user
      

      let subTotal = await cartHelper.getSubTotal()
      
      let total = await cartHelper.totalCheckOutAmount(userId)
      

      cartHelper.getCartItems(userId).then((cartItems)=>{
       
      cartHelper.getCartCount(userId).then((count)=>{
      res.render('user/cart',{ layout: "layout",cartItems, subTotal, total, userSession,count})

        })
      }) 

    } else {
      res.render('user/GuestCart')
    }
  }
    catch(err){
      console.log(err)
    }
  },





  // POST ADD TO CART
  addToCart: (req, res) => {

    cartHelper.addToCart(req.params.id,req.session.user._id).then((response)=>{
     
      res.send(response)
    })
  },





  // POST UPDATE QUANTITY CART
  updateQuantity:(req,res)=>{
    let userId = req.session.user._id
    cartHelper.updateQuantity(req.body).then(async (response) => {
      response.total = await cartHelper.totalCheckOutAmount(userId)
      response.subTotal = await cartHelper.subtotal(userId)
        res.json(response)
    })
  },



  // DELETE PRODUCT
  deleteProduct:(req,res)=>{
      
    cartHelper.deleteProduct(req.body).then((response)=>{
      res.send(response)
    })


  },



  







}


