const db = require('../model/connection')



module.exports={

addNewCoupon:(couponData)=>{
    return new Promise((resolve, reject) => {
        try {

            let coupon={
                couponCode:couponData.code,
                expiry:couponData.expiry,
                minPurchase:couponData.minAmount,
                discountPercentage:couponData.discount,
                maxDiscount:couponData.maxDiscount,
                discription:couponData.discription
            }
            console.log('db couoons',coupon);
             db.coupons.find({couponCode:couponData.code}).then(async(result)=>{
                if(result.length!=0){
                    resolve({status:false})
                }else{
                   await db.coupons(coupon).save().then(()=>{
                    resolve({status:true})
                   })
                    
                }
             })
             
            
        } catch (error) {
             reject(error)
            
        }
    })
},
showCoupons:()=>{
    return new Promise(async(resolve, reject) => {
        try {
           await db.coupons.find({}).then((coupons)=>{
            resolve(coupons)
           }) 
        } catch (error) {
           reject(error) 
        }
    })
},
redeemCoupon:(code,userId,total)=>{
    return new Promise(async(resolve, reject) => {
        try {

            const coupon=await db.coupons.findOne({couponCode:code});
            if(!coupon||(coupon.expiry<Date.now())){

                resolve({status:false,reason:"Invalid Or Expired Coupon"})
            }else if(total<coupon.minPurchase){
               resolve({status:false,reason:`You have to Purchase for Minimum ₹${coupon.minPurchase} for applying this coupon`})
            }
            else if(coupon.userIds.includes(userId)){
                resolve({status:false,reason:"You Have Already Used This coupon"})
            } 
             
            else{
            //    coupon.userIds.push(userId);
            //    await coupon.save();

            
               const discountAmount=Math.min(total*(coupon.discountPercentage/100),coupon.maxDiscount)    
               let finalPrice=total-discountAmount
               console.log('itu final',finalPrice);

               await db.cart.updateOne({user:userId},{$set:{discountAmount:discountAmount,minPurchaseAmount:coupon.minPurchase,couponCode:code}}).then((result)=>{

                console.log('update ayoo',result);
                resolve({status:true,discountAmount:discountAmount,finalPrice:finalPrice})

               })
 
            }
            
        } catch (error) {
           reject(error) 
        }
    })
},
removeCoupon:(couponId)=>{
    return new Promise( (resolve, reject) => {
        try {
              db.coupons.deleteOne({_id:couponId}).then(()=>{

                resolve()
                
            })
        } catch (error) {
            reject(error)
        }
    })
},
saveCouponUser:(code,userId)=>{
    return new Promise((resolve, reject) => {
        try {
        db.coupons.updateOne({couponCode:code},{$push:{userIds:userId}}).then(()=>{
            resolve()
        })
        } catch (error) {
           reject(error) 
        }
    })
},
getCouponCode:(userId)=>{
    return new Promise(async(resolve, reject) => {
        try {
            const cart= await db.cart.findOne({user:userId});
            let couponCode=cart.couponCode;
            resolve(couponCode)

        } catch (error) {
            reject(error)
        }
    })
}








}