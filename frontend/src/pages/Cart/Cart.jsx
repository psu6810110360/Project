import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaTimes, FaBookOpen } from 'react-icons/fa';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // ดึงข้อมูลจากตะกร้าตอนเปิดหน้านี้
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  // ฟังก์ชันลบสินค้าออกจากตะกร้า
  const removeItem = (idToRemove) => {
    const updatedCart = cartItems.filter(item => item.id !== idToRemove);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // คำนวณยอดรวมทั้งหมด
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.salePrice || 0), 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: '"Prompt", sans-serif' }}>
      
      {/* ส่วนหัวตะกร้า (Header สีน้ำเงิน) */}
      <div style={{ backgroundColor: '#003366', padding: '20px', borderRadius: '12px 12px 0 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
          <FaArrowLeft />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaShoppingCart style={{ fontSize: '24px' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>ตะกร้าสินค้า</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#bbdefb' }}>{cartItems.length} รายการ</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* รายการสินค้าในตะกร้า */}
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>
            <FaShoppingCart style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }} />
            <p>ยังไม่มีคอร์สในตะกร้า</p>
            <button onClick={() => navigate('/courses')} style={{ marginTop: '10px', padding: '10px 20px', background: '#003366', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ไปเลือกดูคอร์สเรียน
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '15px', border: '1px solid #eee', padding: '15px', borderRadius: '10px', position: 'relative' }}>
                
                {/* ปุ่มกากบาท ลบสินค้า */}
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px' }}>
                  <FaTimes />
                </button>

                {/* รูปปก */}
                <div style={{ width: '100px', height: '100px', backgroundColor: '#f5f5f5', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.coverImageUrl ? (
                    <img src={`http://localhost:3000${item.coverImageUrl}`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FaBookOpen style={{ fontSize: '30px', color: '#ccc' }} />
                  )}
                </div>

                {/* ข้อมูลคอร์ส */}
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#888', fontSize: '13px' }}>โดย {item.instructorName || 'ไม่ระบุชื่อผู้สอน'}</p>
                  
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#666' }}>
                    <span>⏱ {item.classTime || '-'}</span>
                  </div>
                </div>

                {/* ราคา */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>฿{item.salePrice?.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '13px' }}>฿{item.originalPrice?.toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ส่วนสรุปยอดและปุ่มชำระเงิน */}
        {cartItems.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '2px solid #f5f5f5', paddingTop: '20px' }}>
            <h3 style={{ color: '#003366', fontSize: '18px', marginBottom: '20px' }}>สรุปคำสั่งซื้อ</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
              <span>ยอดรวมย่อย</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              <span>ยอดรวมทั้งหมด</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>

            <button 
              onClick={() => navigate('/payment')}
              style={{ width: '100%', padding: '15px', backgroundColor: '#F2984A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(242, 152, 74, 0.2)' }}>
              ดำเนินการชำระเงิน
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}