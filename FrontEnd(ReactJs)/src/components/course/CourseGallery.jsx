import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CourseGallery = ({ thumbnailUrl, gallery, title }) => {
  // Combine thumbnail and gallery images
  const allImages = [thumbnailUrl, ...(gallery || [])].filter(url => !!url);

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center text-white text-4xl font-bold">
        {title?.charAt(0)}
      </div>
    );
  }

  return (
    <div className="course-gallery-container relative group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="w-full aspect-video rounded-3xl overflow-hidden shadow-sm border border-gray-100"
      >
        {allImages.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <img
                src={url}
                alt={`${title} - ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom styles to match the brand */}
      <style dangerouslySetInnerHTML={{ __html: `
        .course-gallery-container .swiper-button-next,
        .course-gallery-container .swiper-button-prev {
          color: #16a34a;
          background: transparent;
          opacity: 0;
          transition: all 0.3s ease;
          text-shadow: 0 0 8px rgba(255,255,255,0.8);
        }
        .course-gallery-container:hover .swiper-button-next,
        .course-gallery-container:hover .swiper-button-prev {
          opacity: 1;
        }
        .course-gallery-container .swiper-button-next:after,
        .course-gallery-container .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        .course-gallery-container .swiper-pagination-bullet-active {
          background: #16a34a;
        }
      `}} />
    </div>
  );
};

export default CourseGallery;
