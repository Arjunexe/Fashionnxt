require('dotenv').config()
const userhelpers = require("../../helpers/userHelpers/userHelpers")
const db = require("../../models/connection")
const { sendOtpApi, otpVerify } = require('../../api/twilio')
const session = require('express-session')
const cartHelper = require('../../helpers/userHelpers/cartHelper')
const userHelpers = require('../../helpers/userHelpers/userHelpers')



let userSession;


module.exports = {

  // user home page

  getHome: async (req, res) => {


    if (req.session.user) {

      userSession = req.session.user

      res.render('user/user', { userSession })
    } else {
      res.render('user/user')

    }

  },

  getUserLogin: (req, res) => {

    if (req.session.user) {

      res.redirect('/')
    } else {

      res.render('user/login')
    }
  },


  // MAIN USERLOGIN

  // postUserLogin: (req, res) => {

  //   userhelpers.doLogin(req.body).then((response) => {
  //     req.session.user = response.user
  //     req.session.status = true

  //     

  //     if (loggedinstatus == true) {
  //       res.redirect('/')
  //     } else {

  //       res.render('user/login', {loggedinstatus })

  //     }
  //   })

  // },

  postUserLogin: (req, res) => {
    let data = req.body
    userhelpers.doLogin(data).then((loginAction) => {
      if (loginAction.status) {
        req.session.user = loginAction.user
        req.session.status = true

        res.send(loginAction)
      } else {
        res.send(loginAction)
      }
    })
  },











  getSignUp: (req, res) => {
    emailStatus = true
    if (req.session.loggedIn) {
      res.redirect('/login')
    } else {
      res.render("user/signup");
    }
  },




  // postSignUp: (req, res) => {
  //   userhelpers.doSignUp(req.body).then((response) => {

  //     let emailStatus = response.status
  //     if (emailStatus == false) {
  //       res.redirect('/login')
  //     } else {

  //       res.render('user/signup', )
  //     }

  //   })
  // },

  postSignup: (req, res) => {
    let data = req.body
    userhelpers.doSignUp(data).then((response) => {
      req.session.user = response.data
     
      req.session.loggedIn = true
      res.send(response)
    })
  },









  getLogout: (req, res) => {

    req.session.user = null;
    req.session.loggedIn = false;

    res.redirect("/login");

  },

//  OTP LOGIN
  // otpLogin: async (req, res) => {
  //   const mobileNumber  = req.body.mobileNumber;
  //   req.session.number = mobileNumber;
  //   try {
  //     userhelpers.getUserNumber(mobileNumber).then((user) => {

  //     if (user.status !== true) {
  //       return res.status(200).json({ error: true, message: 'Wrong Mobile Number' });
  //     }
  //     sendOtpApi(mobileNumber).then((result)=> {

  //       if (!result) {
  //         return res.status(200).json({ error: true, message: 'Something went wrong' });
  //       }
  //       res.status(200).json({ error: false, message: 'Otp has been send successfully' });
  //     })
  //   })
  //   } catch (error) {
  //     res.status(500).json({ message: 'Internal server error occured' });
  //   }
  // },


//   OTP VERIFY  
  // otpVerify: async (req, res) => {

  //   const { otp } = req.body;


  //   let number = req.session.number
  
  //   const user = await db.user.findOne({ phonenumber: number }).lean().exec()
  //   req.session.user = user;
  //   try {
  //     const status = await otpVerify(otp, number)

  //     if (!status) {
  //       res.status(200).json({ error: false, message: 'Something went wrong' })
  //     }
  //     res.status(200).json({ error: false, message: 'Otp has been verified' })

  //   } catch (error) {
  //     res.status(500).json({ message: 'Internal server error occured' })
  //   }
  // },

//    OTP RESEND OTP
  // resendOtp: async (req, res) => {
  //   let mobileNumber = req.session.number

  //   try {
  //     const status = await sendOtpApi(mobileNumber);
  //     if (!status) {
  //       return res.status(200).json({ error: true, message: 'Something went wrong' });
  //     }
  //     res.status(200).json({ error: false, message: 'Otp has been send successfully' });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Internal server error occured' });
  //   }

  // },


  // getShop: (req, res) => {

  //   userSession = req.session.user

  //   userhelpers.getShopProducts(req.body).then((product) => {

    
  //       res.render('user/shop', { layout: "layout", userSession, product })
      


  //   })

  // },

  //SHOP
  // getShop: (req, res) => {

  //   userSession = req.session.user

  //   userhelpers.getShopProducts(req.body).then((product) => {

  //     if (req.session.user) {

  //       res.render('user/shop', { layout: "layout", userSession, product })
  //     } else {
  //       res.render('user/shop', { product })
  //     }


  //   })

  // },

  getShopPage: async (req, res) => {
    try {
        let userSession = req.session.user   
   
     
    
       

       
        const page = parseInt(req.query?.page) || 1
        console.log('3');
        const perPage = 6
        if (req.query?.search || req.query?.sort || req.query?.filter) {
            console.log('4');
            const { product, currentPage, totalPages, noProductFound } = await userhelpers.getQueriesOnShop(req.query)
            console.log('5');
            noProductFound ?
          
                req.session.noProductFound = noProductFound
             
                : req.session.selectedProducts = product
            res.render('user/shop', { layout: 'Layout', product, userSession, totalPages, currentPage, productResult: req.session.noProductFound })
        } else {
            let currentPage = 1
            const { product, totalPages } = await userHelpers.getAllProducts(page, perPage);
            if (product?.length != 0)
                req.session.noProductFound = false
            res.render('user/shop', { layout: 'Layout', product, userSession, currentPage,totalPages, productResult: req.session.noProduct })
            req.session.noProductFound = false
        }

    } catch (error) {
        console.log(error)
    }
},






  // getShop: (req, res) => {
  //   let userSession = req.session.user;

  //   userhelpers.getShopProducts(req.body)
  //     .then((product) => {
  //       if (req.session.user) {
  //         res.render('user/shop', { layout: 'layout', userSession, product });
  //       } else {
  //         res.render('user/shop');
  //       }
  //     })
  //     .catch((error) => {
  //       // Handle the error appropriately
  //       console.error(error);
  //       res.status(500).send('Internal Server Error');
  //     });
  // }










  // getProductDetail:(req,res)=>{
  //   userSession=req.session.user
  //   res.render('user/productDetails',{userSession})
  // },
     


  //    REAL 
  // getProductDetail: async (req, res) => {
  //   let proId = req.params.id
  //   userSession = req.session.user
  //   let count = await cartHelper.getCartCount(userSession._id)

  //   userhelpers.getProductDetail(proId).then((product) => {

  //     res.render('user/productDetails', { product, userSession, count })
  //   })
  // },

  getProductDetail : async (req, res) => {
    try {
      const proId = req.params.id;
      
      const userSession = req.session.user;
     
      const addPro = await userhelpers.addProduct(proId,userSession._id)
      // const count = await cartHelper.getCartCount(userSession._id);
      
      const product = await userhelpers.getProductDetail(proId);
      let response
      res.render('user/productDetails', { product, userSession, addPro });
    } catch (error) {
    
      console.error('Error in getProductDetail:', error);
      res.status(500).send('Internal Server Error');
    }
  },






  getDetails: (userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.user.findOne({ _id: userId }).then((user) => {
                resolve(user)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},














}
