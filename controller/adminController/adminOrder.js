const session = require('express-session')
const adminHelper = require('../../helpers/adminHelpers/adminLoginHelper')
const auth = require ('../../middlewares/middleware')
// const adminOrderHelper = require ('../../helpers/adminHelpers/adminOrderHelper')
const orderHelpers = require ('../../helpers/userHelpers/orderHelper')
const userController = require ('../../controller/userController/userController')
const couponHelper = require ('../../helpers/adminHelpers/adminCouponHelper')

// COUPON,BANNER,

module.exports = {


// GET ORDER LIST 
getOrderList: (req, res) => {
  let userId = req.params.id
  let admin = req.session.admin
  // orderHelpers.getAddress(userId).then((address) => {
  adminHelper.getUserList(userId).then((user) => {
     
      orderHelpers.getOrders(userId).then((order) => {
         
          res.render('admin/orderList', { layout: 'admin-layout', user, userId, admin, order, userPage: true })
      })
  })

},



//  GET ORDER DETAILS
getOrderDetails: async (req, res) => {
  let admin = req.session.admin
  let orderId = req.query.orderId
  let userId = req.query.userId
  let userDetails = await userController.getDetails(userId)
  orderHelpers.getOrderAddress(userId, orderId).then((address) => {
      orderHelpers.getSubOrders(orderId, userId).then((orderDetails) => {
          orderHelpers.getOrderedProducts(orderId, userId).then((product) => {
              orderHelpers.getTotal(orderId, userId).then((productTotalPrice) => {
                  orderHelpers.getOrderTotal(orderId, userId).then((orderTotalPrice) => {
                    
    
           res.render('admin/orderDetails', { layout: 'admin-layout', admin, userDetails, address, product, orderId,orderDetails, productTotalPrice, orderTotalPrice
                      })
                  })
              })
          })
      })
  })
},




// GET COUPON LIST  
getCoupon:(req,res)=>{
    if (req.session.admin) {

        let admin = req.session.admin
        couponHelper.getCouponList().then((couponList)=>{
        res.render('admin/couponList', { layout: 'admin-layout', admin , couponList, coupon: true})
        })    
      } else {
        res.redirect('/admin/admin-login')
      }
},




// GENERATE COUPON CODE
generatorCouponCode: (req, res) => {
    couponHelper.generatorCouponCode().then((couponCode) => {
      
        res.send(couponCode)
    })
},


// POST ADD COUPON
postaddCoupon: (req, res) => {
    let data = {
        couponCode: req.body.coupon,
        validity: req.body.validity,
        minPurchase: req.body.minPurchase,
        minDiscountPercentage: req.body.minDiscountPercentage,
        maxDiscountValue: req.body.maxDiscount,
        description: req.body.description
    }
    couponHelper.postaddCoupon(data).then((response) => {
        res.send(response)
    })
},


getCouponList: (req, res) => {
    let admin = req.session.admin
    couponHelper.getCouponList().then((couponList) => {
        res.render('admin/couponList', { layout: 'adminLayout', admin, couponList })
    })
},




removeCoupon: (req, res) => {
    let couponId = req.body.couponId
    couponHelper.removeCoupon(couponId).then((successResponse) => {
        res.send(successResponse)
    })
},



getAddCoupon: (req, res) => {
    let admin = req.session.admin
    res.render('admin/addCoupon', { layout: 'admin-layout', admin, coupon: true  })
},








}