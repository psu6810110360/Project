//Payment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Payment() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [slipImage, setSlipImage] = useState(null);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(items);
    const total = items.reduce((sum, item) => sum + Number(item.salePrice || 0), 0);
    setTotalPrice(total);
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipImage(URL.createObjectURL(file));
    }
    e.target.value = null; 
  };

  // ✅ ฟังก์ชันยืนยันการชำระเงิน (เวอร์ชันดักจับ Error แบบละเอียด)
  const handleConfirmPayment = async () => {
    if (!slipImage) {
      Swal.fire('แจ้งเตือน', 'กรุณาอัปโหลดหลักฐานการโอนเงิน', 'warning');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      Swal.fire('เกิดข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อนทำรายการ', 'error');
      navigate('/login');
      return;
    }

    console.log('--- 🔍 กำลังตรวจสอบข้อมูลก่อนส่ง ---');
    console.log('User ID ที่จะส่งไป:', userId);
    console.log('ของในตะกร้าทั้งหมด:', cartItems);

    try {
      Swal.fire({
        title: 'กำลังตรวจสอบการชำระเงิน...',
        text: 'กรุณารอสักครู่ ระบบกำลังเพิ่มคอร์สเข้าห้องเรียนของคุณ',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      for (const item of cartItems) {
        console.log(`กำลังบันทึกคอร์ส ID: ${item.id}`);
        if (!item.id) {
            throw new Error(`ข้อมูลคอร์สผิดพลาด ไม่มีไอดี (item.id เป็น ${item.id})`);
        }
        const response = await axios.post(`http://localhost:3000/users/${userId}/add-course/${item.id}`);
        console.log('✅ บันทึกคอร์สนี้สำเร็จ:', response.data);
      }

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      Swal.fire('สำเร็จ!', 'ชำระเงินเรียบร้อย คอร์สถูกเพิ่มเข้าห้องเรียนแล้ว', 'success').then(() => {
        navigate('/payment-success', { state: { totalPrice } });
      });

    } catch (error) {
      console.error('❌ Error แบบละเอียด:', error);
      const backendErrorMessage = error.response?.data?.message || error.message;
      console.error('📩 สาเหตุจาก Backend:', backendErrorMessage);

      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: `บันทึกไม่สำเร็จ สาเหตุ: ${backendErrorMessage}`,
      });
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: '"Prompt", sans-serif', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      
      {/* ฝั่งซ้าย: อัปโหลดสลิป */}
      <div style={{ flex: '1 1 600px' }}>
        <h2 style={{ color: '#003366', marginBottom: '25px' }}>ชำระเงิน / อัปโหลดสลิป</h2>
        
        <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>โอนเงินผ่านบัญชีธนาคาร</p>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '5px' }}>ธนาคารกสิกรไทย (KBank)</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#003366', letterSpacing: '2px', margin: '10px 0' }}>123-4-56789-0</p>
            <p style={{ fontSize: '16px', color: '#666' }}>ชื่อบัญชี: บริษัท สมาร์ท ไซเอนซ์ จำกัด</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '15px' }}>แนบหลักฐานการโอนเงิน (สลิป)</h3>
          <div style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', position: 'relative', overflow: 'hidden' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} 
            />
            {!slipImage ? (
              <div style={{ pointerEvents: 'none' }}>
                <div style={{ fontSize: '40px', color: '#ccc', marginBottom: '10px', textAlign: 'center' }}>📸</div>
                <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่</p>
                <p style={{ margin: '5px 0 0', color: '#999', fontSize: '14px', textAlign: 'center' }}>รองรับไฟล์ JPG, PNG</p>
              </div>
            ) : (
              <div style={{ pointerEvents: 'none', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={slipImage} alt="Slip Preview" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <p style={{ marginTop: '15px', color: '#003366', fontWeight: 'bold' }}>แตะเพื่อเปลี่ยนรูปภาพ</p>
              </div>
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
      <div style={{ flex: '1 1 300px' }}>
        <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '25px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
          <h3 style={{ color: '#003366', marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>สรุปคำสั่งซื้อ</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
            <span>สินค้า ({cartItems.length} รายการ)</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: '#333', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
            <span>ยอดรวมทั้งหมด</span>
            <span style={{ color: '#F2984A' }}>฿{totalPrice.toLocaleString()}</span>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', fontSize: '14px', color: '#555' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#333' }}>รายการคอร์ส:</p>
            {cartItems.map((item, index) => (
              <div key={index} style={{ marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                • {item.title}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}