const orderService = require("../services/orderService");

const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body; // Bắt buộc truyền lên "COD"

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn phương thức thanh toán",
      });
    }

    const result = await orderService.checkoutCart(userId, paymentMethod);

    return res.status(200).json({
      success: true,
      message: "Thanh toán thành công!",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Thanh toán thất bại",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getMyOrders(userId);
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi lấy danh sách đơn hàng",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await orderService.cancelOrder(userId, id);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi hủy đơn hàng",
    });
  }
};

module.exports = {
  checkout,
  getMyOrders,
  cancelOrder,
};
