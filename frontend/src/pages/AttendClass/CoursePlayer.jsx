import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlayCircle } from 'react-icons/fa';

export default function CoursePlayer() {
  const { courseId } = useParams(); 
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/courses/${courseId}`);
      const courseData = res.data;
      setCourse(courseData);

      if (courseData.videos) {
        const parsedVideos = typeof courseData.videos === 'string' 
          ? JSON.parse(courseData.videos) 
          : courseData.videos;
        
        parsedVideos.sort((a, b) => a.order - b.order);
        setVideos(parsedVideos);

        if (parsedVideos.length > 0) {
          setCurrentVideo(parsedVideos[0]);
        }
      }
    } catch (error) {
      console.error('ไม่สามารถดึงข้อมูลคอร์สได้:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center', color: '#333' }}>กำลังโหลดเนื้อหา...</div>;
  if (!course) return <div style={{ padding: '50px', textAlign: 'center', color: '#333' }}>ไม่พบคอร์สเรียน</div>;

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px' }}>
      
      {/* 🔹 แถบด้านบน (Header) */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={() => navigate('/my-classroom')} // กลับไปหน้าห้องเรียนของคุณ
          style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaArrowLeft /> กลับห้องเรียน
        </button>
        <h2 style={{ margin: 0, fontSize: '24px' }}>{course.title}</h2>
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
                style={{ width: '100%', height: 'auto', maxHeight: '70vh', outline: 'none' }}
              >
                {/* ดึง URL ของวิดีโอมาเล่นตรงนี้ */}
                <source src={currentVideo.url.startsWith('http') ? currentVideo.url : `http://localhost:3000${currentVideo.url}`} type="video/mp4" />
                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
              </video>
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: 0, color: '#F2984A' }}>ตอนที่ {currentVideo.order}: {currentVideo.title}</h3>
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
            {videos.length > 0 ? videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setCurrentVideo(video)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px',
                  backgroundColor: currentVideo?.id === video.id ? '#F2984A' : '#3d3d3d', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: '0.2s'
                }}
              >
                <FaPlayCircle size={20} />
                <span>EP.{video.order} {video.title}</span>
              </button>
            )) : (
              <p style={{ color: '#888', textAlign: 'center' }}>ไม่มีรายการวิดีโอ</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}