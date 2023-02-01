const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const userModel = require("../models/userModel");
const { validateName, validateEmail, validateMobileNo, validatePassword, validatePlace, validatePincode } = require("../validations/validator");
// const { uploadFiles } = require("../middleware/aws");


//==========Router handler for user registration===============
const registerUser = async function (req, res) {
    try {
        let body = req.body;
        let { fname, lname, email, phone, password, address } = body;

        console.log(body);
        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, message: "Request body can't be empty." });
        }

        //====validations for First name====
        if (fname && typeof fname != "string") {
            return res.status(400).send({ status: false, message: "First name must be in string" });
        }
        if (!fname || !fname.trim()) {
            return res.status(400).send({ status: false, message: "First name is required." });
        }
        if (!validateName(fname.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid First name" });
        }

        //====validations for last name====
        if (lname && typeof lname != "string") {
            return res.status(400).send({ status: false, message: "Last name must be in string" });
        }
        if (!lname || !lname.trim()) {
            return res.status(400).send({ status: false, message: "Last name is required." });
        }
        if (!validateName(lname.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid Last name." });
        }

        //====validations for Email====
        if (email && typeof email != "string") {
            return res.status(400).send({ status: false, message: "Email must be in String." });
        }
        if (!email || !email.trim()) {
            return res.status(400).send({ status: false, message: "Email is required." });
        }
        if (!validateEmail(email.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid Email." });
        }
        const existEmail = await userModel.findOne({ email: email });
        if (existEmail) {
            return res.status(400).send({ status: false, message: "This Email is already in use, try with another one." });
        }

        //====validations for Phone====
        if (phone && typeof phone != "string") {
            return res.status(400).send({ status: false, message: "phone number must be in String." });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).send({ status: false, message: "phone number is required." });
        }
        if (!validateMobileNo(phone.trim())) {
            return res.status(400).send({ status: false, message: "Enter a valid phone Number." });
        }
        const existphone = await userModel.findOne({ phone: phone });
        if (existphone) {
            return res.status(400).send({ status: false, message: "This phone is already in use, try with another one." });
        }

        //====validations for password====
        if (password && typeof password != "string") {
            return res.status(400).send({ status: false, message: "Password must be in string" });
        }
        if (!password || !password.trim()) {
            return res.status(400).send({ status: false, message: "password is required." });
        }
        if (!validatePassword(password.trim())) {
            return res.status(400).send({ status: false, message: "Password Must be 8-15 length,consist of mixed character and special character" });
        }
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            body.password = hash;
        });

        address=JSON.parse(body.address)
        //====validations for address====
        if (address && typeof address != "object") {
            return res.status(400).send({ status: false, message: "Address must be in Object Form." });
        }
        let { shipping, billing } = address;
        
        //====validations for shipping address====
        if (shipping && typeof shipping != "object") {
            return res.status(400).send({ status: false, message: "Shipping Address must be in Object Form." });
        }
        if (shipping.street && typeof shipping.street != "string") {
            return res.status(400).send({ status: false, message: "Street must be in string" });
        }
        if (!shipping.street || !shipping.street.trim()) {
            return res.status(400).send({ status: false, message: "Street is required." });
        }
        if (shipping.city && typeof shipping.city != "string") {
            return res.status(400).send({ status: false, message: "City must be in string" });
        }
        if (!shipping.city || !shipping.city.trim()) {
            return res.status(400).send({ status: false, message: "City is required." });
        }
        if (!validatePlace(shipping.city.trim())) {
            return res.status(400).send({ status: false, message: "City is invalid, number is not allowed." });
        }
        if (shipping.pincode && typeof shipping.pincode != "string") {
            return res.status(400).send({ status: false, message: "Pincode must be in string" });
        }
        if (!shipping.pincode || !shipping.pincode.trim()) {
            return res.status(400).send({ status: false, message: "Pincode is required." });
        }
        if (!validatePincode(shipping.pincode.trim())) {
            return res.status(400).send({ status: false, message: "pincode is invalid, it contains only 6 digits." });
        }

        //====validations for Billing address====
        if (billing && typeof billing != "object") {
            return res.status(400).send({ status: false, message: "Billing Address must be in Object Form." });
        }
        if (billing.street && typeof billing.street != "string") {
            return res.status(400).send({ status: false, message: "Street must be in string" });
        }
        if (!billing.street || !billing.street.trim()) {
            return res.status(400).send({ status: false, message: "Street is required." });
        }
        if (billing.city && typeof billing.city != "string") {
            return res.status(400).send({ status: false, message: "City must be in string" });
        }
        if (!billing.city || !billing.city.trim()) {
            return res.status(400).send({ status: false, message: "City is required." });
        }
        if (!validatePlace(billing.city.trim())) {
            return res.status(400).send({ status: false, message: "City is invalid, number is not allowed." });
        }
        if (billing.pincode && typeof billing.pincode != "string") {
            return res.status(400).send({ status: false, message: "Pincode must be in string" });
        }
        if (!billing.pincode || !billing.pincode.trim()) {
            return res.status(400).send({ status: false, message: "Pincode is required." });
        }
        if (!validatePincode(billing.pincode.trim())) {
            return res.status(400).send({ status: false, message: "pincode is invalid, it contains only 6 digits." });
        }

        //uploading file to Amazon s3 environment
        // let files = req.files;
        // if (files && files.length > 0) {
        //     let uploadFileUrl = await uploadFiles(files[0]);
        //     body.profileImage = uploadFileUrl;

        //     const uniqueProfileImg = await userModel.findOne({ profileImage: uploadFileUrl });
        //     if (uniqueProfileImg) {
        //         return res.status(400).send({ status: false, message: "Profile Image is already exists." });
        //     }
        // } else {
        //     return res.status(400).send({ status: false, message: "No Profile Image found." });
        // }

        body.address=JSON.parse(body.address)
        const registerUser = await userModel.create(body);

        res.status(201).send({ status: true, message: "User created successfully", data: registerUser });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


