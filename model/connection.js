const mongoose = require('mongoose')
db=mongoose.createConnection('mongodb://localhost:27017/Ecommerce')



db.on('error', (err) => {
    console.log(err)
})

db.once('open', function() {
    console.log("Connection Successful!");
});


const usersSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    mobile:String,
    address:[{
        name: String,
        houseNo: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        mobile: String,
        email: String,
        
        
      
    }],
    createdAt:{
        type:Date,
        default:new Date(),
    },
    wallet:{
        type:Number,
        default:0,

        
    },

    coupons:Array,

    blocked:{
        type:Boolean,
        default:false
    }
})

const productSchema=new mongoose.Schema({

    name:String,
    price:Number,
    category:String,
    quantity:Number,
    description:String,
    actualPrice:Number,
    discount:{
        type:Number,
        default:0
    },
    discountPercentage:{
        type:Number,
        default:0
    },      
    startDate:Date,
    endDate:{
        type:Date,
        default:null,

    },
    img:[]
    

})

const categoriesSchema=new mongoose.Schema({
    name:String,
})
const cartSchema=new mongoose.Schema({
    user:mongoose.Types.ObjectId,
    discountAmount:{
        type:Number,
        default:0
    },
    minPurchaseAmount:{
        type:Number,
        default:0
    },
    couponCode:{
        type:String,
        default:null
    },
    cartItems:[{
        products:mongoose.Types.ObjectId,
        quantity:Number
    }]
})

const orderSchema=new mongoose.Schema({
    
userId:mongoose.Types.ObjectId,
orders:[
    {
        name:String,
        mobile:Number,
        paymentMethod:String,
        paymentStatus:String,
        totalPrice:Number,
        productDetails:Array,
        shippingAddress:Object,
        orderStatus:{
            type:String,
            default:'Placed'
        },
        status:{
            type:Boolean,
            default:true
        },
        createdAt:{
            type:Date,
            default:new Date()
        }
    }
]

})

const couponSchema=new mongoose.Schema({
    couponCode:String,
    expiry:Date,
    minPurchase:Number,
    discountPercentage:Number,
    maxDiscount:Number,
    discription:String,
    userIds:[String],
    isValid:{
        type:Boolean,
        default:true
    },

    createdAt:{
        type:Date,
        default:new Date()
    },

})
 const productOfferSchema=new mongoose.Schema({
    offerName:String,
    productId:mongoose.Types.ObjectId,
    productName:String,
    discountPercentage:Number,
    startDate:{
        type:Date,
        
    },
    endDate:{
        type:Date,
        
    },
    status:{
        type:Boolean,
        default:true
    }
 })

 const categoryOfferSchema=new mongoose.Schema({
    offerName:String,
    categoryId:mongoose.Types.ObjectId,
    categoryName:String,
    discountPercentage:Number,
    startDate:{
        type:Date,
        
    },
    endDate:{
        type:Date,
        

    },
    status:{
        type:Boolean,
        default:true
    
    },
    
 })

 const reviewSchema=new mongoose.Schema({
    productName:String,
    productId:mongoose.Types.ObjectId,
    reviews:[{
        userName:String,
        review:String,
        date:Date,
        rating:String,
    }]

 })

 const bannerSchema=new mongoose.Schema({

    title:String,
    image:String,
    url:String,
    description:String,
    category:String

 })

 


module.exports={
    users:db.model('users',usersSchema),
    products: db.model('product',productSchema),
    categories:db.model('categories',categoriesSchema),
    cart:db.model('cart',cartSchema),
    order:db.model('order',orderSchema),
    coupons:db.model('coupon',couponSchema),
    productOffers:db.model('productOffers',productOfferSchema),
    categoryOffers:db.model('categoryOffers',categoryOfferSchema),
    reviews:db.model('reviews',reviewSchema),
    banners:db.model('banners',bannerSchema)

    
}  