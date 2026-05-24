const Order = require("../models/Order");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const cartService = require("./cartService");

const checkoutCart = async (userId, paymentMethod) => {
  // 1. Lấy giỏ hàng
  const cart = await cartService.getCartByUserId(userId);
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  const createdOrders = [];
  const createdEnrollments = [];

  // 2. Tạo Order và Enrollment cho từng khoá học trong giỏ
  for (const item of cart.items) {
    const course = item.courseId; // Đã được populate
    if (!course) continue;

    // Tính toán giá
    const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.price;
    
    // Giả định: Platform giữ 30%, GV nhận 70%
    const teacherRevenueRatio = course.teacherProfile?.revenueShare || 0.7;
    const teacherRevenue = finalPrice * teacherRevenueRatio;
    const platformFee = finalPrice - teacherRevenue;

    // Tạo đơn hàng
    const order = await Order.create({
      userId,
      courseId: course._id,
      originalPrice: course.price,
      discountPrice: course.discountPrice,
      finalPrice: finalPrice,
      platformFee,
      teacherRevenue,
      status: "new",
      paymentMethod,
      statusTimeline: [
        { status: "new", note: "Khách hàng đặt đơn" }
      ]
    });
    createdOrders.push(order);

    // Mặc dù COD là pending, ta có thể tạm tạo Enrollment (hoặc chờ update).
    // Ở đây tạo luôn để tiện test cho học viên.
    // Kiểm tra xem đã có Enrollment chưa
    const existingEnroll = await Enrollment.findOne({ userId, courseId: course._id });
    if (!existingEnroll) {
      const enrollment = await Enrollment.create({
        userId,
        courseId: course._id,
        orderId: order._id,
        status: "active",
      });
      createdEnrollments.push(enrollment);
    }
  }

  // 3. Xoá giỏ hàng
  await cartService.clearCart(userId);

  return {
    orders: createdOrders,
    enrollments: createdEnrollments,
  };
};

const getMyOrders = async (userId) => {
  return await Order.find({ userId })
    .populate("courseId", "title thumbnailUrl price discountPrice")
    .sort({ createdAt: -1 });
};

const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  const now = new Date();
  const timeSinceOrder = (now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60); // minutes

  if (order.status === "new" || order.status === "confirmed") {
    if (timeSinceOrder <= 30) {
      order.status = "cancelled";
      order.statusTimeline.push({ status: "cancelled", note: "Khách hàng hủy đơn" });
      await order.save();
      return { message: "Hủy đơn hàng thành công", order };
    } else {
      throw new Error("Chỉ được hủy đơn trong vòng 30 phút sau khi đặt");
    }
  } else if (order.status === "preparing") {
    order.status = "cancel_requested";
    order.statusTimeline.push({ status: "cancel_requested", note: "Yêu cầu hủy đơn" });
    await order.save();
    return { message: "Đã gửi yêu cầu hủy đơn cho shop", order };
  } else {
    throw new Error("Không thể hủy đơn hàng ở trạng thái này");
  }
};

module.exports = {
  checkoutCart,
  getMyOrders,
  cancelOrder,
};
