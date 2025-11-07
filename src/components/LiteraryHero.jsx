import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const literaryData = [
  {
    id: 1,
    author: "HỒ XUÂN HƯƠNG",
    imageUrl: "https://res.cloudinary.com/dtmd2wn3b/image/upload/v1762505551/HoXuanHuong_jvvwcp.webp",
    quote: "Thân em vừa trắng lại vừa tròn\nBảy nổi ba chìm với nước non."
  },
  {
    id: 2,
    author: "TỐ HỮU",
    imageUrl: "https://res.cloudinary.com/dtmd2wn3b/image/upload/v1762505546/ToHuu_z9yezm.webp",
    quote: "Từ ấy trong tôi bừng nắng hạ\nMặt trời chân lý chói qua tim."
  },
  {
    id: 3,
    author: "HỒ CHÍ MINH",
    imageUrl: "https://res.cloudinary.com/dtmd2wn3b/image/upload/v1762505534/BacHo_tsgrht.webp",
    quote: "Người ngắm trăng soi ngoài cửa sổ\nTrăng nhòm khe cửa ngắm nhà thơ."
  }
];

const LiteraryHero = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    customPaging: (i) => (
      <div className="w-3 h-3 bg-white/50 rounded-full hover:bg-white transition-all duration-300 cursor-pointer mt-4"></div>
    ),
    dotsClass: "slick-dots custom-dots flex justify-center space-x-2 !bottom-8"
  };

  const formatQuote = (quote) => {
    return quote.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < quote.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      <Slider {...settings} className="h-full">
        {literaryData.map((item) => (
          <div key={item.id} className="relative h-[500px] outline-none flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={item.imageUrl}
                alt={item.author}
                className="object-contain max-h-[350px] max-w-full rounded-lg shadow-lg z-0 mx-auto"
                draggable={false}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
              {/* Content */}
              <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-6">
                <div className="max-w-4xl mx-auto">
                  {/* Author name */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase mb-6 tracking-wide">
                    {item.author}
                  </h1>
                  {/* Quote */}
                  <p className="text-xl md:text-2xl italic text-gray-200 leading-relaxed max-w-3xl mx-auto">
                    "{formatQuote(item.quote)}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      {/* Custom CSS for dots */}
      <style jsx>{`
        .custom-dots {
          list-style: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .custom-dots li {
          margin: 0 !important;
        }
        .custom-dots li button {
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background-color: rgba(255, 255, 255, 0.5) !important;
          border: none !important;
          padding: 0 !important;
          transition: all 0.3s ease !important;
          font-size: 0 !important;
        }
        .custom-dots li.slick-active button {
          background-color: white !important;
          transform: scale(1.2) !important;
        }
        .custom-dots li button:hover {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
};

export default LiteraryHero;