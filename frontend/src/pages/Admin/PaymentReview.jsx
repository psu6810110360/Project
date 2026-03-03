// src/pages/Admin/PaymentReview.jsx
// src/pages/Admin/PaymentReview.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PaymentReview.css';

const PaymentReview = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const viewSlip = (url) => {
    if (!url) return;
    let imageUrl = url;
    Swal.fire({
      title: 'หลักฐานการโอนเงิน',
      imageUrl: imageUrl,
      imageAlt: 'Slip Image',
      width: 600,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#fff',
      backdrop: `rgba(0,0,0,0.4)`
    });
  };

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // ดึงข้อมูลทั้งหมดจาก Backend
      const res = await axios.get(
        'http://localhost:3000/payments', 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🔥 ข้อมูลจาก Backend:", res.data);

      // กรองเฉพาะสถานะ pending (เช็คแบบไม่สนตัวพิมพ์เล็กใหญ่)
      const pendingOrders = res.data.filter(order => {
        const status = order.status ? order.status.toLowerCase() : '';
        return status === 'pending'; 
      });

      setPayments(pendingOrders);

    } catch (error) {
      console.error('โหลดล้มเหลว:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันอนุมัติ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      confirmButtonText: 'อนุมัติ',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');

      // ✅ แก้จุดที่ 1: ยิงไปที่ /approve ตาม Controller
      await axios.patch(
        `http://localhost:3000/payments/${paymentId}/approve`,
        {}, // ไม่ต้องส่ง body เพราะ Controller ไม่ได้รับค่าจาก body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire('สำเร็จ', 'อนุมัติเรียบร้อย', 'success');
      fetchPendingPayments();
    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถอนุมัติได้', 'error');
    }
  };

  const handleReject = async (paymentId) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันปฏิเสธ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'ปฏิเสธ',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');

      // ✅ แก้จุดที่ 2: ยิงไปที่ /reject ตาม Controller
      await axios.patch(
        `http://localhost:3000/payments/${paymentId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire('เรียบร้อย', 'ปฏิเสธแล้ว', 'success');
      fetchPendingPayments();
    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถปฏิเสธได้', 'error');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;

  return (
    <div className="admin-payment-container">
      <h1 className="admin-title">ตรวจสอบการชำระเงิน (Pending)</h1>

      {payments.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          🎉 ไม่มีรายการรอตรวจสอบ
        </p>
      ) : (
        <table className="payment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>วันที่</th>
              <th>ผู้เรียน</th>
              <th>คอร์ส</th>
              <th>ราคา</th>
              <th>สลิป</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('th-TH') : '-'}</td>
                <td>
                  <div style={{fontWeight: 'bold'}}>{p.user?.username || '-'}</div>
                  <div style={{fontSize: '0.85em', color: '#666'}}>{p.user?.email}</div>
                </td>
                <td>{p.course?.title || '-'}</td>
                <td>฿{Number(p.price || 0).toLocaleString()}</td>
                <td>
                  {p.slipUrl ? (
                    <button className="btn-view-slip" onClick={() => viewSlip(p.slipUrl)}>
                      👁️ ดูสลิป
                    </button>
                  ) : <span style={{color: 'red'}}>ไม่มีสลิป</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-approve" onClick={() => handleApprove(p.id)}>อนุมัติ</button>
                    <button className="btn-reject" onClick={() => handleReject(p.id)}>ปฏิเสธ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentReview;