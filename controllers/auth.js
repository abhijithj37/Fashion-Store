 



module.exports={
    authInit:async(req,res,next)=>{
        if(req.session?.user){
         let userData=req.session.user
            if(userData.blocked){
                req.user=null;
                
            }else{
                req.user=req.session.user;
            };
        }else{
            req.user=null;
        }
        if(req.session?.admin){
        
            req.admin=req.session.admin
             
       }else{   
            req.admin=null;
         }
        next();

    },
    verifyUser:(req,res,next)=>{
        if(req.user){
            next();

        }else{
            res.redirect('/login')
        }
    },
    verifyAdmin:(req,res,next)=>{
        if(req.admin){
            next();
            
        }else{
            res.redirect('/admin/adminlogin')
        }
    }
    


}
