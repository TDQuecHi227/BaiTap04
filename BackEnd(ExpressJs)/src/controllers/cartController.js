const cartService = require("../services/cartService");

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartByUserId(userId);
    return res.status(200).json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy giỏ hàng",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId là bắt buộc",
      });
    }

    const cart = await cartService.addToCart(userId, courseId);
    return res.status(200).json({
      success: true,
      message: "Đã thêm khóa học vào giỏ hàng",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể thêm vào giỏ hàng",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const cart = await cartService.removeFromCart(userId, courseId);
    return res.status(200).json({
      success: true,
      message: "Đã xóa khóa học khỏi giỏ hàng",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể xóa khỏi giỏ hàng",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};
