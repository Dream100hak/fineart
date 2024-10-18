// src/components/SwiperBanner.js
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

function SwiperBanner() {
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      modules={[Navigation, Pagination, Autoplay]}
      className="banner"
    >
      <SwiperSlide>
        <div className="banner-content">
          <h1>Welcome to Fine Art Portal</h1>
          <img src={require('../front_visual/slide01_bg.png')} alt="Slide 1" />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="banner-content">
          <h1>Fine Art Education</h1>
          <img src={require('../front_visual/slide02_bg.jpg')} alt="Slide 2" />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="banner-content">
          <h1>Global Art News</h1>
          <img src={require('../front_visual/slide03_bg.jpg')} alt="Slide 3" />
        </div>
      </SwiperSlide>
    </Swiper>
  );
}

export default SwiperBanner;
