import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  if (!course) return null;

  return (
    <div
      onClick={() => navigate(`/courses/${course._id}`)}
      className="group relative rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer h-full flex flex-col"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-teal-400 text-white font-bold text-lg">
            {course.title?.charAt(0)}
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white/50">
            {course.category || "Tiếng Anh"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs font-semibold text-gray-700">{course.averageRating || "5.0"}</span>
          <span className="text-[10px] text-gray-400">({course.totalReviews || 0})</span>
        </div>

        <h3 className="font-display font-bold text-base text-gray-900 line-clamp-2 mb-3 group-hover:text-brand-600 transition-colors min-h-[3rem]">
          {course.title}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-[10px] border border-brand-100">
              {course.teacherId?.username?.charAt(0).toUpperCase() || "T"}
            </div>
            <span className="text-[11px] font-medium text-gray-500 truncate max-w-[80px]">
              {course.teacherId?.username || "Giáo viên"}
            </span>
          </div>

          <div className="text-right">
            {course.discountPrice > 0 ? (
              <>
                <div className="text-[10px] text-gray-400 line-through">
                  {course.price?.toLocaleString('vi-VN')}đ
                </div>
                <div className="text-sm font-bold text-brand-600">
                  {course.discountPrice?.toLocaleString('vi-VN')}đ
                </div>
              </>
            ) : (
              <div className="text-sm font-bold text-brand-600">
                {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : "Miễn phí"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
