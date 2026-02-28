//Cart.jsx
// Cart.jsx (Updated with Responsive & SweetAlert2)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaShoppingCart, FaTimes, FaBookOpen } from 'react-icons/fa';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // ดึงข้อมูลจากตะกร้าตอนเปิดหน้านี้
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  // ฟังก์ชันลบสินค้าออกจากตะกร้า พร้อม SweetAlert2
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
        // แจ้งเตือน Navbar ให้ Update ตัวเลข
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

  // คำนวณยอดรวมทั้งหมด
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.salePrice || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: '"Prompt", sans-serif' }}>
      
      {/* CSS สำหรับ Responsive */}
      <style>{`
        .cart-row { display: flex; gap: 20px; border: 1px solid #eee; padding: 20px; border-radius: 12px; position: relative; align-items: center; transition: 0.3s; }
        .cart-row:hover { border-color: #F2984A; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .cart-img { width: 120px; height: 80px; border-radius: 8px; object-fit: cover; background: #f9f9f9; flex-shrink: 0; }
        .price-tag { text-align: right; min-width: 120px; }

        @media (max-width: 600px) {
          .cart-row { flex-direction: column; text-align: center; }
          .cart-img { width: 100%; height: 150px; }
          .price-tag { text-align: center; width: 100%; border-top: 1px dashed #eee; padding-top: 10px; margin-top: 5px; }
          .remove-btn { top: 10px !important; right: 10px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ backgroundColor: '#003366', padding: '25px', borderRadius: '15px 15px 0 0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>ตะกร้าสินค้า</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#bbdefb' }}>ทั้งหมด {cartItems.length} รายการ</p>
          </div>
        </div>
        <FaShoppingCart style={{ fontSize: '30px', opacity: 0.5 }} />
      </div>

      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '0 0 15px 15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        
        {/* รายการสินค้า */}
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '70px', color: '#eee', marginBottom: '20px' }}><FaShoppingCart /></div>
            <h3 style={{ color: '#888' }}>ยังไม่มีคอร์สเรียนในตะกร้า</h3>
            <button 
              onClick={() => navigate('/courses')} 
              style={{ marginTop: '20px', padding: '12px 30px', background: '#003366', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ไปเลือกดูคอร์สเรียน
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cartItems.map((item, index) => (
              <div key={index} className="cart-row">
                
                {/* ปุ่มลบสินค้า */}
                <button 
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                  style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '18px' }}
                >
                  <FaTimes />
                </button>

                {/* รูปปก */}
                {item.coverImageUrl ? (
                  <img src={`http://localhost:3000${item.coverImageUrl}`} alt="cover" className="cart-img" />
                ) : (
                  <div className="cart-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaBookOpen style={{ fontSize: '30px', color: '#ccc' }} />
                  </div>
                )}

                {/* ข้อมูลคอร์ส */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#003366', fontSize: '17px', lineHeight: '1.4' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>ผู้สอน: {item.instructorName || 'ไม่ระบุชื่อผู้สอน'}</p>
                  <span style={{ fontSize: '13px', background: '#f0f5ff', color: '#003366', padding: '3px 10px', borderRadius: '20px' }}>
                    ⏱ {item.classTime || '-'}
                  </span>
                </div>

                {/* ราคา */}
                <div className="price-tag">
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '20px' }}>฿{item.salePrice?.toLocaleString()}</div>
                  {item.originalPrice && (
                    <div style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '14px' }}>฿{item.originalPrice?.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* สรุปยอดและปุ่มชำระเงิน */}
        {cartItems.length > 0 && (
          <div style={{ marginTop: '40px', background: '#fcfcfc', padding: '25px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ color: '#003366', fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid #003366', paddingBottom: '10px', display: 'inline-block' }}>
              สรุปยอดชำระเงิน
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
              <span>ยอดรวมสินค้า</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold', color: '#003366' }}>
              <span>ยอดชำระสุทธิ</span>
              <span style={{ color: '#F2984A' }}>฿{totalPrice.toLocaleString()}</span>
            </div>

            <button 
              onClick={() => navigate('/payment')}
              style={{ 
                width: '100%', 
                padding: '18px', 
                backgroundColor: '#F2984A', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '19px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                boxShadow: '0 6px 15px rgba(242, 152, 74, 0.3)',
                transition: '0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e0873a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#F2984A'}
            >
              ไปสู่การชำระเงิน
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}