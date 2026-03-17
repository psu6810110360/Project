// src/pages/Courses/CourseForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaVideo, FaEdit, FaTrash, FaUpload, FaList, FaSave, FaTimes } from 'react-icons/fa';
import './CourseForm.css'; 

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState(0);

  // ==========================================
  // 📌 State 
  // ==========================================
  const [formData, setFormData] = useState({
    title: '', shortDescription: '', isActive: true, originalPrice: '', salePrice: '',
    suitableFor: [], // ✅ เปลี่ยนเป็น Array สำหรับเก็บค่า ม.4, ม.5, ม.6
    classTime: ''
  });

  // ✅ State สำหรับเก็บ วัน, ชม., นาที, วิ. แยกกัน
  const [duration, setDuration] = useState({ days: '', hours: '', minutes: '', seconds: '' });
  
  // ✅ ฟังก์ชันรับค่าเปลี่ยนเวลา
  const handleDurationChange = (e) => {
    setDuration({ ...duration, [e.target.name]: e.target.value });
  };

  const [courseContents, setCourseContents] = useState([{ title: '', lessons: '', problems: '' }]);
  const [coverImage, setCoverImage] = useState(null);
  const [sampleVideo, setSampleVideo] = useState(null);
  const [instructors, setInstructors] = useState([{ name: '', image: null, previewUrl: '' }]);

  const [videos, setVideos] = useState([]); 
  const [newVideoTitle, setNewVideoTitle] = useState(''); 
  const [newVideoFile, setNewVideoFile] = useState(null); 
  const [isUploading, setIsUploading] = useState(false); 

  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // ==========================================
  // 📌 useEffect: Fetch Data
  // ==========================================
  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:3000/courses/${id}`).then((res) => {
        const course = res.data;
        
        // ✅ แปลงค่าเหมาะสำหรับ (suitableFor) จาก String กลับเป็น Array
        let parsedSuitableFor = [];
        if (course.suitableFor) {
          parsedSuitableFor = course.suitableFor.split(',').map(item => item.trim());
        }

        // ✅ ดึงเฉพาะตัวเลขจาก classTime (เผื่อใน DB มีคำว่า " ชั่วโมง" ติดมา)
        let parsedClassTime = '';
        if (course.classTime) {
          parsedClassTime = course.classTime.replace(/\D/g, ''); 
        }

        setFormData({
          title: course.title || '',
          shortDescription: course.shortDescription || '',
          isActive: course.isActive === true || String(course.isActive) === "true" || course.isActive === 1,
          originalPrice: course.originalPrice || '',
          salePrice: course.salePrice || '',
          suitableFor: parsedSuitableFor,
          classTime: parsedClassTime
        });

        if (course.courseContents) {
          const contents = typeof course.courseContents === 'string' ? JSON.parse(course.courseContents) : course.courseContents;
          setCourseContents(contents);
        }

        if (course.instructors && Array.isArray(course.instructors)) {
          setInstructors(course.instructors.map(inst => ({
            name: inst.name || '',
            image: null,
            previewUrl: inst.imageUrl ? `http://localhost:3000${inst.imageUrl}` : ''
          })));
        }

        // ✅ ดึงค่าวินาทีจากฐานข้อมูลมาแยกใส่ช่อง วัน, ชม., นาที, วิ.
        if (course.accessDurationSeconds) {
          const totalSecs = parseInt(course.accessDurationSeconds, 10);
          const d = Math.floor(totalSecs / 86400);
          const h = Math.floor((totalSecs % 86400) / 3600);
          const m = Math.floor((totalSecs % 3600) / 60);
          const s = totalSecs % 60;
          setDuration({
            days: d > 0 ? d : '',
            hours: h > 0 ? h : '',
            minutes: m > 0 ? m : '',
            seconds: s > 0 ? s : ''
          });
        }

        if (course.videos) {
            const parsedVideos = typeof course.videos === 'string' ? JSON.parse(course.videos) : course.videos;
            setVideos(parsedVideos || []); 
        } else {
          setVideos([]);
        }

      }).catch(err => {
          console.error("Failed to fetch course data", err);
      });
    }
  }, [id, isEditMode]);

  // ==========================================
  // 📌 Handlers
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ✅ ฟังก์ชันจัดการ Checkbox ของ "เหมาะสำหรับ"
  const handleSuitableForChange = (level) => {
    setFormData(prev => {
      const newSuitableFor = prev.suitableFor.includes(level)
        ? prev.suitableFor.filter(item => item !== level)
        : [...prev.suitableFor, level];
      
      // จัดเรียงลำดับ ม.4 -> ม.5 -> ม.6 ให้สวยงาม
      const order = ['ม.4', 'ม.5', 'ม.6'];
      newSuitableFor.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      
      return { ...prev, suitableFor: newSuitableFor };
    });
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault(); 
    const data = new FormData(); 

    // จัดการข้อมูล Text ปกติ
    Object.keys(formData).forEach(key => {
      if (key === 'isActive') {
        data.append(key, formData.isActive ? 'true' : 'false');
      } else if (key === 'salePrice') {
        // ✅ หากราคาขายว่างเปล่า ให้ใช้ราคาเดิมแทน
        data.append(key, formData.salePrice || formData.originalPrice);
      } else if (key === 'suitableFor') {
        // ✅ แปลง Array เป็น String ก่อนส่งเข้า DB
        data.append(key, formData.suitableFor.join(', '));
      } else if (key === 'classTime') {
        // ✅ เติมคำว่า " ชั่วโมง" ให้ตอนส่งเข้า Database
        data.append(key, formData.classTime ? `${formData.classTime} ชั่วโมง` : '');
      } else { 
        data.append(key, formData[key]);
      }
    });

    // ✅ รวบยอดเวลาที่กรอกทั้งหมดให้กลายเป็น "วินาทีรวม" ก่อนส่ง
    const totalSeconds = 
      (parseInt(duration.days || 0) * 86400) + 
      (parseInt(duration.hours || 0) * 3600) + 
      (parseInt(duration.minutes || 0) * 60) + 
      parseInt(duration.seconds || 0);

    if (totalSeconds > 0) {
      data.append('accessDurationSeconds', totalSeconds);
    } else {
      data.append('accessDurationSeconds', '');
    }

    // ✅ แนบข้อมูลอื่นๆ (คอร์สย่อย, รูปภาพปก, วิดีโอตัวอย่าง, และครูผู้สอน)
    data.append('courseContents', JSON.stringify(courseContents));
    if (coverImage) data.append('coverImage', coverImage);
    if (sampleVideo) data.append('sampleVideo', sampleVideo);
    instructors.forEach((inst) => {
      data.append('instructorNames', inst.name); 
      if (inst.image) data.append('instructorImages', inst.image); 
    });

    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:3000/courses/${id}`, data);
        Swal.fire('สำเร็จ', 'บันทึกรายละเอียดคอร์สเรียบร้อย', 'success');
      } else {
        await axios.post('http://localhost:3000/courses', data);
        Swal.fire('สำเร็จ', 'สร้างคอร์สใหม่เรียบร้อย', 'success').then(() => navigate('/'));
      }
    } catch (error) {
      console.error('บันทึกข้อมูลไม่สำเร็จ', error);
      Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleUploadVideo = async () => {
    if (!newVideoTitle || !newVideoFile) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อตอนและเลือกไฟล์วิดีโอ', 'warning');
      return;
    }

    setIsUploading(true);
    const videoData = new FormData();
    videoData.append('file', newVideoFile); 
    
    try {
      const uploadRes = await axios.post('http://localhost:3000/courses/upload-video', videoData);
      const realVideoUrl = uploadRes.data.url; 

      const newVideoObj = {
        id: Date.now().toString(), 
        title: newVideoTitle,
        url: realVideoUrl, 
        order: videos.length + 1 
      };

      const updatedVideos = [...videos, newVideoObj];
      setVideos(updatedVideos);

      await axios.patch(`http://localhost:3000/courses/${id}/videos`, { videos: updatedVideos });
      Swal.fire('สำเร็จ', 'อัปโหลดวิดีโอเรียบร้อย', 'success');
      setNewVideoTitle('');
      setNewVideoFile(null);
    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'อัปโหลดวิดีโอไม่สำเร็จ', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    Swal.fire({
        title: 'ยืนยันการลบวิดีโอ?',
        text: "คุณไม่สามารถกู้คืนได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!'
      }).then(async (result) => {
        if (result.isConfirmed) {
            const updatedVideos = videos.filter(v => v.id !== videoId);
            setVideos(updatedVideos);
            try {
              await axios.patch(`http://localhost:3000/courses/${id}/videos`, { videos: updatedVideos });
              Swal.fire('สำเร็จ', 'ลบวิดีโอแล้ว', 'success');
            } catch (error) {
              Swal.fire('ผิดพลาด', 'ไม่สามารถลบวิดีโอได้', 'error');
            }
        }
      });
  };

  const handleSaveEditVideo = async (videoId) => {
    if (!editVideoTitle) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อตอนให้ครบถ้วน', 'warning');
      return;
    }

    setIsSavingEdit(true);
    let finalVideoUrl = videos.find(v => v.id === videoId).url;

    try {
      if (editVideoFile) {
        const videoData = new FormData();
        videoData.append('file', editVideoFile);
        const uploadRes = await axios.post('http://localhost:3000/courses/upload-video', videoData);
        finalVideoUrl = uploadRes.data.url;
      }

      const updatedVideos = videos.map(video => {
        if (video.id === videoId) {
          return { ...video, title: editVideoTitle, url: finalVideoUrl };
        }
        return video;
      });

      await axios.patch(`http://localhost:3000/courses/${id}/videos`, { videos: updatedVideos });
      
      setVideos(updatedVideos);
      setEditingVideoId(null);
      setEditVideoFile(null);
      Swal.fire({ title: 'สำเร็จ', text: 'แก้ไขข้อมูลวิดีโอเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });

    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการแก้ไขวิดีโอ', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="course-form-container">
      <h2 className="form-header">
        {isEditMode ? `จัดการคอร์ส: ${formData.title}` : 'เพิ่มคอร์สเรียนใหม่'}
      </h2>

      {/* ✅ แถบเมนู Tab */}
      <div className="tab-container">
        <button 
          onClick={() => setActiveTab(0)}
          className={`tab-btn ${activeTab === 0 ? 'active' : ''}`}
        >
          <FaEdit /> รายละเอียดคอร์ส
        </button>
        
        {isEditMode ? (
          <button 
            onClick={() => setActiveTab(1)}
            className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}
          >
            <FaVideo /> จัดการและอัปโหลดวิดีโอ
          </button>
        ) : (
          <div className="tab-btn disabled">
            (กรุณาบันทึกคอร์สก่อนเพื่อจัดการวิดีโอ)
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* 🟢 เนื้อหา TAB 0: รายละเอียดคอร์ส */}
      {/* ===================================== */}
      {activeTab === 0 && (
        <form onSubmit={handleSubmitDetails} className="form-layout">
          
          <div>
            <label className="form-label">ชื่อคอร์ส: <span className="required-star">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-input" />
          </div>
          <div>
            <label className="form-label">รายละเอียดสั้น:</label>
            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="form-textarea" />
          </div>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">ราคาเดิม: <span className="required-star">*</span></label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-col">
              <label className="form-label highlight">ราคาขาย (ปล่อยว่างได้):</label>
              <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="หากไม่กรอกจะใช้ราคาเดิม" className="form-input highlight" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">รูปภาพปก:</label>
              <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} accept="image/*" />
            </div>
            <div className="form-col">
              <label className="form-label">วิดีโอตัวอย่าง (ถ้ามี):</label>
              <input type="file" onChange={(e) => setSampleVideo(e.target.files[0])} accept="video/*" />
            </div>
          </div>

          <hr className="divider" />
          
          <div>
            <label className="form-label">รายชื่อครูผู้สอน: <span className="required-star">*</span></label>
            {instructors.map((inst, index) => (
              <div key={index} className="item-card item-row">
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder={`ชื่อครูคนที่ ${index + 1}`} value={inst.name} onChange={(e) => { const newItems = [...instructors]; newItems[index].name = e.target.value; setInstructors(newItems); }} required className="form-input" style={{ marginBottom: '10px' }} />
                  <input type="file" accept="image/*" onChange={(e) => { const newItems = [...instructors]; newItems[index].image = e.target.files[0]; setInstructors(newItems); }} />
                </div>
                {inst.previewUrl && !inst.image && (<img src={inst.previewUrl} alt="preview" className="instructor-preview" />)}
                {instructors.length > 1 && (<button type="button" onClick={() => setInstructors(instructors.filter((_, i) => i !== index))} className="btn-remove-item">ลบ</button>)}
              </div>
            ))}
            <button type="button" onClick={() => setInstructors([...instructors, { name: '', image: null, previewUrl: '' }])} className="btn-add-item">+ เพิ่มครูผู้สอน</button>
          </div>

          <hr className="divider" />

          {/* ✅ แถวใหม่ที่ปรับช่องเหมาะสำหรับ และ ช่องเวลาเรียน */}
          <div className="form-row">
            <div className="form-col" style={{ flex: 1 }}>
              <label className="form-label">เหมาะสำหรับ:</label>
              {/* ✅ เปลี่ยนเป็น Checkbox เลือกหลายตัวได้ */}
              <div className="checkbox-group">
                {['ม.4', 'ม.5', 'ม.6'].map(level => (
                  <label key={level} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formData.suitableFor.includes(level)}
                      onChange={() => handleSuitableForChange(level)}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-col" style={{ flex: 1 }}>
              <label className="form-label">เวลาเรียน:</label>
              {/* ✅ เปลี่ยน Type เป็น Number และใส่หน่วยชั่วโมง */}
              <div className="input-with-unit">
                <input 
                  type="number" 
                  name="classTime" 
                  value={formData.classTime} 
                  onChange={handleChange} 
                  placeholder="เช่น 30" 
                  className="form-input" 
                  min="0"
                />
                <span className="unit-text">ชั่วโมง</span>
              </div>
            </div>
          </div>

          {/* ✅ ช่องกรอกเวลาแบบแบ่ง 4 ช่อง */}
          <div className="form-row">
            <div className="form-col" style={{ width: '100%' }}>
              <label className="form-label" style={{ color: 'var(--accent-color)' }}>⏳ ระยะเวลาคอร์ส (เว้นว่างทั้งหมด = เรียนได้ตลอดชีพ):</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" name="days" value={duration.days} onChange={handleDurationChange} placeholder="วัน" className="form-input" min="0" />
                <input type="number" name="hours" value={duration.hours} onChange={handleDurationChange} placeholder="ชั่วโมง" className="form-input" min="0" max="23" />
                <input type="number" name="minutes" value={duration.minutes} onChange={handleDurationChange} placeholder="นาที" className="form-input" min="0" max="59" />
                <input type="number" name="seconds" value={duration.seconds} onChange={handleDurationChange} placeholder="วินาที" className="form-input" min="0" max="59" />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">รายละเอียดคอร์สย่อย:</label>
            {courseContents.map((item, index) => (
              <div key={index} className="item-card">
                <input type="text" placeholder={`ชื่อคอร์สที่ (${index + 1}.)`} value={item.title} onChange={(e) => { const newItems = [...courseContents]; newItems[index].title = e.target.value; setCourseContents(newItems); }} className="form-input" style={{ marginBottom: '10px' }} />
                <textarea placeholder="บทที่สอน (เช่น บทที่ 1, บทที่ 2)" value={item.lessons} onChange={(e) => { const newItems = [...courseContents]; newItems[index].lessons = e.target.value; setCourseContents(newItems); }} className="form-textarea" style={{ marginBottom: '10px', height: '60px' }} />
                <input type="text" placeholder="โจทย์ที่พาลุย :" value={item.problems} onChange={(e) => { const newItems = [...courseContents]; newItems[index].problems = e.target.value; setCourseContents(newItems); }} className="form-input" />
                {courseContents.length > 1 && (<button type="button" onClick={() => setCourseContents(courseContents.filter((_, i) => i !== index))} className="btn-remove-item">ลบรายการนี้</button>)}
              </div>
            ))}
            <button type="button" onClick={() => setCourseContents([...courseContents, { title: '', lessons: '', problems: '' }])} className="btn-add-item">+ เพิ่มคอร์สย่อย</button>
          </div>

          <div className="toggle-box">
            <label className="toggle-label">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: '18px', height: '18px' }} /> เปิดใช้งานคอร์สนี้ (Active)
            </label>
          </div>

          <div className="action-row">
            <button type="submit" className="btn-save-main">
              <FaSave /> บันทึกข้อมูล
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-back-main">
              ย้อนกลับ
            </button>
          </div>
        </form>
      )}

      {/* ===================================== */}
      {/* 🔵 เนื้อหา TAB 1: จัดการและอัปโหลดวิดีโอ */}
      {/* ===================================== */}
      {activeTab === 1 && (
        <div>
          {/* อัปโหลดวิดีโอใหม่ */}
          {!editingVideoId && (
            <div className="video-upload-box">
              <h3 className="section-title">
                <FaUpload /> เพิ่มวิดีโอตอนใหม่
              </h3>
              <div className="upload-row">
                <div className="upload-col">
                  <label className="form-label">ชื่อตอน/หัวข้อ:</label>
                  <input 
                    type="text" 
                    placeholder="เช่น: EP.1 บทนำ" 
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="upload-col">
                  <label className="form-label">ไฟล์วิดีโอ (.mp4):</label>
                  <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*"
                    onChange={(e) => setNewVideoFile(e.target.files[0])}
                    style={{ width: '100%', padding: '7px' }}
                  />
                </div>
                <div className="upload-actions">
                  <button onClick={handleUploadVideo} disabled={isUploading} className="btn-upload">
                    {isUploading ? 'กำลังอัปโหลด...' : <><FaSave /> บันทึกวิดีโอ</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* รายการวิดีโอ */}
          <h3 className="section-title bordered">
            <FaList /> รายการวิดีโอในคอร์ส ({videos.length})
          </h3>
          
          {videos.length === 0 ? (
            <div className="empty-state">
              ยังไม่มีวิดีโอในคอร์สนี้ กรุณาเพิ่มวิดีโอด้านบน
            </div>
          ) : (
            <div className="video-list">
              {videos.map((video, index) => (
                <div key={video.id} className={`video-item ${editingVideoId === video.id ? 'editing' : ''}`}>
                  
                  {editingVideoId === video.id ? (
                    // --- โหมดแก้ไข ---
                    <div className="video-edit-layout">
                      <div className="upload-row">
                        <div className="upload-col">
                          <label className="form-label" style={{ fontSize: '13px' }}>ชื่อตอน/หัวข้อ:</label>
                          <input 
                            type="text" 
                            value={editVideoTitle} 
                            onChange={(e) => setEditVideoTitle(e.target.value)} 
                            className="form-input" 
                            style={{ padding: '8px' }} 
                          />
                        </div>
                        <div className="upload-col">
                          <label className="form-label" style={{ fontSize: '13px' }}>ไฟล์วิดีโอปัจจุบัน:</label>
                          <div className="video-file-display">
                            <FaVideo style={{ color: '#94a3b8' }} /> {video.url.split('/').pop()}
                          </div>
                          <label className="form-label" style={{ fontSize: '13px', marginTop: '10px' }}>อัปโหลดไฟล์ใหม่ (ถ้าต้องการเปลี่ยน):</label>
                          <input 
                            type="file" 
                            accept="video/mp4,video/x-m4v,video/*"
                            onChange={(e) => setEditVideoFile(e.target.files[0])} 
                            style={{ width: '100%', fontSize: '13px', paddingTop: '5px' }} 
                          />
                        </div>
                      </div>
                      
                      <div className="btn-group-right">
                         <button onClick={() => setEditingVideoId(null)} className="btn-cancel">
                           <FaTimes /> ยกเลิก
                         </button>
                         <button onClick={() => handleSaveEditVideo(video.id)} disabled={isSavingEdit} className="btn-save-edit">
                           {isSavingEdit ? 'กำลังบันทึก...' : <><FaSave /> บันทึกการแก้ไข</>}
                         </button>
                      </div>
                    </div>
                  ) : (
                    // --- โหมดแสดงผลปกติ ---
                    <>
                      <div className="video-info-row">
                        <div className="video-number">{index + 1}</div>
                        <div>
                          <h4 className="video-title-text">{video.title}</h4>
                          <div className="video-url-text">
                            <FaVideo style={{ color: '#94a3b8' }} /> {video.url.split('/').pop()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            setEditingVideoId(video.id);
                            setEditVideoTitle(video.title);
                            setEditVideoFile(null);
                          }} 
                          className="btn-action-small btn-edit"
                        >
                           <FaEdit /> แก้ไข
                        </button>
                        <button onClick={() => handleDeleteVideo(video.id)} className="btn-action-small btn-delete">
                          <FaTrash /> ลบ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}