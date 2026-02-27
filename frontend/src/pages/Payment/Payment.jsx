import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // ใช้ SweetAlert เด้งแจ้งเตือนสวยๆ

export default function Payment() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [slipImage, setSlipImage] = useState(null); // เก็บรูปสลิปที่อัปโหลด

  useEffect(() => {
    // ดึงข้อมูลตะกร้ามาคำนวณเงิน
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    if (items.length === 0) {
      navigate('/cart'); // ถ้าไม่มีของ เด้งกลับไปหน้าตะกร้า
      return;
    }
    setCartItems(items);
    const total = items.reduce((sum, item) => sum + Number(item.salePrice || 0), 0);
    setTotalPrice(total);
  }, [navigate]);

  // ฟังก์ชันพรีวิวรูปสลิป
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipImage(URL.createObjectURL(file));
    }
  };

// ฟังก์ชันยืนยันการชำระเงิน (อัปเดตเพื่อบันทึกลง Database จริง)
  const handleConfirmPayment = async () => {
    if (!slipImage) {
      Swal.fire('กรุณาแนบสลิป', 'โปรดอัปโหลดรูปภาพสลิปการโอนเงินก่อนกดยืนยันครับ', 'warning');
      return;
    }

    const userId = localStorage.getItem('userId'); // ดึง ID จากเครื่อง
    
    if (!userId) {
      Swal.fire('กรุณาล็อกอินใหม่', 'ไม่พบข้อมูลผู้ใช้งาน กรุณาออกจากระบบแล้วเข้าใหม่ครับ', 'error');
      return;
    }

    try {
      // 1. 🔗 ส่งข้อมูลคอร์สในตะกร้าไปบันทึกลง Database (ของเดิมบันทึกแค่ในเครื่องเลยไม่ขึ้น)
      // เราจะวนลูปส่งคอร์สที่ซื้อทั้งหมดไปที่ API ของเรา
      for (const item of cartItems) {
        await fetch(`http://localhost:3000/users/${userId}/add-course/${item.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. ล้างตะกร้า (ในเครื่อง)
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      // 3. ไปหน้าความสำเร็จ
      navigate('/payment-success', { state: { totalPrice: totalPrice } });

    } catch (error) {
      console.error("Payment Error:", error);
      Swal.fire('ระบบขัดข้อง', 'ไม่สามารถบันทึกข้อมูลการซื้อลงฐานข้อมูลได้', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: '"Prompt", sans-serif' }}>
      <h2 style={{ color: '#003366', textAlign: 'center', marginBottom: '5px' }}>ชำระเงิน</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>สแกน QR Code และอัปโหลดสลิปเพื่อยืนยันการชำระเงิน</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* ฝั่งซ้าย: ข้อมูลการโอนเงินและแนบสลิป */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* กล่อง QR Code */}
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '30px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#F2984A', marginTop: 0 }}>สแกน QR Code เพื่อชำระเงิน</h3>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
              alt="QR Code" 
              style={{ width: '200px', height: '200px', margin: '20px auto', display: 'block', border: '5px solid #003366', borderRadius: '12px', padding: '10px' }} 
            />
            <h3 style={{ margin: '10px 0', color: '#333' }}>ยอดชำระ: <span style={{ color: '#F2984A' }}>฿{totalPrice.toLocaleString()}</span></h3>
          </div>

          {/* กล่องบัญชีธนาคาร */}
          <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>หรือโอนเงินไปที่บัญชี:</p>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>ธนาคาร: <span style={{ color: '#003366' }}>ธนาคารกรุงเทพ</span></p>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>เลขบัญชี: <span style={{ color: '#003366' }}>123-4-56789-0</span></p>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>ชื่อบัญชี: <span style={{ color: '#003366' }}>บจก. Smart Science Pro</span></p>
          </div>

          {/* กล่องแนบสลิป */}
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: '#F2984A', margin: '0 0 15px 0' }}>↑ แนบสลิปการโอนเงิน</h4>
            <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' }}>
              
              {slipImage ? (
                <div>
                  <img src={slipImage} alt="Slip Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '15px' }} />
                  <br />
                  <button onClick={() => setSlipImage(null)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>ลบรูปนี้</button>
                </div>
              ) : (
                <>
                  <p style={{ color: '#888', marginBottom: '10px' }}>คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</p>
                  <p style={{ fontSize: '12px', color: '#aaa' }}>PNG, JPG หรือ PDF (สูงสุด 10MB)</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: '10px' }} />
                </>
              )}
            </div>
          </div>

          <button 
            onClick={handleConfirmPayment}
            style={{ width: '100%', padding: '15px', backgroundColor: '#F2984A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(242, 152, 74, 0.3)' }}>
            ยืนยันการโอนเงิน
          </button>

        </div>

        {/* ฝั่งขวา: สรุปคำสั่งซื้อ */}
        <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '25px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
          <h3 style={{ color: '#003366', marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>สรุปคำสั่งซื้อ</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
            <span>สินค้า ({cartItems.length} รายการ)</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #eee', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            <span>ยอดรวมทั้งหมด</span>
            <span style={{ color: '#003366' }}>฿{totalPrice.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}