// src/pages/Courses/CourseForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaVideo, FaEdit, FaTrash, FaUpload, FaList, FaSave, FaTimes } from 'react-icons/fa';

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // ✅ State สำหรับจัดการ Tab
  const [activeTab, setActiveTab] = useState(0);

  // ==========================================
  // 📌 ส่วนที่ 1: State ข้อมูลรายละเอียดคอร์ส
  // ==========================================
  const [formData, setFormData] = useState({
    title: '', shortDescription: '', isActive: true, originalPrice: '', salePrice: '',
    suitableFor: '', classTime: '',
  });

  const [courseContents, setCourseContents] = useState([{ title: '', lessons: '', problems: '' }]);
  const [coverImage, setCoverImage] = useState(null);
  const [sampleVideo, setSampleVideo] = useState(null);
  const [instructors, setInstructors] = useState([{ name: '', image: null, previewUrl: '' }]);

  // ==========================================
  // 📌 ส่วนที่ 2: State ระบบจัดการวิดีโอ 
  // ==========================================
  const [videos, setVideos] = useState([]); 
  const [newVideoTitle, setNewVideoTitle] = useState(''); 
  const [newVideoFile, setNewVideoFile] = useState(null); 
  const [isUploading, setIsUploading] = useState(false); 

  // 🌟 เพิ่ม State สำหรับโหมดแก้ไขวิดีโอ (Inline Editing)
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // ==========================================
  // 📌 useEffect: ดึงข้อมูลคอร์ส
  // ==========================================
  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:3000/courses/${id}`).then((res) => {
        const course = res.data;
        setFormData({
          title: course.title || '',
          shortDescription: course.shortDescription || '',
          isActive: course.isActive === true || String(course.isActive) === "true" || course.isActive === 1,
          originalPrice: course.originalPrice || '',
          salePrice: course.salePrice || '',
          suitableFor: course.suitableFor || '',
          classTime: course.classTime || '',
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

        // ✅ ดึงข้อมูลวิดีโอ
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
  // 📌 ฟังก์ชันจัดการ Form รายละเอียดคอร์ส
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, key === 'isActive' ? (formData.isActive ? 'true' : 'false') : formData[key]));
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

  // ==========================================
  // 📌 ฟังก์ชันจัดการวิดีโอ
  // ==========================================
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

  // 🌟 ฟังก์ชันสำหรับการแก้ไขวิดีโอที่มีอยู่แล้ว
  const handleSaveEditVideo = async (videoId) => {
    if (!editVideoTitle) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อตอนให้ครบถ้วน', 'warning');
      return;
    }

    setIsSavingEdit(true);
    let finalVideoUrl = videos.find(v => v.id === videoId).url; // จำ URL เดิมไว้ก่อน

    try {
      // 1. ถ้ามีการเลือกไฟล์ใหม่ ให้ยิงไปอัปโหลดเอา URL ใหม่ก่อน
      if (editVideoFile) {
        const videoData = new FormData();
        videoData.append('file', editVideoFile);
        const uploadRes = await axios.post('http://localhost:3000/courses/upload-video', videoData);
        finalVideoUrl = uploadRes.data.url;
      }

      // 2. สร้าง Array วิดีโอใหม่ โดยอัปเดตตัวที่กำลังแก้
      const updatedVideos = videos.map(video => {
        if (video.id === videoId) {
          return { ...video, title: editVideoTitle, url: finalVideoUrl };
        }
        return video;
      });

      // 3. ยิงไปเซฟที่ Backend (ใช้วิธีโยน Array ใหม่ทับไปเลย)
      await axios.patch(`http://localhost:3000/courses/${id}/videos`, { videos: updatedVideos });
      
      setVideos(updatedVideos);
      setEditingVideoId(null); // ปิดโหมดแก้ไข
      setEditVideoFile(null);
      Swal.fire({ title: 'สำเร็จ', text: 'แก้ไขข้อมูลวิดีโอเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });

    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการแก้ไขวิดีโอ', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };


  // ==========================================
  // 📌 สไตล์
  // ==========================================
  const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outlineColor: '#003366', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '8px', color: '#003366' };

  return (
    <div style={{ maxWidth: '800px', background: '#FFFFFF', border: 'none', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', margin: '40px auto' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px', marginTop: 0 }}>
        {isEditMode ? `จัดการคอร์ส: ${formData.title}` : 'เพิ่มคอร์สเรียนใหม่'}
      </h2>

      {/* ✅ แถบเมนู Tab */}
      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab(0)}
          style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: 'bold', border: 'none', background: 'none', color: activeTab === 0 ? '#F2984A' : '#888', borderBottom: activeTab === 0 ? '3px solid #F2984A' : 'none', cursor: 'pointer', transition: '0.3s' }}
        >
          <FaEdit style={{ marginRight: '8px' }} /> รายละเอียดคอร์ส
        </button>
        
        {isEditMode ? (
          <button 
            onClick={() => setActiveTab(1)}
            style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: 'bold', border: 'none', background: 'none', color: activeTab === 1 ? '#F2984A' : '#888', borderBottom: activeTab === 1 ? '3px solid #F2984A' : 'none', cursor: 'pointer', transition: '0.3s' }}
          >
            <FaVideo style={{ marginRight: '8px' }} /> จัดการและอัปโหลดวิดีโอ
          </button>
        ) : (
          <div style={{ flex: 1, padding: '15px', fontSize: '14px', color: '#bbb', textAlign: 'center', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            (กรุณาบันทึกคอร์สก่อนเพื่อจัดการวิดีโอ)
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* 🟢 เนื้อหา TAB 0: รายละเอียดคอร์ส */}
      {/* ===================================== */}
      {activeTab === 0 && (
        <form onSubmit={handleSubmitDetails} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div><label style={labelStyle}>ชื่อคอร์ส:</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} /></div>
          <div><label style={labelStyle}>รายละเอียดสั้น:</label><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} /></div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>ราคาเดิม:</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={{ ...labelStyle, color: '#F2984A' }}>ราคาขาย:</label><input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} required style={{ ...inputStyle, border: '1px solid #F2984A' }} /></div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>รูปภาพปก:</label>
              <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} accept="image/*" style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>วิดีโอตัวอย่าง (ถ้ามี):</label>
              <input type="file" onChange={(e) => setSampleVideo(e.target.files[0])} accept="video/*" style={{ width: '100%' }} />
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
          
          <div>
            <label style={labelStyle}>รายชื่อครูผู้สอน:</label>
            {instructors.map((inst, index) => (
              <div key={index} style={{ display: 'flex', gap: '15px', background: '#fcfcfc', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #eee', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder={`ชื่อครูคนที่ ${index + 1}`} value={inst.name} onChange={(e) => { const newItems = [...instructors]; newItems[index].name = e.target.value; setInstructors(newItems); }} required style={{ ...inputStyle, marginBottom: '10px' }} />
                  <input type="file" accept="image/*" onChange={(e) => { const newItems = [...instructors]; newItems[index].image = e.target.files[0]; setInstructors(newItems); }} />
                </div>
                {inst.previewUrl && !inst.image && (<img src={inst.previewUrl} alt="preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />)}
                {instructors.length > 1 && (<button type="button" onClick={() => setInstructors(instructors.filter((_, i) => i !== index))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: '10px' }}>ลบ</button>)}
              </div>
            ))}
            <button type="button" onClick={() => setInstructors([...instructors, { name: '', image: null, previewUrl: '' }])} style={{ padding: '8px 12px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>+ เพิ่มครูผู้สอน</button>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>เหมาะสำหรับ:</label><input type="text" name="suitableFor" value={formData.suitableFor} onChange={handleChange} placeholder="เช่น นักเรียน ม.4-6" style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}> เวลาเรียน:</label><input type="text" name="classTime" value={formData.classTime} onChange={handleChange} placeholder="เช่น เสาร์-อาทิตย์ 09:00-12:00" style={inputStyle} /></div>
          </div>

          <div>
            <label style={labelStyle}> รายละเอียดคอร์สย่อย:</label>
            {courseContents.map((item, index) => (
              <div key={index} style={{ background: '#fcfcfc', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #eee' }}>
                <input type="text" placeholder={`ชื่อคอร์สที่ (${index + 1}.)`} value={item.title} onChange={(e) => { const newItems = [...courseContents]; newItems[index].title = e.target.value; setCourseContents(newItems); }} style={{ ...inputStyle, marginBottom: '10px' }} />
                <textarea placeholder="บทที่สอน (เช่น บทที่ 1, บทที่ 2)" value={item.lessons} onChange={(e) => { const newItems = [...courseContents]; newItems[index].lessons = e.target.value; setCourseContents(newItems); }} style={{ ...inputStyle, height: '60px', marginBottom: '10px' }} />
                <input type="text" placeholder="โจทย์ที่พาลุย :" value={item.problems} onChange={(e) => { const newItems = [...courseContents]; newItems[index].problems = e.target.value; setCourseContents(newItems); }} style={inputStyle} />
                {courseContents.length > 1 && (<button type="button" onClick={() => setCourseContents(courseContents.filter((_, i) => i !== index))} style={{ color: 'red', marginTop: '10px', border: 'none', background: 'none', cursor: 'pointer' }}>ลบรายการนี้</button>)}
              </div>
            ))}
            <button type="button" onClick={() => setCourseContents([...courseContents, { title: '', lessons: '', problems: '' }])} style={{ padding: '8px 12px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>+ เพิ่มคอร์สย่อย</button>
          </div>

          <div style={{ marginTop: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#003366', display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginRight: '10px', width: '18px', height: '18px' }} /> เปิดใช้งานคอร์สนี้ (Active)
            </label>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
            <button type="submit" style={{ flex: 2, padding: '12px', background: '#F2984A', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(242, 152, 74, 0.3)' }}>
              <FaSave style={{ marginRight: '8px' }} /> บันทึกข้อมูล
            </button>
            <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '12px', background: '#e9ecef', color: '#003366', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
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
          {/* กล่องอัปโหลดวิดีโอใหม่ (ซ่อนไว้ถ้ากำลังแก้ไขวิดีโออื่นอยู่) */}
          {!editingVideoId && (
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', border: '2px dashed #cbd5e1', marginBottom: '30px' }}>
              <h3 style={{ color: '#003366', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUpload /> เพิ่มวิดีโอตอนใหม่
              </h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>ชื่อตอน/หัวข้อ:</label>
                  <input 
                    type="text" 
                    placeholder="เช่น: EP.1 บทนำ" 
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>ไฟล์วิดีโอ (.mp4):</label>
                  <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*"
                    onChange={(e) => setNewVideoFile(e.target.files[0])}
                    style={{ width: '100%', padding: '7px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '62px' }}>
                  <button 
                    onClick={handleUploadVideo}
                    disabled={isUploading}
                    style={{ 
                      padding: '10px 20px', background: isUploading ? '#6c757d' : '#28a745', 
                      color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', 
                      cursor: isUploading ? 'not-allowed' : 'pointer', height: '40px',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    {isUploading ? 'กำลังอัปโหลด...' : <><FaSave /> บันทึกวิดีโอ</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ลิสต์วิดีโอที่อัปโหลดแล้ว */}
          <h3 style={{ color: '#003366', borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaList /> รายการวิดีโอในคอร์ส ({videos.length})
          </h3>
          
          {videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', color: '#888' }}>
              ยังไม่มีวิดีโอในคอร์สนี้ กรุณาเพิ่มวิดีโอด้านบน
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {videos.map((video, index) => (
                <div key={video.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#fff', border: editingVideoId === video.id ? '2px solid #F2984A' : '1px solid #e2e8f0', borderRadius: '10px', boxShadow: editingVideoId === video.id ? '0 4px 10px rgba(242, 152, 74, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)' }}>
                  
                  {/* 🌟 เช็คว่ากำลังแก้ไขวิดีโอนี้อยู่หรือไม่ */}
                  {editingVideoId === video.id ? (
                    // --- โหมดแก้ไข ---
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        
                        {/* ส่วนที่ 1: แก้ไขชื่อตอน */}
                        <div style={{ flex: '1 1 200px' }}>
                          <label style={{ fontSize: '13px', color: '#555', fontWeight: 'bold' }}>ชื่อตอน/หัวข้อ:</label>
                          <input 
                            type="text" 
                            value={editVideoTitle} 
                            onChange={(e) => setEditVideoTitle(e.target.value)} 
                            style={{ ...inputStyle, padding: '8px' }} 
                          />
                        </div>

                        {/* ส่วนที่ 2: โชว์ไฟล์เดิม & อัปโหลดไฟล์ใหม่ */}
                        <div style={{ flex: '1 1 200px' }}>
                          <label style={{ fontSize: '13px', color: '#555', fontWeight: 'bold' }}>ไฟล์วิดีโอปัจจุบัน:</label>
                          <div style={{ 
                            background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', 
                            fontSize: '13px', color: '#0f172a', marginBottom: '8px', marginTop: '4px',
                            display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-all',
                            border: '1px dashed #cbd5e1'
                          }}>
                            <FaVideo style={{ color: '#94a3b8' }} /> {video.url.split('/').pop()}
                          </div>

                          <label style={{ fontSize: '13px', color: '#555', fontWeight: 'bold' }}>อัปโหลดไฟล์ใหม่ (ถ้าต้องการเปลี่ยน):</label>
                          <input 
                            type="file" 
                            accept="video/mp4,video/x-m4v,video/*"
                            onChange={(e) => setEditVideoFile(e.target.files[0])} 
                            style={{ width: '100%', fontSize: '13px', paddingTop: '5px' }} 
                          />
                        </div>

                      </div>
                      
                      {/* ส่วนที่ 3: ปุ่มกดบันทึก/ยกเลิก */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                         <button 
                           onClick={() => setEditingVideoId(null)} 
                           style={{ padding: '8px 15px', background: '#e9ecef', color: '#495057', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                         >
                           <FaTimes /> ยกเลิก
                         </button>
                         <button 
                           onClick={() => handleSaveEditVideo(video.id)} 
                           disabled={isSavingEdit}
                           style={{ padding: '8px 15px', background: '#003366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isSavingEdit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                         >
                           {isSavingEdit ? 'กำลังบันทึก...' : <><FaSave /> บันทึกการแก้ไข</>}
                         </button>
                      </div>
                    </div>
                  ) : (
                    // --- โหมดแสดงผลปกติ ---
                    // --- โหมดแสดงผลปกติ ---
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#e2e8f0', color: '#003366', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px' }}>{video.title}</h4>
                          <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                          style={{ padding: '8px 12px', background: '#f8f9fa', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold' }}
                        >
                           <FaEdit /> แก้ไข
                        </button>
                        <button onClick={() => handleDeleteVideo(video.id)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold' }}>
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