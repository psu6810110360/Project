import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Navbar({ isLoggedIn, setIsLoggedIn }) { // <--- รับ isLoggedIn
  const navigate = useNavigate();
  
  // ดึง role มาเช็คเพื่อแสดงผลบนปุ่ม
  const userRole = localStorage.getItem('userRole'); 

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
        
        setIsLoggedIn(false); // <--- เซ็ตสถานะการล็อกอินเป็น false

        Swal.fire({
          title: 'ออกจากระบบสำเร็จ',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/'); 
        });
      }
    });
  };

  return (
    <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#003366' }}>Smart</span>
            <span style={{ color: '#F2984A' }}>Science</span>
            <span style={{ color: '#003366' }}>Pro</span>
          </h1>
          <span style={{ color: '#888888', fontSize: '13px', marginTop: '-2px', fontWeight: '400' }}>
            เรียนวิทย์ในแบบที่เข้าใจง่ายที่สุด
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '15px', fontWeight: '500' }}>
          <span style={{ cursor: 'pointer', color: '#333333' }}>นักเรียนของเรา</span>
          <span style={{ cursor: 'pointer', color: '#333333' }}>ติดต่อเรา</span>
          <Link to="/courses" style={{ textDecoration: 'none', color: '#333333' }}>คอร์สเรียน</Link>
          <span style={{ cursor: 'pointer', color: '#333333' }}>บัญชีของฉัน</span>
          
          {/* เปลี่ยนมาเช็คจาก isLoggedIn แทน */}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '10px 24px', backgroundColor: '#dc3545', color: '#FFFFFF', border: 'none', 
                borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', 
                fontFamily: '"Prompt", sans-serif', transition: '0.3s'
              }}
            >
              ออกจากระบบ {userRole === 'admin' ? '(Admin)' : ''}
            </button>
          ) : (
            <Link 
              to="/login"
              style={{ 
                padding: '10px 24px', backgroundColor: '#003366', color: '#FFFFFF', textDecoration: 'none', 
                borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', 
                fontFamily: '"Prompt", sans-serif', transition: '0.3s', display: 'inline-block',
              }}
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;