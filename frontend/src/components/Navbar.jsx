import React, { useState } from 'react'; // <--- เพิ่ม useState ตรงนี้
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Navbar.css'; 

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); 
  
  // สร้าง State สำหรับจำว่าเมนูมือถือเปิดอยู่หรือไม่ (เริ่มต้นคือ false = ปิด)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ฟังก์ชันสลับการเปิด/ปิดเมนู
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        Swal.fire({
          title: 'ออกจากระบบสำเร็จ',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/'); 
        });
      }
    });
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        
        {/* ส่วนโลโก้ */}
        <Link to="/" className="logo-section" onClick={() => setIsMobileMenuOpen(false)}>
          <h1 className="logo-text">
            <span style={{ color: '#003366' }}>Smart</span>
            <span style={{ color: '#F2984A' }}>Science</span>
            <span style={{ color: '#003366' }}>Pro</span>
          </h1>
          <span className="logo-subtext">เรียนวิทย์ในแบบที่เข้าใจง่ายที่สุด</span>
        </Link>

        {/* 🍔 ปุ่ม Hamburger Menu (โชว์เฉพาะตอนจอเล็ก) */}
        <div className="hamburger-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
             /* ไอคอน กากบาท (ปิด) */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            /* ไอคอน 3 ขีด (เปิด) */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </div>

        {/* ส่วนเมนู (จะเพิ่มคลาส 'open' ถ้ากดปุ่ม 3 ขีด) */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <span onClick={() => setIsMobileMenuOpen(false)}>นักเรียนของเรา</span>
            <span onClick={() => setIsMobileMenuOpen(false)}>ติดต่อเรา</span>
            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>คอร์สเรียน</Link>
            <span onClick={() => setIsMobileMenuOpen(false)}>บัญชีของฉัน</span>
          </div>
          
          {isLoggedIn ? (
            <button 
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
              className="btn-logout"
            >
              ออกจากระบบ {userRole === 'admin' ? '(Admin)' : ''}
            </button>
          ) : (
            <Link to="/login" className="btn-login" onClick={() => setIsMobileMenuOpen(false)}>เข้าสู่ระบบ</Link>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;