//===========Router handler for get user============
const getUser = async function(req, res)  {

    try {
        let userId = req.params.userId;
        if (!userId) { return res.status(400).send({ status: false, message: "User Id is required in params" }) }
      //  let token_UserId = req.decode.userId;  //userId from token 
       
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, messsge: "Invalid user Id" })

        //------------------------userId matches from the token for authorization purpose-------------------------------//
        //if(userId !== token_UserId){ return res.status(403).send({ status:false, message:"you are not authorized user"})}
        const getData = await userModel.findById({ _id: userId });
         if (!getData) { return res.status(404).send({ status: false, message: "User Id is not present in DataBase" }) }

        return res.status(200).send({ status: true, message: "User profile details", data: getData })

    } catch (error) {
        return res.status(500).send({ status: false, Message: error.Message })
    }

}


//===========router handler for Update user================
const updateUser = async (req, res) => {
    // try {
        let userId = req.params.userId
        if (!userId || (userId && userId.trim() == "")) {
            return res.status(400).send({ status: false, message: " userId cant be empty" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " please enter valid userId..." })
        }
        let isUserId = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!isUserId) {
            return res.status(404).send({ status: false, message: "sorry we can't find userId in our collection... " })

        }
        let { fname, lname, email, password, phone, profileImage, address } = req.body
        console.log(req.body);
        let queryArr = Object.keys(req.body)
        if (queryArr.length == 0) {
            return res.status(400).send({ status: false, message: "please enter some data in order to update your document...." })
        }
        let updatedData = {}
        if ((fname && fname.trim() == "")) {
            return res.status(400).send({ status: false, message: "please provide your fname it cant be empty..." })
        } if (!validateName(fname)) {
            return res.status(400).send({ status: false, message: "please provid valid fname to update" })
        }
        if (fname) {
            updatedData.fname == fname.trim()
        }

        if ((lname && lname.trim() == "")) {
            return res.status(400).send({ status: false, message: "please provide your lname it cant be empty..." })
        } if (!validateName(lname) ) {
            return res.status(400).send({ status: false, message: "please provid valid lname to update" })
        }
        if (lname) {
            updatedData.lname == lname.trim()
        }
        if ((email && email.trim() == "")) {
            return res.status(400).send({ status: false, message: "please provide your email it cant be empty..." })
        } if (!validateEmail(email)) {
            return res.status(400).send({ status: false, message: "please provid valid email to update" })
        }
        if (isUserId.email == email.trim()) {
            return res.status(400).send({ status: false, message: "sorry there is already a document existing with same email" })
        }
        if (email) {
            updatedData.email == email.trim()
        }



        if (password && password.trim() == "") {
            return res.status(400).send({ status: false, message: "Password cant be empty" });
        }
        if (!validatePassword(password.trim())) {
            return res.status(400).send({ status: false, message: "Password Must be 8-15 length,consist of mixed character and special character" });
        }
        // if (password) {
        //     updatedData.password == password.trim()
        // }
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            updatedData.password = hash;
        });

        if (phone && phone.trim() == "") {
            return res.status(400).send({ status: false, message: "phone number cant be empty..." });
        }
        if (!validateMobileNo(phone.trim())) {
            return res.status(400).send({ status: false, message: "Password Must be 8-15 length,consist of mixed character and special character" });
        }

        if (isUserId.phone == phone.trim()) {
            return res.status(400).send({ status: false, message: "sorry this phone number already exist in collection " })
        }
        if (phone) {
            updatedData.phone == phone.trim()
        }
        if (profileImage && typeof (profileImage) != "string") {
            return res.status(400).send({ status: false, message: "please enter valid profileImage " });
        }
        if (profileImage) {
            updatedData.profileImage == profileImage
        }

        address = JSON.parse(req.body.address) ;
    
        if (typeof (address) != "object") {
            return res.status(400).send({ status: false, message: "address has to be an object " });
        }
        let x = ["street", "city", "pincode"]
        let f = ["shipping", "billing"]
        let a = Object.keys(address)

        let count = 0
        f.forEach((y) => {
            if (!a.includes(y)) {
                count++
            }
        })
        if (count > 0) {
            return res.status(400).send({ status: false, message: "please enter valid attributes of address" });
        }
        console.log(address.shipping);
        if (address.shipping) {
            if (typeof (address.shipping) != "object") {
                return res.status(400).send({ status: false, message: "shipping should be an object" });
            }
            let { street, city, pincode } = address.shipping

            if (street && street.trim() == "") {
                return res.status(400).send({ status: false, message: "street cant be empty" });

            }
            if(street) address.shipping.street=street
            // if (validateName(street)) {
            //     return res.status(400).send({ status: false, message: "street name is in valid" });
            // }
             if (city && city.trim() == "") {
                return res.status(400).send({ status: false, message: "city cant be empty" });
            } if (!validateName(city)) {
                return res.status(400).send({ status: false, message: "please enter valid city name" });
            }
            if(city) address.shipping.city=city
            if (pincode && pincode.trim() == "") {
                return res.status(400).send({ status: false, message: "pincode cant be empty" });
            }
            
            if(pincode) address.shipping.pincode=pincode
            
        }

        updatedData.address=address;

        if (address.billing) {
            if (typeof (address.billing) != "object") {
                return res.status(400).send({ status: false, message: "billing should be an object" });
            }
            let { street, city, pincode } = address.billing

            if (street && street.trim() == "") {
                return res.status(400).send({ status: false, message: "street cant be empty" });

            }
            if(street) address.billing.street=street
            // if (validateName(street)) {
            //     return res.status(400).send({ status: false, message: "street name is in valid" });
            // }
             if (city && city.trim() == "") {
                return res.status(400).send({ status: false, message: "city cant be empty" });
            } if (!validateName(city)) {
                return res.status(400).send({ status: false, message: "please enter valid city name" });
            }
            if(city) address.billing.city=city
            if (pincode && pincode.trim() == "") {
                return res.status(400).send({ status: false, message: "pincode cant be empty" });
            }
            
            if(pincode) address.billing.pincode=pincode

            updatedData.address.billing = address.billing
        }

        // let finalArr = Object.keys(updatedData)
        // if (finalArr.length != queryArr.length) {
        //     return res.status(400).send({ status: false, message: "please check your attributes.." });
        // }
        console.log(updatedData);
        let finalUpdate = await userModel.findOneAndUpdate(
            { _id: userId }, 
            {...updatedData}, 
            { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: finalUpdate });
    // }
    // catch (err) {
    //     return res.status(500).send({ status: false, message: err })
    // }

}

//============Router handler for Login User===============
const login = async function (req, res) {
    try {
        const email = req.body.email
        const password = req.body.password
        const check = await userModel.findOne({ email: email })
        if (!check) return res.status(400).send({ status: false, message: "Please provide correct credentials" })//status code
        const passwordCompare = await bcrypt.compare(password, check.password)

        if (!passwordCompare) return res.status(400).send({ status: false, message: "please provide correct credentials" })
        else {
            const token = jwt.sign({ userId: check._id.toString(), password: password }, "Secret key", { expiresIn: "5hr" })
            return res.status(200).send({ status: true, message: "User Login Successfull", data: { userId: check._id, token: token } })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { registerUser , updateUser , getUser , login};