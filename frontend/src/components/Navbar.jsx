//Navbar.jsx
import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaShoppingCart, FaBookOpen, FaClipboardList, FaUsers } from 'react-icons/fa'; // เพิ่ม Icon สวยๆ
import './Navbar.css'; 

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); 

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCartCount();
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
        const currentUserId = localStorage.getItem('userId');
        const currentCart = localStorage.getItem('cart');
        
        if (currentUserId && currentCart) {
            localStorage.setItem(`cart_user_${currentUserId}`, currentCart);
        }

        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId'); 
        localStorage.removeItem('token');  
        localStorage.removeItem('myCourses'); 
        localStorage.removeItem('cart'); 

        setCartCount(0);
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

        {/* 🍔 Hamburger Menu */}
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
            {/* restored non-linked menu items from original design */}
            <span onClick={() => setIsMobileMenuOpen(false)}>นักเรียนของเรา</span>
            <span onClick={() => setIsMobileMenuOpen(false)}>ติดต่อเรา</span>
            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>คอร์สเรียน</Link>
            
            {/* 👑 เมนูสำหรับ ADMIN เท่านั้น */}
            {isLoggedIn && userRole === 'admin' && (
              <>
                <Link to="/admin/orders" className="admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaClipboardList style={{ marginRight: '5px' }} /> รายการสั่งซื้อ
                </Link>
                <Link to="/manage-users" className="admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaUsers style={{ marginRight: '5px' }} /> จัดการผู้ใช้
                </Link>
              </>
            )}

            {/* 🎓 เมนูสำหรับ USER ทั่วไป (และโชว์ให้แอดมินดูด้วยเพื่อเช็คหน้าบ้าน) */}
            {isLoggedIn && (
              <Link to="/my-classroom" onClick={() => setIsMobileMenuOpen(false)}>
                <FaBookOpen style={{ marginRight: '5px' }} /> ห้องเรียนของฉัน
              </Link>
            )}

            {/* 🛒 ตะกร้าสินค้า */}
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
              <FaShoppingCart size={22} color="#003366" />
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-8px', right: '-12px', 
                  backgroundColor: '#F2984A', color: 'white', 
                  borderRadius: '50%', padding: '2px 6px', 
                  fontSize: '11px', fontWeight: 'bold' 
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
              style={{ backgroundColor: userRole === 'admin' ? '#d33' : '#003366' }}
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