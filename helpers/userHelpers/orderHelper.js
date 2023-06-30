const db = require ('../../models/connection')
const { ObjectId, DBRef, Db } = require('mongodb');
const { promises } = require('dns');
const { resolve } = require('path');
require('dotenv').config()


const Razorpay = require('razorpay');

const key_secret = process.env.RZP_SECRET_KEY;
const key_id = process.env.RZP_KEY_ID;

var instance = new Razorpay({
  key_id: 'rzp_test_2iHDAx3U2Gm7Yb',
  key_secret: 'QqgFekhlVRWUKcTFkcw0Yghr',
});




module.exports = {



  // GET ADDRESS
  getAddress: (userId) => {
    return new Promise((resolve, reject) => {
        db.Address.findOne({ user: userId }).then((response) => {
            resolve(response)
        })

    })
},


// POST ADDRESS
  postAddress: (data, userId) => {
    try {
     
        return new Promise((resolve, reject) => {
            let addressInfo = {
                fname: data.fname,
                lname: data.lname,
                street: data.street,
                appartment: data.appartment,
                city: data.city,
                state: data.state,
                zipcode: data.zipcode,
                phone: data.phone,
                email: data.email
            }

            db.Address.findOne({ user: userId }).then(async (ifAddress) => {
                if (ifAddress) {
                    db.Address.updateOne(
                        { user: userId },
                        {
                            $push: { Address: addressInfo }
                        }
                    ).then((response) => {
                        resolve(response)
                       
                    })
                } else {
                    let newAddress = db.Address({ user: userId, Address: addressInfo })

                    await newAddress.save().then((response) => {
                        resolve(response)
                    })
                }
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },







// GET ORDER REAL
getOrders: (userId) => {
  try {
      return new Promise((resolve, reject) => {
          db.Order.findOne({ user: userId }).then((user) => {
              resolve(user)
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},






//USER PROFILE DETAILS
// getuserD:(userId) =>{
//     try {
//         return new Promise((resolve,reject) =. {
//             db.
//         })
//     } catch (error) {
//         console.log(error.message);
//     }
// }


// getOrders: (userId) => {
//     try {
//       return new Promise((resolve, reject) => {
//         db.Order.find({ user: userId })
//            // Sort by the "createdAt" field in descending order
//           .then((user) => {
//             console.log(user,'usssssssssserrrrrrrrrrr');
//             resolve(user);
//           });
//       });
//     } catch (error) {
//       console.log(error.message);
//     }
//   },
  



// getOrders: (userId) => {
//     try {
//       return new Promise((resolve, reject) => {
//         db.Order.findOne({ user: userId }).then((user) => {
//           // Retrieve the orders array from the user object
//           const orders = user.orders;
  
//           // Sort the orders array in descending order based on createdAt timestamps
//           orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
//           resolve(orders);
//         });
//       });
//     } catch (error) {
//       console.log(error.message);
//     }
//   },


  
  




// PLACE ORDER
placeOrder: (data,userId) => {
  
    try {
        let flag = 0
       
        return new Promise(async (resolve, reject) => {
            let productDetails = await db.Cart.aggregate([
                {
                    $match: {
                        user: new ObjectId(userId)
                    }
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
                        as: "productDetails"
                    }
                },
                {
                    $unwind: "$productDetails"

                },
                {
                    $project: {

                        productId: "$productDetails._id",
                        productName: "$productDetails.name",
                        productPrice: "$productDetails.price",
                        brand: "$productDetails.brand",
                        quantity: "$quantity",
                        category: "$productDetails.category",
                        image: "$productDetails.img"
                    }
                }
            ])
           

            let Address = await db.Address.aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: "$Address"
                },
                {
                    $match: { "Address._id": new ObjectId(data.address) }
                },
                {
                    $project: { item: "$Address" }
                }
            ])
            

            let status, orderStatus;
            if (data.payment_option === "COD" || data.payment_option==="razorpay") {
                status = "Placed",
                    orderStatus = "Success"

            } else if (data.payment_option === 'wallet'){
                let userData = await db.user.findById({_id: data.user})
                if(userData.wallet < data.total){
                    flag = 1
                    reject(new Error("Insufficient Wallet Balance"))
                }else {
                    userData.wallet = data.total
                    await userData.save(
                        status = 'placed',
                        orderStatus = 'success'
                    )
                }

            } 
            
            else {
                status = "Pending",
                    orderStatus = "Pending"
            }

            let orderData = {
                name: Address[0].item.fname,
                paymentStatus: status,
                paymentMethod: data.payment_option,
                productDetails: productDetails,
                shippingAddress: Address,
                orderStatus: orderStatus,
                totalPrice: data.discountedAmount
            }
            let order = await db.Order.findOne({ user: userId })


            if (flag == 0) {
                if (order) {
                    await db.Order.updateOne(
                        { user: data.user },
                        {
                            $push: { orders: orderData }
                        }
                    )
                } else {
                    let newOrder = db.Order({
                        user: data.user,
                        orders: orderData
                    })
                    await newOrder.save()
                }


                db.Cart.findOne({user: userId}).populate('cartItems.productId').lean().exec().then(async(cart)=> {
                    let total=0, result = {};
                    console.log('userID', userId);
                    console.log('cart', cart);

                    for (let i = 0; i < cart.cartItems.length; i++) {
                        total += cart.cartItems[i].productId.price * cart.cartItems[i].quantity;
                    }

                    //inventory management 
                    // update product quantity in the database
                    for (let i = 0; i < productDetails.length; i++) {
                        let purchasedProduct = productDetails[i];
                        let originalProduct = await db.Product.findById(purchasedProduct.productId);
                        let purchasedQuantity = purchasedProduct.quantity;
                        originalProduct.quantity -= purchasedQuantity;
                        await originalProduct.save();
                        await db.Cart.deleteMany({ user: data.user })
                    }


                    result.total = total;
                    result.orderDetails = productDetails;
                    console.log(result, 'results');
                    resolve(result)
                })

                



            }

        })
    } catch (error) {
        throw error;
    }
},






generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
        instance.orders.create({
            amount: total,
            currency: "INR",
            receipt: 'orderId',
            notes: {
              key1: "value3",
              key2: "value2"
            }
          }).then((res) => {
            console.log('razorpay instance:: ', res);
            resolve(res);
          }).catch((err)=> {
            console.log('generate error', err);
          })
    })
},







 // GET ORDER ADDRESS
getOrderAddress: (userId, orderId) => {
    return new Promise((resolve, reject) => {
        db.Order.aggregate([
            {
                $match: {
                    "user": new ObjectId(userId)
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $match: {
                    "orders._id": new ObjectId(orderId)
                }
            },
            {
                $unwind: "$orders.shippingAddress"
            },
            {
                $project: {
                    "shippingAddress": "$orders.shippingAddress"
                }
            }
        ]).then((address) => {
            resolve(address)
        })

    })
},






// GET SUBORDER
getSubOrders: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        'user': new ObjectId(userId)
                    }
                },
                {
                    $unwind: '$orders'
  
                },
                {
                    $match: {
                        'orders._id': new ObjectId(orderId)
                    }
                }
  
            ]).then((order) => {
                resolve(order)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },





// GET ORDERED PRODUCTS
getOrderedProducts: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.productDetails"
                },
                {
                    $project: {
                        "productDetails": "$orders.productDetails"
                    }
                }
            ]).then((response) => {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },
  
  





// GET TOTAL
getTotal: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.productDetails"
                },
                {
                    $project: {
                        "productDetails": "$orders.productDetails",
  
                        "totalPrice": { $multiply: ["$orders.productDetails.productPrice", "$orders.productDetails.quantity"] }
                    }
                }
            ]).then((response) => {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },
  
  






// GET OREDERED TOTAL
getOrderTotal: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.productDetails"
                },
                {
                    $group: {
                        _id: "$orders._id",
                        totalPrice: { $sum: "$orders.productDetails.productPrice" }
                    }
                }
  
            ]).then((response) => {
                if (response && response.length > 0) {
                    const orderTotal = response[0].totalPrice
                    resolve(orderTotal)
                }
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },





  // GET EDIT ADDRESS
  getEditAddress: (addressId, userId) => {
    return new Promise((resolve, reject) => {
        db.Address.aggregate([
            {
                $match: {
                    user: new ObjectId(userId)
                }
            },
            {
                $project: {
                    address: {
                        $filter: {
                            input: "$Address",
                            as: "item",
                            cond: { $eq: ["$$item._id", new ObjectId(addressId)] }
                        }
                    }
                }
            }
        ])
            .then(result => {
                if (result.length === 0) {
                    resolve(null); // Address not found
                } else {
                    resolve(result[0].address[0]); // Return the matched address
                }
            })
            .catch(error => {
                reject(error);
            });
    });
},





// PATCH EDIT ADDRESS
patchEditAddress: (userId, addressId, UserData) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.Address
                .updateOne(
                    {
                        user: new ObjectId(userId),
                        "Address._id": new ObjectId(addressId),
                    },
                    {
                        $set: {
                            "Address.$": UserData,
                        },
                    }
                )
                .then((response) => {
                    resolve(response);
                });
        } catch (error) {
            reject(error);
        }
    });
},








