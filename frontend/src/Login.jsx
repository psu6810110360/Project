import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // <--- เพิ่ม SweetAlert2 ตรงนี้
import './Login.css';
import studentImage from './assets/student.png'; 

function Login({ setIsAdmin }) { 
  const [isLogin, setIsLogin] = useState(true); 
  const [lang, setLang] = useState('TH'); 

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

  // --------------------------------------------------------
  // 📚 พจนานุกรมเก็บข้อความ 2 ภาษา
  // --------------------------------------------------------
  const texts = {
    TH: {
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
      alertRegSuccess: 'ลงทะเบียนสำเร็จ! ข้อมูลพื้นฐานถูกบันทึกแล้ว',
      promptReset: 'กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน:',
      alertResetSuccess: 'ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยัง'
    },
    EN: {
      tabLogin: 'Login',
      tabRegister: 'Register',
      subtitle: 'Enter your details to access your learning dashboard',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      btnSubmitLogin: 'Login',
      btnSubmitReg: 'Create Account',
      noAccount: "Don't have an account? ",
      hasAccount: 'Already have an account? ',
      alertAdmin: 'Login successful! Welcome Admin.',
      alertStudent: 'Login successful! Welcome Student.',
      alertFail: 'Invalid email or password. Please try again.',
      alertPwdNotMatch: 'Passwords do not match. Please try again.',
      alertRegSuccess: 'Registration successful! Basic info saved.',
      promptReset: 'Please enter your email to receive a password reset link:',
      alertResetSuccess: 'A password reset link has been sent to'
    }
  };

  const t = texts[lang]; 

  // --------------------------------------------------------

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      if (loginEmail === 'admin@test.com' && loginPassword === '1234') {
        Swal.fire({
          title: lang === 'TH' ? 'สำเร็จ!' : 'Success!',
          text: t.alertAdmin,
          icon: 'success',
          confirmButtonColor: '#003366'
        }).then(() => {
          setIsAdmin(true); 
          navigate('/courses'); 
        });
      } else if (loginEmail === 'student@test.com' && loginPassword === '1234') {
        Swal.fire({
          title: lang === 'TH' ? 'สำเร็จ!' : 'Success!',
          text: t.alertStudent,
          icon: 'success',
          confirmButtonColor: '#003366'
        }).then(() => {
          setIsAdmin(false); 
          navigate('/courses'); 
        });
      } else {
        Swal.fire({
          title: lang === 'TH' ? 'ข้อผิดพลาด!' : 'Error!',
          text: t.alertFail,
          icon: 'error',
          confirmButtonColor: '#FF9F43'
        });
      }
    } else {
      if (registerData.password !== registerData.confirmPassword) {
        Swal.fire({
          title: lang === 'TH' ? 'ข้อผิดพลาด!' : 'Error!',
          text: t.alertPwdNotMatch,
          icon: 'warning',
          confirmButtonColor: '#FF9F43'
        });
        return;
      }
      console.log("Registered Data:", registerData);
      Swal.fire({
        title: lang === 'TH' ? 'ยอดเยี่ยม!' : 'Awesome!',
        text: t.alertRegSuccess,
        icon: 'success',
        confirmButtonColor: '#003366'
      }).then(() => {
        setIsLogin(true); 
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    // เปลี่ยน Prompt เป็น Pop-up สวยๆ
    const { value: resetEmail } = await Swal.fire({
      title: lang === 'TH' ? 'รีเซ็ตรหัสผ่าน' : 'Reset Password',
      input: 'email',
      inputLabel: t.promptReset,
      inputPlaceholder: 'example@gmail.com',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#8E94A3',
      confirmButtonText: lang === 'TH' ? 'ส่งลิงก์' : 'Send Link',
      cancelButtonText: lang === 'TH' ? 'ยกเลิก' : 'Cancel'
    });

    if (resetEmail) {
      Swal.fire({
        title: lang === 'TH' ? 'ส่งแล้ว!' : 'Sent!',
        text: `${t.alertResetSuccess} ${resetEmail}`,
        icon: 'success',
        confirmButtonColor: '#003366'
      });
    }
  }

  // ไอคอนตา
  const EyeOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
  const EyeOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>);

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* --- ฝั่งซ้าย: ฟอร์ม --- */}
        <div className={`login-form-section ${!isLogin ? 'signup-mode' : ''}`}>
          
          <button 
            className="lang-toggle-btn" 
            onClick={() => setLang(lang === 'TH' ? 'EN' : 'TH')}
            title={lang === 'TH' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            {lang === 'TH' ? 'EN' : 'TH'}
          </button>

          <div className="toggle-buttons">
            <button className={`toggle-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)} type="button">{t.tabLogin}</button>
            <button className={`toggle-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)} type="button">{t.tabRegister}</button>
          </div>

          <h1 className="form-title">{isLogin ? t.tabLogin : t.tabRegister}</h1>
          <p className="form-subtitle">{t.subtitle}</p>

          <form onSubmit={handleSubmit} className={!isLogin ? 'signup-form-scroll' : ''}>
            
            {/* ================= โหมด REGISTER ================= */}
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

            {/* ================= โหมด LOGIN ================= */}
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

        {/* --- ฝั่งขวา: รูปภาพ --- */}
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