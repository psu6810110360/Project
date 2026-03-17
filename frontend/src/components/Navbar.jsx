// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa'; 
import './Navbar.css'; 

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); 
  const userName = localStorage.getItem('userName') || 'โปรไฟล์';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); 
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // ✅ 1. เพิ่ม State สำหรับเก็บรูปโปรไฟล์
  const [profilePic, setProfilePic] = useState(null);

  // สลับเมนูมือถือ
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // อัปเดตจำนวนตะกร้า
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.length);
  };

  // ✅ 2. ฟังก์ชันดึงรูปโปรไฟล์จาก localStorage
  const loadProfilePic = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setProfilePic(userData.profilePicture || null);
      } catch (error) {
        console.error("Parse user data error:", error);
      }
    } else {
      setProfilePic(null);
    }
  };

  useEffect(() => {
    updateCartCount();
    loadProfilePic(); // โหลดรูปตอนเปิดเว็บครั้งแรก

    window.addEventListener('cartUpdated', updateCartCount);
    // ✅ 3. ดักฟัง Event 'profileUpdated' เพื่อรีเฟรชรูปทันที
    window.addEventListener('profileUpdated', loadProfilePic);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('profileUpdated', loadProfilePic);
    };
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

        // ลอจิก backup cart
        const currentUserId = localStorage.getItem('userId');
        const currentCart = localStorage.getItem('cart');
        
        if (currentUserId) {
          if (currentCart && currentCart !== '[]') {
            localStorage.setItem(`cart_user_${currentUserId}`, currentCart);
          } else {
            localStorage.removeItem(`cart_user_${currentUserId}`);
          }
        }

        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('myCourses');
        localStorage.removeItem('userName');
        localStorage.removeItem('cart');
        localStorage.removeItem('user'); // ✅ ล้างข้อมูล user ด้วยเพื่อความชัวร์ตอนสลับไอดี

        setCartCount(0);
        setProfilePic(null); // ✅ เคลียร์รูปโปรไฟล์
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

            {/* 🟢 จัดเรียงลำดับเมนูใหม่ตรงนี้ครับ */}
            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>
              คอร์สเรียน
            </Link>
            <Link to="/our-students" onClick={() => setIsMobileMenuOpen(false)}>
              นักเรียนของเรา
            </Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              ติดต่อเรา
            </Link>

            {/* 🔥 ADMIN MENU */}
            {userRole === 'admin' ? (
              <>
                <Link 
                  to="/manage-users" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  จัดการผู้ใช้
                </Link>

                <Link 
                  to="/manage-students" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  จัดการรีวิวนักเรียน
                </Link>

                <Link
                  to="/admin/payments"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ตรวจสอบสลิป
                </Link>
              </>
            ) : (
              // User ทั่วไป
              <Link to="/my-classroom" onClick={() => setIsMobileMenuOpen(false)}>
                ห้องเรียนของฉัน
              </Link>
            )}

            {/* ตะกร้าสินค้า */}
            <Link 
              to="/cart" 
              className="cart-link"
              onClick={() => setIsMobileMenuOpen(false)} 
              style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '10px' }}
            >
              <FaShoppingCart size={24} />
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

            {/* ✅ ปุ่มโปรไฟล์แบบมี Dropdown (แสดงเฉพาะตอน Login) */}
            {isLoggedIn && (
              <div style={{ position: 'relative', marginLeft: '10px' }}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: '#003366', 
                    fontWeight: 'bold',
                    backgroundColor: '#fff3e6', 
                    padding: '6px 14px', 
                    borderRadius: '20px',
                    border: '1px solid #fce7d4',
                    cursor: 'pointer'
                  }}
                >
                  {/* ✅ 4. เช็คว่ามี profilePic ไหม ถ้ามีให้โชว์รูป ถ้าไม่มีให้โชว์ไอคอนเดิม */}
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }} 
                    />
                  ) : (
                    <FaUserCircle size={22} color="#F2984A" /> 
                  )}
                  {userName}
                </button>

                {/* กล่อง Dropdown เมนู */}
                {isProfileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: '0',
                    backgroundColor: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    width: '180px',
                    zIndex: 1000,
                    border: '1px solid #eaeaea',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Link 
                      to="/profile" 
                      onClick={() => { setIsProfileDropdownOpen(false); setIsMobileMenuOpen(false); }}
                      style={{ 
                        fontFamily: '"Prompt", sans-serif',
                        padding: '12px 16px', 
                        color: '#003366', 
                        textDecoration: 'none', 
                        borderBottom: '1px solid #f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontWeight: 'bold' 
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <FaUserCircle /> ดูข้อมูลส่วนตัว
                    </Link>
                    <button 
                      onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); setIsMobileMenuOpen(false); }}
                      style={{ 
                        fontFamily: '"Prompt", sans-serif',
                        padding: '12px 16px', 
                        color: '#dc3545', 
                        background: 'none', 
                        border: 'none', 
                        textAlign: 'left', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontWeight: 'bold', 
                        fontSize: '15px' 
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#fff5f5'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {!isLoggedIn && (
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