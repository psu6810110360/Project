// Cart.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaShoppingCart, FaTimes, FaBookOpen } from 'react-icons/fa';
import './Cart.css'; // นำเข้า CSS

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  const removeItem = (idToRemove) => {
    Swal.fire({
      title: 'ลบออกจากตะกร้า?',
      text: "คุณต้องการนำคอร์สนี้ออกจากรายการใช่หรือไม่",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'ใช่, ลบออก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCart = cartItems.filter(item => item.id !== idToRemove);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          timer: 800,
          showConfirmButton: false
        });
      }
    });
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.salePrice || 0), 0);

  return (
    <div className="cart-container">
      
      {/* Header */}
      <div className="cart-header">
        <div className="cart-header-left">
          <button onClick={() => navigate(-1)} className="back-circle-btn">
            <FaArrowLeft />
          </button>
          <div className="cart-header-title">
            <h2>ตะกร้าสินค้า</h2>
            <p>ทั้งหมด {cartItems.length} รายการ</p>
          </div>
        </div>
        <FaShoppingCart style={{ fontSize: '30px', opacity: 0.5 }} />
      </div>

      <div className="cart-body">
        
        {/* รายการสินค้า */}
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon"><FaShoppingCart /></div>
            <h3>ยังไม่มีคอร์สเรียนในตะกร้า</h3>
            <button onClick={() => navigate('/courses')} className="go-shopping-btn">
              ไปเลือกดูคอร์สเรียน
            </button>
          </div>
        ) : (
          <div className="cart-list">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-row">
                
                <button className="remove-btn" onClick={() => removeItem(item.id)}>
                  <FaTimes />
                </button>

                {/* รูปปก */}
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="cover" className="cart-img" />
                ) : (
                  <div className="cart-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaBookOpen style={{ fontSize: '30px', color: '#ccc' }} />
                  </div>
                )}

                {/* ข้อมูลคอร์ส */}
                <div className="cart-item-info">
                  <h4>{item.title}</h4>
                  <p>ผู้สอน: {item.instructorName || 'ไม่ระบุชื่อผู้สอน'}</p>
                  <span className="time-tag">
                    ⏱ {item.classTime || '-'}
                  </span>
                </div>

                {/* ราคา */}
                <div className="price-tag">
                  <div className="price-main">฿{item.salePrice?.toLocaleString()}</div>
                  {item.originalPrice && (
                    <div className="price-original">฿{item.originalPrice?.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* สรุปยอดและปุ่มชำระเงิน */}
        {cartItems.length > 0 && (
          <div className="cart-summary">
            <h3 className="summary-title">สรุปยอดชำระเงิน</h3>
            
            <div className="summary-row">
              <span>ยอดรวมสินค้า</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="summary-total">
              <span>ยอดชำระสุทธิ</span>
              <span className="highlight">฿{totalPrice.toLocaleString()}</span>
            </div>

            <button onClick={() => navigate('/payment')} className="checkout-btn">
              ไปสู่การชำระเงิน
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}