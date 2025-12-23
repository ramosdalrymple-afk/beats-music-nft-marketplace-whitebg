import { useState, useEffect } from 'react';

const slides = [
  {
    image: '/nft_beats/1.JPG',
    title: 'Soul Collection',
    subtitle: 'Legendary Artists Unite'
  },
  {
    image: '/nft_beats/2.JPG',
    title: 'Musicverse',
    subtitle: 'Interactive NFT Art Fair'
  },
  {
    image: '/nft_beats/3.JPG',
    title: 'Join the Beat',
    subtitle: '4,444 Unique NFTs'
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="hero-slider-container">
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className="hero-slide-overlay" />
          </div>
        ))}
      </div>
    </div>
  );
}
