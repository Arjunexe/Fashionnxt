const db = require ('../../models/connection')


module.exports = {



  getOrderByDate: () => {
    return new Promise(async (resolve, reject) => {
        const startDate = new Date();
        try {
            const response = await db.Order.find({ 'orders.createdAt': { $lt: startDate } });
            resolve(response);
        } catch (error) {
            reject(error);
        }
    });
},




getOrderByCategory: () => {
  return new Promise(async (resolve, reject) => {
      await db.Order.aggregate([
          { $unwind: "$orders" },
      ]).then((response) => {
          const productDetails = response.map(order => order.orders.productDetails);
          resolve(productDetails)

      })
  })
},





getAllOrders: () => {
  try {
    return new Promise((resolve, reject) => {
      db.Order.find().then((orders) => {
        let totalOrders = 0;
        orders.forEach((order) => {
          totalOrders += order.orders.length;
        });
        resolve(totalOrders);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
},



getAllOrdersSum: () => {
  try {
    return new Promise((resolve, reject) => {
      db.Order.find().then((orders) => {
        let totalSum = 0;
        orders.forEach((order) => {
          order.orders.forEach((item) => {
            totalSum += item.totalPrice;
          });
        });
        resolve(totalSum);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
},






}