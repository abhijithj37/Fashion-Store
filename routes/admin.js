var express = require('express');
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../controllers/auth');
var router = express.Router(); 
const auth=require('../controllers/auth')
const multer  = require('multer');
const userController = require('../controllers/userController');
 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/product-images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })


       

/* GET home page. */
router.get('/',auth.verifyAdmin, adminController.getAdminPanel);

router.get('/adminlogin',adminController.getAdminLogin);


router.post('/adminlogin',adminController.adminLoginPost);

router.get('/users',auth.verifyAdmin,adminController.getUsers)


router.put('/user-block/:id',auth.verifyAdmin,adminController.userBlock);

router.put('/user-unblock/:id',auth.verifyAdmin,adminController.userUnblock)

router.get('/add-category',auth.verifyAdmin,adminController.addCategory)

router.post('/add-category',auth.verifyAdmin,adminController.addCategoryPost)

router.get('/add-products',auth.verifyAdmin,adminController.addProducts)

router.post('/add-product',upload.array("image",4), auth.verifyAdmin,adminController.addProductsPost)

router.get('/products',auth.verifyAdmin,adminController.products)

router.get('/category',auth.verifyAdmin,adminController.category)

router.delete('/delete-products/:id',auth.verifyAdmin,adminController.deleteProduct)

router.delete('/delete-category/:id',auth.verifyAdmin,adminController.deleteCategory)

router.get('/edit-products/:id', auth.verifyAdmin,adminController.editProducts)

router.post('/edit-products/:id',upload.fields([
    { name: 'img0', maxCount: 1 },
    { name: 'img1', maxCount: 1 },
    { name: 'img2', maxCount: 1 },
    { name: 'img3', maxCount: 1 }
  ]),auth.verifyAdmin,adminController.editProductsPost)

router.get('/edit-category/:id',auth.verifyAdmin,adminController.editCategory)

router.post('/edit-category/:id', auth.verifyAdmin,adminController.editCategoryPost)

router.get('/logout',adminController.adminLogout)

router.get('/orders',auth.verifyAdmin,adminController.viewOrders)

router.post('/admin-cancel-order',auth.verifyAdmin,adminController.cancelOrder)

router.get('/order-details/:id',auth.verifyAdmin,adminController.orderDetails)

router.post('/change-order-status',auth.verifyAdmin,adminController.changeOrderStatus)

router.get('/add-coupon',auth.verifyAdmin,adminController.addCouponPage)

router.post('/add-coupon',auth.verifyAdmin,adminController.addCouponPost)

router.get('/coupons',auth.verifyAdmin,adminController.showCoupons)

router.delete('/remove-coupon/:Id',auth.verifyAdmin,adminController.removeCoupon)

router.get('/sales-report',auth.verifyAdmin,adminController.salesReport)

router.post('/get-product-report',auth.verifyAdmin,adminController.getProductReport)

router.post('/export-to-excel',auth.verifyAdmin,adminController.exportToexcell)

router.get('/offers',auth.verifyAdmin,adminController.offers)

router.get('/add-offer',auth.verifyAdmin,adminController.addOffer)

router.post('/add-offer',auth.verifyAdmin,adminController.addOfferPost)

router.put('/cancel-offer/:name',auth.verifyAdmin,adminController.cancellProductOffer)

router.put('/cancell-category-offer/:name',auth.verifyAdmin,adminController.cancellCategoryOffer)

router.put('/return-product',auth.verifyAdmin,adminController.returnProduct)

router.put('/cancel-return',auth.verifyAdmin,adminController.cancelReturn)

router.get('/add-banner',auth.verifyAdmin,adminController.addBanner)

router.get('/banners',auth.verifyAdmin,adminController.showBanners)

router.post('/add-banner',upload.single("image"), auth.verifyAdmin,adminController.addBannerPost)

router.get('/edit-banner/:cat',auth.verifyAdmin,adminController.editBanner)

router.post('/edit-banner/:id',upload.single("image"),auth.verifyAdmin,adminController.editBannerPost)



   



 
module.exports = router;