//CANCEL ORDER
cancelOrder: (orderId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.find({ 'orders._id': orderId }).then((orders) => {
                let orderIndex = orders[0].orders.findIndex((orders) => orders._id == orderId);
                let order = orders[0].orders.find((order) => order._id == orderId);

             if (order.paymentMethod === 'COD' && order.orderConfirm === 'Delivered' && order.paymentStatus === 'paid') {
                    // Update order status in the database
                    db.Order.updateOne(
                        { 'orders._id': orderId },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.orderConfirm']: 'Canceled',
                                ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                            }
                        }
                    ).then((orders) => {
                        resolve(orders)
                    });
                } else {
                    // Update order status in the database
                    db.Order.updateOne(
                        { 'orders._id': orderId },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.orderConfirm']: 'Canceled'
                            }
                        }
                    ).then((orders) => {
                        resolve(orders)
                    });
                }
            });
        });
    } catch (error) {
        console.log(error.message);
    }
},


// RETURN ORDER
returnOrder: (orderId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.find({ 'orders._id': orderId }).then((orders) => {

                let orderIndex = orders[0].orders.findIndex(
                    (orders) => orders._id == orderId
                );
                let order = orders[0].orders.find((order) => order._id == orderId);

                if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'Paid') {
                    // Fetch payment details from Razorpay API
                    instance.payments.fetch(order.paymentId).then((payment) => {
                        if (payment.status === 'captured') {
                            // Initiate refund using the payment ID and refund amount
                            instance.payments.refund(order.paymentId, { amount: order.totalPrice * 100 }).then((refund) => {
                                // Update order status in the database
                                orderModel.Order.updateOne(
                                    { 'orders._id': orderId },
                                    {
                                        $set: {
                                            ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                            ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                        }
                                    }
                                ).then((orders) => {
                                    resolve(orders);
                                });
                            }).catch((error) => {
                                console.log(error);
                                reject(error);
                            });
                        } else {
                            console.log('Payment not captured');
                            reject('Payment not captured');
                        }
                    }).catch((error) => {
                        console.log(error);
                        reject(error);
                    });
                } else if (order.paymentMethod === 'COD' || order.paymentMethod === 'wallet') {
                    // Update order status in the database
                    db.Order.updateOne(
                        { 'orders._id': orderId },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                            }
                        }
                    ).then((orders) => {
                        resolve(orders);
                    });
                } else {
                    console.log('Invalid payment method');
                    reject('Invalid payment method');
                }
            });
        });
    } catch (error) {
        console.log(error.message);
    }
},




