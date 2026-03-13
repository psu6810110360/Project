// src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react'; // 🟢 เพิ่ม useRef
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { 
  FaUserCircle, FaEdit, FaSave, FaArrowLeft, 
  FaKey, FaEnvelope, FaUserTag, FaCamera // 🟢 เพิ่ม FaCamera
} from 'react-icons/fa';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // 🟢 เอาไว้อ้างอิง input file ที่ซ่อนอยู่
  
  // State สำหรับเก็บข้อมูลผู้ใช้
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    email: 'user@example.com',
    profilePicture: null // 🟢 เพิ่ม state เก็บรูปล่าสุด
  });

  // State สำหรับโหมดแก้ไข
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // State สำหรับเปลี่ยนรหัสผ่าน
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:3000/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        
        setUserData({
          name: data.name || localStorage.getItem('userName') || 'ผู้ใช้งาน',
          role: data.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักเรียน (Student)',
          email: data.email || 'ยังไม่ระบุอีเมล',
          // 🟢 ดึง path รูปมาจาก Backend ถ้ามี ให้เติม http... เข้าไปเพื่อให้แสดงผลได้
          profilePicture: data.profilePicture ? `http://localhost:3000${data.profilePicture}` : null
        });
        
        setEditName(data.name || localStorage.getItem('userName'));

      } catch (error) {
        console.error('ดึงข้อมูลโปรไฟล์ล้มเหลว, ใช้ข้อมูลสำรอง', error);
        const storedName = localStorage.getItem('userName') || 'ผู้ใช้งานระบบ';
        const storedRole = localStorage.getItem('userRole') || 'user';
        
        setUserData(prev => ({
          ...prev,
          name: storedName,
          role: storedRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักเรียน (Student)'
        }));
        setEditName(storedName);
      }
    };

    fetchProfileData();
  }, []);

  // 🟢 ฟังก์ชันสำหรับอัปโหลดรูปโปรไฟล์
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      // แสดง Loading เล็กน้อย
      Swal.fire({ title: 'กำลังอัปโหลด...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await axios.post('http://localhost:3000/users/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      // อัปเดตรูปในหน้าเว็บทันที
      const newPicUrl = `http://localhost:3000${response.data.profilePicture}`;
      setUserData(prev => ({ ...prev, profilePicture: newPicUrl }));
      
      Swal.fire({ icon: 'success', title: 'เปลี่ยนรูปโปรไฟล์สำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้', 'error');
    }
  };

  // ฟังก์ชันบันทึกข้อมูลส่วนตัว (จำลอง)
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อของคุณ', 'warning');
      return;
    }

    try {
      // 💡 ตรงนี้สามารถเพิ่ม axios.patch() เพื่อส่งชื่อใหม่ไปอัปเดตที่ Backend ได้
      localStorage.setItem('userName', editName);
      setUserData({ ...userData, name: editName });
      setIsEditing(false);

      Swal.fire({ icon: 'success', title: 'บันทึกข้อมูลสำเร็จ', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  // ฟังก์ชันเปลี่ยนรหัสผ่าน
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณายืนยันรหัสผ่านใหม่ให้ถูกต้อง', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบใหม่', 'warning');
        return;
      }

      await axios.patch('http://localhost:3000/users/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Swal.fire('สำเร็จ', 'อัปเดตรหัสผ่านเรียบร้อยแล้ว', 'success');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'ระบบมีปัญหา ไม่สามารถเปลี่ยนรหัสผ่านได้';
      Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outlineColor: '#F2984A', fontSize: '15px', boxSizing: 'border-box', marginBottom: '15px' };
  const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003366', marginBottom: '8px', fontSize: '14px' };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: '"Prompt", sans-serif' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: '#eee', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', color: '#555', transition: '0.3s', marginBottom: '20px', fontWeight: 'bold' }}
        onMouseOver={(e) => {e.target.style.background = '#003366'; e.target.style.color = '#fff'}}
        onMouseOut={(e) => {e.target.style.background = '#eee'; e.target.style.color = '#555'}}
      >
        <FaArrowLeft /> ย้อนกลับ
      </button>

      <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eee' }}>
        
        {/* Header ส่วนหัวโปรไฟล์ */}
        <div style={{ background: '#003366', padding: '40px 20px', textAlign: 'center', color: '#fff', position: 'relative' }}>
          
          {/* 🟢 ส่วนแสดงและอัปโหลดรูปภาพ */}
          <div 
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', marginBottom: '15px' }} 
            onClick={() => fileInputRef.current.click()} // กดแล้วไปทริกเกอร์ input file
            title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
          >
            {userData.profilePicture ? (
              <img 
                src={userData.profilePicture} 
                alt="Profile" 
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', backgroundColor: '#fff' }} 
              />
            ) : (
              <FaUserCircle style={{ fontSize: '90px', color: '#F2984A', backgroundColor: '#fff', borderRadius: '50%', padding: '2px', border: '3px solid #fff' }} />
            )}
            
            {/* ไอคอนกล้องเล็กๆ ทับอยู่มุมขวาล่าง */}
            <div style={{ position: 'absolute', bottom: '0px', right: '0px', background: '#fff', borderRadius: '50%', padding: '6px', color: '#003366', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <FaCamera size={16} />
            </div>
          </div>

          {/* 🟢 Input ไฟล์ที่ซ่อนไว้ */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />

          <h1 style={{ margin: 0, fontSize: '24px' }}>{userData.name}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#bbdefb', fontSize: '14px' }}><FaUserTag /> {userData.role}</p>
        </div>

        <div style={{ padding: '40px 30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          
          {/* Section 1: ข้อมูลส่วนตัว */}
          <div>
            <h2 style={{ color: '#003366', fontSize: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaEdit color="#F2984A" /> ข้อมูลส่วนตัว
            </h2>

            {isEditing ? (
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                <label style={labelStyle}>ชื่อ - นามสกุล (แสดงผล)</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={inputStyle} 
                />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSaveProfile} style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <FaSave /> บันทึก
                  </button>
                  <button onClick={() => {setIsEditing(false); setEditName(userData.name);}} style={{ flex: 1, padding: '10px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}>ชื่อ - นามสกุล</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{userData.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><FaEnvelope /> อีเมลบัญชีผู้ใช้</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{userData.email}</div>
                </div>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ marginTop: '10px', padding: '10px', background: '#f0f5ff', color: '#003366', border: '1px solid #cce0ff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
                >
                  แก้ไขข้อมูลส่วนตัว
                </button>
              </div>
            )}
          </div>

          {/* Section 2: เปลี่ยนรหัสผ่าน */}
          <div>
            <h2 style={{ color: '#003366', fontSize: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaKey color="#F2984A" /> เปลี่ยนรหัสผ่าน
            </h2>

            <form onSubmit={handleChangePassword}>
              <label style={labelStyle}>รหัสผ่านเดิม</label>
              <input 
                type="password" required
                value={passwords.oldPassword} 
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                style={inputStyle} placeholder="••••••••"
              />

              <label style={labelStyle}>รหัสผ่านใหม่</label>
              <input 
                type="password" required minLength="6"
                value={passwords.newPassword} 
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                style={inputStyle} placeholder="••••••••"
              />

              <label style={labelStyle}>ยืนยันรหัสผ่านใหม่</label>
              <input 
                type="password" required minLength="6"
                value={passwords.confirmPassword} 
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                style={inputStyle} placeholder="••••••••"
              />

              <button type="submit" style={{ width: '100%', padding: '12px', background: '#003366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' }}>
                อัปเดตรหัสผ่าน
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}