const users = require("../models/connection")

module.exports = {


  userauth:(req,res,next)=>{

    if(req.session.user){
      next()
    }else{
      res.render('user/login',{layout:"empty-layoutUser"})    // |user/login
    }
   
  },

  adminauth:(req,res,next)=>{
    if(req.session.admin){
      next()
    }else{
      res.render('admin/admin-login',{layout:'empty-layout'})
    }
  }


}
