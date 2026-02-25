// src/pages/Home/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/home-banner.png'; 
import './HomePage.css'; // นำเข้าไฟล์ CSS

const HomePage = () => {
  return (
    <div className="home-wrapper">
      <div className="home-container">
        
        {/* ฝั่งข้อความ (ซ้ายมือ) */}
        <div className="home-content">
          <h1 className="home-title">
            “เรียนให้<span style={{ color: '#F49D58' }}>เข้าใจ</span> ไม่ใช่แค่ท่องจำ”
          </h1>
          
          <h2 className="home-subtitle">
            ติวเข้ามหาลัยโดยครูผู้เชี่ยวชาญ เลือกเรียนได้ทุกที่ ทุกเวลา
          </h2>

          {/* ส่วนจุดเด่น (Features) */}
          <div className="features-grid">
            <FeatureItem icon="👨‍🏫" title="คุณครูคุณภาพ" desc="ครูจบตรง มีประสบการณ์สอน" />
            <FeatureItem icon="🕒" title="เรียนยืดหยุ่น" desc="เรียนออนไลน์ได้ตลอดเวลา" />
            <FeatureItem icon="✅" title="เห็นผลจริง" desc="มีรีวิวจากนักเรียน/ผู้ปกครอง" />
            <FeatureItem icon="💻" title="เรียนได้ทุกอุปกรณ์" desc="มือถือ แท็บเล็ต คอม" />
          </div>

          {/* ปุ่ม Action */}
          <div className="cta-container"> 
            <Link to="/my-classroom" style={{ textDecoration: 'none', width: '100%' }}>
              <button className="btn-primary">
                เข้าสู่ห้องเรียน
              </button>
            </Link>
          </div>
        </div>

        {/* ฝั่งรูปภาพ (ขวามือ) */}
        <div className="home-image-section">
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(420px, 80vw)',
                    height: 'min(420px, 80vw)',
                    backgroundColor: '#003366',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>
                <img 
                    src={heroImage} 
                    alt="Smart Science Pro Teacher" 
                    style={{ 
                        position: 'relative', 
                        zIndex: 1, 
                        maxWidth: '100%', 
                        height: 'auto', 
                        borderRadius: '0 0 200px 200px',
                        display: 'block'
                    }} 
                />
            </div>
        </div>

      </div>
    </div>
  );
};

// Component ย่อย
const FeatureItem = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
    <div style={{ fontSize: '2.2rem', marginRight: '15px' }}>{icon}</div>
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 5px 0', color: '#003366' }}>{title}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  </div>
);

export default HomePage;