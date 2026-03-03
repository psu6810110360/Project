import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Payment() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [slipPreview, setSlipPreview] = useState(null);
  const [slipFile, setSlipFile] = useState(null); // ⭐ เพิ่ม

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

  // ===============================
  // เลือกไฟล์
  // ===============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  // ===============================
  // ยืนยันการชำระเงิน
  // ===============================
  const handleConfirmPayment = async () => {
    if (!slipFile) {
      Swal.fire('แจ้งเตือน', 'กรุณาแนบสลิปการโอนเงิน', 'warning');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      Swal.fire('เกิดข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน', 'error');
      navigate('/login');
      return;
    }

    const courseIds = cartItems.map(item => String(item.id));
    if (courseIds.length === 0) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลคอร์ส', 'error');
      return;
    }

    try {
      Swal.fire({
        title: 'กำลังส่งข้อมูลการชำระเงิน...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // ===============================
      // 1️⃣ upload slip จริง
      // ===============================
      const formData = new FormData();
      formData.append('file', slipFile);

      const uploadRes = await axios.post(
        'http://localhost:3000/payments/upload-slip',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const slipUrl = uploadRes.data.slipUrl;

      // ===============================
      // 2️⃣ create payment
      // ===============================
      await axios.post('http://localhost:3000/payments', {
        userId: Number(userId),
        courseIds,
        slipUrl,
      });

      // ===============================
      // 3️⃣ cleanup
      // ===============================
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      Swal.fire(
        'ส่งข้อมูลสำเร็จ',
        'รอแอดมินตรวจสอบการชำระเงิน',
        'success'
      ).then(() => {
        navigate('/payment-success', {
          state: { totalPrice },
        });
      });

    } catch (error) {
      console.error(error);
      Swal.fire(
        'เกิดข้อผิดพลาด',
        error.response?.data?.message || error.message,
        'error'
      );
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '40px auto',
      padding: '0 20px',
      display: 'flex',
      gap: '30px',
      flexWrap: 'wrap',
    }}>
      {/* LEFT */}
      <div style={{ flex: '1 1 600px' }}>
        <h2 style={{ color: '#003366', marginBottom: '25px' }}>
          ชำระเงิน / อัปโหลดสลิป
        </h2>

        <div style={{
          background: '#f8f9fa',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          <p><b>ธนาคารกสิกรไทย</b></p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            123-4-56789-0
          </p>
          <p>บริษัท สมาร์ท ไซเอนซ์ จำกัด</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>แนบหลักฐานการโอนเงิน</h3>

          <div style={{
            border: '2px dashed #ccc',
            borderRadius: '12px',
            padding: '20px',
            minHeight: '200px',
            position: 'relative',
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
              }}
            />

            {!slipPreview ? (
              <p style={{ textAlign: 'center', color: '#888' }}>
                คลิกเพื่ออัปโหลดสลิป
              </p>
            ) : (
              <img
                src={slipPreview}
                alt="Slip Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '250px',
                  display: 'block',
                  margin: 'auto',
                }}
              />
            )}
          </div>
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

      {/* RIGHT */}
      <div style={{ flex: '1 1 300px' }}>
        <div style={{
          border: '1px solid #eee',
          borderRadius: '12px',
          padding: '25px',
        }}>
          <h3>สรุปคำสั่งซื้อ</h3>
          {cartItems.map((item, i) => (
            <div key={i}>• {item.title}</div>
          ))}
          <hr />
          <b>รวมทั้งหมด: ฿{totalPrice.toLocaleString()}</b>
        </div>
      </div>
    </div>
  );
}