// src/pages/Admin/AdminPayments.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null); // ⭐ เพิ่ม

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        'http://localhost:3000/payments/admin',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPayments(res.data);
    } catch (err) {
      Swal.fire('ผิดพลาด', 'โหลดข้อมูลไม่สำเร็จ', 'error');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/payments/admin/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire('สำเร็จ', 'อัปเดตสถานะแล้ว', 'success');
      fetchPayments();
    } catch (err) {
      Swal.fire('ผิดพลาด', 'อัปเดตไม่สำเร็จ', 'error');
    }
  };

  // ⭐ helper: แปลง slipUrl ให้ใช้ได้ทั้ง local / cloudinary
  const getSlipUrl = (slipUrl) => {
    if (!slipUrl) return '';
    if (slipUrl.startsWith('http')) return slipUrl;
    return `http://localhost:3000${slipUrl}`;
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>จัดการการชำระเงิน</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>ผู้ใช้</th>
            <th>คอร์ส</th>
            <th>สลิป</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.user?.email}</td>
              <td>{p.course?.title}</td>

              {/* 🔥 เปลี่ยนจาก <a> เป็นปุ่มเปิด modal */}
              <td>
                <button
                  onClick={() => setSelectedSlip(getSlipUrl(p.slipUrl))}
                >
                  ดูสลิป
                </button>
              </td>

              <td>{p.status}</td>
              <td>
                {p.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(p.id, 'APPROVED')}>
                      อนุมัติ
                    </button>
                    <button onClick={() => updateStatus(p.id, 'REJECTED')}>
                      ปฏิเสธ
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL ดูสลิป ================= */}
      {selectedSlip && (
        <div
          style={overlayStyle}
          onClick={() => setSelectedSlip(null)}
        >
          <div
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedSlip}
              alt="Slip"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                display: 'block',
              }}
            />
            <button
              style={{ marginTop: 10 }}
              onClick={() => setSelectedSlip(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

/* ===== styles ===== */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#fff',
  padding: 20,
  borderRadius: 8,
  maxWidth: '90%',
};