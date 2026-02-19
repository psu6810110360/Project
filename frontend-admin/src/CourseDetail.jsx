import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaUserGraduate, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function CourseDetail({ isAdmin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  const [activeMedia, setActiveMedia] = useState(0);

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

  const lineStyle = { borderBottom: '1px solid #ddd', marginBottom: '8px', width: '100%', height: '1px' };
  
 
  const hasVideo = Boolean(course.sampleVideoUrl);

  const toggleMedia = () => {
    if (hasVideo) {
      setActiveMedia(prev => (prev === 0 ? 1 : 0));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#fff', color: '#333' }}>
      
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '60px' }}>
        
       
        <div>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
           
            {activeMedia === 0 ? (
              <img 
                src={course.coverImageUrl ? `http://localhost:3000${course.coverImageUrl}` : '/default-cover.jpg'} 
                alt="Cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <video 
                src={`http://localhost:3000${course.sampleVideoUrl}`} 
                controls 
                autoPlay 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}

           
            {hasVideo && (
              <>
                <button onClick={toggleMedia} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#333' }}>
                  <FaChevronLeft />
                </button>
                <button onClick={toggleMedia} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#333' }}>
                  <FaChevronRight />
                </button>
                
                
                <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activeMedia === 0 ? '#F2984A' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setActiveMedia(0)}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activeMedia === 1 ? '#F2984A' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setActiveMedia(1)}></div>
                </div>
              </>
            )}
          </div>

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

      
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px' }}>
        
        
        <div>
          <h2 style={{ color: '#003366', fontSize: '24px', borderBottom: '2px solid #003366', paddingBottom: '10px', marginBottom: '25px' }}>
            รายละเอียดคอร์สเรียน
          </h2>

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

        <div>
          <h2 style={{ color: '#003366', fontSize: '24px', marginBottom: '25px' }}>ทีมผู้สอน</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {course.instructors && Array.isArray(course.instructors) && course.instructors.length > 0 ? (
              course.instructors.map((inst, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #F2984A', flexShrink: 0 }}>
                    <img 
                      src={inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : '/default-avatar.png'} 
                      alt={`Instructor ${inst.name}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 5px 0' }}>{inst.name}</p>
                    <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>อุดมการณ์การศึกษา</p>
                  </div>
                </div>
              ))
            ) : course.instructorName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #F2984A', flexShrink: 0 }}>
                  <img 
                    src={course.instructorImageUrl ? `http://localhost:3000${course.instructorImageUrl}` : '/default-avatar.png'} 
                    alt="Instructor" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 5px 0' }}>{course.instructorName}</p>
                  <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>อุดมการณ์การศึกษา</p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#888' }}>ยังไม่ระบุข้อมูลผู้สอน</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}