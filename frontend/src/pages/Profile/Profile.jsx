// src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { 
  FaUserCircle, FaEdit, FaSave, FaArrowLeft, 
  FaKey, FaEnvelope, FaUserTag, FaCamera, FaPhone 
} from 'react-icons/fa';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State สำหรับเก็บข้อมูลผู้ใช้แบบแยกฟิลด์
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    email: 'user@example.com',
    profilePicture: null
  });

  // State สำหรับโหมดแก้ไขแบบ Object
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

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
        
        // จัดการกรณี backend ส่งมาเป็น name รวม หรือ แยก firstName/lastName
        const fetchedFirstName = data.firstName || (data.name ? data.name.split(' ')[0] : '') || localStorage.getItem('userName') || 'ผู้ใช้งาน';
        const fetchedLastName = data.lastName || (data.name && data.name.includes(' ') ? data.name.split(' ').slice(1).join(' ') : '') || '';
        const fetchedPhone = data.phone || '';

        setUserData({
          firstName: fetchedFirstName,
          lastName: fetchedLastName,
          phone: fetchedPhone,
          role: data.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักเรียน (Student)',
          email: data.email || 'ยังไม่ระบุอีเมล',
          profilePicture: data.profilePicture ? `http://localhost:3000${data.profilePicture}` : null
        });
        
        setEditData({
          firstName: fetchedFirstName,
          lastName: fetchedLastName,
          phone: fetchedPhone
        });

      } catch (error) {
        console.error('ดึงข้อมูลโปรไฟล์ล้มเหลว, ใช้ข้อมูลสำรอง', error);
        const storedName = localStorage.getItem('userName') || 'ผู้ใช้งานระบบ';
        const storedRole = localStorage.getItem('userRole') || 'user';
        
        setUserData(prev => ({
          ...prev,
          firstName: storedName,
          lastName: '',
          phone: '',
          role: storedRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักเรียน (Student)'
        }));
        setEditData({ firstName: storedName, lastName: '', phone: '' });
      }
    };

    fetchProfileData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      Swal.fire({ title: 'กำลังอัปโหลด...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await axios.post('http://localhost:3000/users/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const newPicUrl = `http://localhost:3000${response.data.profilePicture}`;
      setUserData(prev => ({ ...prev, profilePicture: newPicUrl }));
      
      Swal.fire({ icon: 'success', title: 'เปลี่ยนรูปโปรไฟล์สำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้', 'error');
    }
  };

  // ฟังก์ชันบันทึกข้อมูลส่วนตัว (ยิง API จริง)
  const handleSaveProfile = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // ส่งข้อมูลไปอัปเดตที่ Backend
      await axios.patch('http://localhost:3000/users/profile', {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // อัปเดตข้อมูลหน้าเว็บและ LocalStorage
      localStorage.setItem('userName', `${editData.firstName} ${editData.lastName}`);
      setUserData({ 
        ...userData, 
        firstName: editData.firstName, 
        lastName: editData.lastName, 
        phone: editData.phone 
      });
      setIsEditing(false);

      Swal.fire({ icon: 'success', title: 'บันทึกข้อมูลสำเร็จ', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error('Save Profile Error:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบ Backend', 'error');
    }
  };

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
          
          <div 
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', marginBottom: '15px' }} 
            onClick={() => fileInputRef.current.click()}
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
            
            <div style={{ position: 'absolute', bottom: '0px', right: '0px', background: '#fff', borderRadius: '50%', padding: '6px', color: '#003366', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <FaCamera size={16} />
            </div>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />

          {/* แสดงชื่อและนามสกุล */}
          <h1 style={{ margin: 0, fontSize: '24px' }}>{userData.firstName} {userData.lastName}</h1>
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
                <label style={labelStyle}>ชื่อจริง</label>
                <input 
                  type="text" 
                  value={editData.firstName} 
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})} 
                  style={inputStyle} 
                />

                <label style={labelStyle}>นามสกุล</label>
                <input 
                  type="text" 
                  value={editData.lastName} 
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})} 
                  style={inputStyle} 
                />

                <label style={labelStyle}>เบอร์โทรศัพท์</label>
                <input 
                  type="text" 
                  value={editData.phone} 
                  onChange={(e) => setEditData({...editData, phone: e.target.value})} 
                  style={inputStyle} 
                />
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={handleSaveProfile} style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <FaSave /> บันทึก
                  </button>
                  <button onClick={() => {setIsEditing(false); setEditData({firstName: userData.firstName, lastName: userData.lastName, phone: userData.phone});}} style={{ flex: 1, padding: '10px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}>ชื่อ - นามสกุล</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{userData.firstName} {userData.lastName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><FaPhone /> เบอร์โทรศัพท์</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{userData.phone || '- ไม่ระบุ -'}</div>
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

          {/* Section 2: เปลี่ยนรหัสผ่าน (เหมือนเดิม) */}
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