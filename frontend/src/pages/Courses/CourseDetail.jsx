//CourseDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaClock, FaUserGraduate, FaChevronLeft, FaChevronRight, 
  FaShoppingCart, FaArrowLeft, FaPlayCircle, FaCheckCircle 
} from 'react-icons/fa';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0); // 0: Cover, 1: Video

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลได้', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: '"Prompt", sans-serif' }}>
      <div className="loader">กำลังโหลดข้อมูลคอร์ส...</div>
    </div>
  );

  if (!course) return <div style={{ textAlign: 'center', padding: '100px' }}>ไม่พบข้อมูลคอร์ส</div>;

  const hasVideo = Boolean(course.sampleVideoUrl);
  const myCourses = JSON.parse(localStorage.getItem('myCourses')) || [];
  const isOwned = myCourses.some(c => c.id === course.id);

  const addToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (existingCart.find(item => item.id === course.id)) {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: '"Prompt", sans-serif', backgroundColor: '#fdfdfd' }}>
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: '#eee', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', color: '#555', transition: '0.3s' }}
          onMouseOver={(e) => {e.target.style.background = '#003366'; e.target.style.color = '#fff'}}
          onMouseOut={(e) => {e.target.style.background = '#eee'; e.target.style.color = '#555'}}
        >
          <FaArrowLeft /> ย้อนกลับ
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Media & Description */}
        <div>
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', backgroundColor: '#000' }}>
            {activeMedia === 0 ? (
              <img 
                src={course.coverImageUrl ? `http://localhost:3000${course.coverImageUrl}` : 'https://via.placeholder.com/800x450'} 
                alt="Course Cover" 
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} 
              />
            ) : (
              <video 
                src={`http://localhost:3000${course.sampleVideoUrl}`} 
                controls autoPlay 
                style={{ width: '100%', aspectRatio: '16/9', display: 'block' }} 
              />
            )}

            {/* Media Toggler */}
            {hasVideo && (
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setActiveMedia(0)}
                  style={{ padding: '8px 15px', borderRadius: '30px', border: 'none', background: activeMedia === 0 ? '#F2984A' : 'rgba(255,255,255,0.9)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  รูปหน้าปก
                </button>
                <button 
                  onClick={() => setActiveMedia(1)}
                  style={{ padding: '8px 15px', borderRadius: '30px', border: 'none', background: activeMedia === 1 ? '#F2984A' : 'rgba(255,255,255,0.9)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FaPlayCircle /> ตัวอย่างวิดีโอ
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '26px', color: '#003366', borderLeft: '5px solid #F2984A', paddingLeft: '15px', marginBottom: '25px' }}>รายละเอียดคอร์ส</h2>
            {course.courseContents?.map((content, idx) => (
              <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #f0f0f0' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{idx + 1}. {content.title}</h3>
                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}><strong>เนื้อหาเรียน:</strong> {content.lessons}</p>
                <p style={{ color: '#666', fontSize: '14px', margin: '0' }}><strong>โจทย์ฝึกฝน:</strong> {content.problems}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Buying Info */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
            <h1 style={{ fontSize: '28px', color: '#003366', marginTop: '15px', lineHeight: '1.3' }}>{course.title}</h1>
            <p style={{ color: '#888', fontSize: '15px' }}>{course.suitableFor || 'เหมาะสำหรับผู้เริ่มต้นถึงระดับกลาง'}</p>
            
            <div style={{ margin: '25px 0', padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>ราคาพิเศษเพียง</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#F2984A' }}>
                ฿{course.salePrice?.toLocaleString()}
                {course.originalPrice && (
                  <span style={{ fontSize: '18px', color: '#ccc', textDecoration: 'line-through', marginLeft: '10px' }}>
                    ฿{course.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '14px' }}>
                <FaClock style={{ color: '#F2984A' }} /> <span>เวลาเรียนทั้งหมด: {course.classTime || 'ไม่จำกัด'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '14px' }}>
                <FaCheckCircle style={{ color: '#28a745' }} /> <span>เข้าเรียนได้ตลอดชีพ</span>
              </div>
            </div>

            {isOwned ? (
              <button 
                onClick={() => navigate('/my-courses')} 
                style={{ width: '100%', padding: '18px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <FaUserGraduate /> เข้าสู่บทเรียนของคุณ
              </button>
            ) : (
              <button 
                onClick={addToCart} 
                style={{ width: '100%', padding: '18px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.3s', boxShadow: '0 10px 20px rgba(0,51,102,0.2)' }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <FaShoppingCart /> เพิ่มลงตะกร้าสินค้า
              </button>
            )}
          </div>

          {/* Instructor Profile Card */}
          <div style={{ marginTop: '30px', background: '#003366', padding: '25px', borderRadius: '25px', color: '#fff' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>ทีมผู้สอน</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* ตรวจสอบข้อมูลผู้สอน */}
              {(course.instructors || [
                { name: course.instructorName, imageUrl: course.instructorImageUrl }
              ]).map((inst, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : 'https://via.placeholder.com/60'} 
                    alt={inst.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F2984A' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{inst.name || 'อาจารย์ผู้เชี่ยวชาญ'}</div>
                    <div style={{ fontSize: '12px', color: '#bbdefb' }}>Expert Instructor</div>
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