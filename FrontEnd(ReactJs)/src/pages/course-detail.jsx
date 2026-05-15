import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetailApi } from "../util/api";
import { Header } from "../components/layout/header.jsx";
import { Button, Spinner } from "../components/ui/index.jsx";

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getCourseDetailApi(id);
        if (res) {
          setCourse(res);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết khóa học:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
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
          <Button variant="primary" className="mt-4" onClick={() => navigate("/courses")}>
            Quay lại danh sách
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
              <div className="aspect-video w-full bg-gray-100 relative">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-teal-400 text-white text-4xl font-bold">
                    {course.title?.charAt(0)}
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-md text-brand-700 px-4 py-2 rounded-2xl text-sm font-bold shadow-lg border border-white/50 uppercase tracking-wider">
                    {course.category || "Tiếng Anh"}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
                  {course.title}
                </h1>
                
                <div className="flex items-center gap-6 mt-6 pb-6 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xl border border-brand-100">
                      {course.teacherId?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Giáo viên</p>
                      <p className="text-sm font-bold text-gray-700">{course.teacherId?.username}</p>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-100" />
                  
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">Đánh giá</p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-bold text-gray-700">{course.averageRating || "5.0"}</span>
                    </div>
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
                  <span className="text-4xl font-bold text-brand-600">
                    {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : "Miễn phí"}
                  </span>
                  {course.price > 0 && (
                    <span className="text-gray-400 line-through text-sm">
                      {(course.price * 1.2).toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="primary" className="w-full py-4 text-lg font-bold shadow-lg shadow-brand-100">
                  Đăng ký ngay
                </Button>
                <Button variant="secondary" className="w-full py-4 font-bold">
                  Thêm vào yêu thích
                </Button>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-sm font-bold text-gray-900">Khóa học này bao gồm:</p>
                <ul className="space-y-3">
                  {[
                    "Hơn 50 bài học chi tiết",
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
      </main>
    </div>
  );
}

export default CourseDetailPage;
