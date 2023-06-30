const express = require('express');
const router = express.Router();
const auth = require('../middlewares/middleware')

const adminController = require ('../controller/adminController/adminLogin');
const user = require ('../models/connection')
const multer = require('../config/multer')
const adminOrderController = require ('../controller/adminController/adminOrder')
const orderController = require ('../controller/userController/orderController')



// router.post('/',adminController.postAdminlogin)
router.get('/',auth.adminauth,adminController.getDashboard)


// GET LOGIN
router.get('/login',auth.adminauth,adminController.getLogin)


// POST LOGIN
router.post('/login',adminController.postLogin)


// GET LOGOUT
router.get('/logout',adminController.getLogout)



// GET USER LIST 
router.get('/userList',adminController.getUser)



// CHANGE USER STATUS
router.put('/change_user_status',adminController.changeUserStatus)



// PRODUCT LIST
router.get('/productList',auth.adminauth, adminController.getProductList)



// ADD PRODUCT
router.get('/addProduct',auth.adminauth,adminController.getAddProduct)



// EDIT PRODUCT
router.get('/editProduct/:id',auth.adminauth,adminController.getEditProduct)



//DELETE PRODUCT-------------------
// router.delete('/deleteProduct/:id',adminController.deleteProduct)



//POST EDIT PRODUCT
router.post('/editProduct/:id',multer.editeduploads,adminController.postEditProduct)




//POST ADD PRODUCT
router.post('/addProduct',multer.uploads, adminController.postAddProduct);



//ADD CATEGORY
router.get('/addCategory',auth.adminauth, adminController.getAddCategory)




//POST ADD CATEGORY
router.post('/addCategory',adminController.postAddCategory)




//EDIT CATEGORY
router.route('/api/edit-category/:id').get(auth.adminauth,adminController.handleEditCategorys).patch(adminController.handleEditCategoryPatch);




//GET SUB CATEGORY
router.route('/getSubcategories').post(adminController.getSubCategory)




//REMOVE SUB CATEGORY
router.route('/remove-subCategory/:id').delete(adminController.removeSubCategory)



//DELETE CATEGORY
router.delete('/api/delete-category/:id',adminController.deleteCategory)



// LIST AND UNLIST
router.put('/unlistProduct', adminController.UnlistProduct)




// GET ORDER LIST   
  router.get('/order-list/:id',auth.adminauth,adminOrderController.getOrderList)




// GET ORDER DETAILS
 router.get('/order-details',auth.adminauth,adminOrderController.getOrderDetails)





 // STATUS ORDER DETAILS
router.post('/change-order-status',orderController.changeOrderStatus)



                                //-------COUPON---------//

// GET COUPON LIST
router.get('/couponList',adminOrderController.getCoupon)


// ADD COUPON
router.route('/add-coupon').get(auth.adminauth,adminOrderController.getAddCoupon).post(adminOrderController.postaddCoupon)


// GENERATE COUPON 
router.route('/generate-coupon-code').get(auth.adminauth,adminOrderController.generatorCouponCode)

// REMOVE COUPON
router.route('/remove-coupon').delete(adminOrderController.removeCoupon)




// SALES REPORT
router.route('/sales-report').get( auth.adminauth,adminController.getSalesReport).post(adminController.postSalesReport)

















module.exports = router;
