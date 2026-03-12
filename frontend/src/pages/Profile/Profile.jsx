// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaUserCircle, FaEdit, FaSave, FaArrowLeft, FaKey, FaEnvelope, FaUserTag } from 'react-icons/fa';

export default function Profile() {
  const navigate = useNavigate();
  
  // State สำหรับเก็บข้อมูลผู้ใช้
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    email: 'user@example.com' // สมมติอีเมลขึ้นมา ถ้า Backend คุณมีการส่งอีเมลมาด้วย ให้ดึงมาใส่ตรงนี้
  });

  // State สำหรับโหมดแก้ไข
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // State สำหรับเปลี่ยนรหัสผ่าน (เตรียมไว้ให้ต่อ API)
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

        // 🟢 1. ยิง API ดึงข้อมูลจริงจาก Backend (ปรับ URL ให้ตรงกับระบบของคุณ)
        const response = await axios.get('http://localhost:3000/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        
        // 🟢 2. เอาข้อมูลจริงที่ได้มาเซ็ตลง State
        setUserData({
          name: data.name || localStorage.getItem('userName') || 'ผู้ใช้งาน',
          role: data.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักเรียน (Student)',
          email: data.email || 'ยังไม่ระบุอีเมล'
        });
        
        setEditName(data.name || localStorage.getItem('userName'));

      } catch (error) {
        console.error('ดึงข้อมูลโปรไฟล์ล้มเหลว, ใช้ข้อมูลสำรอง', error);
        // กรณี API พังหรือกำลังพัฒนา ให้ใช้ข้อมูลจาก LocalStorage สำรองไปก่อน
        const storedName = localStorage.getItem('userName') || 'ผู้ใช้งานระบบ';
        const storedRole = localStorage.getItem('userRole') || 'user';
        
        setUserData({
          ...userData,
          name: storedName,
          role: storedRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักเรียน (Student)'
        });
        setEditName(storedName);
      }
    };

    fetchProfileData();
  }, []);

  // ฟังก์ชันบันทึกข้อมูลส่วนตัว
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อของคุณ', 'warning');
      return;
    }

    try {
      // 💡 ตรงนี้สามารถเพิ่ม axios.patch() เพื่อส่งชื่อใหม่ไปอัปเดตที่ Backend ได้
      // await axios.patch('http://localhost:3000/users/profile', { name: editName }, { headers: ... });

      // จำลองการเซฟลง LocalStorage ให้หน้าเว็บเปลี่ยนตามทันที
      localStorage.setItem('userName', editName);
      setUserData({ ...userData, name: editName });
      setIsEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
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
      // 💡 นำ axios มาต่อ API เปลี่ยนรหัสผ่านตรงนี้
      // await axios.post('http://localhost:3000/auth/change-password', passwords, ...);
      
      Swal.fire('สำเร็จ', 'อัปเดตรหัสผ่านเรียบร้อยแล้ว (ระบบจำลอง)', 'success');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Swal.fire('เกิดข้อผิดพลาด', 'รหัสผ่านเดิมไม่ถูกต้อง หรือระบบมีปัญหา', 'error');
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outlineColor: '#F2984A', fontSize: '15px', boxSizing: 'border-box', marginBottom: '15px' };
  const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003366', marginBottom: '8px', fontSize: '14px' };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: '"Prompt", sans-serif' }}>
      
      {/* ปุ่มย้อนกลับ */}
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
          <FaUserCircle style={{ fontSize: '80px', color: '#F2984A', backgroundColor: '#fff', borderRadius: '50%', padding: '5px', marginBottom: '15px' }} />
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