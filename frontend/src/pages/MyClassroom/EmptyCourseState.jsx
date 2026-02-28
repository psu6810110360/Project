// EmptyCourseState.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen, FaGraduationCap } from 'react-icons/fa';

const EmptyCourseState = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
      border: '1px solid #f0f0f0',
      margin: '20px auto',
      maxWidth: '800px',
      fontFamily: '"Prompt", sans-serif'
    }}>
      <div style={{ fontSize: '100px', color: '#f0f0f0', marginBottom: '20px' }}>
        <FaBookOpen />
      </div>
      
      <h2 style={{ color: '#003366', fontSize: '28px', marginBottom: '15px', fontWeight: 'bold' }}>
        ห้องเรียนของคุณยังว่างอยู่
      </h2>
      
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '40px', maxWidth: '500px', lineHeight: '1.6' }}>
        ดูเหมือนว่าคุณยังไม่ได้ลงทะเบียนเรียนคอร์สไหนเลยในขณะนี้ <br/>
        มาเริ่มสร้างทักษะใหม่ๆ ไปกับคอร์สที่เราคัดสรรมาเพื่อคุณกันเถอะ!
      </p>

      <button 
        onClick={() => navigate('/courses')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 45px',
          backgroundColor: '#F2984A',
          color: '#fff',
          border: 'none',
          borderRadius: '50px',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(242, 152, 88, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <FaGraduationCap fontSize="24px" /> ไปเลือกดูคอร์สเรียนเลย!
      </button>
    </div>
  );
};

export default EmptyCourseState;