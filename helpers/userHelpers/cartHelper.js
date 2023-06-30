const { response } = require('express')

const db = require('../../models/connection')
const { ObjectId } = require('mongodb');




module.exports = {

// ADD TO CART
  addToCart: (proId, userId) => {
   
    let proObj = {
      productId: proId,
      quantity: 1
    }
    try {
      return new Promise((resolve, reject) => {

        db.Cart.findOne({ user: userId }).then(async (cart) => {

          if (cart) {
            let productExist = cart.cartItems.findIndex((cartItems) => cartItems.productId == proId);

            if (productExist != -1) {

              db.Cart.updateOne({ user: userId, "cartItems.productId": proId }, {
                $inc: { "cartItems.$.quantity": 1 }
              }).then((response) => {
                resolve({ response, status: false })

              })

            } else {
              db.Cart.updateOne({ user: userId }, { $push: { cartItems: proObj } }).then((response) => { resolve({ status: true }) })
            }

          } else {
            let newCArt = await db.Cart({ user: userId, cartItems: proObj })
            await newCArt.save().then((response) => { resolve({ status: true }) })

          }

        }
        )

      })

    } catch (error) {
      console.log(error.message);
    }

  },




  // GET CART COUNT
  getCartCount: (userId) => {
    
    return new Promise((resolve, reject) => {
     
      let count = 0
      db.Cart.findOne({ user: userId }).then((cart) => {
       
        if (cart) {
          count = cart.cartItems.length;
        }
        
        resolve(count)
        
      })
    })
  },




  // UPDATE QUANTITY
  updateQuantity: (data) => {
    let cartId = data.cartId
    let proId = data.proId
    let userId = data.userId
    let count = data.count
    let quantity = data.quantity
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
          db.Cart.updateOne(
            { _id: cartId },
            {
              $pull: { cartItems: { productId: proId } }
            }).then(() => {
              resolve({ status: true })
            })
        } else {
          db.Cart.updateOne(
            { _id: cartId, "cartItems.productId": proId },
            {
              $inc: { "cartItems.$.quantity": count }
            }).then(() => {
              db.Cart.findOne(
                { _id: cartId, "cartItems.productId": proId },
                { "cartItems.$": 1 }
              ).then((cart) => {
                const newQuantity = cart.cartItems[0].quantity;
                resolve({ status: true, newQuantity: newQuantity });
              });
            })
        }
      })
    } catch (error) {
      console.log(error.message);
    }

  },




  // GET CART ITEMS
  getCartItems: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        db.Cart.aggregate([
          {
            $match: {
              user: new ObjectId(userId)
            },
          },
          {
            $unwind: '$cartItems'
          },
          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity"
            }
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted"
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              carted: { $arrayElemAt: ["$carted", 0] }
            }
          }
        ])
          .then((cartItems) => {
            

            for(let i=0; i<cartItems.length; i++){
              cartItems[i].subtotal = cartItems[i].carted.price*cartItems[i].quantity
            }
            
            resolve(cartItems)
          })
      })
    } catch (error) {
      console.log(error.message);
    }
  },




  // TOTAL AMOUNT 
  totalCheckOutAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.Cart
        .aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$cartItems",
          },

          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },

          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },    
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .then((total) => {
          resolve(total[0]?.total);
        });
    });
  },





  // SUB TOTAL
  getSubTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.Cart
        .aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },

          {
            $unwind: "$cartItems",
          },

          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },

          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,

              price: {
                $arrayElemAt: ["$carted.price", 0],
              },
            },
          },
          {
            $project: {
              total: { $multiply: ["$quantity", "$price"] },
            },
          },
        ])
        .then((total) => {
       
          resolve(total);
        });
    });
  },




  //  DELETE PRODUCT
  deleteProduct: async(data)=>{
    let cartId = data.cartId
    let proId = data.proId
     
    return new Promise((resolve,reject) =>{ 
      db.Cart.updateOne({_id: cartId},{$pull: {cartItems: {productId: proId}}}).then(() =>{ resolve ({status: true})})
     
    })
    .catch((error) =>{
      console.log(error.message);
    })
  },







}