// FIND ORDER
findOrder: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "orders._id": new ObjectId(orderId),
                        user: new ObjectId(userId)
                    }  
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                }
            ]).then((response) => {
                let orders = response.map((element) => element.orders);
                resolve(orders);
            });
        });
    } catch (error) {
        console.log(error.message);
    }
},



findProduct: async(orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "orders._id": new ObjectId(orderId),
                        user: new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                }
            ]).then((response) => {
                let product = response.map((element) => element.orders.productDetails);
                resolve(product);
            });
        });
    } catch (error) {
        console.log(error.message);
    }
},







// FIND PRODUCT
// findProduct: (orderId, userId) => {
//     try {
//         return new Promise((resolve, reject) => {
//             db.Order.aggregate([
//                 {
//                     $match: {
//                         "orders._id": new ObjectId(orderId),
//                         user: new ObjectId(userId)
//                     }
//                 },
//                 {
//                     $unwind: "$orders"
//                 },



//             ]).then((response) => {
//                 let product = response.filter((element) => {
//                     if (element.orders._id == orderId) {

//                         return true;
//                     }
//                     return false;
//                 }).map((element) => element.orders.productDetails);
//                 resolve(product)
//             })
//         })
//     } catch (error) {
//         console.log(error.message);
//     }
// },





// FIND ADDRESS
findAddress: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "orders._id": new ObjectId(orderId),
                        user: new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $unwind: "$orders.shippingAddress"
                },
                {
                    $replaceRoot: { newRoot: "$orders.shippingAddress.item" }
                },
                {
                    $project: {
                        _id: 1,
                        fname: 1,
                        lname: 1,
                        street: 1,
                        appartment: 1,
                        city: 1,
                        state: 1,
                        zipcode: 1,
                        phone: 1,
                        email: 1
                    }
                }
            ]).then((response) => {
                // console.log(response[0].phone,'[[');
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},





changeOrderStatus: (orderId, status) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.updateOne(
                { 'orders._id': orderId },
                {
                    $set: { 'orders.$.orderConfirm': status }
                }).then((response) => {

                    resolve(response)
                })
        })
    } catch (error) {
        console.log(error.message);
    }
},






