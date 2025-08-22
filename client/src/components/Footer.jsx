import React from 'react';
import './Footer.css';

const logoFooter = '/images/logo_footer.png';

function Footer() {
    return (
    <footer className='app-footer'>
        <div className='footer-logo'>
          <img src={logoFooter} alt='TEDDY Market 로고' height={'24px'}></img>
        </div>
        <div className='footer-text'>
          <span>Copyright</span>
          <p>TEDDY Corp.</p>
          <span>All Rights Reserved.</span>
        </div>
      </footer>
)}

export default Footer;