
const db = require('../../models/connection')
const bcrypt = require('bcrypt')




module.exports = {


    doAdminLogin: (data) => {

        return new Promise((resolve, reject) => {
            db.admin.findOne({ email: data.email }).then((admin) => {


                if (admin) {
                    bcrypt.compare(data.password, admin.password).then((logedTrue) => {

                        resolve(logedTrue)
                    })
                } else {
                    resolve(false)
                }
            })


        })
    },


    getUserList: () => {
        try {
            return new Promise((resolve, reject) => {
                db.user.find().then((user) => {
                    if (user) {

                        resolve(user)
                    } else {
                        console.log("User not found");
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    changeUserHStatus: (userId, status) => {
        try {
            return new Promise((resolve, reject) => {
                db.user.updateOne({ _id: userId }, { $set: { status: status } }).then((response) => {
                    if (response) {
                        resolve(response)
                    } else {
                        console.log("not found");
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }

    },



    getProductList: () => {
        try {
            return new Promise((resolve, reject) => {
                db.Product.find().then((product) => {
                    if (product) {
                        resolve(product)
                    } else {
                        console.log('product not found');
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }

    },


    getEditProduct: (proId) => {
        try {
            return new Promise((resolve, reject) => {
                db.Product.findById(proId).then((product) => {
                    if (product) {
                        resolve(product)
                    } else {
                        console.log('product not found');
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }

    },



    getPreviousImages: (proId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.Product.findOne({ _id: proId }).then((response) => {
                    resolve(response.img)
                })
            })
        } catch (error) {
            console.log(error.message);
        }

    },


    postEditProduct: (proId, product, image) => {

        try {
            return new Promise((resolve, reject) => {
                db.Product.updateOne({ _id: proId },
                    {
                        $set:
                        {
                            name: product.name,
                            brand: product.brand,
                            description: product.description,
                            price: product.price,
                            quantity: product.quantity,
                            category: product.category,
                            img: image
                        }
                    }).then((newProduct) => {
                        resolve(newProduct)
                    })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    //DELETE PRODUCT HELPER------------------------------------
    // deleteProduct: (proId) => {
    //   try {
    //       return new Promise((resolve, reject) => {
    //           db.Product.findByIdAndDelete({ _id: proId }).then((response) => {
    //               if (response) {
    //                   resolve({ status: true })
    //               } else {
    //                   resolve({ status: false })
    //               }
    //           })
    //       })
    //   } catch (error) {
    //       console.log(error.message);
    //   }
    // },



    postAddCategory: (data) => {

        try {
            return new Promise((resolve, reject) => {
                // capitalize the first letter of category
                const category = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase();

                db.Category.findOne({ category: category })
                    .then(async (categoryDoc) => {
                        if (!categoryDoc) {
                            let newCategory = new db.Category({
                                category: category,
                                sub_category: [{ name: data.sub_category, offer: { validFrom: 0, validTo: 0, discountPercentage: 0 } }]
                            });
                            await newCategory.save().then(() => {
                                resolve({ status: true });
                            });
                        } else {
                            let subcategoryDoc = categoryDoc.sub_category.find((sub_category) => sub_category.name === data.sub_category);
                            if (!subcategoryDoc) {
                                categoryDoc.sub_category.push({ name: data.sub_category, offer: { validFrom: 0, validTo: 0, discountPercentage: 0 } });
                                await categoryDoc.save().then(() => {
                                    resolve({ status: true });
                                });
                            } else {
                                resolve({ status: false, message: 'Subcategory already exists.' });
                            }
                        }
                    });
            });
        } catch (error) {
            console.log(error.message);
        }
    },



    getSubCategory: (data) => {
        try {
            return new Promise((resolve, reject) => {
                db.Category.findOne({ category: data.category }).then((category) => {
                    if (category) {
                        resolve(category.sub_category)
                    } else {
                        reject("Error Category not found")
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },



    deleteSubCategory: (id, name) => {
        return new Promise(async (resolve, reject) => {
            await db.Category.updateOne(
                { _id: id },
                { $pull: { sub_category: { name: name } } }
            ).then((response) => {
                console.log(response);
                resolve(response);
            });
        });
    },


    deleteCategory: (catId) => {
        try {
            return new Promise((resolve, reject) => {
                db.Category.findByIdAndDelete(catId).then((res) => {
                    if (res) {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
            })

        } catch (error) {
            console.log(err.message);   
        }
    },



    postAddProduct: (data) => {
        try {
            return new Promise((resolve, reject) => {
                let product = new db.Product(data);
                product.save().then(() => {
                    resolve()
                })

            })
        } catch (error) {
            console.log(error.message);
        }
    },


    //UNLIST

    unlistProduct: (proId, condition) => {
        return new Promise(async (resolve, reject) => {
            await db.Product.updateOne({ _id: proId },
                { $set: { unlist: condition } }).then((product) => {
                    resolve(product)
                }).catch((err) => {
                    reject(err)
                })
        })

    },



    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
          await db.Product.find().then((response) => {
            resolve(response);
          });
        });
      },




      getCodCount: () => {
        return new Promise(async (resolve, reject) => {
          let response = await db.Order.aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.paymentMethod": "COD",
              },
            },
          ]);
          resolve(response);
        });
      },







      getOnlineCount: () => {
        return new Promise(async (resolve, reject) => {
          let response = await db.Order.aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.paymentMethod": "razorpay",
              },
            },
          ]);
          resolve(response);
        });
      },





    getWalletCount:()=>{

    return new Promise(async (resolve, reject) => {
      let response = await db.Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "wallet",
          },
        },
      ]);
      resolve(response);
    });

  },





  getSalesReport: () => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $match: {
                        "orders.orderConfirm": "delivered"
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


postReport: (date) => {
  
    try {
        let start = new Date(date.startdate);
        let end = new Date(date.enddate);
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $match: {
                        $and: [
                            { "orders.orderConfirm": "delivered" },
                            { "orders.createdAt": { $gte: start, $lte: new Date(end.getTime() + 86400000) } }
                        ]
                    }
                }
            ]).exec()
                .then((response) => {
                    console.log(response,'res');
                    resolve(response)
                })
        })
    } catch (error) {
        console.log(error.message);
    }
},









}