import React from 'react';
import { Link } from "react-router-dom";



function Footer() {
  return (
    <div className="footer-container">

    <Link to="/" className="link">
        <div className="footerLink">© 2023 Paybit Finance</div>
    </Link>

    <Link to="/" className="link">
        <div className="footerLink">Swap</div>
    </Link>

    <Link to="/Perguntas" className="link">
        <div className="footerLink">Perguntas</div>
    </Link>
  
      </div>
  );
}

export default Footer;
