import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import '../animations.css';

function LandingPage() {
  const navigate = useNavigate();
  const [isVideoLoaded, setIsVideoLoaded] = useState(true);

  const features = [
    {
      icon: '🏰',
      title: 'Virtual Fashion World',
      description: 'Explore a magical 3D world where fashion meets technology in an immersive gaming experience.'
    },
    {
      icon: '👕',
      title: 'AR Try-On Technology',
      description: 'Try on clothes virtually with cutting-edge augmented reality before making your purchase.'
    },
    {
      icon: '🔒',
      title: 'Blockchain Security',
      description: 'Shop with confidence using PayMan\'s secure blockchain technology for all transactions.'
    },
    {
      icon: '🌐',
      title: 'Multiplayer Experience',
      description: 'Connect with friends, explore together, and get real-time fashion advice from the community.'
    }
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="magic-sparkles">
            <span className="sparkle sparkle-1">✨</span>
            <span className="sparkle sparkle-2">⭐</span>
            <span className="sparkle sparkle-3">💫</span>
            <span className="sparkle sparkle-4">✨</span>
            <span className="sparkle sparkle-5">⭐</span>
            <span className="sparkle sparkle-6">💫</span>
          </div>
          
          <h1 className="hero-title">
            Welcome to <span className="magic-text">Payman Land</span>
          </h1>
          <p className="hero-subtitle">
            The most magical virtual fashion experience where dreams come true! 
            Step into a world of endless possibilities and discover fashion like never before.
          </p>
          
          <div className="hero-buttons">
            <button 
              className="btn primary-btn"
              onClick={() => navigate('/create-avatar')}
            >
              ✨ Enter the World
            </button>
            {/* <button 
              className="btn secondary-btn"
              onClick={() => navigate('/dashboard')}
            >
              🎮 Enter the World
            </button> */}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="video-container">
          <h2 className="video-title">See the Magic in Action</h2>
          <p className="video-subtitle">
            Watch how Payman Land brings fashion and technology together in perfect harmony
          </p>
          
          <div className="video-wrapper">
            {!isVideoLoaded ? (
              <div className="video-placeholder" onClick={() => setIsVideoLoaded(true)}>
                <div className="play-button">
                  <span className="play-icon">▶️</span>
                </div>
                <h3>Experience the Magic</h3>
                <p>Click to watch our demo video</p>
              </div>
            ) : (
              <iframe
                className="demo-video"
                src="https://www.youtube.com/embed/1XU26-WcdqU?si=c-GtB4yNNNRyMQzs"
                title="Payman Land Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Magical Features</h2>
          <p className="features-subtitle">
            Discover what makes Payman Land the most enchanting virtual fashion destination
          </p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="cta-section">
            <h3 className="cta-title">Ready to Begin Your Journey?</h3>
            <button 
              className="btn cta-btn"
              onClick={() => navigate('/create-avatar')}
            >
              🌟 Create Your Avatar Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
