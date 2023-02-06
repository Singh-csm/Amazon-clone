const { isValidObjectId } = require("mongoose");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isValidNum } = require("../validations/validator");


//<<<===================== This function is used for Create Cart Data =====================>>>//
const createCart = async function (req, res) {

    try {

        let userId = req.params.userId
        let data = req.body

        //===================== Destructuring Cart Body Data =====================//
        let { cartId, productId, quantity } = data

        //===================== Checking Field =====================//
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Data is required inside request body" })
        //===================== Validation of productId =====================//
        if (!productId) return res.status(400).send({ status: false, message: "Enter ProductId." })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `This ProductId: ${productId} is not valid!` })

        //===================== Fetching Product Data is Present or Not =====================//
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) { return res.status(404).send({ status: false, message: `This ProductId: ${productId} is not exist!` }) }

        if (quantity < 0) return res.status(400).send({ status: false, message: "quantity is must be greater than 0" })

        if (quantity || typeof quantity == 'string') {

            if (!isValidNum(quantity)) return res.status(400).send({ status: false, message: "Quantity of product should be in numbers." })

        } else {
            quantity = 1
        }

        //===================== Assign Value =====================//
        let Price = checkProduct.price


        if (cartId) {

            //===================== Checking the CartId is Valid or Not by Mongoose =====================//
            if (!cartId) return res.status(400).send({ status: false, message: "Enter a cartId" });
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `This cartId: ${cartId} is not valid!.` })

            //===================== Fetch the Cart Data from DB =====================//
            let checkCart = await cartModel.findOne({ _id: cartId, userId: userId }).select({ _id: 0, items: 1, totalPrice: 1, totalItems: 1 })

            //===================== This condition will run when Card Data is present =====================//
            if (checkCart) {

                let items = checkCart.items
                let object = {}

                //===================== Run Loop in items Array =====================//
                for (let i = 0; i < items.length; i++) {

                    //===================== Checking both ProductId are match or not =====================//
                    if (items[i].productId.toString() == productId) {

                        items[i]['quantity']++

                        let totalPrice = checkCart.totalPrice + (quantity * Price)
                        let totalItem = items.length

                        //===================== Push the Key and Value into Object =====================//
                        object.items = items
                        object.totalPrice = totalPrice
                        object.totalItems = totalItem

                        //===================== Update Cart document =====================//
                        let updateCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true }).populate('items.productId')

                        return res.status(201).send({ status: true, message: "Success", data: updateCart })

                    }
                }

                //===================== Pushing the Object into items Array =====================//
                items.push({ productId: productId, quantity: quantity })
                let tPrice = checkCart.totalPrice + (quantity * Price)

                //===================== Push the Key and Value into Object =====================//
                object.items = items
                object.totalPrice = tPrice
                object.totalItems = items.length

                //===================== Update Cart document =====================//
                let update1Cart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true }).populate('items.productId')


                return res.status(201).send({ status: true, message: "Success", data: update1Cart })

            }


            else {

                return res.status(404).send({ status: false, message: "Cart doesn't exist with this userId!" })
            }

        } else {

            //===================== Fetch the Cart Data from DB =====================//
            let cart = await cartModel.findOne({ userId: userId })

            //===================== This condition will run when Card Data is not present =====================//
            if (!cart) {

                //===================== Make a empty Array =====================//
                let arr = []
                let totalPrice = quantity * Price

                //===================== Pushing the Object into items Arr =====================//
                arr.push({ productId: productId, quantity: quantity })

                //===================== Create a object for Create Cart =====================//
                let obj = {
                    userId: userId,
                    items: arr,
                    totalItems: arr.length,
                    totalPrice: totalPrice
                }

                //===================== Final Cart Creation =====================//
                await cartModel.create(obj)

                let resData = await cartModel.findOneAndUpdate({ userId }, { $push: { productId: productId, quantity: quantity } }).populate('items.productId')

                return res.status(201).send({ status: true, message: "Success", data: resData })

            } else {

                return res.status(400).send({ status: false, message: "You have already CartId which is exist in your account." })
            }
        }

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}


