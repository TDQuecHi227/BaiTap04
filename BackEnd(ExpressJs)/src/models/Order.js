const mongoose = require("mongoose");

// Đơn hàng khi học viên mua khóa học. Là căn cứ pháp lý cho doanh thu.
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Giá tại thời điểm mua (snapshot, không phụ thuộc giá hiện tại)
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    finalPrice: {
      type: Number,
      required: true, // giá thực tế thanh toán
    },
    currency: {
      type: String,
      default: "VND",
    },

    // Chia doanh thu
    platformFee: {
      type: Number,
      required: true, // phần platform giữ lại
    },
    teacherRevenue: {
      type: Number,
      required: true, // phần chuyển cho GV
    },

    /*
     * Trạng thái đơn hàng:
     * "new"               : 1. Đơn hàng mới
     * "confirmed"         : 2. Đã xác nhận đơn hàng
     * "preparing"         : 3. Shop đang chuẩn bị hàng
     * "delivering"        : 4. Đang giao hàng
     * "delivered"         : 5. Đã giao thành công
     * "cancelled"         : 6. Hủy đơn hàng
     * "cancel_requested"  : Yêu cầu hủy đơn (khi đang ở bước preparing)
     */
    status: {
      type: String,
      enum: ["new", "confirmed", "preparing", "delivering", "delivered", "cancelled", "cancel_requested", "pending", "paid", "failed", "refunded"],
      default: "new",
    },
    
    statusTimeline: {
      type: [
        {
          status: String,
          timestamp: { type: Date, default: Date.now },
          note: String
        }
      ],
      default: [],
    },

    // Thông tin cổng thanh toán
    paymentMethod: {
      type: String,
      default: "", // "vnpay", "momo", "stripe"...
    },
    paymentGatewayId: {
      type: String,
      default: "", // transaction ID từ gateway
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ courseId: 1, status: 1 });
orderSchema.index({ status: 1, paidAt: -1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
