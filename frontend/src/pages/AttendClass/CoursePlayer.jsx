import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import './CoursePlayer.css'; // อย่าลืม import ไฟล์ CSS นะครับ

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

      const resPayment = await axios.get('http://localhost:3000/payments/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  const handleVideoEnded = async () => {
    if (!currentVideo) return;
    const videoIdStr = String(currentVideo.id);
    if (completedVideos.includes(videoIdStr)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/payments/complete-video',
        { courseId: String(courseId), videoId: videoIdStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.completedVideos) {
        setCompletedVideos(res.data.completedVideos);
      }
    } catch (error) {
      console.error('ไม่สามารถบันทึกความคืบหน้าได้:', error);
    }
  };

  const progressPercent = videos.length > 0 
    ? Math.round((completedVideos.length / videos.length) * 100) 
    : 0;

  if (isLoading) return <div className="cp-loading-text">กำลังโหลดเนื้อหา...</div>;
  if (!course) return <div className="cp-error-text">ไม่พบคอร์สเรียน</div>;

  return (
    <div className="cp-container">
      
      {/* 🔹 แถบด้านบน (Header) */}
      <div className="cp-header">
        <div className="cp-header-left">
          <button onClick={() => navigate('/my-classroom')} className="cp-back-btn">
            <FaArrowLeft /> กลับ
          </button>
          <h2 className="cp-title">{course.title}</h2>
        </div>

        {/* 🟢 หลอด Progress Bar */}
        <div className="cp-progress-wrapper">
          <div className="cp-progress-info">
            <span>ความคืบหน้าของคุณ</span>
            <span className="cp-progress-text">{progressPercent}%</span>
          </div>
          <div className="cp-progress-bg">
            <div 
              className="cp-progress-fill" 
              style={{ width: `${progressPercent}%` }} // ตัวนี้ต้องค้างไว้เพราะค่าเปลี่ยนตาม State
            ></div>
          </div>
        </div>
      </div>

      {/* 🔹 พื้นที่เนื้อหาหลัก */}
      <div className="cp-main-content">
        
        {/* ฝั่งซ้าย: วิดีโอเพลเยอร์ */}
        <div className="cp-video-section">
          {currentVideo ? (
            <>
              <video 
                key={currentVideo.id} 
                className="cp-video-element"
                controls 
                autoPlay
                controlsList="nodownload" 
                onEnded={handleVideoEnded}
              >
                <source src={currentVideo.url.startsWith('http') ? currentVideo.url : `http://localhost:3000${currentVideo.url}`} type="video/mp4" />
                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
              </video>
              <div className="cp-video-info-footer">
                <h3 className="cp-current-ep-title">ตอนที่ {currentVideo.order}: {currentVideo.title}</h3>
                {completedVideos.includes(String(currentVideo.id)) && (
                  <span className="cp-status-completed">
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
        <div className="cp-playlist-section">
          <h3 className="cp-playlist-title">เนื้อหาหลักสูตร</h3>
          
          <div className="cp-playlist-list">
            {videos.length > 0 ? videos.map((video) => {
              const isCompleted = completedVideos.includes(String(video.id));
              const isPlaying = currentVideo?.id === video.id;

              return (
                <button
                  key={video.id}
                  onClick={() => setCurrentVideo(video)}
                  className={`cp-video-item ${isPlaying ? 'is-playing' : ''}`}
                >
                  <div className="cp-item-info">
                    <FaPlayCircle size={20} color={isPlaying ? '#fff' : '#aaa'} />
                    <span>EP.{video.order} {video.title}</span>
                  </div>
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