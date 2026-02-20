import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CourseList from './CourseList';
import CourseForm from './CourseForm';
import CourseDetail from './CourseDetail';
import HomePage from './HomePage';
import Login from './Login'; // 1. เพิ่มการนำเข้าหน้า Login ตรงนี้

import { FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: '"Prompt", sans-serif' }}>
        
        {/* Navigation Bar */}
        <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#003366' }}>Smart</span>
                <span style={{ color: '#F2984A' }}>Science</span>
                <span style={{ color: '#003366' }}>Pro</span>
              </h1>
              <span style={{ color: '#888888', fontSize: '13px', marginTop: '-2px', fontWeight: '400' }}>
                เรียนวิทย์ในแบบที่เข้าใจง่ายที่สุด
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '15px', fontWeight: '500' }}>
              <span style={{ cursor: 'pointer', color: '#333333', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#F2984A'} onMouseOut={(e) => e.target.style.color = '#333333'}>นักเรียนของเรา</span>
              <span style={{ cursor: 'pointer', color: '#333333', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#F2984A'} onMouseOut={(e) => e.target.style.color = '#333333'}>ติดต่อเรา</span>
              
              <Link to="/courses" style={{ textDecoration: 'none', color: '#333333', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#F2984A'} onMouseOut={(e) => e.target.style.color = '#333333'}>
                คอร์สเรียน
              </Link>
              
              <span style={{ cursor: 'pointer', color: '#333333', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#F2984A'} onMouseOut={(e) => e.target.style.color = '#333333'}>บัญชีของฉัน</span>
              
              {/* 2. แก้ไขปุ่ม เข้าสู่ระบบ / ออกจากระบบ */}
              {isAdmin ? (
                <button 
                  onClick={() => setIsAdmin(false)}
                  style={{ 
                    padding: '10px 24px', backgroundColor: '#dc3545', color: '#FFFFFF', border: 'none', 
                    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', 
                    fontFamily: '"Prompt", sans-serif', transition: '0.3s'
                  }}
                >
                  ออกจากระบบ (Admin)
                </button>
              ) : (
                <Link 
                  to="/login"
                  style={{ 
                    padding: '10px 24px', backgroundColor: '#003366', color: '#FFFFFF', textDecoration: 'none', 
                    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', 
                    fontFamily: '"Prompt", sans-serif', transition: '0.3s', display: 'inline-block',
                    boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)'
                  }}
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* 3. เพิ่ม Route สำหรับหน้า Login และส่ง setIsAdmin ไปให้ด้วย */}
            <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} /> 
            
            <Route path="/courses" element={<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}><CourseList isAdmin={isAdmin} /></div>} />
            <Route path="/course/:id" element={<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}><CourseDetail /></div>} />
            <Route path="/add" element={<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}><CourseForm /></div>} />
            <Route path="/edit/:id" element={<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%' }}><CourseForm /></div>} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: '#003366', color: '#FFFFFF', padding: '40px 20px', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
            <p style={{ margin: '0 0 15px 0', fontSize: '16px', letterSpacing: '0.5px' }}>
              P'8 Smart Science Pro
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '20px', fontSize: '22px' }}>
              <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaFacebook /></a>
              <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaLinkedin /></a>
              <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaYoutube /></a>
              <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaInstagram /></a>
            </div>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;