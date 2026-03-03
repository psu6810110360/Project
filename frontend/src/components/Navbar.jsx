// src/components/Navbar.jsx
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

  // สลับเมนูมือถือ
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // อัปเดตจำนวนตะกร้า
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

        // backup cart
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
        }).then(() => navigate('/'));
      }
    });
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* โลโก้ */}
        <Link to="/" className="logo-section" onClick={() => setIsMobileMenuOpen(false)}>
          <h1 className="logo-text">
            <span style={{ color: '#003366' }}>Smart</span>
            <span style={{ color: '#F2984A' }}>Science</span>
            <span style={{ color: '#003366' }}>Pro</span>
          </h1>
          <span className="logo-subtext">เรียนวิทย์ในแบบที่เข้าใจง่ายที่สุด</span>
        </Link>

        {/* Hamburger */}
        <div className="hamburger-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✖' : '☰'}
        </div>

        {/* เมนู */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <span onClick={() => setIsMobileMenuOpen(false)}>นักเรียนของเรา</span>
            <span onClick={() => setIsMobileMenuOpen(false)}>ติดต่อเรา</span>

            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>
              คอร์สเรียน
            </Link>

            {/* เมนู Admin */}
            {userRole === 'admin' && (
              <>
                <Link
                  to="/manage-users"
                  style={{ color: '#F2984A', fontWeight: 'bold' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  จัดการผู้ใช้
                </Link>

                <Link
                  to="/admin/payments"
                  style={{ color: '#F2984A', fontWeight: 'bold' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ตรวจสอบการชำระเงิน
                </Link>
              </>
            )}

            {/* เมนู User */}
            {userRole !== 'admin' && (
              <span onClick={() => setIsMobileMenuOpen(false)}>บัญชีของฉัน</span>
            )}

            {/* ตะกร้า */}
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ position: 'relative', marginLeft: '10px' }}
            >
              <FaShoppingCart size={24} color="#003366" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-12px',
                    backgroundColor: '#F2984A',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
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
            <Link
              to="/login"
              className="btn-login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;