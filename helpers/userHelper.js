require('dotenv').config()

const db = require('../model/connection')
const bcrypt = require('bcrypt')
const { response } = require('express')
const { resolveInclude } = require('ejs')
const ObjectId = require('mongodb').ObjectId
// const razorpayKey=require('../config/razorPayKey')

const Razorpay = require('razorpay');
const { productDetails } = require('../controllers/usercontroller')
const { orders } = require('@paypal/checkout-server-sdk')






var instance = new Razorpay({
    key_id:process.env.KEY_ID,
    key_secret:process.env.SECRET_KEY,
});



module.exports={

      doSignup:(userData)=>{
        return new Promise((resolve, reject) => {
                try {
                    
                 
                let response={}
                db.users.find({$or:[{email:userData.email},{mobile:userData.mobile}]}).then(async(user)=>{
                    if(user.length==0){
                        console.log("user not exist");
                        userData.password=await bcrypt.hash(userData.password,10)
                        let data=await db.users(userData)
                        data.save()
                        response.user=data
                        response.status=true;
                        resolve(response)
                    }else{
                        console.log("user exists");
                        resolve({status:false})
                    }
                })
                
            } catch (error) {
                reject(error)    
            }
        })
      },

       doLogin:(userData)=>{
        return new Promise(async(resolve, reject) => {
            try {
                
             
                let response={}
                let user=await db.users.findOne({email: userData.email})
                if(user){


                    if(user.blocked){
                        resolve({blocked:true})
                       
                    }
                    console.log(" login user exist");
                    bcrypt.compare(userData.password,user.password).then((result)=>{
                        console.log('resss',result);
                        if(result){
                            response.user=user
                            response.status=true;
                            resolve(response)
                        }else{
                            console.log("invalid password");
                            resolve({status:false})

                        }
                    })
                }else{
                    console.log("login user not exist");
                    resolve({status:false})

                }
            } catch (error) {
                reject(error)
            }
        })
      },
      getUserDetailsNo:(mobileNo)=>{
       return new Promise(async(resolve, reject) => {
        try {
            
         
         let userDetails= await db.users.findOne({mobile:mobileNo})
            resolve(userDetails)
        } catch (error) {
            reject(error)
        }
       })
         
      },
      addToCart:(proId,userId)=>{
        let proObj={
            products:proId,
            quantity:1
        }
        return new Promise(async(resolve, reject) => {
            try {
                
           
            let userCart=await db.cart.findOne({user:userId})

            if(userCart){

                let proExist=userCart.cartItems.findIndex(cartItems=>cartItems.products==proId)

            console.log('exist is',proExist)
                if(proExist!=-1){
                    db.cart.updateOne({user:userId,'cartItems.products':proId},
                    {$inc:{'cartItems.$.quantity':1}})
                    .then(()=>{
                        resolve()
                    })
                }else{
                    db.cart.updateOne({user:userId},{
                        $push:{cartItems:proObj}
                    }).then((response)=>{
                        resolve()
                    })
                }
                
            }else{
                let cartObj={
                    user:userId,
                    cartItems:proObj

                }
                db.cart(cartObj).save().then(()=>{
                    resolve()

                })
            }
        } catch (error) {
             reject(error)   
        }
        })
        
      },
      getCartProducts:(userId)=>{
        return new Promise((resolve, reject) => {
            try {
                
            
            db.cart.aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
            
                {
                    $unwind:'$cartItems'
                },
                {
                    $project:{
                        item:'$cartItems.products',
                        quantity:'$cartItems.quantity'
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField:"item",
                        foreignField:"_id",
                        as:'cartItems'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$cartItems',0]}
                    }
                }
            ]).then((cartItems)=>{
                console.log('resolved cart items',cartItems);
                resolve(cartItems)
                
            })
        } catch (error) {
               reject(error) 
        }
        })
        
        
      },
      getCartCount:(userId)=>{
        return new Promise(async(resolve, reject) => {
            try {
                
             
            let count=0;
            let cart=await db.cart.findOne({user:userId})
            if(cart){
                count=cart.cartItems.length
            }
            resolve(count)
        } catch (error) {
            reject(error)    
        }
        })
      },
       checkCartQuantity:(proId,userId)=>{
        
        return new Promise(async(resolve, reject) => {
            try {
                
             
            let cart=await db.cart.findOne({user:userId})
            if(cart){
                
                let cartIndex=cart.cartItems.findIndex(cart=>cart.products==proId)
                if(cartIndex==-1){
                    let quantity=0
                    resolve({status:true,quantity:quantity})
                }else{
                    let quantity=cart.cartItems[cartIndex].quantity
                    resolve({status:true,quantity:quantity})
                    console.log("quantity",quantity);
                }
            }else{

                resolve({status:false})
            }
        } catch (error) {
              reject(error)  
        }
        })

       },
       changeProductQuantity:(details)=>{
        return new Promise((resolve, reject) => {

            try {
                
             
            count=parseInt(details.count)

        
                db.cart.updateOne({'_id':details.cart,'cartItems.products':details.product},{
                    $inc:{'cartItems.$.quantity':count}
                }).then(()=>{

                    resolve({status:true})
                })
            } catch (error) {
                reject(error)
            }
             
        })
       },


       getTotalAmount:(userId)=>{
        return new Promise((resolve, reject) => {
            try {
                
            
            db.cart.aggregate([
                { 
                    $match:{user:ObjectId(userId)}
                 },
                 {
                    $unwind:'$cartItems'
                 },
                 {
                    $project:{
                        item:'$cartItems.products',
                        quantity:'$cartItems.quantity'
                    }
                 },
                 {
                    $lookup:{
                        from:'products',
                        localField:"item",
                        foreignField:"_id",
                        as:'cartItems'
                    }
                 },
                 {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$cartItems',0]}
                    }
                 },
                 {
                    $group:{
                       _id:null,
                       total:{$sum:{$multiply:['$quantity','$product.price']}} 
                    }
                 }
                ]).then(async(total)=>{
                    console.log('total is',total);
 
                    resolve(total[0]?.total)

                })
            } catch (error) {
                reject(error)
            }
        })
       },
       removeCartItem:(data,userId)=>{
        return new Promise((resolve, reject) => {
            try {
                
            
            db.cart.updateOne({'_id':data.cartId},
            {
            $pull:{cartItems:{products:data.product}}
            }   
        ).then(()=>{

            resolve({removeProduct:true})
        })
       db.cart.deleteMany({'cartItems':{$size:0}}).then(()=>{
        resolve()
       }) 
       
    } catch (error) {
          reject(error)      
    }
        
        })
       },
       placeOrder:(order,cartProducts,userAddr)=>{
        console.log('the real cart products',cartProducts);

        for (let i = 0; i < cartProducts.length; i++) {

            cartProducts[i].status=true
            cartProducts[i].productStatus='processing'
            
             
        }
        console.log('status of product',cartProducts);



             return new Promise(async(resolve, reject) => {

                try {
                    
                 
                
                let user=await db.users.findOne({_id:order.userId})
                let wallet=user.wallet;
                wallet=wallet-order.total;
                if(wallet<0){
                    wallet=0
                }
                await db.users.updateOne({_id:order.userId},{$set:{wallet:wallet}})


                let orderAddress={
                    houseno:userAddr.houseNo,
                    street:userAddr.street,
                    city:userAddr.city,
                    state:userAddr.state,
                    pincode:userAddr.pincode,
                    mobile:userAddr.mobile,
                    email:userAddr.email,
                }
                let orderData={
                    userId:order.userId,
                    name:userAddr.name,
                    mobile:userAddr.mobile,
                    paymentMethod:order.payment,
                    paymentStatus:order.paymentStatus,
                    productDetails:cartProducts,
                    totalPrice:order.total,
                    shippingAddress:orderAddress,
                    
                }
                orderObj={

                    userId:order.userId,
                    orders:orderData
                }
           let orderExist=await db.order.findOne({userId:order.userId})
           if(orderExist){
            db.order.updateOne({userId:order.userId},{$push:{orders:orderData}}).then((orderId)=>{
                console.log('razor',orderId);
                resolve()
             })
           }else{
             let orderSave=db.order(orderObj)
             orderSave.save()

              // db.order(orderObj).save().then((orderId)=>{
             //     console.log('razor order Id',orderId);
            //     resolve(orderId)
           // })
    
           }
    
           db.cart.deleteOne({user:order.userId}).then(()=>{
                resolve()
           })

           
           
              //inventory
             for(let i=0;i<cartProducts.length;i++){
                await db.products.updateOne({
                    _id:ObjectId (cartProducts[i].product._id) 

                },
                {
                   $inc:{quantity:-cartProducts[i].quantity} 
                }).then((quanity)=>{
                    console.log('quantity decresed',quanity);
                    resolve()
                })
             }

            } catch (error) {
                   reject(error) 
            }

             })
        
       
    },
    orderDetails:(userId)=>{
        return new Promise((resolve, reject) => {
            try {
                
             
            db.order.aggregate([
                {
                      $match:{userId:ObjectId(userId)}    

                },
                {
                    $unwind:'$orders'  
    
                },
                
                {
                  $sort:{'orders.createdAt':-1,'orders._id':-1}
                }


            ]).then((orders)=>{
                console.log('orders',orders);
                resolve(orders)

            })
        } catch (error) {
              reject(error)  
        }
        })
    },
    cancelOrder:(data,userId)=>{
       return new Promise(async(resolve, reject) => {

        try {
            
         
        let order= await db.order.findOne({userId:ObjectId(userId)})
        if(order){
          let orderIndex= await order.orders.findIndex(order=>order._id==data.orderId)
          let productDetails= await order.orders[orderIndex].productDetails
          console.log('product details iddd',productDetails);

          db.order.updateOne({userId:ObjectId(userId)},{$set:{['orders.'+orderIndex+'.status']:false,
                                                        ['orders.'+orderIndex+'.orderStatus']:'Cancelled'
        }})
          .then((orderdetail)=>{
            console.log('hey order',orderdetail);
            
            resolve()
          })
          for(let i=0;i<productDetails.length;i++){
            console.log('prddddd',productDetails);

            await db.products.updateOne({_id:ObjectId( productDetails[i].product._id)},{

                $inc:{quantity:productDetails[i].quantity}

            }).then((quantity)=>{
                console.log('quantity increased',quantity);
                resolve()
            })

          }

         
        }
    } catch (error) {
            reject(error)
    }

       })  

    },
    addAddress:(userId,addrData)=>{
        return new Promise((resolve, reject) => {
            try {
                
             
            db.users.updateOne({_id: ObjectId(userId)},{$push:{address:addrData}}).then(()=>{
                resolve({status:true})
            })
        } catch (error) {
           reject(error)     
        }
        })
    },
    getAddress:(userId)=>{
        return new Promise((resolve, reject) => {
            try {
                
             
            db.users.aggregate([
                
                {
                 $match:{_id:ObjectId(userId)}
                },

                
                
                {

                $unwind:'$address'

            },
            {
                 $project:{addresses:'$address'}
            }
        ]).then((addresses)=>{

             resolve(addresses)
        })

    } catch (error) {
        reject(error)        
    }
        })
    },
    findAddress:(userId,addrId)=>{
        return new Promise((resolve, reject) => {

            try {
                
            
            db.users.aggregate([{
                $match:{_id:ObjectId(userId)}
            },
            {
              $unwind:'$address'  
            },
            {
             $match:{'address._id':ObjectId(addrId)}   
            },
            {
               $project:{address:1,
             } 
            }

            
        ]).then((addrData)=>{
            console.log('new user addr is',addrData)

            console.log('addssss',addrData[0].address);

            resolve(addrData[0].address)
        })

    } catch (error) {
         reject(error)       
    }
        })
         
    },
    generateRazorPay:async(userId,total)=>{
        let orderDetails= await db.order.find({userId:userId})
         let orders=orderDetails[0].orders.slice(-1)
          
        let orderId=orders[0]._id;
         
         total=total*100

        
             return new Promise((resolve, reject) => {
                try {
                    
                
                var options = {
                    amount: total,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: ""+orderId,
                  };
                  instance.orders.create(options, function(err, order) {

                    resolve(order);

                  });
                } catch (error) {
                    reject(error)
                }
             })





    },
    verifyPayment:(details)=>{
        return new Promise((resolve, reject) => {
            try {
                
             
            const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256',razorpayKey.secretKey)
                hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject("Payement Failed")
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    changePaymentStatus: (userId, orderId) => {
        console.log('orderId=>', orderId);
        return new Promise(async (resolve, reject) => {
            try {
                
             
            
                let orders = await db.order.find({ userId: userId })
                let orderIndex = orders[0].orders.findIndex(order => order._id == orderId)
                db.order.updateOne(
                    {
                        'orders._id': ObjectId(orderId)
                    },
                    {
                        $set: {
                            ['orders.' + orderIndex + '.paymentStatus']: 'PAID'
                        }
                    }
                ).then((data) => {
                    resolve()
                })
             
            } catch (error) {
                reject(error)
            }
        })
    },

    editAddress: (addr, userId) => {
        // console.log(data);
        return new Promise(async (resolve, reject) => {
            
            try {
                
            
                let address = await db.users.find({ _id: userId })
                 console.log("personall",address);
                let addressIndex = await address[0].address.findIndex(address => address._id == addr.id)
                console.log('addr index ',addressIndex);

                let addressData = {
                    name: addr.name,
                    houseNo: addr.houseNo,
                    street: addr.street,
                    city: addr.city,
                    state: addr.state,
                    pincode: addr.pincode,
                    mobile: addr.mobile,
                    email: addr.email,
                }

                db.users.updateOne({ userId: userId }, {
                    $set: {
                        ['address.' + addressIndex]: addressData
                    }
                }).then((data) => {
                    console.log('addr change or not',data);
                    resolve({ status: true })
                })
            } catch (error) {
                reject(error)
            }
             
        })
    },
    deleteAddress: (userId, addrId) => {
        return new Promise(async (resolve, reject) => {
             try {
                
              
                db.users.updateOne(
                    {
                        _id: userId,

                    },
                    {
                        $pull: { address: { _id: addrId } }
                    }
                ).then(() => {

                     resolve({ status: true })
                })
            } catch (error) {
                reject(error)
            }
            
        })
    },
    findUser:(userId)=>{
        return new Promise((resolve, reject) => {
            try {
                
            
            db.users.findOne({_id:userId}).then((user)=>{

                console.log("iam the user",user);
                
                resolve(user)
            })
        } catch (error) {
             reject(error)   
        }
        })
    },
    editAccount:(userId,data)=>{
        return new Promise((resolve, reject) => {
            try {
                
             
            db.users.updateOne({_id:userId},{$set:{
                name:data.name,
                email:data.email,
                mobile:data.mobile,

            }}).then(()=>{
                resolve({status:true})
            })
        } catch (error) {
            reject(error)    
        }
        })
    },
    editPassword:(userId,data)=>{

        console.log('iam the pasword data',data);
        return new Promise(async(resolve, reject) => {

            try {
                
             
            let user= await db.users.findOne({_id:userId})
             bcrypt.compare(data.oldPassword,user.password).then(async(result)=>{
                console.log('what is the result',result);
                if(result){
                     data.newPassword=await bcrypt.hash(data.newPassword,10)
                     db.users.updateOne({_id:userId},{$set:{password:data.newPassword}}).then(()=>{
                        resolve({status:true})

                     })


                }else{

                    resolve({status:false})
                }
             })
            } catch (error) {
               reject(error) 
            }
        })
    },
     
    getDiscountAmount:(userId)=>{
        return new Promise(async(resolve, reject) => {
            try {
                const cart=await db.cart.findOne({user:userId});
                let discountAmount=cart.discountAmount
                console.log('final',discountAmount);
                resolve(discountAmount)
            } catch (error) {
                reject(error)
            }
        })
    },
     getMinPurchase:(userId)=>{
        return new Promise(async(resolve, reject) => {
            try {
                const cart=await db.cart.findOne({user:userId});
                let minPurchase=cart.minPurchaseAmount
                resolve(minPurchase)
            } catch (error) {
                reject(error)
            }
        })
     },
    postReview:(prodName,userName,review,reviewedDate,rating,prodId)=>{
        return new Promise(async(resolve, reject) => {
            try {
                let reviewObj={
                    userName:userName,
                    review:review,
                    date:reviewedDate,
                    rating:rating
                }
                let productReviews=await db.reviews.findOne({productName:prodName});
                if(productReviews){
                     
                    db.reviews.updateOne({productName:prodName},{$push:{reviews:reviewObj}}).then(()=>{
                        resolve()
                    })
                }else{
                    let productReview={
                        productId:prodId,
                        productName:prodName,
                        reviews:reviewObj
                    }
                    db.reviews(productReview).save().then(()=>{
                            resolve()
                    })



                }
                
            } catch (error) {
             reject(error)   
            }
        })
    },
    getOrderedProducts:(userId)=>{
        return new Promise((resolve, reject) => {
            try {
                db.order.aggregate([{
                    $match:{userId:ObjectId(userId)}

                },
                {
                    $unwind:'$orders'
                },
                {
                    $match:{'orders.orderStatus':'Delivered'}
                 },
                {
                 $unwind:'$orders.productDetails'
                },
                {
                 $group:{

                    _id:'$orders.productDetails.product._id',
                    productName:{$first:'$orders.productDetails.product.name'}
                 
                 }
                }
            ]).then((result)=>{
                resolve(result)
                console.log('loop',result);
            })
            } catch (error) {
                reject(error)
            }
        })
    },


    



    
    
    




    }
