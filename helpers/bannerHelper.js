const db = require('../model/connection')


module.exports={

    addBanner:(banner)=>{
        return new Promise((resolve, reject) => {
            try {
                db.banners(banner).save().then(()=>{
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllBanners:()=>{
        return new Promise((resolve, reject) => {
            try {
               db.banners.find().then((banners)=>{
                resolve(banners)
               }) 
            } catch (error) {
                reject(error)
            }
        })
    },
    getBanner:(category)=>{
        return new Promise((resolve, reject) => {
            try {
                db.banners.findOne({category:category}).then((mainBanner)=>{
                    resolve(mainBanner)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    editBanner:(data,image,id)=>{

        return new Promise(async(resolve, reject) => {
            try {
                let banner=await db.banners.findOne({_id:id})
                console.log('heyy',banner)
                let bannerImage=banner.image;
                
                if(image==""){
                    console.log('ldsfk',image)
                    image=bannerImage
                }

                db.banners.updateOne({_id:id},{$set:{title:data.title,
                image:image,url:data.url,description:data.description,category:data.category
                }}).then(()=>{
                    resolve()
                })

            } catch (error) {
                reject(error)
            }
        })
    }
}
