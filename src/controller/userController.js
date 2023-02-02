const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const userModel = require("../models/userModel");
const { validateName, validateEmail, validateMobileNo, validatePassword, validatePlace, validatePincode } = require("../validations/validator");


//==========Router handler for user registration===============
const registerUser = async function (req, res) {
    try {
        let body = req.body;

        if (body.address) {
            body.address = JSON.parse(body.address);
        }

        let { fname, lname, email, phone, password, address, profileImage } = body;

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
        // const saltRounds = 10;
        // bcrypt.hash(password, saltRounds, function (err, hash) {
        //     body.password = hash;
        // });
        let hashing = bcrypt.hashSync(password, 10);
        body.password = hashing;


        //====validations for address====
        if (!address) {
            return res.status(400).send({ status: false, message: "Address is required." });
        }

        // address = JSON.parse(body.address);
        if (address && typeof address != "object") {
            return res.status(400).send({ status: false, message: "Address must be in Object Form." });
        }
        let { shipping, billing } = address;
        //====validations for shipping address====
        if (shipping && typeof shipping != "object") {
            return res.status(400).send({ status: false, message: "Shipping Address must be in Object Form." });
        }
        if (!shipping) {
            return res.status(400).send({ status: false, message: "Shipping Adderss is required." });
        }
        if (shipping.street && typeof shipping.street != "string") {
            return res.status(400).send({ status: false, message: "shipping Street must be in string" });
        }
        if (!shipping.street || !shipping.street.trim()) {
            return res.status(400).send({ status: false, message: "shipping Street is required." });
        }
        if (shipping.city && typeof shipping.city != "string") {
            return res.status(400).send({ status: false, message: "shipping City must be in string" });
        }
        if (!shipping.city || !shipping.city.trim()) {
            return res.status(400).send({ status: false, message: "shipping City is required." });
        }
        if (!validatePlace(shipping.city.trim())) {
            return res.status(400).send({ status: false, message: "shipping City is invalid, number is not allowed." });
        }
        if (shipping.pincode && typeof shipping.pincode != "string") {
            return res.status(400).send({ status: false, message: "shipping Pincode must be in string" });
        }
        if (!shipping.pincode || !shipping.pincode.trim()) {
            return res.status(400).send({ status: false, message: "shipping Pincode is required." });
        }
        if (!validatePincode(shipping.pincode.trim())) {
            return res.status(400).send({ status: false, message: "shipping pincode is invalid, it contains only 6 digits." });
        }

        //====validations for Billing address====
        if (billing && typeof billing != "object") {
            return res.status(400).send({ status: false, message: "Billing Address must be in Object Form." });
        }
        if (!billing) {
            return res.status(400).send({ status: false, message: "Billing Adderss is required." });
        }
        if (billing.street && typeof billing.street != "string") {
            return res.status(400).send({ status: false, message: "Billing Street must be in string" });
        }
        if (!billing.street || !billing.street.trim()) {
            return res.status(400).send({ status: false, message: "Billing Street is required." });
        }
        if (billing.city && typeof billing.city != "string") {
            return res.status(400).send({ status: false, message: "Billing City must be in string" });
        }
        if (!billing.city || !billing.city.trim()) {
            return res.status(400).send({ status: false, message: "Billing City is required." });
        }
        if (!validatePlace(billing.city.trim())) {
            return res.status(400).send({ status: false, message: "Billing City is invalid, number is not allowed." });
        }
        if (billing.pincode && typeof billing.pincode != "string") {
            return res.status(400).send({ status: false, message: "Billing Pincode must be in string" });
        }
        if (!billing.pincode || !billing.pincode.trim()) {
            return res.status(400).send({ status: false, message: "Billing Pincode is required." });
        }
        if (!validatePincode(billing.pincode.trim())) {
            return res.status(400).send({ status: false, message: "Billing pincode is invalid, it contains only 6 digits." });
        }

        body.profileImage = req.profileImage;
        const registerUser = await userModel.create(body);

        res.status(201).send({ status: true, message: "User created successfully", data: registerUser });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


//===========Router handler for get user============
const getUser = async function (req, res) {

    try {
        let userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: "User Id is required in params" })
        }
        //  let token_UserId = req.decode.userId;  //userId from token 

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, messsge: "Invalid user Id" });
        }

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
const updateUsers = async (req, res) => {
    try {
        let userId = req.params.userId

        if (!userId || (userId && userId.trim() == "")) {
            return res.status(400).send({ status: false, message: " userId cant be empty" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " please enter valid userId..." })
        }
        let isUserId = await userModel.findOne({ _id: userId }).lean()
        if (!isUserId) {
            return res.status(404).send({ status: false, message: "sorry we can't find userId in our collection... " })
        }

        //====authorization part=====
        if (isUserId._id != req.token) {
            return res.status(403).send({ status: false, message: "You are not authorize to update." });
        }

        let data = req.body

        let { fname, lname, email, password, phone, profileImage, address } = data



        if (fname) {
            if (fname && typeof fname != "string") {
                return res.status(400).send({ status: false, message: "First name must be in string" });
            }
            if (!validateName(fname.trim())) {
                return res.status(400).send({ status: false, message: "Enter a valid First name" });
            }
        }

        if (lname) {
            if (lname && typeof lname != "string") {
                return res.status(400).send({ status: false, message: "Last name must be in string" });
            }
            if (!validateName(lname.trim())) {
                return res.status(400).send({ status: false, message: "Enter a valid Last name." });
            }
        }

        //====validations for Email====
        if (email) {
            if (email && typeof email != "string") {
                return res.status(400).send({ status: false, message: "Email must be in String." });
            }
            if (!validateEmail(email.trim())) {
                return res.status(400).send({ status: false, message: "Enter a valid Email." });
            }
            const checkEmail = await userModel.findOne({ email: email });
            if (checkEmail) {
                return res.status(400).send({ status: false, message: "This Email is already in use, try with another one." });
            }
        }

        //====validations for Phone====
        if (phone) {
            if (phone && typeof phone != "string") {
                return res.status(400).send({ status: false, message: "phone number must be in String." });
            }
            if (!validateMobileNo(phone.trim())) {
                return res.status(400).send({ status: false, message: "Enter a valid phone Number." });
            }

            const checkPhone = await userModel.findOne({ phone: phone });
            if (checkPhone) {
                return res.status(400).send({ status: false, message: "This Phone number is already in use, try with another one." });
            }
        }
        //====validations for password====
        if (password) {
            if (password && typeof password != "string") {
                return res.status(400).send({ status: false, message: "Password must be in string" });
            }

            if (!validatePassword(password.trim())) {
                return res.status(400).send({ status: false, message: "Password Must be 8-15 length,consist of mixed character and special character" });
            }
            let hashing = bcrypt.hashSync(password, 10);
            data.password = hashing;
        }

        if (profileImage) {
            data.profileImage = req.profileImage;
        }

        if (address) {
            address = JSON.parse(data.address)
            //====validations for address====
            if (address && typeof address != "object") {
                return res.status(400).send({ status: false, message: "Address must be in Object Form." });
            }
            let { shipping, billing } = address;

            //====validations for shipping address====
            if (shipping) {
                if (shipping && typeof shipping != "object") {
                    return res.status(400).send({ status: false, message: "Shipping Address must be in Object Form." });
                }
                if (shipping.street) {
                    if (shipping.street && typeof shipping.street != "string") {
                        return res.status(400).send({ status: false, message: "Street must be in string" });

                    }
                    //console.log(isUserId)



                }
                if (shipping.city) {
                    if (shipping.city && typeof shipping.city != "string") {
                        return res.status(400).send({ status: false, message: "City must be in string" });
                    }
                    if (!validatePlace(shipping.city.trim())) {
                        return res.status(400).send({ status: false, message: "City is invalid, number is not allowed." });
                    }
                }


                if (shipping.pincode) {
                    if (shipping.pincode && typeof (shipping.pincode) != "string") {
                        console.log(shipping.pincode)
                        return res.status(400).send({ status: false, message: "Pincode must be in number" });
                    }

                }
            }
            //====validations for Billing address====
            if (billing != undefined) {
                if (billing && typeof billing != "object") {
                    return res.status(400).send({ status: false, message: "Billing Address must be in Object Form." });
                }

                if (billing.street) {
                    if (billing.street && typeof billing.street != "string") {
                        return res.status(400).send({ status: false, message: "Street must be in string" });
                    }
                }

                if (billing.city) {
                    if (billing.city && typeof billing.city != "string") {
                        return res.status(400).send({ status: false, message: "City must be in string" });
                    }
                    if (!validatePlace(billing.city.trim())) {
                        return res.status(400).send({ status: false, message: "City is invalid, number is not allowed." });
                    }
                }

                if (billing.pincode) {
                    if (billing.pincode && typeof billing.pincode != "string") {
                        return res.status(400).send({ status: false, message: "Pincode must be in string" });
                    }
                    if (!validatePincode(billing.pincode.trim())) {
                        return res.status(400).send({ status: false, message: "pincode is invalid, it contains only 6 digits." });
                    }
                }
            }

            let a = isUserId.address


        }
        let { shipping, billing } = isUserId.address
        let arr = Object.keys(address)
        arr.forEach((u) => {
            if (u == "shipping" || u == "billing") {
                if (u == "shipping" && address[u] != undefined) {
                    let Arr = ["street", "city", "pincode"]
                    for (let i = 0; i < 3; i++) {
                        if (address[u][Arr[i]] != undefined) {
                            shipping[Arr[i]] = address[u][Arr[i]]
                        }
                    }
                }
                if (u == "billing" && address[u] != undefined) {
                    let Arr = ["street", "city", "pincode"]
                    for (let i = 0; i < 3; i++) {
                        if (address[u][Arr[i]] != undefined) {
                            billing[Arr[i]] = address[u][Arr[i]]
                        }
                    }
                }


            }
        })
        address.shipping = shipping
        address.billing = billing
        if (address) {
            data["address"] = address
        }

        let reqArr = ["fname", "lname", "email", "password", "phone", "profileImage", "address"]
        let resArr = Object.keys(data)
        let count = 0
        resArr.forEach((y) => {
            if (!reqArr.includes(y)) {
                count++
            }
        })
        // if(count>0){
        //     return res.status(400).send({ status: false, message: "please check your attributes..." });
        // }



        let finalUpdate = await userModel.findOneAndUpdate(
            { _id: userId },
            { ...data },
            { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: finalUpdate });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err })
    }

}

