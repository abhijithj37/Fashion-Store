const { ObjectID } = require('bson')
const { response } = require('express')

const db=require('../model/connection')







module.exports={


   addCategories:(data)=>{
    
      return new Promise((resolve, reject) => {
        try {
            
         
        db.categories.find({name:data.name}).then(async(result)=>{
            let response={}
            if(result.lenght==0){
                let categories=await db.categories(data)
                categories.save()
                response.status=true;
                resolve(response)
            }else{
                resolve({status:false})
            }
        })
    } catch (error) {
          reject(error)  
    }
      })
   },
    

    
    getAllCategories:()=>{
        return new Promise(async(resolve, reject) => {
            try {
                
            
            let categories=await db.categories.find({})
            resolve(categories)
        } catch (error) {
                reject(error)
        }
        })
    },
    addProducts:(product)=>{
        return new Promise(async(resolve, reject) => {
            try {
                
             
            console.log("productsss..",product)

            let data =await db.products(product)
            data.save();
            resolve(data._id)
        } catch (error) {
                reject(error)
        }
        })                                                                                              
    },

    getAllProducts:()=>{
        return new Promise(async(resolve, reject) => {
            try {
            
            let products=await db.products.find({})
            resolve(products)
        } catch (error) {
                reject(error)
        }
        })
    
    },
    deleteProducts:(proId)=>{
        return new Promise((resolve, reject) => {
            try {
                
            
            db.products.deleteOne({_id:proId}).then(()=>{
                resolve({status:true})
            })
        } catch (error) {
              reject(error)  
        }
        })

    },

    editProduct:(proId,data)=>{
        return new Promise(async(resolve, reject) => {
         

        let product= await db.products.findOne({_id:proId});
        console.log('jjjjop',product);

        for(i=0;i<4;i++){
            if(data.img[i]!=""){
            product.img[i]=data.img[i]
            }
        }
        db.products.updateOne({_id:proId},{$set:{
            name:data.name,
            price:data.price,
            category:data.category,
            quantity:data.quantity,
            description:data.description,
            img:product.img

        }}).then((result)=>{

            console.log("edit-products...",result);
            resolve()

        })




         
         
         

        })

    },
    
    deleteCategory:(id)=>{
        return new Promise((resolve, reject) => {
            db.categories.deleteOne({_id:id}).then(()=>{
                resolve({status:true})
            })
        })
    },
    addCategories:(data)=>{
        return new Promise((resolve, reject) => {
            db.categories.find({name:{ $regex : new RegExp(data.name, "i") }}).then(async(category)=>{
                
                if(category.length==0){
                    let categories = await db.categories(data)
                    categories.save()
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },    
    editCategory:(catId,data)=>{
        return new Promise((resolve, reject) => {
            db.categories.find({name:data.name}).then(async(result)=>{
                
                if(result.length==0){
                 db.categories.updateOne({_id:catId},{$set:{
                      name:data.name
                    }}).then(()=>{
                            
                    resolve({status:true})
                    })
                     
                }
                   else{
                    resolve({status:false})
                }
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.products.findOne({_id:proId}).then((product)=>{
                resolve(product)
            })
        })
    },
    getCategoryDetails:(catId)=>{
        return new Promise((resolve, reject) => {
            db.categories.findOne({_id:catId}).then((category)=>{
                resolve(category)
            })
        })
    },
     
    getProductReviews:(prodId)=>{
        return new Promise((resolve, reject) => {
            try {
                db.reviews.aggregate([{
                    $match:{productId:ObjectID(prodId)}
                },
                {
                  $unwind:'$reviews'  
                }
            ]).then((reviews)=>{
                resolve(reviews)
                console.log('rereer',reviews);
            })
            } catch (error) {
                
            }
        })
    },
    changeProductReturnStatus:(userId,orderId,prodId,status)=>{


        return new Promise(async(resolve, reject) => {
            let order= await db.order.findOne({userId:userId})
            console.log('returnstat',order)
            let orderIndex= await order.orders.findIndex(orders=>orders._id==orderId)
            let productIndex=await order.orders[orderIndex].productDetails.findIndex(prod=>prod.product._id==prodId)
            console.log('kkret',productIndex);
            console.log('uuret',orderIndex);
             db.order.updateOne({userId:userId },{
                $set:{['orders.'+orderIndex+'.productDetails.'+productIndex+'.productStatus']:status}
            }).then((data)=>{
                console.log('return staatt',data);
                resolve()
            })
            
     
             
    
        })

    },
    recentProducts:()=>{
        return new Promise(async(resolve, reject) => {
            try {
           let recentProducts=await db.products.find().sort({_id:-1}).limit(4);
           resolve(recentProducts)
            } catch (error) {
                
            }
        })
    },
    kidsProducts:()=>{
        return new Promise((resolve, reject) => {
            try {
               db.products.find({category:'Kids'}).then((cat)=>{
                resolve(cat)
               }) 
            } catch (error) {
                
            }
        })
    },
    womensProducts:()=>{
        return new Promise((resolve, reject) => {
            try {
                db.products.find({category:'Womens'}).then((prod)=>{
                    resolve(prod)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    mensProducts:()=>{
        return new Promise((resolve, reject) => {
            try {
               db.products.find({category:'Mens'}).then((prod)=>{
                resolve(prod)
               })
            } catch (error) {
                reject(error)
            }
        })
    }
    
    
    
}