let updatecart = async function (req, res) {
    try {
        let { productId, cartId, removeProduct } = req.body;
        console.log(removeProduct)
        let data = req.body
        if (Object.keys(data).length == 0) return res.send("no keys found")

        if (!productId) return res.status(400).send({ status: "false", message: "please provide productId" })
        if (!cartId) return res.status(400).send({ status: "false", message: "please provide cartId" })
        // if(!removeProduct) return res.status(400).send({status:"false",message:"please provide removeProduckey"})

        if (productId) {
            if (!isValid.isValidString(productId)) return res.status(400).send({ status: "false", message: "product Id cannot be empty" })
            if (!isValidObjectId(productId)) return res.status(400).send({ status: "false", message: "enter a valid product Id" })

        }
        if (cartId) {
            if (!isValid.isValidString(productId)) return res.status(400).send({ status: "false", message: "cart Id cannot be empty" })
            if (!isValidObjectId(productId)) return res.status(400).send({ status: "false", message: "enter a valid cart Id" })
        }

        // if( (data.removeProduct!==1 || data.removeProduct!==0)) return res.status(400).send({status:false,message:"set removeproduct to 0 to remove the product and 1 to reduce the quantity"})


        let productdetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productdetails) return res.status(404).send({ status: false, message: "product doesnot exists" })



        let cartdetails = await cartModel.findOne({ _id: cartId })
        if (!cartdetails) return res.status(404).send({ status: false, message: "cart doesnot exists create a new cart" })
        console.log(cartdetails)

        let Arrayitems = cartdetails.items
        let totalprice = cartdetails.totalPrice
        totalItems = cartdetails.totalItems
        console.log(Arrayitems.length)

        if (removeProduct == 0) {
            let Product = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1 })
            if (!Product) return res.status(404).send({ status: false, message: "Product not found" })
            let quantity = 1
            Arrayitems.forEach((x, i) => {
                if (x.productId == productId) {
                    Arrayitems.splice(i, 1)
                    quantity = x.quantity
                }
            })
            totalprice = totalprice - (Product.price) * quantity
            totalItems = totalItems - 1
        }

        else if (removeProduct == 1) {
            let Product = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1 })
            Arrayitems.forEach((x, i) => {
                if (x.productId == productId) {
                    x.quantity--
                }
            })
            totalprice = totalprice - Product.price
            totalItems = totalItems - 1
        }


        const removeditems = await cartModel.findOneAndUpdate({ _id: cartId }, { items: Arrayitems, totalPrice: totalprice, totalItems: totalItems }, { new: true }).select({ __v: 0 })
        if (!removeditems) return res.status(404).send({ status: false, message: "cart not found" })
        return res.status(200).send(removeditems)
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const getCartDetails = async function (req, res) {
    try {
        let userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({ status: false, message: "User Id is required." });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid User Id." });
        }

        let checkExistsUser = await userModel.findOne({ _id: userId });
        if (!checkExistsUser) {
            return res.status(404).send({ status: false, message: "User doesn't exists in DB with this User Id." });
        }

        // if (userId != req.token) {
        //     return res.status(403).send({ status: false, message: "User is not Authorized to fetch the cart details." });
        // }

        const cartDetails = await cartModel.findOne({ userId: userId })
            .populate({
                path: "items", populate: { path: "productId", model: "ProductData", select: { _id: 0, updatedAt: 0, createdAt: 0, isDeleted: 0, isFreeShipping: 0, __v: 0, currencyId: 0, currencyFormat: 0 } },
            });

        if (!cartDetails) {
            return res.status(400).send({ status: false, message: "Cart dosen't exists with this User Id." });
        }
        return res.status(200).send({ status: true, message: "Success", data: cartDetails });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId have tobe an ObjectId...." })

        }
        if (userId != req.token) {
            return res.status(403).send({ status: false, message: "you are unauthorized to perform  delete action ...." })
        }
        let isUserExist = await userModel.findOne({ userId: userId, isDeleted: false })
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "no card exist in db with given userId..." })
        }
        let deletedCart = await cartModel.findOneAndUpdate({ userId: userId, isDeleted: false }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        res.status(204).send()
    }
    catch (err) {
        res.status(500).send({ status: false, err: err.message })
    }
}


module.exports = { getCartDetails, deleteCart, createCart, updatecart };