// src/pages/Courses/CourseDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaClock, FaUserGraduate, FaChevronLeft, FaChevronRight, 
  FaShoppingCart, FaArrowLeft, FaPlayCircle, FaCheckCircle 
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
  const [isExpired, setIsExpired] = useState(false); // ✅ 1. เพิ่ม State สำหรับเช็คคอร์สหมดอายุ

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
              const approvedItem = relatedPayments.find(p => p.status && p.status.toLowerCase() === 'approved');
              const pendingItem = relatedPayments.find(p => p.status && p.status.toLowerCase() === 'pending');
              
              const targetPayment = approvedItem || pendingItem || relatedPayments[0];
              const status = targetPayment.status ? targetPayment.status.toLowerCase() : 'pending';
              
              setPaymentStatus(status);
              
              if (status === 'approved') {
                // ✅ 2. เช็คว่าคอร์สหมดอายุหรือยัง (เอาเวลาปัจจุบัน เทียบกับ expiresAt)
                if (targetPayment.expiresAt && new Date(targetPayment.expiresAt) < new Date()) {
                  setIsExpired(true);
                  setIsOwned(false); // หมดอายุแล้ว ไม่ให้กดเข้าเรียน
                } else {
                  setIsOwned(true);
                  setIsExpired(false);
                }
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
                src={course.coverImageUrl ? `http://localhost:3000${course.coverImageUrl}` : 'https://via.placeholder.com/800x450'} 
                alt="Course Cover" 
                className="media-content"
              />
            ) : (
              <video 
                src={`http://localhost:3000${course.sampleVideoUrl}`} 
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
                {/* ✅ 3. เปลี่ยนให้ดึงข้อมูล accessDurationDays มาโชว์ */}
                <span>{course.accessDurationDays ? `เข้าเรียนได้ ${course.accessDurationDays} วัน` : 'เข้าเรียนได้ตลอดชีพ'}</span>
              </div>
            </div>

            {/* ✅ 4. โชว์กรอบแดงเตือนถ้าคอร์สหมดอายุ */}
            {(isRevoked || isExpired) && (
              <div className="alert-box alert-revoked" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <strong>🚫 คอร์สนี้หมดอายุ / หมดสิทธิ์เรียนแล้ว</strong><br/>คุณสามารถกดเพิ่มลงตะกร้าเพื่อสั่งซื้อใหม่ได้อีกครั้ง
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
            ) : (
              <button className="btn-action btn-add-cart" onClick={addToCart}>
                <FaShoppingCart /> {(isRevoked || isExpired) ? 'ซื้อคอร์สนี้อีกครั้ง' : 'เพิ่มลงตะกร้าสินค้า'}
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
                    src={inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : 'https://via.placeholder.com/60'} 
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