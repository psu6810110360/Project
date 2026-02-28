import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaShoppingCart } from 'react-icons/fa'; 
import './Navbar.css'; 

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); 

  // ฟังก์ชันสลับการเปิด/ปิดเมนู
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ฟังก์ชันอัปเดตตัวเลขตะกร้า
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCartCount(); // อัปเดตตอนโหลดแถบเมนูครั้งแรก
    
    // ดักฟัง Event พิเศษ (เพื่อให้ตัวเลขเปลี่ยนทันทีเมื่อมีการกดเพิ่มของ หรือ Logout)
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

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
        // 1. ล้างข้อมูลทุกอย่างให้เกลี้ยง!
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId'); 
        localStorage.removeItem('token');  
        localStorage.removeItem('myCourses'); 
        localStorage.removeItem('cart'); 

        // ✅ 2. [จุดสำคัญ] สั่งรีเซ็ตตัวเลขบนหน้าจอให้เป็น 0 ทันที
        setCartCount(0);
        
        // ✅ 3. ส่งสัญญาณบอกส่วนอื่นๆ ว่าตะกร้าว่างแล้วนะ
        window.dispatchEvent(new Event('cartUpdated'));

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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </div>

        {/* ส่วนเมนู */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <span onClick={() => setIsMobileMenuOpen(false)}>นักเรียนของเรา</span>
            <span onClick={() => setIsMobileMenuOpen(false)}>ติดต่อเรา</span>
            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>คอร์สเรียน</Link>
            
            {/* ซ่อนปุ่มบัญชีของฉัน หรือเปลี่ยนเป็นจัดการระบบถ้าเป็นแอดมิน */}
            {userRole === 'admin' ? (
              <Link to="/manage-users" style={{ color: '#F2984A', fontWeight: 'bold' }} onClick={() => setIsMobileMenuOpen(false)}>จัดการผู้ใช้</Link>
            ) : (
              <span onClick={() => setIsMobileMenuOpen(false)}>บัญชีของฉัน</span>
            )}

            {/* 🛒 ไอคอนตะกร้าสินค้า */}
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
              <FaShoppingCart size={24} color="#003366" />
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-8px', right: '-12px', 
                  backgroundColor: '#F2984A', color: 'white', 
                  borderRadius: '50%', padding: '2px 6px', 
                  fontSize: '12px', fontWeight: 'bold' 
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
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