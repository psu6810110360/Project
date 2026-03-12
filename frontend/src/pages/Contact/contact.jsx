import { useState } from 'react';
import axios from 'axios';
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaRegClock,
    FaFacebookF,
    FaLine,
    FaInstagram
} from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSending, setIsSending] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        try {
            await axios.post('http://localhost:3000/contact', formData);
            Swal.fire('ส่งข้อความสำเร็จ!', 'เราได้รับข้อความของคุณแล้ว จะรีบติดต่อกลับโดยเร็วที่สุดครับ', 'success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถส่งข้อความได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const cardStyle = {
        background: '#fff',
        border: '1px solid #003366',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    };

    const infoBoxStyle = {
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'flex-start',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    };

    const iconCircleStyle = {
        background: '#fff3e0',
        color: '#F2984A',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        outlineColor: '#003366',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        fontSize: '15px'
    };

    const labelStyle = {
        display: 'block',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333',
        fontSize: '14px'
    };

    const socialCardStyle = {
        background: '#fff',
        border: '1px solid #003366',
        borderRadius: '12px',
        padding: '30px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        flex: '1 1 250px'
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', color: '#333' }}>

            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ color: '#003366', fontSize: '32px', marginBottom: '10px' }}>ติดต่อเรา</h1>
                <p style={{ color: '#666', fontSize: '16px' }}>เรายินดีรับฟังความคิดเห็นและตอบคำถามของคุณ</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '60px' }}>

                <div style={{ flex: '1 1 450px' }}>
                    <div style={cardStyle}>
                        <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>ส่งข้อความถึงเรา</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>ชื่อ - นามสกุล *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="กรอกชื่อของคุณ" required style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>อีเมล *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" required style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>เบอร์โทรศัพท์</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="089-123-4567" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>ข้อความ *</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="พิมพ์ข้อความของคุณที่นี่..." required style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                            </div>
                            <button
                                type="submit"
                                disabled={isSending}
                                style={{
                                    background: isSending ? '#ccc' : '#F2984A',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: isSending ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginTop: '10px'
                                }}
                            >
                                <FaEnvelope /> {isSending ? 'กำลังส่งข้อความ...' : 'ส่งข้อความ'}
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={infoBoxStyle}>
                        <div style={iconCircleStyle}><FaPhoneAlt /></div>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>โทรศัพท์</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: '1.6' }}>02-123-4567<br />089-456-7890</p>
                        </div>
                    </div>

                    <div style={infoBoxStyle}>
                        <div style={iconCircleStyle}><FaEnvelope /></div>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>อีเมล</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: '1.6' }}>info@smartscience.com<br />support@smartscience.com</p>
                        </div>
                    </div>

                    <div style={infoBoxStyle}>
                        <div style={iconCircleStyle}><FaMapMarkerAlt /></div>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>ที่อยู่</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
                                คณะวิศวกรรมศาสตร์ มหาวิทยาลัยสงขลานคริทร์<br />
                                คอหงส์ หาดใหญ่<br />
                                สงขลา 90110
                            </p>
                        </div>
                    </div>

                    <div style={{ ...infoBoxStyle, background: '#fdfbf7', borderColor: '#f4dec4' }}>
                        <div style={{ ...iconCircleStyle, background: '#fff', border: '1px solid #f4dec4' }}><FaRegClock /></div>
                        <div style={{ width: '100%' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>เวลาทำการ</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                <span>จันทร์ - ศุกร์:</span>
                                <span>09:00 - 18:00 น.</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                <span>เสาร์:</span>
                                <span>10:00 - 16:00 น.</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                                <span>อาทิตย์:</span>
                                <span style={{ color: '#F2984A', fontWeight: 'bold' }}>ปิดทำการ</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2 style={{ color: '#003366', fontSize: '24px', marginBottom: '10px' }}>ติดตามเราบนโซเชียลมีเดีย</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>อัปเดตข่าวสารและโปรโมชันใหม่ๆ ได้ที่</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>

                    <div style={socialCardStyle}>
                        <div style={{ ...iconCircleStyle, background: '#e0f2fe', color: '#0284c7', width: '60px', height: '60px', fontSize: '28px' }}>
                            <FaFacebookF />
                        </div>
                        <h3 style={{ margin: '5px 0', color: '#333' }}>Facebook</h3>
                        <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '14px' }}>@SmartSciencePro</p>
                        <button style={{ width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>ติดตาม</button>
                    </div>

                    <div style={socialCardStyle}>
                        <div style={{ ...iconCircleStyle, background: '#dcfce7', color: '#16a34a', width: '60px', height: '60px', fontSize: '32px' }}>
                            <FaLine />
                        </div>
                        <h3 style={{ margin: '5px 0', color: '#333' }}>Line</h3>
                        <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '14px' }}>@SmartScience</p>
                        <button style={{ width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>ติดตาม</button>
                    </div>

                    <div style={socialCardStyle}>
                        <div style={{ ...iconCircleStyle, background: '#fce7f3', color: '#db2777', width: '60px', height: '60px', fontSize: '30px' }}>
                            <FaInstagram />
                        </div>
                        <h3 style={{ margin: '5px 0', color: '#333' }}>Instagram</h3>
                        <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '14px' }}>@smartscience.th</p>
                        <button style={{ width: '100%', padding: '10px', background: '#003366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>ติดตาม</button>
                    </div>

                </div>
            </div>

        </div>
    );
}