//============Router handler for Login User===============
const login = async function (req, res) {
    try {
        const body = req.body;
        let { email, password } = body;

        if (email && typeof email != "string") {
            return res.status(400).send({ status: false, message: "email must be in string" });
        }
        if (!email || !email.trim()) {
            return res.status(400).send({ status: false, message: "Email is mandatory and can not be empty." });
        }
        email = email.toLowerCase().trim();
        if (!validateEmail(email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid Email." });
        }

        if (password && typeof password != "string") {
            return res.status(400).send({ status: false, message: "password must be in string" });
        }
        if (!password || !password.trim()) {
            return res.status(400).send({ status: false, message: "Password is mandatory and can not be empty." });
        }

        const check = await userModel.findOne({ email: email });
        if (!check) {
            return res.status(400).send({ status: false, message: "No such user exist. Please Enter a valid Email and Passowrd." })//status code
        }
        const passwordCompare = await bcrypt.compare(password, check.password)

        if (!passwordCompare) {
            return res.status(400).send({ status: false, message: "please provide correct credentials , Password is incorrect." });
        }

        const token = jwt.sign(
            { userId: check._id.toString() }, "NKTCGROUPTHREEPROJECTFIVE", { expiresIn: "10m" }
        );
        return res.status(200).send({ status: true, message: "User Login Successfull", data: { userId: check._id, token: token } });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { registerUser, updateUsers, getUser, login };