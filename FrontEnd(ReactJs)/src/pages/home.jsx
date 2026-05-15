import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/header.jsx";
import { getHomePageApi } from "../util/api.js";
import { BrandLogo, Button } from "../components/ui/index.jsx";
import CourseCard from "../components/course/CourseCard.jsx";

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState({
    promotionalCourses: [],
    newestCourses: [],
    bestSellingCourses: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await getHomePageApi();
        if (res) {
          setHomeData(res);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu trang chủ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-300/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-300/20 blur-[120px]" />
      </div>
      <Header />
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-12 space-y-16">

        {/* Banner Section */}
        <section className="rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-teal-700 text-white p-8 md:p-14 shadow-2xl shadow-brand-500/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Nâng cấp bản thân <br /><span className="text-brand-200">mỗi ngày.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-xl">Khám phá hàng trăm khóa học chất lượng cao, từ cơ bản đến nâng cao. Bắt đầu hành trình học tập của bạn ngay hôm nay.</p>
            <Button className="bg-white text-brand-700 hover:bg-brand-50 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Khám phá ngay
            </Button>
          </div>
        </section>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 1. Khuyến mãi */}
            {homeData.promotionalCourses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-red-500">Khuyến mãi đặc biệt</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {homeData.promotionalCourses.map(course => (
                    <CourseCard key={course._id} course={course} type="promo" />
                  ))}
                </div>
              </section>
            )}
            {/* 2. Mới nhất */}
            {homeData.newestCourses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-blue-500">Khóa học mới nhất</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {homeData.newestCourses.map(course => (
                    <CourseCard key={course._id} course={course} type="new" />
                  ))}
                </div>
              </section>
            )}
            {/* 3. Bán chạy */}
            {homeData.bestSellingCourses.length > 0 && (
              <section className="pb-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-orange-500">Bán chạy nhất</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {homeData.bestSellingCourses.map(course => (
                    <CourseCard key={course._id} course={course} type="bestseller" />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
