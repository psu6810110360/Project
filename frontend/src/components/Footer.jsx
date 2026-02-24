import { FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer style={{ backgroundColor: '#003366', color: '#FFFFFF', padding: '40px 20px', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
        <p style={{ margin: '0 0 15px 0', fontSize: '16px', letterSpacing: '0.5px' }}>
          P'8 Smart Science Pro
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '20px', fontSize: '22px' }}>
          <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaFacebook /></a>
          <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaLinkedin /></a>
          <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaYoutube /></a>
          <a href="#" style={{ color: '#FFFFFF', transition: 'color 0.2s' }}><FaInstagram /></a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;