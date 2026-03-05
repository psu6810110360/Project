// src/pages/Payment/Payment.jsx
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

    const total = items.reduce(
      (sum, item) => sum + Number(item.salePrice || 0),
      0
    );
    setTotalPrice(total);
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ แก้ไขตรงนี้: แปลงไฟล์รูปให้กลายเป็น Base64 String 
      // เพื่อให้สามารถส่งแนบไปใน JSON (slipUrl) ให้ Backend อ่านได้เลย
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result); // จะได้เป็น String เช่น "data:image/jpeg;base64,..."
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  // ==================================================
  // ✅ ยืนยันการชำระเงิน → สร้าง PAYMENT (PENDING)
  // ==================================================
  const handleConfirmPayment = async () => {
    if (!slipImage) {
      Swal.fire('แจ้งเตือน', 'กรุณาอัปโหลดหลักฐานการโอนเงิน', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // ✅ ดึง userId มาเตรียมไว้
    
    if (!token) {
      Swal.fire('เกิดข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อนทำรายการ', 'error');
      navigate('/login');
      return;
    }

    try {
      Swal.fire({
        title: 'กำลังส่งข้อมูลการชำระเงิน...',
        text: 'กรุณารอสักครู่ ระบบกำลังรอแอดมินตรวจสอบ',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // ✅ รวม courseIds ให้ตรงกับ backend
      const courseIds = cartItems.map((item) => item.id);

      await axios.post(
        'http://localhost:3000/payments',
        {
          courseIds,
          slipUrl: slipImage, // ส่ง String Base64 ไปได้เลย
          totalPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🧹 ล้างตะกร้าหลัก
      localStorage.removeItem('cart');
      
      // ✅ เพิ่มเติม: ล้างตะกร้าสำรอง (Backup) ของ User คนนี้ด้วย
      if (userId) {
        localStorage.removeItem(`cart_user_${userId}`);
      }
      
      window.dispatchEvent(new Event('cartUpdated'));

      Swal.fire(
        'ส่งข้อมูลสำเร็จ',
        'ระบบได้รับข้อมูลแล้ว รอแอดมินตรวจสอบ',
        'success'
      ).then(() => {
        navigate('/payment-success', { state: { totalPrice } });
      });
    } catch (error) {
      console.error('❌ Payment error:', error);
      Swal.fire(
        'เกิดข้อผิดพลาด',
        error.response?.data?.message || error.message,
        'error'
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '40px auto',
        fontFamily: '"Prompt", sans-serif',
        padding: '0 20px',
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap',
      }}
    >
      {/* ฝั่งซ้าย */}
      <div style={{ flex: '1 1 600px' }}>
        <h2 style={{ color: '#003366', marginBottom: '25px' }}>
          ชำระเงิน / อัปโหลดสลิป
        </h2>

        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #eee',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
            โอนเงินผ่านบัญชีธนาคาร
          </p>
          <p>ธนาคารกสิกรไทย (KBank)</p>
          <p
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#003366',
            }}
          >
            123-4-56789-0
          </p>
          <p>ชื่อบัญชี: บริษัท สมาร์ท ไซเอนซ์ จำกัด</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>แนบหลักฐานการโอนเงิน</h3>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {slipImage && (
            <img
              src={slipImage}
              alt="slip"
              style={{ maxWidth: '100%', marginTop: 10 }}
            />
          )}
        </div>

        <button
          onClick={handleConfirmPayment}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#F2984A',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ยืนยันการโอนเงิน
        </button>
      </div>

      {/* ฝั่งขวา */}
      <div style={{ flex: '1 1 300px' }}>
        <h3>สรุปคำสั่งซื้อ</h3>
        {cartItems.map((item, idx) => (
          <div key={idx}>• {item.title}</div>
        ))}
        <hr />
        <strong>รวมทั้งหมด: ฿{totalPrice.toLocaleString()}</strong>
      </div>
    </div>
  );
}