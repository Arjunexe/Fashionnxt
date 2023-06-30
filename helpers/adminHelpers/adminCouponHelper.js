const db = require ('../../models/connection')
const voucherCode = require('voucher-code-generator')




//COUPON


module.exports = {



// GENERATE COUPON CODE
  generatorCouponCode: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let couponCode = voucherCode.generate({
                length: 12,
                count: 1,
                charset: "0123456789abcdefghijklmnopqrstuvw",
                prefix: "fashionxt",
            });
            resolve({ status: true, couponCode: couponCode[0] });
        } catch (err) {
        }
    });
},

// POST ADD COUPON
postaddCoupon: (data) => {
  try {
      return new Promise((resolve, reject) => {
          db.Coupon.findOne({ couponCode: data.couponCode }).then((coupon) => {
              if (coupon) {
                  resolve({ status: false })
              } else {
                  db.Coupon(data).save().then((response) => {
                      resolve({ status: true })
                  })
              }
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},




// GET COUOPON LIST
getCouponList: () => {
  return new Promise((resolve, reject) => {
      db.Coupon.find().sort({createdAt : -1}).then((coupons) => {
         
          resolve(coupons)
      })
  })
},



// REMOVE COUPON
removeCoupon: (couponId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Coupon.deleteOne({ _id: couponId }).then(() => {
                resolve()
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},






}