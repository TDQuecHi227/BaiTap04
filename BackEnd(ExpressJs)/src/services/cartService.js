const Cart = require("../models/Cart");
const Course = require("../models/Course");

const getCartByUserId = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: "items.courseId",
    select: "title price discountPrice thumbnailUrl teacherId",
    populate: { path: "teacherId", select: "username" }
  });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

const addToCart = async (userId, courseId) => {
  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // Find user's cart
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Check if already in cart
  const exists = cart.items.find((item) => item.courseId.toString() === courseId);
  if (exists) {
    throw new Error("Course already in cart");
  }

  cart.items.push({ courseId });
  await cart.save();

  return await cart.populate({
    path: "items.courseId",
    select: "title price discountPrice thumbnailUrl teacherId",
    populate: { path: "teacherId", select: "username" }
  });
};

const removeFromCart = async (userId, courseId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.courseId.toString() !== courseId
  );
  await cart.save();

  return await cart.populate({
    path: "items.courseId",
    select: "title price discountPrice thumbnailUrl teacherId",
    populate: { path: "teacherId", select: "username" }
  });
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return cart;
};

module.exports = {
  getCartByUserId,
  addToCart,
  removeFromCart,
  clearCart,
};
