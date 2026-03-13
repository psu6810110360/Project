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
import './Contact.css'; // 🟢 ดึงไฟล์ CSS มาใช้ตรงนี้

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

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>ติดต่อเรา</h1>
                <p>เรายินดีรับฟังความคิดเห็นและตอบคำถามของคุณ</p>
            </div>

            <div className="contact-content">
                {/* ฟอร์มซ้าย */}
                <div className="contact-form-section">
                    <div className="contact-card">
                        <h3>ส่งข้อความถึงเรา</h3>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label className="form-label">ชื่อ - นามสกุล *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="กรอกชื่อของคุณ" required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">อีเมล *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" required className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">เบอร์โทรศัพท์</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="089-123-4567" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ข้อความ *</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="พิมพ์ข้อความของคุณที่นี่..." required className="form-textarea" />
                            </div>
                            <button type="submit" disabled={isSending} className="submit-btn">
                                <FaEnvelope /> {isSending ? 'กำลังส่งข้อความ...' : 'ส่งข้อความ'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ข้อมูลขวา */}
                <div className="contact-info-section">
                    <div className="info-box">
                        <div className="icon-circle"><FaPhoneAlt /></div>
                        <div className="info-content">
                            <h4>โทรศัพท์</h4>
                            <p>02-123-4567<br />089-456-7890</p>
                        </div>
                    </div>

                    <div className="info-box">
                        <div className="icon-circle"><FaEnvelope /></div>
                        <div className="info-content">
                            <h4>อีเมล</h4>
                            <p>info@smartscience.com<br />support@smartscience.com</p>
                        </div>
                    </div>

                    <div className="info-box">
                        <div className="icon-circle"><FaMapMarkerAlt /></div>
                        <div className="info-content">
                            <h4>ที่อยู่</h4>
                            <p>คณะวิศวกรรมศาสตร์ มหาวิทยาลัยสงขลานครินทร์<br />คอหงส์ หาดใหญ่<br />สงขลา 90110</p>
                        </div>
                    </div>

                    <div className="info-box highlight">
                        <div className="icon-circle"><FaRegClock /></div>
                        <div className="info-content">
                            <h4>เวลาทำการ</h4>
                            <div className="time-row">
                                <span>จันทร์ - ศุกร์:</span>
                                <span>09:00 - 18:00 น.</span>
                            </div>
                            <div className="time-row">
                                <span>เสาร์:</span>
                                <span>10:00 - 16:00 น.</span>
                            </div>
                            <div className="time-row">
                                <span>อาทิตย์:</span>
                                <span className="time-closed">ปิดทำการ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* โซเชียลด้านล่าง */}
            <div className="social-section">
                <h2>ติดตามเราบนโซเชียลมีเดีย</h2>
                <p>อัปเดตข่าวสารและโปรโมชันใหม่ๆ ได้ที่</p>

                <div className="social-cards-container">
                    <div className="social-card">
                        <div className="social-icon fb"><FaFacebookF /></div>
                        <h3>Facebook</h3>
                        <p>@SmartSciencePro</p>
                        <button className="follow-btn">ติดตาม</button>
                    </div>

                    <div className="social-card">
                        <div className="social-icon line"><FaLine /></div>
                        <h3>Line</h3>
                        <p>@SmartScience</p>
                        <button className="follow-btn">ติดตาม</button>
                    </div>

                    <div className="social-card">
                        <div className="social-icon ig"><FaInstagram /></div>
                        <h3>Instagram</h3>
                        <p>@smartscience.th</p>
                        <button className="follow-btn">ติดตาม</button>
                    </div>
                </div>
            </div>
        </div>
    );
}