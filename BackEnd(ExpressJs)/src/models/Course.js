const mongoose = require("mongoose");

// Khóa học do giáo viên tạo ra và bán trên platform.
const courseSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [], // Danh sách ảnh bổ sung cho Swiper
    },
    introVideoUrl: {
      type: String,
      default: "", // video giới thiệu khóa
    },

    // Phân loại
    category: {
      type: String,
      default: "", // "IELTS", "TOEIC", "Giao tiếp"...
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: {
      type: [String],
      default: [],
    },

    // Giá & trạng thái
    price: {
      type: Number,
      required: true,
      min: 0, // 0 = miễn phí
    },
    discountPrice: {
      type: Number,
      default: null, // giá khuyến mãi
    },
    currency: {
      type: String,
      default: "VND",
    },

    /*
     * Trạng thái khóa học:
     * "draft"     : GV đang soạn, chưa submit
     * "pending"   : đã submit, chờ admin/manager duyệt
     * "published" : đã duyệt, học viên có thể mua
     * "rejected"  : bị từ chối, GV cần chỉnh sửa
     * "archived"  : ẩn khỏi marketplace, enrollment cũ vẫn học được
     */
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "archived"],
      default: "draft",
    },

    // Ghi chú khi admin reject
    reviewNote: {
      type: String,
      default: "",
    },

    // Cache thống kê
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0, // tổng doanh thu thô
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

courseSchema.index({ teacherId: 1 });
courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ title: "text", tags: "text", description: "text" });

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
