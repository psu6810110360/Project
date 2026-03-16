// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode'; 
import './Login.css';
import studentImage from '../../assets/student.png'; 

function Login({ setIsLoggedIn }) { 
  const [isLogin, setIsLogin] = useState(true); 

  // State สำหรับหน้า Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false); 

  // State สำหรับหน้า Register 
  const [registerData, setRegisterData] = useState({
    firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: ''
  });
  const [showRegPwd, setShowRegPwd] = useState(false); 
  const [showConfirmPwd, setShowConfirmPwd] = useState(false); 

  const navigate = useNavigate();

  const t = {
    tabLogin: 'เข้าสู่ระบบ',
    tabRegister: 'ลงทะเบียน',
    subtitle: 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบการเรียนรู้ของคุณ',
    firstName: 'ชื่อจริง',
    lastName: 'นามสกุล',
    phone: 'เบอร์โทรศัพท์',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    forgotPassword: 'ลืมรหัสผ่าน?',
    btnSubmitLogin: 'เข้าสู่ระบบ',
    btnSubmitReg: 'สร้างบัญชีผู้ใช้',
    noAccount: 'ยังไม่มีบัญชีผู้ใช้? ',
    hasAccount: 'มีบัญชีผู้ใช้อยู่แล้ว? ',
    alertAdmin: 'เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับผู้ดูแลระบบ',
    alertStudent: 'เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับน้องนักเรียน',
    alertFail: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่',
    alertPwdNotMatch: 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง',
    alertRegSuccess: 'ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ', // ปรับข้อความใหม่
    promptReset: 'กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน:',
    alertResetSuccess: 'ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยัง'
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // 🟢 ส่วนของ LOGIN (เข้าสู่ระบบ)
    // ==========================================
    if (isLogin) {
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });

        if (response.ok) {
          const data = await response.json();
          
          const token = data.token; 
          const userId = data.userId; 

          if (token) {
            // เซฟค่าพื้นฐานลงเครื่อง
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('isLoggedIn', 'true');

            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }

            // --- ส่วนกู้คืนตะกร้าสินค้า ---
            const savedCart = localStorage.getItem(`cart_user_${userId}`);
            if (savedCart) {
                const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
                const savedCartParsed = JSON.parse(savedCart);
                
                const mergedCart = [...currentCart, ...savedCartParsed].reduce((acc, current) => {
                    const x = acc.find(item => item.id === current.id);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []);
                
                localStorage.setItem('cart', JSON.stringify(mergedCart));
            }
            // ---------------------------
            
            // แจ้งเตือน Navbar ให้อัปเดต
            window.dispatchEvent(new Event('cartUpdated'));

            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.role || 'student'; 
            localStorage.setItem('userRole', userRole);

            const isAdmin = userRole === 'admin';

            Swal.fire({
              title: 'สำเร็จ!',
              text: isAdmin ? t.alertAdmin : t.alertStudent,
              icon: 'success',
              confirmButtonColor: '#003366'
            }).then(() => {
              setIsLoggedIn(true); 
              navigate('/courses'); 
            });
          } else {
             throw new Error("ไม่พบ Token จากระบบ");
          }

        } else {
          const errorData = await response.json();
          Swal.fire({
            title: 'ข้อผิดพลาด!',
            text: errorData.message || t.alertFail,
            icon: 'error',
            confirmButtonColor: '#FF9F43'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'ระบบขัดข้อง!',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือเกิดข้อผิดพลาดกับ Token',
          icon: 'error',
          confirmButtonColor: '#FF9F43'
        });
      }

    } else {
      // ==========================================
      // 🔵 ส่วนของ REGISTER (ลงทะเบียน) - แก้ไขใหม่
      // ==========================================
      if (registerData.password !== registerData.confirmPassword) {
        Swal.fire({ title: 'ข้อผิดพลาด!', text: t.alertPwdNotMatch, icon: 'warning', confirmButtonColor: '#FF9F43' });
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            phone: registerData.phone,
            email: registerData.email,
            password: registerData.password,
          }),
        });

        if (response.ok) {
          // ✅ แก้ไข: ไม่ต้องพยายามดึง token ที่นี่ เพราะ Backend Register มักไม่ส่งมา
          Swal.fire({
            title: 'ลงทะเบียนสำเร็จ!',
            text: 'บัญชีของคุณถูกสร้างเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ',
            icon: 'success',
            confirmButtonColor: '#003366'
          }).then(() => {
            // สลับกลับไปหน้า Login อัตโนมัติ และเคลียร์รหัสผ่าน
            setIsLogin(true);
            setLoginEmail(registerData.email); // อำนวยความสะดวก กรอกอีเมลให้เลย
            setLoginPassword('');
            setRegisterData({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' });
          });

        } else {
          const errorData = await response.json();
          Swal.fire({ title: 'ข้อผิดพลาด!', text: errorData.message || 'ไม่สามารถสมัครสมาชิกได้', icon: 'error', confirmButtonColor: '#FF9F43' });
        }
      } catch (error) {
        console.error(error);
        Swal.fire({ title: 'ระบบขัดข้อง!', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', icon: 'error', confirmButtonColor: '#FF9F43' });
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const { value: resetEmail } = await Swal.fire({
      title: 'รีเซ็ตรหัสผ่าน',
      input: 'email',
      inputLabel: t.promptReset,
      inputPlaceholder: 'example@gmail.com',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#8E94A3',
      confirmButtonText: 'ส่งลิงก์',
      cancelButtonText: 'ยกเลิก'
    });

    if (resetEmail) {
      Swal.fire({ title: 'ส่งแล้ว!', text: `${t.alertResetSuccess} ${resetEmail}`, icon: 'success', confirmButtonColor: '#003366' });
    }
  }

  const EyeOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
  const EyeOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className={`login-form-section ${!isLogin ? 'signup-mode' : ''}`}>
          <div className="toggle-buttons">
            <button className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)} type="button">{t.tabLogin}</button>
            <button className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)} type="button">{t.tabRegister}</button>
          </div>
          <h1 className="form-title">{isLogin ? t.tabLogin : t.tabRegister}</h1>
          <p className="form-subtitle">{t.subtitle}</p>
          <form onSubmit={handleSubmit} className={!isLogin ? 'signup-form-scroll' : ''}>
            {!isLogin && (
              <>
                <div className="form-row two-cols">
                  <div className="input-group">
                    <label>{t.firstName}</label>
                    <input type="text" name="firstName" placeholder={t.firstName} value={registerData.firstName} onChange={handleRegisterChange} required />
                  </div>
                  <div className="input-group">
                    <label>{t.lastName}</label>
                    <input type="text" name="lastName" placeholder={t.lastName} value={registerData.lastName} onChange={handleRegisterChange} required />
                  </div>
                </div>
                <div className="form-row two-cols">
                  <div className="input-group">
                    <label>{t.phone}</label>
                    <input type="tel" name="phone" placeholder="08x-xxx-xxxx" value={registerData.phone} onChange={handleRegisterChange} required />
                  </div>
                  <div className="input-group">
                    <label>{t.email}</label>
                    <input type="email" name="email" placeholder="example@gmail.com" value={registerData.email} onChange={handleRegisterChange} required />
                  </div>
                </div>
                <div className="form-row two-cols">
                  <div className="input-group">
                    <label>{t.password}</label>
                    <div className="password-wrapper">
                      <input type={showRegPwd ? "text" : "password"} name="password" placeholder="********" value={registerData.password} onChange={handleRegisterChange} required minLength="6" />
                      <button type="button" className="eye-btn" onClick={() => setShowRegPwd(!showRegPwd)}>
                        {showRegPwd ? <EyeOffIcon /> : <EyeOpenIcon />}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t.confirmPassword}</label>
                    <div className="password-wrapper">
                      <input type={showConfirmPwd ? "text" : "password"} name="confirmPassword" placeholder="********" value={registerData.confirmPassword} onChange={handleRegisterChange} required minLength="6" />
                      <button type="button" className="eye-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                        {showConfirmPwd ? <EyeOffIcon /> : <EyeOpenIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {isLogin && (
              <>
                <div className="input-group">
                  <label>{t.email}</label>
                  <input type="email" placeholder="example@gmail.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>{t.password}</label>
                  <div className="password-wrapper">
                    <input type={showLoginPwd ? "text" : "password"} placeholder="********" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    <button type="button" className="eye-btn" onClick={() => setShowLoginPwd(!showLoginPwd)}>
                      {showLoginPwd ? <EyeOffIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                  <a href="#" className="forgot-password" onClick={handleForgotPassword}>{t.forgotPassword}</a>
                </div>
              </>
            )}
            <button type="submit" className="login-submit-btn">
              {isLogin ? t.btnSubmitLogin : t.btnSubmitReg}
            </button>
          </form>
          <p className="signup-link">
            {isLogin ? t.noAccount : t.hasAccount}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
              {isLogin ? t.tabRegister : t.tabLogin}
            </a>
          </p>
        </div>
        {isLogin && (
          <div className="login-image-section">
            <img src={studentImage} alt="Student" className="student-img" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;