import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { getCourseDetailApi } from "../util/api";
import { Header } from "../components/layout/header.jsx";
import { Button, Spinner } from "../components/ui/index.jsx";
import { useToast } from "../components/context/ToastContext.jsx";
import CourseGallery from "../components/course/CourseGallery.jsx";
import CourseCard from "../components/course/CourseCard.jsx";

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { items, loading: cartLoading } = useSelector((state) => state.cart);

  const isCourseInCart = items.some((item) => item.courseId?._id === id || item.courseId === id);

  const handleAddToCart = async () => {
    if (isCourseInCart) {
      navigate("/cart");
      return;
    }
    const resultAction = await dispatch(addToCart(id));
    if (addToCart.fulfilled.match(resultAction)) {
      addToast("Đã thêm khóa học vào giỏ hàng thành công!", "success");
    } else {
      addToast(resultAction.payload || "Không thể thêm vào giỏ hàng", "error");
    }
  };

  const handleRegisterNow = async () => {
    if (isCourseInCart) {
      navigate("/cart");
      return;
    }
    const resultAction = await dispatch(addToCart(id));
    if (addToCart.fulfilled.match(resultAction)) {
      navigate("/cart");
    } else {
      addToast(resultAction.payload || "Không thể đăng ký khóa học", "error");
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await getCourseDetailApi(id);
        if (res && res.course) {
          setCourse(res.course);
          setRelatedCourses(res.relatedCourses || []);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết khóa học:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
    // Cuộn lên đầu trang khi đổi id khóa học
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size={40} className="text-brand-600" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy khóa học</h2>
          <Button variant="primary" className="mt-4" onClick={() => navigate("/home")}>
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image and Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <CourseGallery 
                thumbnailUrl={course.thumbnailUrl} 
                gallery={course.gallery} 
                title={course.title} 
              />
              
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                   <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-brand-100">
                    {course.category || "Tiếng Anh"}
                  </span>
                  <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-100">
                    {course.level || "Beginner"}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
                  {course.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 mt-6 pb-6 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xl border border-brand-100">
                      {course.teacherId?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Giáo viên</p>
                      <p className="text-sm font-bold text-gray-700">{course.teacherId?.username}</p>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-100 hidden sm:block" />
                  
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Đánh giá</p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-bold text-gray-700">{course.averageRating || "5.0"}</span>
                      <span className="text-xs text-gray-400">({course.totalRatings || 0})</span>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-gray-100 hidden sm:block" />

                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Học viên</p>
                    <p className="text-sm font-bold text-gray-700">{(course.totalEnrollments || 0).toLocaleString()} đã học</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả khóa học</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    {course.description || "Chưa có mô tả cho khóa học này."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing and CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <div className="mb-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Giá khóa học</p>
                <div className="flex items-baseline gap-2">
                  {course.discountPrice > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-brand-600">
                        {course.discountPrice.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        {course.price.toLocaleString('vi-VN')}đ
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-brand-600">
                      {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : "Miễn phí"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full py-4 text-lg font-bold shadow-lg shadow-brand-100"
                  onClick={handleRegisterNow}
                  disabled={cartLoading}
                >
                  {cartLoading ? "Đang xử lý..." : "Đăng ký ngay"}
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full py-4 font-bold"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? "Đang xử lý..." : isCourseInCart ? "Xem giỏ hàng" : "Thêm vào giỏ hàng"}
                </Button>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-sm font-bold text-gray-900">Khóa học này bao gồm:</p>
                <ul className="space-y-3">
                  {[
                    `${course.totalLessons || 0} bài học chi tiết`,
                    "Bộ thẻ Flashcard thông minh",
                    "Hỗ trợ giải đáp 24/7",
                    "Chứng chỉ sau khi hoàn thành",
                    "Truy cập trọn đời"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[10px]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses Section */}
        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
              Khóa học tương tự
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedCourses.map((item) => (
                <CourseCard key={item._id} course={item} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseDetailPage;
