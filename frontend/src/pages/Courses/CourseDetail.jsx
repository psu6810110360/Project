// src/pages/Courses/CourseDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaClock, FaUserGraduate, FaChevronLeft, FaChevronRight, 
  FaShoppingCart, FaArrowLeft, FaPlayCircle, FaCheckCircle, FaHistory 
} from 'react-icons/fa';
import './CourseDetail.css'; 

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0); 
  const [isOwned, setIsOwned] = useState(false); 
  const [paymentStatus, setPaymentStatus] = useState(null); 
  const [isExpired, setIsExpired] = useState(false); 
  const [isRenewalRequested, setIsRenewalRequested] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/courses/${id}`);
        setCourse(response.data);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const myCoursesRes = await axios.get('http://localhost:3000/payments/my-courses', {
              headers: { Authorization: `Bearer ${token}` }
            });

            const relatedPayments = myCoursesRes.data.filter(item => {
              if (item.course && String(item.course.id) === String(id)) return true;
              if (item.courses && item.courses.some(c => String(c.id) === String(id))) return true;
              if (String(item.id) === String(id)) return true;
              return false;
            });

            if (relatedPayments.length > 0) {
              // ✅ จัดลำดับความสำคัญของบิลใหม่
              const activeApprovedItem = relatedPayments.find(p => {
                if (p.status?.toLowerCase() !== 'approved') return false;
                if (!p.expiresAt) return true;
                return new Date(p.expiresAt) >= new Date();
              });

              const pendingItem = relatedPayments.find(p => p.status?.toLowerCase() === 'pending');

              const expiredApprovedItem = relatedPayments.find(p => {
                if (p.status?.toLowerCase() !== 'approved') return false;
                if (!p.expiresAt) return false;
                return new Date(p.expiresAt) < new Date();
              });

              // 🟢 ลำดับ: ใช้งานได้ > รออนุมัติ > หมดอายุ > อื่นๆ
              const targetPayment = activeApprovedItem || pendingItem || expiredApprovedItem || relatedPayments[0];
              const status = targetPayment.status ? targetPayment.status.toLowerCase() : 'pending';
              
              setPaymentStatus(status);
              
              if (status === 'approved') {
                if (targetPayment.expiresAt && new Date(targetPayment.expiresAt) < new Date()) {
                  setIsExpired(true);
                  setIsOwned(false); 
                  setIsRenewalRequested(targetPayment.isRenewalRequested || false);
                } else {
                  setIsOwned(true);
                  setIsExpired(false);
                }
              } else if (status === 'pending') {
                // ✅ ถ้าเป็นบิลรออนุมัติ ให้ล้างค่าการหมดอายุทิ้ง
                setIsExpired(false);
                setIsOwned(false);
              }
            }
          } catch (err) {
            console.error("Failed to check ownership", err);
          }
        }

      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลได้', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="loader-container">
      <div className="loader">กำลังโหลดข้อมูลคอร์ส...</div>
    </div>
  );

  if (!course) return <div className="not-found">ไม่พบข้อมูลคอร์ส</div>;

  const hasVideo = Boolean(course.sampleVideoUrl);
  const isRevoked = ['revoked', 'suspended', 'canceled'].includes(paymentStatus);
  const isPending = paymentStatus === 'pending';

  const addToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (existingCart.find(item => String(item.id) === String(course.id))) {
      Swal.fire({
        icon: 'warning',
        title: 'คอร์สนี้อยู่ในตะกร้าแล้ว',
        confirmButtonColor: '#F2984A',
      });
      return;
    }
    const newCart = [...existingCart, course];
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));

    Swal.fire({
      icon: 'success',
      title: 'เพิ่มลงตะกร้าแล้ว',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const requestRenewal = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/payments/${id}/request-renewal`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'ส่งคำขอสำเร็จ!',
        text: 'ระบบได้ส่งคำขอต่ออายุไปยังแอดมินแล้ว กรุณารอการอนุมัติ',
        confirmButtonColor: '#003366'
      });
      
      setIsRenewalRequested(true);
    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถส่งคำขอต่ออายุได้', 'error');
    }
  };

  return (
    <div className="course-detail-container">
      
      <div className="nav-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> ย้อนกลับ
        </button>
      </div>

      <div className="detail-grid">
        
        {/* Left Column */}
        <div>
          <div className="media-wrapper">
            {activeMedia === 0 ? (
              <img 
                src={course.coverImageUrl ? course.coverImageUrl : 'https://via.placeholder.com/800x400'} 
                alt="Course Cover" 
                className="media-content"
              />
            ) : (
              <video 
                src={course.sampleVideoUrl} 
                controls autoPlay 
                className="media-content"
              />
            )}

            {hasVideo && (
              <div className="media-toggle-container">
                <button 
                  onClick={() => setActiveMedia(0)}
                  className={`btn-toggle ${activeMedia === 0 ? 'active' : ''}`}
                >
                  รูปหน้าปก
                </button>
                <button 
                  onClick={() => setActiveMedia(1)}
                  className={`btn-toggle ${activeMedia === 1 ? 'active' : ''}`}
                >
                  <FaPlayCircle /> ตัวอย่างวิดีโอ
                </button>
              </div>
            )}
          </div>

          <div className="content-section">
            <h2 className="section-title">รายละเอียดคอร์ส</h2>
            {course.courseContents?.map((content, idx) => (
              <div key={idx} className="content-card">
                <h3>{idx + 1}. {content.title}</h3>
                <p><strong>เนื้อหาเรียน:</strong> {content.lessons}</p>
                <p><strong>โจทย์ฝึกฝน:</strong> {content.problems}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="purchase-card">
            <h1 className="course-detail-title">{course.title}</h1>
            <p className="course-subtitle">{course.suitableFor || 'เหมาะสำหรับผู้เริ่มต้นถึงระดับกลาง'}</p>
            
            <div className="price-section">
              <div className="price-label">ราคาพิเศษเพียง</div>
              <div className="price-wrapper">
                ฿{course.salePrice?.toLocaleString()}
                {course.originalPrice && (
                  <span className="price-original">
                    ฿{course.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <FaClock style={{ color: '#F2984A' }} /> <span>เวลาเรียนทั้งหมด: {course.classTime || 'ไม่จำกัด'}</span>
              </div>
              
              <div className="feature-item">
                <FaCheckCircle style={{ color: '#28a745' }} /> 
                <span>
                  {(() => {
                    if (!course.accessDurationSeconds) return 'เข้าเรียนได้ตลอดชีพ';
                    const d = Math.floor(course.accessDurationSeconds / 86400);
                    const h = Math.floor((course.accessDurationSeconds % 86400) / 3600);
                    const m = Math.floor((course.accessDurationSeconds % 3600) / 60);
                    const s = course.accessDurationSeconds % 60;
                    
                    let timeText = 'เข้าเรียนได้ ';
                    if (d > 0) timeText += `${d} วัน `;
                    if (h > 0) timeText += `${h} ชั่วโมง `;
                    if (m > 0) timeText += `${m} นาที `;
                    if (s > 0) timeText += `${s} วินาที`;
                    
                    return timeText.trim();
                  })()}
                </span>
              </div>
            </div>

            {(isRevoked || isExpired) && (
              <div className="alert-box alert-revoked" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <strong>🚫 คอร์สนี้หมดอายุ / หมดสิทธิ์เรียนแล้ว</strong><br/>
                คุณสามารถกดสั่งซื้อใหม่ หรือขอต่ออายุ(หากแอดมินอนุญาต)
              </div>
            )}

            {isPending && (
              <div className="alert-box alert-pending">
                <strong>⏳ อยู่ระหว่างรอการอนุมัติสลิป</strong>
              </div>
            )}

            {isOwned ? (
              <button className="btn-action btn-study" onClick={() => navigate('/my-classroom')}>
                <FaUserGraduate /> เข้าสู่บทเรียนของคุณ
              </button>
            ) : isPending ? (
              <button className="btn-action btn-pending" disabled>
                <FaClock /> รอการอนุมัติ
              </button>
            ) : isExpired ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isRenewalRequested ? (
                  <button className="btn-action" disabled style={{ backgroundColor: '#f59e0b', color: '#fff', cursor: 'not-allowed', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
                    <FaClock /> รอแอดมินอนุมัติการต่ออายุ
                  </button>
                ) : (
                  <button className="btn-action" onClick={requestRenewal} style={{ backgroundColor: '#ea580c', color: '#fff', cursor: 'pointer', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <FaHistory /> ขอต่ออายุคอร์สเรียน
                  </button>
                )}
                <button className="btn-action btn-add-cart" onClick={addToCart}>
                  <FaShoppingCart /> ซื้อคอร์สนี้อีกครั้ง
                </button>
              </div>
            ) : (
              <button className="btn-action btn-add-cart" onClick={addToCart}>
                <FaShoppingCart /> {isRevoked ? 'ซื้อคอร์สนี้อีกครั้ง' : 'เพิ่มลงตะกร้าสินค้า'}
              </button>
            )}
          </div>

          <div className="instructor-card">
            <h4 className="instructor-title">ทีมผู้สอน</h4>
            <div className="instructor-list">
              {(course.instructors || [
                { name: course.instructorName, imageUrl: course.instructorImageUrl }
              ]).map((inst, idx) => (
                <div key={idx} className="instructor-item">
                  <img 
                    src={inst.imageUrl ? inst.imageUrl : 'https://via.placeholder.com/60'} 
                    alt={inst.name} 
                    className="instructor-img"
                  />
                  <div className="instructor-info">
                    <div className="instructor-name">{inst.name || 'อาจารย์ผู้เชี่ยวชาญ'}</div>
                    <div className="instructor-role">Expert Instructor</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}