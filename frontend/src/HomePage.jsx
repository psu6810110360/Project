// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from './assets/home-banner.png'; 

const HomePage = () => {
  return (
    <div style={{ 
      backgroundColor: '#fff', 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      width: '100%',
      overflow: 'hidden' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        width: '100%' 
      }}>
        
        {/* ฝั่งข้อความ (ซ้ายมือ) */}
        <div style={{ 
          flex: '1 1 600px', // เพิ่มพื้นที่ฝั่งซ้ายให้กว้างขึ้นอีกนิด
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: '20px'
        }}>
          {/* ปรับ fontSize ลงเล็กน้อยเพื่อให้พอดี*/}
          <h1 style={{ 
            fontSize: '3rem', 
            color: '#000', 
            fontWeight: 'bold', 
            lineHeight: '1.2', 
            marginBottom: '15px',
            whiteSpace: 'nowrap' // สั่งห้ามขึ้นบรรทัดใหม่
          }}>
            “เรียนให้<span style={{ color: '#F49D58' }}>เข้าใจ</span> ไม่ใช่แค่ท่องจำ”
          </h1>
          
          <h2 style={{ fontSize: '1.6rem', color: '#333', fontWeight: 'normal', marginBottom: '35px' }}>
            ติวเข้ามหาลัยโดยครูผู้เชี่ยวชาญ เลือกเรียนได้ทุกที่ ทุกเวลา
          </h2>

          {/* ส่วนจุดเด่น (Features) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '40px' }}>
            <FeatureItem icon="👨‍🏫" title="คุณครูคุณภาพ" desc="ครูจบตรง มีประสบการณ์สอน" />
            <FeatureItem icon="🕒" title="เรียนยืดหยุ่น" desc="เรียนออนไลน์ได้ตลอดเวลา" />
            <FeatureItem icon="✅" title="เห็นผลจริง" desc="มีรีวิวจากนักเรียน/ผู้ปกครอง" />
            <FeatureItem icon="💻" title="เรียนได้ทุกอุปกรณ์" desc="มือถือ แท็บเล็ต คอม" />
          </div>

          {/* ปุ่ม Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '170px' }}> 
            <Link to="/courses" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#F49D58',
                color: '#003366',
                border: 'none',
                padding: '18px 60px', // เพิ่มความกว้างปุ่ม
                fontSize: '1.3rem',
                fontWeight: 'bold',
                borderRadius: '50px', // ทำปุ่มให้มนสวยขึ้น
                cursor: 'pointer',
                boxShadow: '0 8px 15px rgba(244, 157, 88, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(244, 157, 88, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(244, 157, 88, 0.4)';
              }}
              >
                เข้าสู่ห้องเรียน
              </button>
            </Link>
          </div>
        </div>

        {/* ฝั่งรูปภาพ (ขวามือ) */}
        <div style={{ flex: '1 1 400px', textAlign: 'center' }}>
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