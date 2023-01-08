const layout='admin-layout'
const { resolveInclude } = require('ejs');
const couponHelpers=require('../helpers/couponHelper')
var adminHelpers=require('../helpers/adminHelpers')
var productHelpers=require('../helpers/productHelpers');
const reportHelpers=require('../helpers/reportHelpers')
const { response } = require('../app');
const { getTotalSalesData, getSalesReport } = require('../helpers/reportHelpers');
const ExcelJS=require('exceljs')
 const bannerHelpers=require('../helpers/bannerHelper')






module.exports={
    getAdminPanel:async(req,res)=>{
    getTotalSalesData().then(async(data)=>{

let cancelledOrders=await reportHelpers.getCancelledOrders()
let totalOrders=await reportHelpers.getTotalOrders()
let dailySales=await reportHelpers.dailySales()
let monthlySales=await reportHelpers.monthlySales()

let months=[];
let eachMonthTotal=[];
let monthlyOrders=[];
let yearTotal=0;
let yearTotalOrder=0;
for(let i=0;i<monthlySales.length;i++){
    let month=monthlySales[i]._id.month
    let total=monthlySales[i].total
    let order=monthlySales[i].totalOrders
    yearTotal+=monthlySales[i].total
    yearTotalOrder+=monthlySales[i].totalOrders

    months.push(month);
    eachMonthTotal.push(total);
    monthlyOrders.push(order)
}




let days=[];
let dayTotal = [];
let orders=[];
let monthTotal=0;
let monthTotalOrder=0;
for (let i = 0; i < dailySales.length; i++) {
let day = dailySales[i]._id.day;
let total = dailySales[i].totalSales;
let order=dailySales[i].totalOrders
   monthTotal+=dailySales[i].totalSales
   monthTotalOrder+=dailySales[i].totalOrders
  
days.push(day);
dayTotal.push(total);
orders.push(order)
}



console.log('jjj',days,dayTotal,monthTotal);
let deliveredOrders=data[0]?.deliveredOrders;
let totalSales=data[0]?.totalSales;
        res.render('admin/admin-panel',{
            deliveredOrders,
            totalSales,
            layout,
            cancelledOrders,
            totalOrders,
            days,dayTotal,monthTotal,monthTotalOrder,orders,
            months,eachMonthTotal,monthlyOrders,yearTotal,yearTotalOrder          
             
        });

        
    }).catch((error)=>{
        res.render('show-error',{error,nav:true,footer:true})

    })



         
    },
    
    getAdminLogin:(req,res)=>{
        if(req.admin){
            res.redirect('/admin')
        }else{
            loginErr=req.session.loginErr
            req.session.loginErr=null;
             res.render('admin/admin-login',{nav:true,footer:true,loginErr});
             
        
        }
    },
    adminLoginPost:(req,res)=>{
        console.log(req.body);
       adminHelpers.doLogin(req.body).then((response)=>{
        if(response.status){
            req.session.admin=response.admin;
            res.redirect('/admin')
        }else{
            req.session.loginErr="Invalid Email or Password"
            res.redirect('/admin/adminlogin')
        }
       }).catch((error)=>{

         res.render('show-error',{error,nav:true,footer:true})

        })
    },
    getUsers:(req,res)=>{
        adminHelpers.getAllUsers().then((users)=>{
            res.render('admin/view-users',{layout,users})
        }).catch((error)=>{
   res.render('show-error',{error,nav:true,footer:true})        })

    },userBlock:(req,res)=>{
        userId=req.params.id;
        adminHelpers.blockUser(userId).then((response)=>{
            res.json(response)
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })

    },
    userUnblock:(req,res)=>{
        userId=req.params.id
        adminHelpers.unblockUser(userId).then((response)=>{
            res.json(response)
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
     
    addCategory:(req,res)=>{
        errMsg=req.session.catErr
        req.session.catErr=null;

        res.render('admin/add-category',{layout,errMsg})

    },

    addCategoryPost:(req,res)=>{
        productHelpers.addCategories(req.body).then((response)=>{
            if(response.status){
                res.redirect('/admin/category')

            }else{
                  req.session.catErr='Category allready exist'
                res.redirect('/admin/add-category')
            }
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },

    addProducts:(req,res)=>{

         productHelpers.getAllCategories().then((category)=>{
            res.render('admin/add-products',{layout,category})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
        
 
    },
    addProductsPost:(req,res)=>{

        console.log('request files',req.files)

        let filenames=req.files.map((files)=>{
            return files.filename;
        })

       console.log('filename',filenames)

        
         
         
        let product={
            name:req.body.name,                      
            price:req.body.price,
            category:req.body.category,
            quantity:req.body.quantity,
            description:req.body.description,
            actualPrice:req.body.price,
            img:filenames

        }

        productHelpers.addProducts(product).then((insertedId)=>{

            // const imgName=insertedId;
            // req.files?.image?.forEach((element ,index) => {
            //     element.mv('./public/product-images/'+imgName+index+'.jpg',(err,done)=>{
            //         if(err){
            //             console.log(err);
            //         }
            //     })
                
            // });
        
            res.redirect('/admin/products')
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
    products:(req,res)=>{
        productHelpers.getAllProducts().then((products)=>{
            res.render('admin/products',{layout,products})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
    category:(req,res)=>{
        productHelpers.getAllCategories().then((category)=>{
            res.render('admin/category',{layout,category})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
    deleteProduct:(req,res)=>{
        let proId=req.params.id
        productHelpers.deleteProducts(proId).then((response)=>{
            res.json(response)
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
    editProducts:async(req,res)=>{
        let products=await productHelpers.getProductDetails(req.params.id)
        productHelpers.getAllCategories().then((category)=>{
            console.log("edit ppp",products);
            res.render('admin/edit-products',{category,products,layout})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
    editProductsPost:(req,res)=>{
       

        console.log('editimage',req.files)
        console.log('edit-body',req.body)
      let img0="";
      let img1="";
      let img2="";
      let img3="";

          if(req.files?.img0){
            img0=req.files.img0[0].filename
          }
          if(req.files?.img1){
            img1=req.files.img1[0].filename
          }
            
          if(req.files?.img2){
            img2=req.files.img2[0].filename
          }
          if(req.files?.img3){
            img3=req.files.img3[0].filename
          }
         
          let hai=[img0,img1,img2,img3]
          console.log('kkdkfklj',hai)

        console.log('img0',img0,'img1',img1)

         proId=req.params.id
         data={
            name:req.body.name,                      
            price:req.body.price,
            category:req.body.category,
            quantity:req.body.quantity,
            description:req.body.description,
            img:[img0,img1,img2,img3]
            
         }

        productHelpers.editProduct(proId,data).then(()=>{
           
            res.redirect('/admin/products')

        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },

    deleteCategory:(req,res)=>{
        id=req.params.id
        productHelpers.deleteCategory(id).then((response)=>{

            res.json(response)
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
    },
    editCategory:async(req,res)=>{
        
        
        productHelpers.getCategoryDetails(req.params.id).then((category)=>{
        res.render('admin/edit-category',{category,layout})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })

    },
    editCategoryPost:(req,res)=>{
        

        console.log(req.body);
        productHelpers.editCategory(req.params.id,req.body).then((response)=>{
            if(response.status){
         res.redirect('/admin/category')

            }else{
                
                 
                res.redirect('/admin/category')


            }
         })
    },
    adminLogout:(req,res)=>{
        req.session.admin=null
        res.redirect('/admin/adminlogin')
    },
    viewOrders:(req,res)=>{
        adminHelpers.viewOrders().then((orders)=>{

      res.render('admin/view-orders',{layout,orders})
      

        }).catch((error)=>{
            console.log(error);
        })
     },
     cancelOrder:(req,res)=>{
        adminHelpers.cancelOrder(req.body.orderId,req.body.userId).then(()=>{
            res.json({status:true})
        }).catch((error)=>{
            console.log(error);
        })
     },
     orderDetails:(req,res)=>{
        adminHelpers.orderDetails(req.params.id).then((orders)=>{

            res.render('admin/order-details',{layout,orders})

            console.log('admin orderDetail',orders);
        }).catch((error)=>{
            console.log(error);
        })
     },
     changeOrderStatus:(req,res)=>{
        console.log('status body',req.body)
        adminHelpers.changeOrderStatus(req.body.orderId,req.body.userId,req.body.status).then(()=>{

            res.json({status:true})

        }).catch((error)=>{
            console.log(error);
        })
     },
     addCouponPage:(req,res)=>{

        res.render('admin/add-coupon',{layout})


      },
      addCouponPost:(req,res)=>{
        let coupon=req.body
        coupon.discount=parseInt(coupon.discount)
        coupon.expiry=new Date(coupon.expiry)
        coupon.minAmount=parseInt(coupon.minAmount)
        coupon.maxDiscount=parseInt(coupon.maxDiscount)

        console.log('date',coupon.expiry);

        if(typeof coupon.discount!=='number'||coupon.discount<=0||coupon.discount>=100){
            res.json({status:false,reason:"Invalid Discount Amount"})
        }else if(!(coupon.expiry instanceof Date )|| coupon.expiry<new Date()){
            res.json({status:false,reason:"Invalid Expiration Date"})
        }else{

            couponHelpers.addNewCoupon(coupon).then((response)=>{
                if(response.status){
                    res.json({status:true})
                }else{

                    res.json({reason:"Coupon Already Exists"})
                }
            }).catch((error)=>{
                console.log(error);
            })
        }


       },
       showCoupons:(req,res)=>{
        
        couponHelpers.showCoupons().then((coupons)=>{
            res.render('admin/show-coupons',{layout,coupons})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
        
       },
        
       removeCoupon:(req,res)=>{
        let couponId=req.params.Id
        console.log('params id',couponId);
        couponHelpers.removeCoupon(couponId).then(()=>{
            res.json({status:true})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
       },
      salesReport:async(req,res)=>{

        console.log('reqqq',req.body);

      let data={}
      data.startDate='2023-01-01';
      data.endDate='2024-01-01';


      let productSales=await reportHelpers.getSalesReport(data)

       let totalSales=0;
       let totalOrders=0;
       for(let i=0;i<productSales.length;i++){
        totalOrders+=productSales[i].numOfOrders
        totalSales+=productSales[i].prodSales
       }
        
        res.render('admin/sales-report',{layout,productSales,totalSales,totalOrders})

        
      } ,
      getProductReport:(req,res)=>{

        console.log('kk',req.body);
        reportHelpers.getSalesReport(req.body).then((data)=>{

            res.send(data)

        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
         })

        console.log('proo',req.body);
      },
      exportToexcell:(req,res)=>{

         reportHelpers.getSalesReport(req.body).then((data)=>{

            console.log('is there',data);


            let totalSales=0;
            let totalOrders=0;
            for(let i=0;i<data.length;i++){
             totalOrders+=data[i].numOfOrders
             totalSales+=data[i].prodSales
            }


            const workbook=new ExcelJS.Workbook();
            const worksheet=workbook.addWorksheet('Sales Data');
            worksheet.columns=[
                {header:'Product Id',key:'_id'},
                {header:'Product Name',key:'productName'},
                {header:'Product Category',key:'productCategory'},
                {header:'Total Quantity Sold ',key:'totalQuantity'},
                {header:'Total Number Of Orders  ',key:'numOfOrders'},
                {header:'Total Sales',key:'prodSales'},
            ];

            worksheet.addRows(data);

            worksheet.addRow({ _id: 'Total Sales', productName: '', productCategory: '', totalQuantity: '', numOfOrders: '', prodSales: totalSales });
            worksheet.addRow({ _id: ' Total Orders', productName: '', productCategory: '', totalQuantity: '', numOfOrders:totalOrders, prodSales: '' });

            const excelBuffer = workbook.xlsx. writeBuffer();

            // Set the response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx');
          
            // Send the Excel file as the response

            res.send(excelBuffer);


        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})
        })
        
      
    

      },
      offers:async(req,res)=>{
        try {

        let productOffers=await adminHelpers.getProductOffers();
        let categoryOffers=await adminHelpers.getCategoryOffers();
        
        
      res.render('admin/offers',{layout,productOffers,categoryOffers})
    } catch (error) {
      res.render('show-error',{error,nav:true,footer:true})
 
    }
        
    },


     addOffer:async(req,res)=>{
     try {
        
     
     let products=await productHelpers.getAllProducts();
     let categories=await productHelpers.getAllCategories();
        let error=req.session.error
        req.session.error=null;
        res.render('admin/add-offer',{layout,products,categories,error})
    } catch (error) {
        res.render('show-error',{error,nav:true,footer:true})

    }
      },

      addOfferPost:(req,res)=>{
        console.log('addofffer',req.body)
        if(req.body.offerType=='product'){
            adminHelpers.addProductOffer(req.body).then((response)=>{
                if(response.status){
                    res.redirect('/admin/offers')

                }else{
                    req.session.error="Allready an Offer Exist for This product !"
                    res.redirect('/admin/add-offer')
                }
 
             }).catch((error)=>{
                res.render('show-error',{error,nav:true,footer:true})

             })
        }else{
            adminHelpers.addCategoryOffer(req.body).then((result)=>{
                if(result.status){
                    res.redirect('/admin/offers')
                }else{
                    req.session.error="Allready an offer Exists for this category !"
                    res.redirect('/admin/add-offer')

                }
             }).catch((error)=>{
                res.render('show-error',{error,nav:true,footer:true})

             })
        }
      },
      cancellProductOffer:(req,res)=>{

        let prodName=req.params.name
        adminHelpers.cancelProductOffer(prodName).then(()=>{

            console.log('cancelled');
            res.json({status:true})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})

        })

        

      },
      cancellCategoryOffer:(req,res)=>{
        let catName=req.params.name
        adminHelpers.cancellCategoryOffer(catName).then(()=>{
            res.json({status:true})
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})

        })
      },
      returnProduct:(req,res)=>{
        let orderId=req.body.orderId
        let prodId=req.body.prodId
        let prodTotal=req.body.prodTotal
        let userId=req.body.userId
     
        console.log('return body',req.body);
                    
         adminHelpers.returnProduct(userId,orderId,prodId,prodTotal).then(()=>{
                               
             res.json({status:true})
     
         }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})

         })
         
     
     
     },
     cancelReturn:(req,res)=>{
        let userId=req.body.userId;
        let orderId=req.body.orderId;
        let prodId=req.body.prodId
        let status='returnCancelled'

        productHelpers.changeProductReturnStatus(userId,orderId,prodId,status).then(()=>{
            res.json({status:true})
        }).catch((error)=>{
          res.render('show-error',{error,nav:true,footer:true})

        })
                 
     },
     addBanner:(req,res)=>{

        res.render('admin/add-banner',{layout})

     },
     showBanners:(req,res)=>{
        bannerHelpers.getAllBanners().then((banners)=>{

        res.render('admin/banners',{layout,banners})


        }).catch((error)=>{
           res.render('show-error',{error,nav:true,footer:true})

        })
      },
     addBannerPost:(req,res)=>{
         console.log('banner',req.file);
        let banner={
            title:req.body.title,
            image:req.file.filename,
            url:req.body.url,
            description:req.body.description,
            category:req.body.category

        }
        bannerHelpers.addBanner(banner).then(()=>{

            res.redirect('/admin/banners')
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})

        })
     },
     editBanner:(req,res)=>{
        let category=req.params.cat
        bannerHelpers.getBanner(category).then((banner)=>{
            console.log('eddd',banner,category)
            res.render('admin/edit-banner',{layout,banner})

        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})

        })
      },
      editBannerPost:(req,res)=>{
        let id=req.params.id
        let image = req.file ? req.file.filename :'';

         
        
        console.log('banner edit',req.params.id,'bannerfile',req.file);

        console.log('image',image);

        bannerHelpers.editBanner(req.body,image,id).then(()=>{
            res.redirect('/admin/banners')
        }).catch((error)=>{
            res.render('show-error',{error,nav:true,footer:true})

        })
        
      },


       
}