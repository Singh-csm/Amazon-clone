const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isIdValid, valid, isValidString } = require("../validations/validator");


//<<<===================== This function is used for Create Cart Data =====================>>>//
const createCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!userId) {
            return res.status(400).send({ status: false, msg: "Please give UserId in Url" })
        }
        if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid User" })
        }
        let user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, msg: "User not Exists" })
        }

        //Authorization validation
        if (userId != req.token) {
            return res.status(403).send({ status: false, message: "User is not Authorized to fetch the cart details." });
        }

        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Data is Missing" })
        }
        let productId = req.body.productId
        if (!productId) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (mongoose.Types.ObjectId.isValid(productId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid productId" })
        }
        let productExists = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExists) {
            return res.status(404).send({ status: false, msg: "Product not Exists" })
        }
        console.log(productExists)
        let cartId = req.body.cartId
        if (cartId) {
            if (valid(cartId) == false) {
                return res.status(400).send({ status: false, msg: "provide Cart Id" })
            }
            if (mongoose.Types.ObjectId.isValid(cartId) == false) {
                return res.status(400).send({ status: false, msg: "Invalid Cart Id" })
            }
            let cartExists = await cartModel.findOne({ _id: cartId, userId: userId })
            if (!cartExists) {
                return res.status(404).send({ status: false, message: "cart for this user doesnt exist..." })
            }
        }
        let cartExists = await cartModel.findOne({ userId: userId }).lean()
        let price = productExists.price

        if (!cartExists) {
            let newCart = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: 1
                }],
                totalPrice: price,
                totalItems: 1
            }



            let creatNewCart = await cartModel.create(newCart)
            let iscreatNewCart = await cartModel.findOne({ _id: creatNewCart._id }).lean()
            // iscreatNewCart={userId,items,totalPrice,totalItems}
            let arr = []
            iscreatNewCart["items"].forEach((x) => {
                delete x["_id"]
                arr.push(x)
            })
            iscreatNewCart["items"] = arr
            return res.status(201).send({ status: true, message: "cart created succesfully", data: iscreatNewCart })



        }

        if (!cartId) {
            return res.status(404).send({ status: false, message: "provide Cart Id for the User" })
        }
        let usersCartId = cartExists._id
        if (usersCartId != cartId) {
            return res.status(404).send({ status: false, message: "Cart id is not matched with this User" })
        }

        let x = []

        let totalPrices = cartExists["totalPrice"]
        let c1 = 0
        //items=[]=>{productId..}=>quantity++=>delete id//
        for (let i = 0; i < cartExists['items'].length; i++) {
            if (cartExists['items'][i].productId == productId) {
                cartExists['items'][i].quantity = cartExists['items'][i].quantity + 1
                totalPrices += productExists.price
                console.log(cartExists['items'][i])
                c1++
            }
            delete cartExists['items'][i]["_id"]
            x.push(cartExists['items'][i])
        }
        if (c1 == 0) {
            let obj = {}
            obj.productId = productId
            obj.quantity = 1
            totalPrices += productExists.price
            console.log(totalPrices)
            x.push(obj)

        }
        x.push()

        console.log(x)
        let updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: x, totalPrice: totalPrices, totalItems: x.length }, { new: true })
        let { _id, items, totalPrice, totalItems, createdAt, updatedAt } = updateCart
        items = x
        let y = { _id, userId, items, totalPrice, totalItems, createdAt, updatedAt }
        y.userId = userId

        return res.status(201).send({ status: true, message: "Success ", data: y })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}


let updatecart = async function (req, res) {
    let { productId, cartId, removeProduct } = req.body;

    let data = req.body
    let dataInBody = Object.keys(data);
    if (Object.keys(data).length == 0) return res.send("no keys found")

    let arr = ["productId", "cartId", "removeProduct"];

    for (let i = 0; i < dataInBody.length; i++) {
        const someThing = dataInBody[i];
        if (!arr.includes(someThing)) {
            return res.status(400).send({ status: false, message: `${someThing} is not a valid Property.` });
        }
    }

    let userId = req.params.userId

        if (!userId) {
            return res.status(400).send({ status: false, msg: "Please give UserId in Url" })
        }
        if (mongoose.Types.ObjectId.isValid(userId) == false) {
            return res.status(400).send({ status: false, msg: "Invalid User" })
        }
        let user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, msg: "User not Exists" })
        }

        //Authorization validation
        if (userId != req.token) {
            return res.status(403).send({ status: false, message: "User is not Authorized to fetch the cart details." });
        }

    if (!productId) return res.status(400).send({ status: "false", message: "please provide productId" })
    if (!cartId) return res.status(400).send({ status: "false", message: "please provide cartId" })
    if (removeProduct == undefined) return res.status(400).send({ status: "false", message: "please provide removeProduct key" })

    if (productId) {
        if (!isValidString(productId)) return res.status(400).send({ status: "false", message: "product Id cannot be empty" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: "false", message: "enter a valid product Id" })

    }
    if (cartId) {
        if (!isValidString(productId)) return res.status(400).send({ status: "false", message: "cart Id cannot be empty" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: "false", message: "enter a valid cart Id" })
    }

    // if( (removeProduct!=1) || (removeProduct!=0)) return res.status(400).send({status:false,message:"set removeproduct to 0 to remove the product and 1 to reduce the quantity"})


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
                totalprice = totalprice - (Product.price) * quantity
            }
        })
        if (totalprice <= 0) {
            totalprice = 0;
        }

        if (totalItems > 0) {
            totalItems = totalItems - 1
        } else {
            totalItems = 0
        }
    }

    else if (removeProduct == 1) {
        let Product = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1 })
        Arrayitems.forEach((x, i) => {
            if (x.productId == productId) {
                if (x.quantity > 0) {
                    x.quantity--
                }
                if (x.quantity == 0) {
                    Arrayitems.splice(i, 1)
                    totalItems = 0
                }
            }
        })
        totalprice = totalprice - Product.price
        if (totalprice <= 0) {
            totalprice = 0;
        }
    } else {
        return res.status(400).send({ status: false, message: "set removeproduct to 0 to remove the product and 1 to reduce the quantity" })
    }


    const removeditems = await cartModel.findOneAndUpdate({ _id: cartId }, { items: Arrayitems, totalPrice: totalprice, totalItems: totalItems }, { new: true }).select({ __v: 0 })
    if (!removeditems) return res.status(404).send({ status: false, message: "cart not found" })
    return res.status(200).send({ status: true, message: "Success", data: removeditems })
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

        if (userId != req.token) {
            return res.status(403).send({ status: false, message: "User is not Authorized to fetch the cart details." });
        }

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