// src/pages/Admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null); // สำหรับดูรูปสลิปขยายใหญ่

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // ⚠️ ต้องมี API GET /orders ที่ Backend (ดึงรายการทั้งหมด)
      const response = await axios.get('http://localhost:3000/orders');
      
      // เรียงลำดับเอาอันใหม่ล่าสุดขึ้นก่อน
      const sortedOrders = response.data.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const confirmText = newStatus === 'APPROVED' ? 'อนุมัติคำสั่งซื้อนี้?' : 'ปฏิเสธคำสั่งซื้อนี้?';
      const confirmColor = newStatus === 'APPROVED' ? '#28a745' : '#d33';

      const result = await Swal.fire({
        title: 'ยืนยันการทำรายการ',
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#aaa',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        // ยิง API ไปอัปเดตสถานะ (เส้นทางตาม Backend controller)
        await axios.patch(`http://localhost:3000/orders/${orderId}/status`, { status: newStatus });
        
        Swal.fire('สำเร็จ', `สถานะถูกเปลี่ยนเป็น ${newStatus} แล้ว`, 'success');
        
        // โหลดข้อมูลใหม่เพื่ออัปเดตตาราง
        fetchOrders();
      }
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire('ล้มเหลว', 'เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  // ฟังก์ชันเลือกสีป้ายสถานะ
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm font-bold">อนุมัติแล้ว</span>;
      case 'PENDING': return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-bold">รอตรวจสอบ</span>;
      case 'REJECTED': return <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm font-bold">ถูกปฏิเสธ</span>;
      default: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Prompt", sans-serif' }}>
      <h1 style={{ color: '#003366', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Admin Dashboard: ตรวจสอบการชำระเงิน
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>ผู้ใช้งาน</th>
                <th style={thStyle}>คอร์สที่ซื้อ</th>
                <th style={thStyle}>ราคา</th>
                <th style={thStyle}>หลักฐานโอนเงิน (Slip)</th>
                <th style={thStyle}>สถานะ</th>
                <th style={thStyle}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>#{order.id}</td>
                  <td style={tdStyle}>
                    {/* User entity doesn't have a `username` field; show name or email */}
                    {order.user ? (
                      <>
                        {/* แสดงชื่อ-สกุล หากมี, ตามด้วยอีเมลเสมอเพื่อความชัดเจน */}
                        {order.user.firstName || order.user.lastName ? (
                          <>
                            {`${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()}
                            <br />
                          </>
                        ) : null}
                        <span style={{ fontSize: order.user.firstName || order.user.lastName ? '12px' : undefined, color: '#555' }}>
                          {order.user.email}
                        </span>
                      </>
                    ) : (
                      'Unknown User'
                    )} <br/>
                    <span style={{ fontSize: '12px', color: '#888' }}>ID: {order.user?.id}</span>
                  </td>
                  <td style={tdStyle}>{order.course?.title || 'Unknown Course'}</td>
                  <td style={tdStyle}>{Number(order.price).toLocaleString()} บาท</td>
                  <td style={tdStyle}>
                    {order.slipUrl ? (
                      <button 
                        onClick={() => setSelectedSlip(`http://localhost:3000${order.slipUrl}`)}
                        style={{ border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', background: '#fff', fontSize: '12px' }}
                      >
                        ดูรูปสลิป
                      </button>
                    ) : (
                      <span style={{ color: '#ccc' }}>ไม่มีรูป</span>
                    )}
                  </td>
                  <td style={tdStyle}>{getStatusBadge(order.status)}</td>
                  <td style={tdStyle}>
                    {order.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'APPROVED')}
                          style={{ padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          อนุมัติ
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                          style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                     {order.status === 'APPROVED' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'PENDING')}
                          style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          แก้ไขสถานะ
                        </button>
                     )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>ไม่มีรายการสั่งซื้อ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ดูรูปสลิป */}
      {selectedSlip && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }} onClick={() => setSelectedSlip(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={selectedSlip} alt="Full Slip" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }} />
            <button 
              onClick={() => setSelectedSlip(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', color: '#fff', background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer' }}
            >
              &times; ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const thStyle = { padding: '15px', textAlign: 'left', color: '#555', fontWeight: 'bold' };
const tdStyle = { padding: '15px', verticalAlign: 'middle' };