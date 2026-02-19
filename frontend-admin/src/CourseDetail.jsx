import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaUserGraduate, FaBookOpen } from 'react-icons/fa';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลด...</div>;
  if (!course) return <div style={{ textAlign: 'center', padding: '50px' }}>ไม่พบข้อมูลคอร์ส</div>;

  // สไตล์สำหรับเส้นบรรทัดตามแบบในรูป
  const lineStyle = { borderBottom: '1px solid #ddd', marginBottom: '8px', width: '100%', height: '1px' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#fff', color: '#333' }}>
      
      {/* ส่วนบน: ข้อมูลทั่วไป */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '60px' }}>
        <div>
          {course.coverImageUrl && (
            <img src={`http://localhost:3000${course.coverImageUrl}`} alt="Cover" style={{ width: '100%', borderRadius: '15px' }} />
          )}
          <div style={{ marginTop: '20px', color: '#666', fontSize: '15px' }}>
            <p><FaClock style={{ marginRight: '8px' }} /> <strong>เวลาเรียน:</strong> {course.classTime || '-'}</p>
            
          </div>
        </div>

        <div>
          <h1 style={{ color: '#003366', fontSize: '32px', marginBottom: '10px' }}>{course.title}</h1>
          <p style={{ color: '#888', marginBottom: '20px' }}>เหมาะสำหรับ : {course.suitableFor || '-'}</p>
          
          <h2 style={{ color: '#003366', fontSize: '28px', marginBottom: '20px' }}>
            {course.salePrice?.toLocaleString()} <span style={{ fontSize: '18px' }}>บาท</span>
          </h2>

          <button style={{ width: '100%', padding: '15px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            สั่งซื้อ
          </button>
        </div>
      </div>

      {/* ส่วนล่าง: รายละเอียดคอร์สเรียน */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px' }}>
        
        <div>
          <h2 style={{ color: '#003366', fontSize: '24px', borderBottom: '2px solid #003366', paddingBottom: '10px', marginBottom: '25px' }}>
            รายละเอียดคอร์สเรียน
          </h2>

          {/* วนลูปแสดงคอร์สย่อยจากฐานข้อมูล */}
          {course.courseContents && Array.isArray(course.courseContents) ? (
            course.courseContents.map((content, index) => (
              <div key={index} style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', color: '#333' }}>คอร์สที่ ({index + 1}.) {content.title}</h3>
                
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>บทที่สอน</p>
                  <p style={{ padding: '5px 0' }}>{content.lessons}</p>
                  <div style={lineStyle}></div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>โจทย์ที่พาลุย :</p>
                  <p style={{ padding: '5px 0' }}>{content.problems}</p>
                  <div style={lineStyle}></div>
                </div>
              </div>
            ))
          ) : (
            <p>ยังไม่มีรายละเอียดบทเรียน</p>
          )}
        </div>

        {/* ส่วนผู้สอน */}
        <div>
          <h2 style={{ color: '#003366', fontSize: '24px', marginBottom: '25px' }}>ผู้สอน</h2>
          {course.instructorName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #F2984A' }}>
                <img 
                  src={course.instructorImageUrl ? `http://localhost:3000${course.instructorImageUrl}` : '/default-avatar.png'} 
                  alt="Instructor" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{course.instructorName}</p>
                <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>อุดมการณ์การศึกษา</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}