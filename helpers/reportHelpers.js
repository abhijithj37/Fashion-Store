 const { get } = require('mongoose')
const { order } = require('../model/connection')
const db=require('../model/connection')


 module.exports={

    getTotalSalesData:()=>{
        return new Promise(async(resolve, reject) => {
            try {
                 db.order.aggregate([{
                    $unwind:'$orders'

                },
                {
                    $match:{'orders.orderStatus':'Delivered'}
                },
                {
                    $group:{
                        _id:null,
                        totalSales:{$sum:'$orders.totalPrice'},
                        deliveredOrders:{$sum:1}

                    }
                },{
                    $project:{
                        deliveredOrders:1,
                        totalSales:1
                    }
                }

             ]).then((data)=>{
                     console.log();
                 resolve(data)
             })
                      
            } catch (error) {
                  reject(error)          
                
            }
        })
    },
    getCancelledOrders:()=>{
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([
                    {$unwind:'$orders'},
                    {
                        $match:{'orders.orderStatus':'Cancelled'}
                    },
                    {
                       $group:{
                        _id:null,
                        totalCancelledOrders:{$sum:1}
                       } 
                    },
                    { 
                    $project:{
                        
                        totalCancelledOrders:1
                    }
                }
                ]).then((data)=>{
                    resolve(data[0]?.totalCancelledOrders)
                })


            } catch (error) {
               reject(error) 
            }
        })
    }, 
    getTotalOrders:()=>{
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([{
                    $unwind:'$orders',


                },
                {
                  $group:{
                    _id:null,
                   totalOrders:{$sum:1}
                  }

                    
                },
                {
                    $project:{
                        
                        totalOrders:1
                    }
                }
            ]).then((data)=>{

                resolve(data[0]?.totalOrders)

            })
            } catch (error) {
                reject(error)
            }
        })
    },
    dailySales:()=>{
        return new Promise(async(resolve, reject) => {
            const currentMonth=new Date().getMonth()+1;
            const currentYear=new Date().getFullYear();
            try {
             db.order.aggregate([{
                    $unwind:'$orders'

                },
            {
             $match:{'orders.orderStatus':'Delivered',
                     'orders.createdAt':{
                        $gte:new Date(currentYear,currentMonth-1,1),  //first day of the current month
                         $lte:new Date(currentYear,currentMonth,0)                                                
                        
                     }
            }
            },
            {
                $group:{
                    _id:{
                        year:{$year:'$orders.createdAt'},
                        month:{$month:'$orders.createdAt'},
                        day:{$dayOfMonth:'$orders.createdAt'},


                    },
                    totalSales:{$sum:'$orders.totalPrice'},
                    totalOrders:{$sum:1}
                },
                 
            },
             {
                $sort:{
                    '_id.day':1
                }
             }

             

            ]).then((data)=>{
                resolve(data)
            
            console.log('itttt',data);
            })
            } catch (error) {
                reject(error)
            }
        })
    },
     monthlySales:()=>{
        return new Promise((resolve, reject) => {
            try {
                const currentYear=new Date().getFullYear();

                db.order.aggregate([
                    {
                        $unwind:'$orders',
                    },
                    {
                        $match:{
                            'orders.orderStatus':'Delivered',
                            'orders.createdAt':{$gte:new Date(currentYear,0,1),
                                                $lte:new Date(currentYear,11,31)
                             
                            }
                        }
                    },
                    {
                        $group:{
                            _id:{
                                year:{$year:'$orders.createdAt'},
                                month:{$month:'$orders.createdAt'}
                            },
                            total:{$sum:'$orders.totalPrice'},
                            totalOrders:{$sum:1}
                        }
                    },
                    {
                        $sort:{
                            '_id.month':1
                        }
                    }

                    
                ]).then((data)=>{
                    console.log(data,'real month');
                    resolve(data)
                })
            } catch (error) {
               reject(error) 
            }
        })
     },
     getSalesReport:(data)=>{

          return new Promise((resolve, reject) => {
            let startDate=new Date(data.startDate)
            startDate.setHours(0,0,0,0)
            let endDate=new Date(data.endDate)
            endDate.setHours(23,59,59,999)
            
            
            try {
                db.order.aggregate([{
                 $unwind:'$orders'
                },
                {
                    $match:{'orders.orderStatus':'Delivered',
                            'orders.createdAt':{$gte:startDate,
                                                $lte:endDate
                            }            
                }
                },
                {
                    $unwind:'$orders.productDetails'
                },
                {
                    $group:{
                        
                            _id:'$orders.productDetails.product._id',
                            totalQuantity:{$sum:'$orders.productDetails.quantity'},
                            prodSales:{$sum:{$multiply:['$orders.productDetails.product.price','$orders.productDetails.quantity']}},
                            productName: { $first: '$orders.productDetails.product.name' },
                            productCategory:{$first:'$orders.productDetails.product.category'},
                            numOfOrders:{$sum:1},
                                               
                             
                            
                        
                    }
                },
                {
                    $sort:{prodSales:-1}
                }
                 


            ]).then((productSales)=>{
            console.log('prod',productSales);
            resolve(productSales)
        
            })

            } catch (error) {
                reject(error)
            }
          })




     }
     


     



 }
