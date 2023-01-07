var express = require('express');
var router = express.Router();
const userController=require('../controllers/userController')
const auth=require('../controllers/auth');
const adminController = require('../controllers/adminController');

/* GET users listing. */

router.get('/',userController.landingPage);

router.get('/signup',userController.getSignup);

router.post('/signup',userController.postSignUp)

router.get('/login',userController.getLogin)

router.post('/login',userController.postLogin);

router.get('/otp-login',userController.getOtpLogin)

router.post('/otp-login',userController.postOtpLogin)

router.post('/verify-otp',userController.verifyOtp)

router.get('/logout',userController.getLogout);

router.get('/shop',auth.verifyUser, userController.showProducts);

router.get('/product-detail/:id',auth.verifyUser,userController.productDetails)

router.get('/cart',auth.verifyUser,userController.getCart)

router.get('/add-to-cart/:id',auth.verifyUser,userController.addToCart)

router.get('/check-cart-quantity/:id',auth.verifyUser,userController.checkCartQuantity)

router.put('/change-product-quantity',auth.verifyUser,userController.changeProductQuantity)

router.delete('/remove-cart-item',auth.verifyUser,userController.removeCartItem)

router.get('/check-out',auth.verifyUser,userController.checkOutPage)

router.post('/place-order',auth.verifyUser,userController.placeOrder)

router.get('/orders',auth.verifyUser,userController.orderDetails)

router.put('/cancel-order',auth.verifyUser,userController.cancelOrder)

router.get('/accounts',auth.verifyUser,userController.accountsPage)

router.post('/add-address',auth.verifyUser,userController.addAddress)

router.get('/success',auth.verifyUser,userController.successPage)

router.post('/verify-payment',auth.verifyUser,userController.verifyPayement)

 
router.get('/paypal-approve',auth.verifyUser,userController.paypalApprove)

router.get('/autofill-address/:id',auth.verifyUser,userController.findAddress)

router.put('/edit-address',auth.verifyUser,userController.editAddress)

router.get('/delete-address/:id',auth.verifyUser,userController.deleteAddress)

router.put('/edit-account',auth.verifyUser,userController.editAccount)

router.put('/edit-password',auth.verifyUser,userController.editPassword)

 
router.post('/redeem-coupon',auth.verifyUser,userController.redeemCoupon)

router.post('/post-review',auth.verifyUser,userController.postReview)

router.put('/return-request',auth.verifyUser,userController.returnRequest)

router.get('/mens-category',auth.verifyUser,userController.mensCategory)

router.get('/womens-category',auth.verifyUser,userController.womensCategory)

router.get('/kids-category',auth.verifyUser,userController.kidsCategory)



 



module.exports = router;
