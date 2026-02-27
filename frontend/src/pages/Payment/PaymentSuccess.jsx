import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับยอดเงินที่ส่งมาจากหน้า Payment (ถ้าไม่ได้ส่งมาจะให้เป็น 0)
  const totalPrice = location.state?.totalPrice || 0;

  // จำลองข้อมูลวันที่และเวลาปัจจุบัน
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  // สุ่มเลข Order ID
  const orderId = `#ORD-${currentDate.getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: '"Prompt", sans-serif', textAlign: 'center' }}>
      
      {/* ไอคอนติ๊กถูก */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e6f0fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaCheckCircle style={{ color: '#003366', fontSize: '50px' }} />
        </div>
      </div>

      <h2 style={{ color: '#003366', marginBottom: '10px', fontSize: '28px' }}>ชำระเงินสำเร็จ</h2>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px', lineHeight: '1.6' }}>
        ขอบคุณที่ใช้บริการ รายการของคุณได้รับการชำระเงินเรียบร้อยแล้ว
      </p>

      {/* กล่องใบเสร็จ */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'left', marginBottom: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#555' }}>
          <span>หมายเลขคำสั่งซื้อ</span>
          <span style={{ fontWeight: 'bold', color: '#333' }}>{orderId}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#555' }}>
          <span>วันที่</span>
          <span style={{ fontWeight: 'bold', color: '#333' }}>{formattedDate}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#555' }}>
          <span>เวลา</span>
          <span style={{ fontWeight: 'bold', color: '#333' }}>{formattedTime}</span>
        </div>

        <div style={{ borderTop: '1px dashed #ccc', margin: '20px 0' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '16px' }}>ยอดรวมทั้งหมด</span>
          <span style={{ fontWeight: 'bold', color: '#F2984A', fontSize: '24px' }}>฿{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* ปุ่มกด */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button 
          onClick={() => alert('ดาวน์โหลดใบเสร็จสำเร็จ!')}
          style={{ width: '100%', padding: '15px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          ดาวน์โหลดใบเสร็จ
        </button>
        
        <button 
          onClick={() => navigate('/my-courses')}
          style={{ width: '100%', padding: '15px', backgroundColor: '#fff', color: '#003366', border: '1px solid #003366', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          เข้าสู่ห้องเรียน
        </button>
      </div>

    </div>
  );
}