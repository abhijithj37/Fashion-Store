const db = require('../model/connection')
const bcrypt = require('bcrypt')
const adminData=require('../config/adminInfo')
const ObjectId = require('mongodb').ObjectId



const data=adminData.adminInfo;

module.exports={

doLogin:(UserData)=>{
    console.log(UserData);
     return new Promise((resolve, reject) => {
       try {
          if(data.name==UserData.name){
            bcrypt.compare(UserData.password,data.password).then((loginTrue)=>{
              let response={}
              if(loginTrue){
                  console.log("its true");
                  response.admin=data;
                  response.status=true;
                  resolve(response);
          
              }else{
                  console.log("ivalid password");
                  resolve({status:false})
              }
            })
          }else{
              console.log('invalid email');
              resolve({status:false})
          }
        
       } catch (error) {
        reject(error)
       } 
             
        
            
        
    })
},
getAllUsers:()=>{
    return new Promise(async(resolve, reject) => {
         try {
            let users= await db.users.find()
            resolve(users)
            
         } catch (error) {
            reject(error)
         }
             

        
    })
},
blockUser:(userId)=>{
    return new Promise((resolve, reject) => {
        try {
            
            db.users.updateOne({_id:userId},{$set:{blocked:true}}).then(()=>{

                resolve({status:true})

            })
        } catch (error) {
            reject(error)
        }
             
        
    })
},
unblockUser:(userId)=>{
    return new Promise((resolve, reject) => {
        try {
            db.users.updateOne({_id:userId},{$set:{blocked:false}}).then(()=>{
                resolve({status:true});
            })
        } catch (error) {
           reject(error)
        }
        
    })
},
viewOrders:()=>{
    return new Promise((resolve, reject) => {
        try {
            db.order.aggregate([
                {
                    $unwind:'$orders'
                },
                {
                    $sort:{'orders.createdAt':-1,'orders._id':-1}
                }
                
                
                
            ]).then((orders)=>{
                resolve(orders)
            })
        } catch (error) {
            reject(error)
        }
        

        
    })
},
cancelOrder:(orderId,userId)=>{
    return new Promise(async(resolve, reject) => {
        try {
            let order= await db.order.findOne({userId:ObjectId(userId)})
        if(order){
          let orderIndex= await order.orders.findIndex(order=>order.id==orderId)
   
          db.order.updateOne({userId:ObjectId(userId)},{$set:{['orders.'+orderIndex+'.status']:false,
          ['orders.'+orderIndex+'.orderStatus']:'Cancelled'}})
                                                                                                                               

          .then((orderdetail)=>{
            console.log('hey admin order',orderdetail);
            resolve({status:true})
          })
        }
        } catch (error) {
            reject(error)
        }
         
       }) 
},
orderDetails:(orderId)=>{
    return new Promise((resolve, reject) => {
        try {
            db.order.aggregate([{
            
                $unwind:'$orders'
            },
            {
                $match:{'orders._id':ObjectId(orderId)}
            }
        ]).then((orders)=>{
            resolve(orders)
        })
        } catch (error) {
           reject(error) 
        }
         
    })
},

changeOrderStatus:(orderId,userId,newStatus)=>{

    console.log("staa",orderId,newStatus);
    return new Promise(async(resolve, reject) => {
        try {
            let order= await db.order.findOne({userId:ObjectId(userId)})
        if(order){
          let orderIndex= await order.orders.findIndex(order=>order.id==orderId)
   
          db.order.updateOne({userId:ObjectId(userId)},{$set:{['orders.'+orderIndex+'.orderStatus']:newStatus,['orders.'+orderIndex+'.paymentStatus']:'PAID'}})
          .then((orderdetail)=>{
            console.log('hey admin order',orderdetail);
            resolve({status:true})
          })
        }
        } catch (error) {
           reject(error) 
        }
         
       }) 
},



addProductOffer:(info)=>{
    return new Promise(async(resolve, reject) => {
        try {
            let offer={
                offerName:info.offerName,
                productName:info.productName,
                discountPercentage:info.discount,
                startDate:new Date(info.startDate),
                endDate: new Date(info.endDate)
            }
           let currentOffer=await db.productOffers.findOne({productName:offer.productName});
           if(currentOffer){
            resolve({status:false})
           }else{

           

            db.productOffers(offer).save().then(async()=>{
             let product=await db.products.findOne({name:offer.productName})
             let discountAmount=product.actualPrice*offer.discountPercentage/100
             let offerPrice=product.actualPrice-discountAmount
             db.products.updateOne({name:offer.productName},{$set:{price:offerPrice,discount:discountAmount,
                discountPercentage:offer.discountPercentage,
            startDate:offer.startDate,
            endDate:offer.endDate
            }}).then(()=>{
                resolve({status:true})
            })
        
        
            })
        }

        } catch (error) {
           reject(error) 
        }
    })
},
getProductOffers:()=>{
    return new Promise((resolve, reject) => {
        try {
            db.productOffers.find().then((offers)=>{
                resolve(offers)
            })
        } catch (error) {
            reject(error)
        }
    })
},
cancelProductOffer:(prodName)=>{
    return new Promise(async(resolve, reject) => {
        try {
            db.productOffers.deleteOne({productName:prodName}).then(async()=>{

             
        let product=await db.products.findOne({name:prodName})
            db.products.updateOne({name:prodName},{$set:{price:product.actualPrice,discount:0,discountPercentage:0,
              endDate:null  
            }}).then(()=>{
                resolve()
            })
    
        })
           
        } catch (error) {
            reject(error)
        }
    })
},
addCategoryOffer:(info)=>{
    return new Promise(async(resolve, reject) => {
        try {
            let offer={
                offerName:info.offerName,
                categoryName:info.categoryName,
                discountPercentage:info.discount,
                startDate:new Date(info.startDate),
                endDate: new Date(info.endDate)

            }
            let currentOffer=await db.categoryOffers.findOne({categoryName:offer.categoryName})
            if(currentOffer){
                resolve({status:false})
            }else{

            
            db.categoryOffers(offer).save().then(async()=>{

            let products=await db.products.find({category:offer.categoryName});

            for(let i=0;i<products.length;i++){


                let discountAmount=products[i].actualPrice*offer.discountPercentage/100
                let offerPrice=products[i].actualPrice-discountAmount
                db.products.updateOne({name:products[i].name},{$set:{price:offerPrice,discount:discountAmount,
                discountPercentage:offer.discountPercentage,
                startDate:offer.startDate,
                endDate:offer.endDate
                }}).then(()=>{
                    resolve({status:true})
                })
                       
            }


            })
        }
               
        } catch (error) {
            reject(error)
        }
    })
},
getCategoryOffers:()=>{
    return new Promise((resolve, reject) => {
        try {
            db.categoryOffers.find().then((catOffer)=>{
                resolve(catOffer)
            })
        } catch (error) {
            reject(error)
        }
    })
},
cancellCategoryOffer:(categoryName)=>{
    return new Promise(async(resolve, reject) => {
        try {
            db.categoryOffers.deleteOne({categoryName:categoryName}).then(async()=>{
                let products=await db.products.find({category:categoryName})
                for(let i=0;i<products.length;i++){
                    db.products.updateOne({name:products[i].name},{$set:{price:products[i].actualPrice,
                    discount:0,
                    discountPercentage:0,endDate:null
                    }}).then(()=>{
                        resolve()
                    })
                }
            })
        } catch (error) {
            reject(error)
        }
    })
},
returnProduct:(userId,orderId,prodId,prodTotal)=>{
    return new Promise(async(resolve, reject) => {
        try {
            
         
        let order= await db.order.findOne({userId:userId})
        console.log('retrun order',order)
        let orderIndex= await order.orders.findIndex(orders=>orders._id==orderId)
        let productIndex=await order.orders[orderIndex].productDetails.findIndex(prod=>prod.product._id==prodId)
        console.log('kkk',productIndex);
        console.log('uuuu',orderIndex);
        await db.order.updateOne({userId:userId },{
            $set:{['orders.'+orderIndex+'.productDetails.'+productIndex+'.productStatus']:'Returned'}
        }).then((data)=>{
            console.log('return modify',data);
        })
         let flag=0;
         let updatedOrder=await db.order.findOne({userId:userId})
         let orderedProducts=await updatedOrder.orders[orderIndex].productDetails;
         for(let i=0;i<orderedProducts.length;i++){
            if(orderedProducts[i].productStatus!='Returned'){
                flag=1;
                break;
            }
         }
         if(flag==0){
            await db.order.updateOne({userId:userId },{
                $set:{['orders.'+orderIndex+'.orderStatus']:'Returned'}
            }).then(()=>{
                console.log('order updated');
            })
         }
             
         console.log('plplpl',orderedProducts);

        let productPrice=parseInt(prodTotal)

        await db.users.updateOne({_id:userId},{
            $inc:{wallet:productPrice}
        }).then(()=>{
            resolve({status:true})
        })

    } catch (error) {
       reject(error)     
    }

    })

},
 

}

 