verifyPayment: (details) => {
    try {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            let hmac = crypto.createHmac("sha256", key_secret);
            hmac.update(
                details["payment[razorpay_order_id]"] +
                "|" +
                details["payment[razorpay_payment_id]"]
            );
            hmac = hmac.digest("hex");
            if (hmac == details["payment[razorpay_signature]"]) {
                resolve();
            } else {
                reject("not match");
            }
        })
    } catch (error) {
        console.log(error.message);
    }
},




changePaymentStatus: (userId, orderId, paymentId) => {
    console.log(paymentId, 'data----');
    try {
        return new Promise(async (resolve, reject) => {
            await db.Order.updateOne(
                { "orders._id": orderId },
                {
                    $set: {
                        "orders.$.orderConfirm": "Success",
                        "orders.$.paymentStatus": "Paid",
                        "orders.$.paymentId": paymentId
                    }
                }
            ),
                db.Cart.deleteMany({ user: userId }).then(() => {
                    resolve()
                })
        })
    } catch (error) {
        console.log(error.message);
    }
},





addWallet: (userId, total) => {
    try {
        return new Promise((resolve, reject) => {
          
            db.user.updateOne({ _id: userId },
                {
                    $inc: { wallet: total }
                }).then((response) => {
                    resolve(response)
                })
        })
    } catch (error) {
        console.log(error.message);
    }
},



 updatePaymentStatus: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                db.Order.aggregate([
                    {
                        $match: {
                            'user': new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: '$orders'
                    },
                    {
                        $match: {
                            'orders._id': new ObjectId(orderId)
                        }
                    },
                    {
                        $set: {
                            'orders.paymentStatus': 'refunded'
                        }
                    }
                ]).then((response) => {
                    console.log(response, '$$$$$$$$$$$$$$$');
                    resolve(response)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },




    // INVOICE
    createData: (orders, product, address) => {


       
      
        var data = {
            // Customize enables you to provide your own templates
            // Please review the documentation for instructions and examples
            customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
                // The logo on top of your invoice
                logo: "",
                // The invoice background
                background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
            },
            // Your own data
            sender: {
                company: "BrandsOnline",
                address: "UB city",
                zip: "996585",
                city: "Bangalore",
                country: "India",
            },
            // Your recipient
            client: {
                // company: address[0].item.fname,
                // address: address[0].item.street,
                // zip: address[0].item.pincode,
                // city: address[0].item.city,
                country: "India",

            },

            information: {
                // number: address[0].item.mobile,
                date: "12-12-2021",
                "due-date": "31-12-2021",
            },

            products: [
                {
                    quantity: product[0][0].quantity,
                    description: product[0][0].productName,
                    "tax-rate": 6,
                    price: product[0][0].productPrice,
                },
            ],
            // The message you would like to display on the bottom of your invoice
            "bottom-notice": "Thank you for your order ",
            // Settings to customize your invoice
            settings: {
                currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            },
            // Translate your invoice to your preferred language
            translate: {},
        };

        return data;
    },




// RETURN ORDER
    returnOrder: (orderId) => {
        try {
            return new Promise((resolve, reject) => {
                db.Order.find({ 'orders._id': orderId }).then((orders) => {

                    let orderIndex = orders[0].orders.findIndex(
                        (orders) => orders._id == orderId
                    );
                    let order = orders[0].orders.find((order) => order._id == orderId);

                    if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'Paid') {
                        // Fetch payment details from Razorpay API
                        instance.payments.fetch(order.paymentId).then((payment) => {
                            if (payment.status === 'captured') {
                                // Initiate refund using the payment ID and refund amount
                                instance.payments.refund(order.paymentId, { amount: order.totalPrice * 100 }).then((refund) => {
                                    // Update order status in the database
                                    db.Order.updateOne(
                                        { 'orders._id': orderId },
                                        {
                                            $set: {
                                                ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                                ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                            }
                                        }
                                    ).then((orders) => {
                                        resolve(orders);
                                    });
                                }).catch((error) => {
                                    console.log(error);
                                    reject(error);
                                });
                            } else {
                                console.log('Payment not captured');
                                reject('Payment not captured');
                            }
                        }).catch((error) => {
                            console.log(error);
                            reject(error);
                        });
                    } else if (order.paymentMethod === 'COD' || order.paymentMethod === 'wallet') {
                        // Update order status in the database
                        db.Order.updateOne(
                            { 'orders._id': orderId },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                    ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                }
                            }
                        ).then((orders) => {
                            resolve(orders);
                        });
                    } else {
                        console.log('Invalid payment method');
                        reject('Invalid payment method');
                    }
                });
            });
        } catch (error) {
            console.log(error.message);
        }
    },






}