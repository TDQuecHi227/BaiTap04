import { useState, useEffect, useCallback } from "react";
import { getAllCoursesApi } from "../util/api";
import { Header } from "../components/layout/header.jsx";
import CourseCard from "../components/course/CourseCard.jsx";
import { Button, InputField } from "../components/ui/index.jsx";



function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceType, setPriceType] = useState("all");

  const categories = ["All", "Grammar", "Vocabulary", "IELTS", "TOEIC", "Communication"];

  const fetchCourses = useCallback(async (page, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await getAllCoursesApi(page, 8, filters);
      if (res) {
        setCourses(res.courses || []);
        setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách khóa học:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Xử lý gọi lại API khi bộ lọc thay đổi (kèm debounce cho search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses(1, { search: searchTerm, category: selectedCategory, priceType });
    }, 500); // Đợi 500ms sau khi người dùng dừng gõ

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, priceType, fetchCourses]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCourses(newPage, { search: searchTerm, category: selectedCategory, priceType });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setPriceType("all");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
              {/* Search */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Tìm kiếm</h4>
                <InputField
                  placeholder="Tên khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!space-y-0"
                />
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Danh mục</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${selectedCategory === cat
                          ? "bg-brand-50 text-brand-700 font-bold"
                          : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Loại khóa học</h4>
                <div className="space-y-2">
                  {[
                    { label: "Tất cả", value: "all" },
                    { label: "Miễn phí", value: "free" },
                    { label: "Có phí", value: "paid" }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="price"
                        checked={priceType === type.value}
                        onChange={() => setPriceType(type.value)}
                        className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full text-xs py-2"
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </aside>

          {/* Course Content */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  Khóa học Tiếng Anh
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Hiển thị {courses.length} trên {pagination.totalItems} kết quả
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Sắp xếp:</span>
                <select className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer">
                  <option>Mới nhất</option>
                  <option>Giá thấp đến cao</option>
                  <option>Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-3 border-brand-200 border-t-brand-600 animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <CourseCard key={course._id} course={course} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-gray-400">Không tìm thấy khóa học nào phù hợp.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Trước
                    </Button>

                    <div className="flex gap-1.5">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pagination.currentPage === pageNum
                                ? "bg-brand-600 text-white shadow-md shadow-brand-100"
                                : "bg-white text-gray-500 hover:bg-brand-50 border border-gray-100"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CoursesPage;
