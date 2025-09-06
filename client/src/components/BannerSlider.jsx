import React from "react";
import Slider from "react-slick"; // 👈 Slider 컴포넌트 import
import "slick-carousel/slick/slick.css"; // 👈 slick 기본 CSS
import "slick-carousel/slick/slick-theme.css"; // 👈 slick 테마 CSS
import '../pages/HomePage.css';

function BannerSlider ({banners}) {
    // react-slick 설정
    const sliderSettings = {
        centerMode: true,
        centerPadding: '20px',
        dots: true, // 하단 점 인디케이터
        infinite: true, // 무한 루프
        speed: 500, // 슬라이드 전환 속도
        slidesToShow: 1, // 한 번에 보여줄 슬라이드 개수
        slidesToScroll: 1, // 한 번에 스크롤될 슬라이드 개수
        autoplay: true, // 자동 재생
        autoplaySpeed: 2000, // 3초마다 자동 재생
        arrows: false, // 좌우 화살표 (기본값)
        // fade: true,
        // customPaging: i => ( // 커스텀 점 (선택 사항)
        //     <div
        //         style={{
        //             width: "30px",
        //             height: "30px",
        //             border: "1px #f8f8f8 solid"
        //         }}
        //     >
        //         {i + 1}
        //     </div>
        // )
        };
        
        if (!banners || banners.length === 0) {
            return <div className="no-banners"><p>현재 진행중인 이벤트가 없습니다.</p></div>
        }

        return (
              <div className="banner-area">
              {banners.length > 0 ? (
                <Slider {...sliderSettings}>
                  {banners.map((banner) => (
                    <div key={banner._id} className="banner-slide">
                      <a href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
                        <img src={banner.imageUrl} alt="배너 이미지" className="banner-image"></img>
                      </a> 
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="no-banners">
                  <p>현재 등록된 배너가 없습니다.</p>
                </div>
              )}
            </div>
        )

}

export default BannerSlider;