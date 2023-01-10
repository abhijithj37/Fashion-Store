
require('dotenv').config()

const productHelpers = require('../helpers/productHelpers')
const userHelper=require('../helpers/userHelper')

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
const db=require('../model/connection')
const adminHelpers = require('../helpers/adminHelpers')
const { order } = require('../model/connection')
 const couponHelpers=require('../helpers/couponHelper')
const {Convert} = require("easy-currencies")
const ObjectId = require('mongodb').ObjectId
const bannerHelpers = require('../helpers/bannerHelper')



const paypal = require('@paypal/checkout-server-sdk')
   const Environment =
    process.env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)


let couponDiscount=0

module.exports={
    

landingPage:async(req,res)=>{
     
    let user=req.user
    let mainBanner=await bannerHelpers.getBanner("Main Banner")     
     productHelpers.recentProducts().then((products)=>{
     res.render('user/landing-page',{user,nav:true,products,mainBanner})

    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
 },
 
getSignup:(req,res)=>{
if(req.user){
    res.redirect('/')
}else{
    res.render('user/signup',{nav:true,footer:true})

}
},

postSignUp:(req,res)=>{
    userHelper.doSignup(req.body).then((response)=>{  
        if(response.status){
            req.session.user=response.user
            res.send({value:"success"})
        }else{
            
            res.send({value:"user allready exists"})
        }
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},

getLogin:(req,res)=>{
    if(req.user){
        res.redirect('/')

    }
    else{
           
        res.render('user/login',{nav:true,footer:true,})
        
        

    }
    
},
postLogin:(req,res)=>{
    userHelper.doLogin(req.body).then((response)=>{
        if (response.status){
            req.session.user=response.user
            res.send({value:"success"})

        }else if(response.blocked){
            res.send({value:"blocked"})
        }
        
        else{
            
            res.send({value:"invalid email or password"})
        }
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},

getOtpLogin:(req,res)=>{
    if(req.user){
        res.redirect('/')
    }else{
        res.render('user/otp-login',{nav:true,footer:true})
    }

},


postOtpLogin: async(req,res)=>{
  const {mobile} =req.body
    console.log('d',req.body);
    userNumber=mobile
    let userExist=await db.users.find({mobile:mobile})
    if(userExist==0){
        console.log('no user');
        res.send({status:false})
    }else{
        client.verify.services(process.env.SERVICE_ID)
        .verifications.create({
            to:`+91${mobile}`,
            channel:'sms',
        }).then((data)=>{
            console.log('data is',data);
            
            //res.status(200).res.send(data,{status:"otp had send to your mobile"})
            res.send({status:"Enter the OTP send to your mobile number"})
        })
        
    }


},

verifyOtp:(req,res)=>{
      const {otp}=req.body
      console.log('ottotpp',req.body)
    client.verify.services(process.env.SERVICE_ID)
    .verificationChecks
    .create({
        to:`+91${userNumber}`,
        code:otp
    }).then((data)=>{
        console.log(data);
        if(data.valid){
            userHelper.getUserDetailsNo(userNumber).then((userDetails)=>{
                req.session.user=userDetails;
                res.send({value:true})

            });

        }else{

            res.send({value:false})
        }
    })
},



getLogout:(req,res)=>{
    req.session.user=null;
    res.redirect('/');
    
},
showProducts: async(req,res)=>{

     let user=req.user
     let cartCount= await userHelper.getCartCount(req.user?._id)

    productHelpers.getAllProducts().then((products)=>{
        res.render('user/product-page',{products,user,cartCount})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
productDetails:async(req,res)=>{

    let user=req.user
    let cartCount= await userHelper.getCartCount(req.user?._id)
    let productReviews=await productHelpers.getProductReviews(req.params.id)
    let totalReviews=productReviews.length
    let orderedProducts=await userHelper.getOrderedProducts(req.user._id)
    let flag=0
    let averageRating=0
     productReviews.forEach(element => {
        averageRating+=parseInt(element.reviews.rating);
     });
     averageRating=averageRating/totalReviews;
     averageRating=Math.round(averageRating*2)/2;
      let averagePercentage=averageRating/5*100
      console.log('lklk',averagePercentage)

    

    for(let i=0;i<orderedProducts.length;i++){
        if(orderedProducts[i]._id==req.params.id){
            flag=1;
            break;
        }
    }
    console.log('flag',flag)
    
    productHelpers.getProductDetails(req.params.id).then((product)=>{
        console.log("oreee", productReviews);
        res.render('user/product-detail',{product,user,cartCount,productReviews,flag,totalReviews,averagePercentage,averageRating})
    })
},
getCart:async(req,res)=>{
      let user=req.user;
      let cartItems=await userHelper.getCartProducts(req.user._id)
      let total= await userHelper.getTotalAmount(req.user._id)
         
        res.render('user/cart',{cartItems,total,user})

    
 },

addToCart:(req,res)=>{
    userHelper.addToCart(req.params.id,req.user._id).then(()=>{
        res.json({status:true})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })

},
checkCartQuantity:(req,res)=>{
    userHelper.checkCartQuantity(req.params.id,req.user._id).then((response)=>{
       res.json(response)
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
changeProductQuantity:(req,res)=>{
    userHelper.changeProductQuantity(req.body).then(async(response)=>{

        response.total= await userHelper.getTotalAmount(req.user._id)
        res.json(response)
     

   
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
removeCartItem:(req,res)=>{
    userHelper.removeCartItem(req.body,req.user._id).then((response)=>{
        res.json(response)
        console.log('product deleted');
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},

checkOutPage:async(req,res)=>{ 

   let cartItems=await userHelper.getCartProducts(req.user._id)
   let subTotal=await userHelper.getTotalAmount(req.user._id)
   let addresses=await userHelper.getAddress(req.user._id)
   let discountAmount=await userHelper.getDiscountAmount(req.user._id)
   let minPurchase=await userHelper.getMinPurchase(req.user._id)
   if(subTotal<minPurchase){
    discountAmount=0
   }


    res.render('user/check-out',{subTotal,cartItems,addresses,discountAmount,paypalClientId: process.env.PAYPAL_CLIENT_ID})
},

placeOrder:async(req,res)=>{
      

    console.log("hai abhijith ");

    console.log('new req body',req.body);


    req.body.userId=req.user._id
    req.body.paymentStatus="pending"
    let total=await userHelper.getTotalAmount(req.user._id)
    let discountAmount=await userHelper.getDiscountAmount(req.user._id)
    let minPurchase=await userHelper.getMinPurchase(req.user._id)

    if(total<minPurchase){
        discountAmount=0
    }

    if(discountAmount!=0){
     let couponCode=await couponHelpers.getCouponCode(req.user._id)
     await couponHelpers.saveCouponUser(couponCode,req.user._id)
    }

    total=total-discountAmount
    req.body.total=total
    
    let cartProducts=await userHelper.getCartProducts(req.user._id)
    let address=await userHelper.findAddress(req.user._id,req.body.addrId)

      let count=0;
      let productName=[]

    for (let i= 0; i< cartProducts.length; i++) {
        
         if(cartProducts[i].product.quantity<=0){
             
            productName.push(cartProducts[i].product.name)
            count=count+1;

        
         } 
    }
     if(count!=0){

     res.json({status:false,productName})

     }else{

     

    

    userHelper.placeOrder(req.body,cartProducts,address).then(async()=>{

        if(req.body.payment=="COD"){
            res.json({codStatus:true})
        }else if(req.body.payment=="razorpay"){
             
            userHelper.generateRazorPay(req.user._id,total).then((order)=>{

             res.json(order)
                  
            }).catch((error)=>{
                res.render('show-error',{error,nav:true,footer:true})

            })

        }else{
            let paypalTotal = await Convert(total).from("INR").to("USD") 
                paypalTotal= Math.round(paypalTotal) 
            
            res.json({paypal:true,total:paypalTotal})
        }
    }).catch((error)=>{
        
        res.render('show-error',{error,nav:true,footer:true})
        
    })

     }


     

},
orderDetails:async(req,res)=>{
 
     userHelper.orderDetails(req.user._id).then((orders)=>{
        let user=req.user
        res.render('user/orders',{orders,footer:true,user})
    }).catch((error)=>{
       res.render('show-error',{error,nav:true,footer:true})

    })
},
cancelOrder:(req,res)=>{


     userHelper.cancelOrder(req.body,req.user._id).then(()=>{
        res.json({status:true})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},

accountsPage:async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
    console.log('here is the user',req.user.name)

     let coupons=await couponHelpers.showCoupons()

    let user=await userHelper.findUser(req.user._id)
    userHelper.getAddress(req.user._id).then((addresses)=>{
        console.log('real address',addresses);

        res.render('user/accounts',{addresses,user,coupons})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
     
},
addAddress:(req,res)=>{

    userHelper.addAddress(req.user._id,req.body).then(()=>{
        res.json({status:true})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
successPage:(req,res)=>{
    res.render('user/success-page')
},
verifyPayement:(req,res)=>{

    userHelper.verifyPayment(req.body).then(() => {

     
    userHelper.changePaymentStatus(req.user._id, req.body['order[receipt]']).then(() => {
            res.json({ status: true })
        })
    }).catch((err) => {
        res.json({ status: false })
    })

},

 

paypalApprove: async (req, res) => {

     const ordersDetails = await db.order.find({ userId: ObjectId(req.user._id)})
    let orders = ordersDetails[0].orders.slice(-1)
    let orderId1 = orders[0]._id
    let orderId = "" + orderId1

    userHelper.changePaymentStatus(req.user._id, orderId).then(() => {
        res.json({ status: true })
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
findAddress:(req,res)=>{
    userHelper.findAddress(req.user._id,req.params.id).then((address)=>{
        res.json({address:address})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })

},
editAddress:(req,res)=>{

    userHelper.editAddress(req.body,req.user._id).then(()=>{
        res.json({status:true})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })

},
deleteAddress:(req,res)=>{
    userHelper.deleteAddress(req.user._id,req.params.id).then((response)=>{
        res.json(response)
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
editAccount:(req,res)=>{
    userHelper.editAccount(req.user._id,req.body).then((response)=>{
        res.json({status:true})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
editPassword:(req,res)=>{
    userHelper.editPassword(req.user._id,req.body).then((response)=>{
        if(response.status){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })
},
 

redeemCoupon:async(req,res)=>{
    console.log('user Coupon',req.body);
    let code=req.body.couponCode
    let userId=req.user._id
    let total=await userHelper.getTotalAmount(userId)
    couponHelpers.redeemCoupon(code,userId,total).then(async(response)=>{
    response.total=total
      
    res.json(response)
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })

},
postReview:(req,res)=>{
    console.log(req.body)

    let prodName=req.body.productName;
    let review=req.body.review
    let reviewDate= new Date(req.body.reviewedDate);
    let rating=req.body.rating;
    let prodId=req.body.productId;
    userHelper.postReview(prodName,req.user.name,review,reviewDate,rating,prodId).then(()=>{
        
        res.json({status:true})
    }).catch((error)=>{
    res.render('show-error',{error,nav:true,footer:true})

    })
},
returnRequest:(req,res)=>{
    let orderId=req.body.orderId;
    let prodId=req.body.prodId
    let status='returnRequest'
    productHelpers.changeProductReturnStatus(req.user._id,orderId,prodId,status).then(()=>{

        res.json({status:true})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})
    })
},

mensCategory:(req,res)=>{
    productHelpers.mensProducts().then((products)=>{
        res.render('user/mens-category',{products})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})
    })
},
womensCategory:(req,res)=>{
    productHelpers.womensProducts().then((products)=>{
        res.render('user/womens-category',{products})
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})
    })
},
kidsCategory:(req,res)=>{
    productHelpers.kidsProducts().then((products)=>{
    res.render('user/kids-category',{products})

    }).catch((error)=>{
      res.render('show-error',{error,nav:true,footer:true})
    })
},




}