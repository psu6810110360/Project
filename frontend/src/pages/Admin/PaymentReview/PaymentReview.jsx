// src/pages/Admin/PaymentReview.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PaymentReview.css';

const PaymentReview = () => {
  const [baskets, setBaskets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // ===================================================
  // จัดกลุ่ม payments เป็น "ตะกร้า" ตาม slipUrl + userId
  // ===================================================
  const groupIntoBaskets = (payments) => {
    const map = new Map();

    payments.forEach((p) => {
      // ใช้ slipUrl + userId เป็น key ของตะกร้า
      const key = `${p.user?.id || 'unknown'}_${p.slipUrl || 'noslip'}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          user: p.user,
          slipUrl: p.slipUrl,
          createdAt: p.createdAt,
          items: [],
        });
      }
      map.get(key).items.push(p);
    });

    // เรียงจากใหม่ไปเก่า
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pendingOnly = res.data.filter((p) => {
        const status = p.status ? p.status.toLowerCase() : '';
        return status === 'pending';
      });

      setBaskets(groupIntoBaskets(pendingOnly));
    } catch (error) {
      console.error('โหลดล้มเหลว:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSlip = (url) => {
    if (!url) return;
    Swal.fire({
      title: 'หลักฐานการโอนเงิน',
      imageUrl: url,
      imageAlt: 'Slip',
      width: 600,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#fff',
      backdrop: `rgba(0,0,0,0.5)`,
    });
  };

  // Approve ทุก payment ในตะกร้า
  const handleApproveBasket = async (basket) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันอนุมัติตะกร้านี้?',
      text: `อนุมัติ ${basket.items.length} คอร์ส ให้ ${basket.user?.firstName || basket.user?.email || 'ผู้เรียน'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#888',
      confirmButtonText: 'อนุมัติทั้งหมด',
      cancelButtonText: 'ยกเลิก',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        basket.items.map((p) =>
          axios.patch(
            `http://localhost:3000/payments/${p.id}/approve`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      Swal.fire('สำเร็จ', 'อนุมัติเรียบร้อยแล้ว', 'success');
      fetchPendingPayments();
    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถอนุมัติได้', 'error');
    }
  };

  // Reject ทุก payment ในตะกร้า
  const handleRejectBasket = async (basket) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันปฏิเสธตะกร้านี้?',
      text: `ปฏิเสธ ${basket.items.length} คอร์ส ของ ${basket.user?.firstName || basket.user?.email || 'ผู้เรียน'}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#888',
      confirmButtonText: 'ปฏิเสธทั้งหมด',
      cancelButtonText: 'ยกเลิก',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        basket.items.map((p) =>
          axios.patch(
            `http://localhost:3000/payments/${p.id}/reject`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      Swal.fire('เรียบร้อย', 'ปฏิเสธเรียบร้อยแล้ว', 'success');
      fetchPendingPayments();
    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถปฏิเสธได้', 'error');
    }
  };

  const totalPrice = (items) =>
    items.reduce((sum, p) => sum + Number(p.price || 0), 0);

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#003366', fontSize: '18px' }}>
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="pr-container">
      <h1 className="pr-title">🧾 ตรวจสอบการชำระเงิน</h1>
      <p className="pr-subtitle">
        {baskets.length > 0
          ? `มี ${baskets.length} ตะกร้า รอการตรวจสอบ`
          : '🎉 ไม่มีรายการรอตรวจสอบ'}
      </p>

      {baskets.length === 0 ? (
        <div className="pr-empty">
          <div style={{ fontSize: '60px' }}>🎉</div>
          <p>ไม่มีรายการรอตรวจสอบในขณะนี้</p>
        </div>
      ) : (
        <div className="pr-basket-list">
          {baskets.map((basket, idx) => (
            <div key={basket.key} className="pr-basket-card">

              {/* Header ตะกร้า */}
              <div className="pr-basket-header">
                <div className="pr-basket-badge">ตะกร้า #{idx + 1}</div>
                <div className="pr-user-info">
                  <span className="pr-user-name">
                    👤 {basket.user?.firstName
                      ? `${basket.user.firstName} ${basket.user.lastName || ''}`
                      : basket.user?.email || 'ไม่ระบุ'}
                  </span>
                  <span className="pr-user-email">{basket.user?.email}</span>
                </div>
                <div className="pr-basket-date">
                  📅 {basket.createdAt
                    ? new Date(basket.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '-'}
                </div>
              </div>

              {/* Body: รายการคอร์ส + สลิป */}
              <div className="pr-basket-body">

                {/* รายการคอร์สในตะกร้า */}
                <div className="pr-courses-section">
                  <h4 className="pr-section-label">
                    🛒 คอร์สที่สั่งซื้อ ({basket.items.length} คอร์ส)
                  </h4>
                  <div className="pr-course-list">
                    {basket.items.map((item, i) => (
                      <div key={item.id} className="pr-course-item">
                        <div className="pr-course-num">{i + 1}</div>
                        <div className="pr-course-title">
                          {item.course?.title || 'ไม่ระบุชื่อคอร์ส'}
                        </div>
                        <div className="pr-course-price">
                          ฿{Number(item.price || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ยอดรวม */}
                  <div className="pr-total-row">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="pr-total-price">
                      ฿{totalPrice(basket.items).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* สลิปโอนเงิน */}
                <div className="pr-slip-section">
                  <h4 className="pr-section-label">📎 หลักฐานการโอนเงิน</h4>
                  {basket.slipUrl ? (
                    <div
                      className="pr-slip-preview"
                      onClick={() => viewSlip(basket.slipUrl)}
                      title="คลิกเพื่อดูสลิปขยาย"
                    >
                      <img
                        src={basket.slipUrl}
                        alt="slip"
                        className="pr-slip-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="pr-slip-error" style={{ display: 'none' }}>
                        ❌ โหลดรูปไม่ได้
                      </div>
                      <div className="pr-slip-overlay">
                        <span>🔍 คลิกเพื่อขยาย</span>
                      </div>
                    </div>
                  ) : (
                    <div className="pr-no-slip">❌ ไม่มีสลิปแนบมา</div>
                  )}
                </div>
              </div>

              {/* Footer: ปุ่ม Action */}
              <div className="pr-basket-footer">
                <button
                  className="pr-btn-approve"
                  onClick={() => handleApproveBasket(basket)}
                >
                  ✅ อนุมัติทั้งตะกร้า
                </button>
                <button
                  className="pr-btn-reject"
                  onClick={() => handleRejectBasket(basket)}
                >
                  ❌ ปฏิเสธทั้งตะกร้า
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentReview;