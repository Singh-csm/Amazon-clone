const { isValidObjectId } = require("mongoose");

const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");


const placeOrder = async function (req, res) {
    // try {
    let userId = req.params.userId;
    let body = req.body;
    let { cartId } = body;

    if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Invalid User id." });
    }
    const checkUser = await userModel.findOne({ _id: userId });
    if (!checkUser) {
        return res.status(400).send({ status: false, message: "User doesn't exists with this User ID." });
    }

    // if (userId != req.token) {
    //     return res.status(403).send({ status: false, message: "you are not authorized to perform any action over this order..." })
    // }

    if (Object.keys(body).length == 0) {
        return res.status(400).send({ status: false, message: "Request body can not be empty." });
    }

    if (!cartId) {
        return res.status(400).send({ status: false, message: "Cart Id is required to place an Order." });
    }
    if (!isValidObjectId(cartId)) {
        return res.status(400).send({ status: false, message: "Invalid Cart id." });
    }
    const checkCart = await cartModel.findOne({ _id: cartId, userId: userId });
    if (!checkCart) {
        return res.status(400).send({ status: false, message: "Cart not found, please check your user id and cart id." });
    }
    if (checkCart.items.length == 0) {
        return res.status(404).send({ status: false, message: "Please add products in cart to place order." });
    }

    let totalQuantity = 0;
    for (let i = 0; i < checkCart.items.length; i++) {
        totalQuantity += checkCart.items[i].quantity;
    }

    let orderDetails = {
        userId: userId,
        items: checkCart.items,
        totalPrice: checkCart.totalPrice,
        totalItems: checkCart.totalItems,
        totalQuantity: totalQuantity
    }
    if (body.status == "cancled") {
        await cartModel.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } }
        );
       
        orderDetails.isDeleted=true
        orderDetails.deletedAt=Date.now()
        let createOrder = await orderModel.create(orderDetails);
       
        return res.status(201).send({ status: true, message: "order canceled successfully ", data: createOrder });
    }
    let createOrder = await orderModel.create(orderDetails);
    createOrder = createOrder._doc;
    delete createOrder.isDeleted;
    return res.status(201).send({ status: true, message: "Success", data: createOrder });
    // } catch (err) {
    //     return res.status(500).send({ status: false, message: err.message });
    // }
}


const updatedOrder = async (req, res) => {
    try {
        let data = req.body
        let orderId = req.body.orderId
        let userId = req.params.userId
        let validArr = Object.keys(data)
        let validatorArr = ["orderId", "status"]
        let count = 0
        validArr.forEach((x) => {
            if (!validatorArr.includes(x)) {
                count++
            }

        })
        if (count > 0) {
            return res.status(400).send({ status: false, message: "please provide valid attributes in order to update your order...." })
        }


        if (userId == undefined || (userId && userId.trim() == "")) {
            return res.status(400).send({ status: false, message: "please provide user Id...." })
        } if (!(isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "please provide valid user Id...." })
        }
        // if(userId!=req.token){
        //     return res.status(403).send({status:false,message:"you are not authorized to perform any action over this order..."})
        // }

        let isUserExist = await userModel.findOne({ _id: userId })
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "Sorry userId Doesn't exist in db..." })
        }

        if (orderId == undefined || (orderId && orderId.trim() == "")) {
            return res.status(400).send({ status: false, message: "please provide orderId...." })
        } if (!(isValidObjectId(orderId))) {
            return res.status(400).send({ status: false, message: "please provide valid orderId...." })
        }
        let isorderExist = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false })
        if (!isorderExist) {
            return res.status(404).send({ status: false, message: "Sorry this order is not present in db..." })
        }
        if (!data.status) {
            return res.status(404).send({ status: false, message: "please provide status in order to update your order..." })
        }
        let statusArr = ["pending", "completed", "cancled"]
        if (!statusArr.includes(data.status)) {
            return res.status(404).send({ status: false, message: "please provide valid status in order to update your order..." })
        }
        if (data.status == "cancled") {
            if (isorderExist.cancellable == false) {
                return res.status(400).send({ status: false, message: "Sorry this order cannot be cancelled....." })
            }

            await cartModel.findOneAndUpdate(
                { userId: userId },
                { $set: { items: [], totalItems: 0, totalPrice: 0 } }
            );

            let updatedOrder = await orderModel.findOneAndUpdate(
                { _id: orderId, userId: userId, isDeleted: false },
                { isDeleted: true, deletedAt: Date.now(), status: data.status,items: [], totalItems: 0, totalPrice: 0 },
                { new: true }
            ).select({ __v: 0 });

            return res.status(200).send({ status: true, message: "order cancelled successfully", data: updatedOrder })
        }
        let updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId, userId: userId, isDeleted: false },
            { status: data.status },
            { new: true }
        ).select({ __v: 0 });
        updatedOrder.isDeleted = undefined;
        return res.status(200).send({ status: true, message: "order updated successfully", data: updatedOrder })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { placeOrder, updatedOrder };