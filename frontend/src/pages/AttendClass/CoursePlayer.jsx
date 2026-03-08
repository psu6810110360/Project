import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 State ใหม่สำหรับเก็บความคืบหน้า
  const [completedVideos, setCompletedVideos] = useState([]);

  useEffect(() => {
    fetchCourseDataAndProgress();
  }, [courseId]);

  const fetchCourseDataAndProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // 1. ดึงข้อมูลคอร์สเรียนและวิดีโอ
      const resCourse = await axios.get(`http://localhost:3000/courses/${courseId}`);
      const courseData = resCourse.data;
      setCourse(courseData);

      if (courseData.videos) {
        const parsedVideos = typeof courseData.videos === 'string' 
          ? JSON.parse(courseData.videos) 
          : courseData.videos;
        parsedVideos.sort((a, b) => a.order - b.order);
        setVideos(parsedVideos);
        if (parsedVideos.length > 0) setCurrentVideo(parsedVideos[0]);
      }

      // 2. ดึงข้อมูลความคืบหน้า (completedVideos) จากประวัติการซื้อของนักเรียน
      const resPayment = await axios.get('http://localhost:3000/payments/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // หา payment ที่ตรงกับ courseId นี้
      const myPayment = resPayment.data.find(p => String(p.course.id) === String(courseId));
      if (myPayment && myPayment.completedVideos) {
        setCompletedVideos(myPayment.completedVideos);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 ฟังก์ชันนี้จะทำงานอัตโนมัติเมื่อวิดีโอเล่นจบ!
  const handleVideoEnded = async () => {
    if (!currentVideo) return;

    const videoIdStr = String(currentVideo.id);

    // ถ้าเคยกดจบไปแล้ว ไม่ต้องยิง API ซ้ำ
    if (completedVideos.includes(videoIdStr)) return;

    try {
      const token = localStorage.getItem('token');
      // ยิง API ไปบอก Backend ว่าดูจบแล้วนะ!
      const res = await axios.post(
        'http://localhost:3000/payments/complete-video',
        { courseId: String(courseId), videoId: videoIdStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // อัปเดต State ให้หน้าเว็บแสดงเครื่องหมายติ๊กถูกทันที
      if (res.data.completedVideos) {
        setCompletedVideos(res.data.completedVideos);
      }
    } catch (error) {
      console.error('ไม่สามารถบันทึกความคืบหน้าได้:', error);
    }
  };

  // คำนวณเปอร์เซ็นต์ความคืบหน้า
  const progressPercent = videos.length > 0 
    ? Math.round((completedVideos.length / videos.length) * 100) 
    : 0;

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center', color: '#333' }}>กำลังโหลดเนื้อหา...</div>;
  if (!course) return <div style={{ padding: '50px', textAlign: 'center', color: '#333' }}>ไม่พบคอร์สเรียน</div>;

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px' }}>
      
      {/* 🔹 แถบด้านบน (Header) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => navigate('/my-classroom')}
            style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaArrowLeft /> กลับ
          </button>
          <h2 style={{ margin: 0, fontSize: '24px' }}>{course.title}</h2>
        </div>

        {/* 🟢 หลอด Progress Bar ด้านขวาบน */}
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
            <span>ความคืบหน้าของคุณ</span>
            <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', backgroundColor: '#444', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              backgroundColor: '#27ae60', 
              height: '100%', 
              transition: 'width 0.5s ease-in-out' 
            }}></div>
          </div>
        </div>
      </div>

      {/* 🔹 พื้นที่เนื้อหาหลัก แบ่ง 2 ฝั่ง */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* ฝั่งซ้าย: วิดีโอเพลเยอร์ (Video Player) */}
        <div style={{ flex: '3', minWidth: '60%', backgroundColor: 'black', borderRadius: '10px', overflow: 'hidden' }}>
          {currentVideo ? (
            <>
              <video 
                key={currentVideo.id} 
                controls 
                autoPlay
                controlsList="nodownload" 
                onEnded={handleVideoEnded} // 🟢 เรียกฟังก์ชันนี้เมื่อวิดีโอเล่นจบ
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', outline: 'none' }}
              >
                <source src={currentVideo.url.startsWith('http') ? currentVideo.url : `http://localhost:3000${currentVideo.url}`} type="video/mp4" />
                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
              </video>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#F2984A' }}>ตอนที่ {currentVideo.order}: {currentVideo.title}</h3>
                {completedVideos.includes(String(currentVideo.id)) && (
                  <span style={{ color: '#27ae60', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <FaCheckCircle /> เรียนจบแล้ว
                  </span>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>
              ยังไม่มีวิดีโอสำหรับคอร์สนี้
            </div>
          )}
        </div>

        {/* ฝั่งขวา: รายการตอน (Playlist) */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#2d2d2d', borderRadius: '10px', padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>เนื้อหาหลักสูตร</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            {videos.length > 0 ? videos.map((video) => {
              const isCompleted = completedVideos.includes(String(video.id));
              const isPlaying = currentVideo?.id === video.id;

              return (
                <button
                  key={video.id}
                  onClick={() => setCurrentVideo(video)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px',
                    backgroundColor: isPlaying ? '#F2984A' : '#3d3d3d', 
                    color: 'white',
                    border: isPlaying ? '2px solid #fff' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPlayCircle size={20} color={isPlaying ? '#fff' : '#aaa'} />
                    <span>EP.{video.order} {video.title}</span>
                  </div>
                  
                  {/* 🟢 โชว์เครื่องหมายติ๊กถูก ถ้าดูจบแล้ว */}
                  {isCompleted && <FaCheckCircle color={isPlaying ? '#fff' : '#27ae60'} size={18} />}
                </button>
              );
            }) : (
              <p style={{ color: '#888', textAlign: 'center' }}>ไม่มีรายการวิดีโอ</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}