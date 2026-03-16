// src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { 
  FaUserCircle, FaEdit, FaSave, FaArrowLeft, 
  FaKey, FaEnvelope, FaUserTag, FaCamera, FaPhone 
} from 'react-icons/fa';

// Import ไฟล์ CSS ที่เราแยกไว้
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    email: 'user@example.com',
    profilePicture: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

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

      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      currentUser.profilePicture = response.data.profilePicture;
      localStorage.setItem('user', JSON.stringify(currentUser));
      window.dispatchEvent(new Event('profileUpdated')); // ตะโกนบอก Navbar!
      
      Swal.fire({ icon: 'success', title: 'เปลี่ยนรูปโปรไฟล์สำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch('http://localhost:3000/users/profile', {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('userName', `${editData.firstName} ${editData.lastName}`);

      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      currentUser.firstName = editData.firstName;
      currentUser.lastName = editData.lastName;
      localStorage.setItem('user', JSON.stringify(currentUser));
      window.dispatchEvent(new Event('profileUpdated')); // ตะโกนบอก Navbar ให้เปลี่ยนชื่อด้วย!
      
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

  return (
    <div className="profile-container">
      
      <button className="btn-back" onClick={() => navigate(-1)}>
        <FaArrowLeft /> ย้อนกลับ
      </button>

      <div className="profile-card">
        
        {/* Header ส่วนหัวโปรไฟล์ */}
        <div className="profile-header">
          
          <div 
            className="profile-image-wrapper"
            onClick={() => fileInputRef.current.click()}
            title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
          >
            {userData.profilePicture ? (
              <img 
                src={userData.profilePicture} 
                alt="Profile" 
                className="profile-img"
              />
            ) : (
              <FaUserCircle className="profile-icon-fallback" />
            )}
            
            <div className="camera-badge">
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

          <h1 className="profile-name">{userData.firstName} {userData.lastName}</h1>
          <p className="profile-role"><FaUserTag /> {userData.role}</p>
        </div>

        <div className="profile-body">
          
          {/* Section 1: ข้อมูลส่วนตัว */}
          <div>
            <h2 className="section-title">
              <FaEdit color="#F2984A" /> ข้อมูลส่วนตัว
            </h2>

            {isEditing ? (
              <div className="edit-box">
                <label className="input-label">ชื่อจริง</label>
                <input 
                  type="text" 
                  value={editData.firstName} 
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})} 
                  className="input-field" 
                />

                <label className="input-label">นามสกุล</label>
                <input 
                  type="text" 
                  value={editData.lastName} 
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})} 
                  className="input-field" 
                />

                <label className="input-label">เบอร์โทรศัพท์</label>
                <input 
                  type="text" 
                  value={editData.phone} 
                  onChange={(e) => setEditData({...editData, phone: e.target.value})} 
                  className="input-field" 
                />
                
                <div className="btn-group">
                  <button onClick={handleSaveProfile} className="btn-save">
                    <FaSave /> บันทึก
                  </button>
                  <button onClick={() => {setIsEditing(false); setEditData({firstName: userData.firstName, lastName: userData.lastName, phone: userData.phone});}} className="btn-cancel">
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-view">
                <div className="info-item">
                  <div className="info-label">ชื่อ - นามสกุล</div>
                  <div className="info-value">{userData.firstName} {userData.lastName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><FaPhone /> เบอร์โทรศัพท์</div>
                  <div className="info-value">{userData.phone || '- ไม่ระบุ -'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><FaEnvelope /> อีเมลบัญชีผู้ใช้</div>
                  <div className="info-value">{userData.email}</div>
                </div>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-edit"
                >
                  แก้ไขข้อมูลส่วนตัว
                </button>
              </div>
            )}
          </div>

          {/* Section 2: เปลี่ยนรหัสผ่าน */}
          <div>
            <h2 className="section-title">
              <FaKey color="#F2984A" /> เปลี่ยนรหัสผ่าน
            </h2>

            <form onSubmit={handleChangePassword}>
              <label className="input-label">รหัสผ่านเดิม</label>
              <input 
                type="password" required
                value={passwords.oldPassword} 
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
                className="input-field" placeholder="••••••••"
              />

              <label className="input-label">รหัสผ่านใหม่</label>
              <input 
                type="password" required minLength="6"
                value={passwords.newPassword} 
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                className="input-field" placeholder="••••••••"
              />

              <label className="input-label">ยืนยันรหัสผ่านใหม่</label>
              <input 
                type="password" required minLength="6"
                value={passwords.confirmPassword} 
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                className="input-field" placeholder="••••••••"
              />

              <button type="submit" className="btn-submit">
                อัปเดตรหัสผ่าน
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}