const express = require("express");
const cookieParser = require("cookie-parser");
const app =express();
app.use(cookieParser());
/**********
 * 1.signup 
 * 2.login
 * 3.allowifloggedin-->allows us access to getuserdata if user is authenticated

 * ********* */

const signupController = async function(req,res){
    try{
        const UserObject= req.body;
        let newUser = await UserModel.create(UserObject);
        // here we are assuming UserModel is a mongoose model that has been defined elsewhere
        // and it has a create method to create a new user in the database
        res.status(201).json({
            message:"User created successfully",
            user:newUser,
            status:"success"
        });
    }
    catch(err){
            res.status(500).json({
            message:err.message,
            status:"failure"
        });
    }
}

const loginController = async function(req,res){
    try{
        let {email,password} = req.body;
        let user= await UserModel.findOne({email});
        if(user){
            let areEqual = user == user.password;
            if(areEqual){
                let  token = await promisifiedJWTSign({id:user["id"]},JWT_SECRET);
                console.log(token);
                res.cookie("jwt",token,{maxAge:10000000, httpOnly:true,path:"/"});
                res.status(200).json({
                    message:"user logged in successfully",
                    user,
                    status:"success"
                });
            }else{
                res.status(401).json({
                    message:"email or password is incorrect",
                    status:"failure"
                });
            }}
        }
    
    catch(err){

    }
}

const protectRouteMiddleware = async function(req,res,next){
    try{
        let decryptedToken = await promisifiedJWYVerify(req.cookies.jwt,JWT_SECRET);
        if(decryptedToken){
            let userId = decryptedToken.id;
            req.UserId = userId; // assuming req.UserId is used to store the user ID for further processing
            next(); // call next() to allow access to the next route
        }
    }
    catch(err){
            res.status(500).json({
            message:"You are not logged in",
            status:"failure"
        });
        
    }
}
    // this is a middleware function that will check if the user is logged in or not
    // if the user is logged in, it will call next() to allow access to the next route
    // if the user is not logged in, it will return an error response


const getUserData= async function(req,res){
    try{
        let userId = req.UserId; // assuming req.UserId is set by the protectRouteMiddleware
        let user = await UserModel.findById(id);
        res.status(200).json({
            message:"User data retrieved successfully",
            user,
            status:"success"
        });
    }catch(err){
            res.status(404).json({
            message:err.message,
            status:"failure"
        });
    }
    // this route will be protected by the protectRouteMiddleware
    // it will return the user data if the user is logged in
 
} 

app.post("/signup", signupController);
app.post("/login", loginController);
app.get("/allowIfLoggedInUser", protectRouteMiddleware,getUserData);


app.use(function(req,res){
    res.status(404).json({
        status:"failure",
        message:"404 Page Not Found"
    })
});

app.listen(3000,function(){
    console.log("Server is listening to port 3000");
});