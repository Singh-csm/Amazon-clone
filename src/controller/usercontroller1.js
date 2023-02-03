
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const userModel = require("../models/userModel");
const { validateName, validateEmail, validateMobileNo, validatePassword, validatePlace, validatePincode } = require("../validations/validator");
// const { uploadFiles } = require("../middleware/aws");


const updateUsers = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!userId || (userId && userId.trim() == "")) {
            return res.status(400).send({ status: false, message: " userId cant be empty" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " please enter valid userId..." })
        }
        let isUserId = await userModel.findOne({ _id: userId, isDeleted: false }).lean()
        if (!isUserId) {
            return res.status(404).send({ status: false, message: "sorry we can't find userId in our collection... " })

        }
        let data=req.body
        
        let { fname, lname, email, password, phone, profileImage, address } = data
        


        if(fname){
        if (fname && typeof fname != "string") {
            return res.status(400).send({ status: false, message: "First name must be in string" });
        }
        if (!validateName(fname.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid First name" });
        }
    }

     if(lname){
        if (lname && typeof lname != "string") {
            return res.status(400).send({ status: false, message: "Last name must be in string" });
        }
        if (!validateName(lname.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid Last name." });
        }
    }
       
    //====validations for Email====
    if(email){
        if (email && typeof email != "string") {
            return res.status(400).send({ status: false, message: "Email must be in String." });
        }
        if (!validateEmail(email.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid Email." });
        }
        if (isUserId.email==email.trim()) {
            return res.status(400).send({ status: false, message: "This Email is already in use, try with another one." });
        }
    }

        //====validations for Phone====
        if(phone){
        if (phone && typeof phone != "string") {
            return res.status(400).send({ status: false, message: "phone number must be in String." });
        }
        if (!validateMobileNo(phone.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid phone Number." });
        }
       
        if (isUserId.phone==phone.trim()) {
            return res.status(400).send({ status: false, message: "This phone is already in use, try with another one." });
        }
    }
        //====validations for password====
        if(password){
        if (password && typeof password != "string") {
            return res.status(400).send({ status: false, message: "Password must be in string" });
        }
       
        if (!validatePassword(password.trim())) {
            return res.status(400).send({ status: false, message: "Password Must be 8-15 length,consist of mixed character and special character" });
        }
        // const saltRounds = 10;
        // bcrypt.hash(password, saltRounds, function (err, hash) {
        //     data.password = hash;
        // });
        let hashing=bcrypt.hashSync(password,10);
        data.password=hashing;
    }


    if(address){
        address=JSON.parse(data.address)
        //====validations for address====
        if (address && typeof address != "object") {
            return res.status(400).send({ status: false, message: "Address must be in Object Form." });
        }
        let { shipping, billing } = address;
        
        //====validations for shipping address====
        if(shipping){
        if (shipping && typeof shipping != "object") {
            return res.status(400).send({ status: false, message: "Shipping Address must be in Object Form." });
        }
        if(shipping.street){
        if (shipping.street && typeof shipping.street != "string") {
            return res.status(400).send({ status: false, message: "Street must be in string" });
            
        }
        //console.log(isUserId)
      
       

    }
        if(shipping.city){
        if (shipping.city && typeof shipping.city != "string") {
            return res.status(400).send({ status: false, message: "City must be in string" });
        }
        if (!validatePlace(shipping.city.trim())) {
            return res.status(400).send({ status: false, message: "City is invalid, number is not allowed." });
        }
    }


    if(shipping.pincode){
        if (shipping.pincode && typeof(shipping.pincode) != "string") {
            console.log(shipping.pincode)
            return res.status(400).send({ status: false, message: "Pincode must be in number" });
        }
        
    }
}
        //====validations for Billing address====
        if(billing!=undefined){
        if (billing && typeof billing != "object") {
            return res.status(400).send({ status: false, message: "Billing Address must be in Object Form." });
        }

    if(billing.street){
        if (billing.street && typeof billing.street != "string") {
            return res.status(400).send({ status: false, message: "Street must be in string" });
        }
    }

    if(billing.city){
        if (billing.city && typeof billing.city != "string") {
            return res.status(400).send({ status: false, message: "City must be in string" });
        }
        if (!validatePlace(billing.city.trim())) {
            return res.status(400).send({ status: false, message: "City is invalid, number is not allowed." });
        }
    }

    if(billing.pincode){
        if (billing.pincode && typeof billing.pincode != "string") {
            return res.status(400).send({ status: false, message: "Pincode must be in string" });
        }
        if (!validatePincode(billing.pincode.trim())) {
            return res.status(400).send({ status: false, message: "pincode is invalid, it contains only 6 digits." });
        }
    }
}
// data["address"]=address


//console.log(isUserId.address["shipping"])

let a=isUserId.address


    }
    let {shipping,billing}=isUserId.address
    let arr=Object.keys(address)
    arr.forEach((u)=>{
        if(u=="shipping" || u=="billing"){
            if(u=="shipping" && address[u]!=undefined){
                let Arr=["street","city","pincode"]
                for(let i=0;i<3;i++){
                    if(address[u][Arr[i]]!=undefined){
                        shipping[Arr[i]]=address[u][Arr[i]]
                    }
                }
            }
            if(u=="billing" && address[u]!=undefined){
                let Arr=["street","city","pincode"]
                for(let i=0;i<3;i++){
                    if(address[u][Arr[i]]!=undefined){
                        billing[Arr[i]]=address[u][Arr[i]]
                    }
                }
            }
            
            
        }
    })
    address.shipping=shipping
    address.billing=billing
    if(address){
        data["address"]=address
    }
    
    let reqArr=["fname", "lname", "email", "password", "phone", "profileImage", "address" ]
    let resArr=Object.keys(data)
    let count=0
    resArr.forEach((y)=>{
        if(!reqArr.includes(y)){
            count++
        }
    })
    // if(count>0){
    //     return res.status(400).send({ status: false, message: "please check your attributes..." });
    // }

    
        
        let finalUpdate = await userModel.findOneAndUpdate(
            { _id: userId }, 
            {...data}, 
            { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: finalUpdate });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err })
    }

}

module.exports={updateUsers}