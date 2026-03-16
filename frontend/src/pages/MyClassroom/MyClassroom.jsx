// src/pages/MyClassroom/MyClassroom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUser, FaRegClock, FaCheckCircle, FaPlayCircle, 
  FaChevronDown, FaChevronRight, FaCalendarAlt, FaHistory, FaAward 
} from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MyClassroom.css';
import EmptyCourseState from './EmptyCourseState';
import { Link, useNavigate } from 'react-router-dom';

// นำเข้าไลบรารีสำหรับสร้าง PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Certificate from '../../components/Certificate.jsx';

const MyClassroom = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRevoked, setShowRevoked] = useState(false);
  const [showRejected, setShowRejected] = useState(false);  
  const [showExpired, setShowExpired] = useState(false); 
  const navigate = useNavigate();

  // ✅ State & Refs สำหรับใบประกาศนียบัตร
  const certificateRef = useRef();
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [certData, setCertData] = useState({ courseName: '', date: '' });
  
  // ดึงชื่อผู้ใช้จาก localStorage (ถ้ามี) ถ้าไม่มีให้ใช้ค่าเริ่มต้น
  let studentName = 'ไม่พบชื่อผู้ใช้งาน';
  const userStr = localStorage.getItem('user'); // ลองดึงจาก key 'user' 
  
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);

      const fName = userData.firstName || userData.firstname || '';
      const lName = userData.lastName || userData.lastname || '';
      // รวมชื่อและนามสกุล (ถ้ามี firstName/lastName)
      if (fName || lName) {
        studentName = `${fName} ${lName}`.trim();
      } 
    } catch (e) {
      console.error("Parse user data error:", e);
    }
  }

  useEffect(() => {
    fetchMyCoursesFromBackend();
  }, []);

  const fetchMyCoursesFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMyCourses([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:3000/payments/my-courses',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const coursesWithStatus = response.data.map((payment) => {
        let totalVideos = 0;
        if (payment.course.videos) {
          try {
            const parsedVideos = typeof payment.course.videos === 'string' 
              ? JSON.parse(payment.course.videos) 
              : payment.course.videos;
            totalVideos = parsedVideos.length;
          } catch (e) {
            console.error('Parse videos error', e);
          }
        }

        const completedCount = payment.completedVideos ? payment.completedVideos.length : 0;
        const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

        const expiresAt = payment.expiresAt ? new Date(payment.expiresAt) : null;
        const isExpired = expiresAt ? expiresAt < new Date() : false;

        return {
          ...payment.course,
          paymentStatus: payment.status ? payment.status.toLowerCase() : 'pending',
          progressPercent: progressPercent,
          expiresAt: expiresAt, 
          isExpired: isExpired, 
          userCourseId: payment.id 
        };
      });

      const uniqueCoursesMap = new Map();

      coursesWithStatus.forEach(course => {
        const existing = uniqueCoursesMap.get(course.id);
        
        const getPriority = (c) => {
          if (c.paymentStatus === 'approved' && !c.isExpired) return 1; 
          if (c.paymentStatus === 'pending') return 2; 
          if (c.paymentStatus === 'approved' && c.isExpired) return 3; 
          return 4; 
        };

        if (!existing || getPriority(course) < getPriority(existing)) {
          uniqueCoursesMap.set(course.id, course);
        }
      });

      const finalCourses = Array.from(uniqueCoursesMap.values());

      setMyCourses(finalCourses);
      localStorage.setItem('myCourses', JSON.stringify(finalCourses));
    } catch (error) {
      console.error('❌ โหลดข้อมูลห้องเรียนล้มเหลว:', error);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันดาวน์โหลดใบประกาศ
  const handleDownloadCertificate = async (courseName) => {
    setDownloadingCert(true);
    
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    setCertData({ courseName, date: today });

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // รอให้ React อัปเดตข้อมูลลงคอมโพเนนต์

      const element = certificateRef.current;
      if (!element) throw new Error("ไม่พบคอมโพเนนต์ Certificate");

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'px', [800, 600]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, 800, 600);
      pdf.save(`Certificate_${courseName}.pdf`);
      
      Swal.fire('สำเร็จ!', 'ดาวน์โหลดใบประกาศนียบัตรเรียบร้อยแล้ว 🎓', 'success');
    } catch (error) {
      console.error('Error generating certificate', error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถสร้างใบประกาศได้', 'error');
    } finally {
      setDownloadingCert(false);
    }
  };

  const pendingCourses = myCourses.filter(c => c.paymentStatus === 'pending');
  const approvedCourses = myCourses.filter(c => c.paymentStatus === 'approved' && !c.isExpired);
  const rejectedCourses = myCourses.filter(c => c.paymentStatus === 'rejected');
  const revokedCourses = myCourses.filter(c => ['revoked', 'suspended', 'canceled'].includes(c.paymentStatus));
  const expiredCourses = myCourses.filter(c => c.paymentStatus === 'approved' && c.isExpired);

  const formatDate = (date) => {
    if (!date) return 'ตลอดชีพ';
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const CourseCard = ({ course }) => {
    const isApproved = course.paymentStatus === 'approved' && !course.isExpired;
    const isPending = course.paymentStatus === 'pending';
    const isRejected = course.paymentStatus === 'rejected';
    const isRevoked = ['revoked', 'suspended', 'canceled'].includes(course.paymentStatus);
    const isExpired = course.isExpired; 

    return (
      <div className="course-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <img 
          src={course.coverImageUrl ? `http://localhost:3000${course.coverImageUrl}` : 'https://via.placeholder.com/400x200?text=No+Cover'} 
          alt={course.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover', opacity: (isRevoked || isExpired) ? 0.6 : 1, filter: (isRevoked || isExpired) ? 'grayscale(80%)' : 'none' }}
        />

        {isApproved && course.progressPercent === 100 && (
          <FaCheckCircle className="completed-icon" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '24px', color: '#28a745', background: 'white', borderRadius: '50%' }} />
        )}

        <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="course-card-title" style={{ marginTop: '0px', color: (isRevoked || isExpired) ? '#7f8c8d' : '#003366', fontSize: '18px', marginBottom: '10px' }}>{course.title}</h3>

          <div className="course-info" style={{ color: '#555', fontSize: '14px', marginBottom: '5px' }}>
            <FaUser style={{ color: '#888', marginRight: '5px' }} /> {course.instructorName || 'ไม่ระบุผู้สอน'}
          </div>
          <div className="course-info" style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>
            <FaRegClock style={{ color: '#888', marginRight: '5px' }} /> {course.classTime || 'ไม่ระบุเวลา'}
          </div>

          <div style={{ marginTop: 'auto' }}>
            {isPending && (
              <div style={{ background: '#fef9c3', color: '#b45309', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                ⏳ รอการอนุมัติ
              </div>
            )}
            
            {isRejected && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                ❌ สลิปถูกปฏิเสธ
              </div>
            )}

            {isRevoked && (
              <div style={{ background: '#f3f4f6', color: '#4b5563', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', border: '1px solid #d1d5db' }}>
                🚫 ถูกระงับสิทธิ์
              </div>
            )}

            {isApproved && (
              <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaCalendarAlt /> หมดอายุ: <strong>{formatDate(course.expiresAt)}</strong>
              </div>
            )}

            {isApproved && (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    <span>ความคืบหน้า</span>
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{course.progressPercent || 0}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${course.progressPercent || 0}%`, backgroundColor: '#27ae60', height: '100%', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <Link to={`/attend/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <button style={{ width: '100%', padding: '10px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FaPlayCircle /> เข้าเรียน
                    </button>
                  </Link>

                  {/* ✅ โชว์ปุ่มรับใบประกาศเฉพาะคอร์สที่ความคืบหน้า 100% */}
                  {course.progressPercent === 100 && (
                    <button 
                      onClick={() => handleDownloadCertificate(course.title)}
                      disabled={downloadingCert}
                      style={{ 
                        width: '100%', padding: '10px', backgroundColor: '#F2984A', 
                        color: 'white', border: 'none', borderRadius: '8px', 
                        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        gap: '8px', opacity: downloadingCert ? 0.7 : 1 
                      }}
                    >
                      <FaAward /> {downloadingCert ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลดใบประกาศ'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {isExpired && (
              <div>
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                  <FaHistory /> หมดอายุเมื่อ: <strong>{formatDate(course.expiresAt)}</strong>
                </div>
                
                <button 
                  onClick={() => navigate(`/course/${course.id}`)} 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FaHistory /> ต่ออายุคอร์สเรียน
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลดห้องเรียน...</div>;
  }

  return (
    <div className="classroom-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <h1 className="classroom-title" style={{ margin: '0', color: '#003366', display: 'inline-block' }}>
          ห้องเรียนของฉัน
        </h1>
      </div>

      {myCourses.length === 0 ? (
        <EmptyCourseState />
      ) : (
        <>
          {pendingCourses.length > 0 && (
            <>
              <h2 className="section-title">รอการอนุมัติ</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {pendingCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {approvedCourses.length > 0 && (
            <div>
              <h2 className="section-title">คอร์สของฉัน</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {approvedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {expiredCourses.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div 
                onClick={() => setShowExpired(!showExpired)}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', color: '#ea580c' }}
              >
                {showExpired ? <FaChevronDown /> : <FaChevronRight />}
                <h2 className="section-title" style={{ margin: 0, color: 'inherit', borderBottom: 'none' }}>
                  คอร์สที่หมดอายุแล้ว ({expiredCourses.length})
                </h2>
              </div>
              
              {showExpired && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {expiredCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}

          {revokedCourses.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div 
                onClick={() => setShowRevoked(!showRevoked)}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', color: '#7f8c8d' }}
              >
                {showRevoked ? <FaChevronDown /> : <FaChevronRight />}
                <h2 className="section-title" style={{ margin: 0, color: 'inherit', borderBottom: 'none' }}>
                  คอร์สที่ถูกระงับสิทธิ์ ({revokedCourses.length})
                </h2>
              </div>
              
              {showRevoked && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {revokedCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}

          {rejectedCourses.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div 
                onClick={() => setShowRejected(!showRejected)}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px', color: '#c0392b' }}
              >
                {showRejected ? <FaChevronDown /> : <FaChevronRight />}
                <h2 className="section-title" style={{ margin: 0, color: 'inherit', borderBottom: 'none' }}>
                  การสั่งซื้อถูกปฏิเสธ ({rejectedCourses.length})
                </h2>
              </div>

              {showRejected && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {rejectedCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* ✅ คอมโพเนนต์ใบประกาศที่ถูกซ่อนไว้สำหรับให้ html2canvas ดึงไปทำ PDF */}
      <Certificate 
        ref={certificateRef} 
        studentName={studentName} 
        courseName={certData.courseName} 
        date={certData.date} 
      />

    </div>
  );
};

export default MyClassroom;