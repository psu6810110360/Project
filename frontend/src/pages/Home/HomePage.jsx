// src/pages/Home/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // ใช้ useNavigate ของเพื่อน เพื่อเขียน Logic ได้
import heroImage from '../../assets/home-banner.png'; 
import './HomePage.css'; // ใช้ CSS ของเรา

const HomePage = () => {
  const navigate = useNavigate();

  // 1. เก็บ Logic ของเพื่อนไว้ (แต่ปรับปรุง Path ให้ตรงกับปัจจุบัน)
  const handleEnterClassroom = () => {
    // ดึงข้อมูลคอร์สจาก LocalStorage (เผื่อเพื่อนทำระบบตะกร้าไว้แล้ว)
    const myCourses = JSON.parse(localStorage.getItem('myCourses')) || [];
    
    if (myCourses.length > 0) {
      // ถ้ามีคอร์สแล้ว ให้ไปหน้า "ห้องเรียนของฉัน" (ที่คุณเพิ่งทำเสร็จ)
      navigate('/my-classroom');
    } else {
      // ถ้ายังไม่มีคอร์ส ให้ไปหน้า "เลือกซื้อคอร์ส"
      navigate('/courses');
    }
  };

  return (
    <div className="home-wrapper">
      <div className="home-container">
        
        {/* 2. ใช้ Layout และ CSS Class ของคุณ (HEAD) เพื่อความสวยงาม/Responsive */}
        <div className="home-content">
          <h1 className="home-title">
            “เรียนให้<span style={{ color: '#F49D58' }}>เข้าใจ</span> ไม่ใช่แค่ท่องจำ”
          </h1>
          
          <h2 className="home-subtitle">
            ติวเข้ามหาลัยโดยครูผู้เชี่ยวชาญ เลือกเรียนได้ทุกที่ ทุกเวลา
          </h2>

          <div className="features-grid">
            <FeatureItem icon="👨‍🏫" title="คุณครูคุณภาพ" desc="ครูจบตรง มีประสบการณ์สอน" />
            <FeatureItem icon="🕒" title="เรียนยืดหยุ่น" desc="เรียนออนไลน์ได้ตลอดเวลา" />
            <FeatureItem icon="✅" title="เห็นผลจริง" desc="มีรีวิวจากนักเรียน/ผู้ปกครอง" />
            <FeatureItem icon="💻" title="เรียนได้ทุกอุปกรณ์" desc="มือถือ แท็บเล็ต คอม" />
          </div>

          {/* 3. จุดสำคัญ! ปุ่มใช้ดีไซน์เรา แต่ใส่ onClick ของเพื่อน */}
          <div className="cta-container"> 
            <button 
              className="btn-primary" 
              onClick={handleEnterClassroom} // เรียกใช้ฟังก์ชันเช็คเงื่อนไข
              style={{ width: '100%' }}
            >
              เข้าสู่ห้องเรียน
            </button>
          </div>
        </div>

        {/* ส่วนรูปภาพ (เหมือนเดิม) */}
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