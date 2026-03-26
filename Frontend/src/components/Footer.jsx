import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="walmart-footer">
      {/* Tier 1: Feedback Section */}
      <div className="footer-feedback-section">
        <p>We'd love to hear what you think!</p>
        <button className="feedback-btn">Give feedback</button>
      </div>

      {/* Tier 2: Links Section */}
      <div className="footer-links-section">
        <ul className="footer-link-list">
          <li><a href="#">All Departments</a></li>
          <li><a href="#">Store Directory</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Our Company</a></li>
          <li><a href="#">Sell on Walmart.com</a></li>
          <li><a href="#">Help</a></li>
          <li><a href="#">Product Recalls</a></li>
          <li><a href="#">Accessibility</a></li>
          <li><a href="#">Tax Exempt Program</a></li>
          <li><a href="#">Get the Walmart App</a></li>
          <li><a href="#">Sign-up for Email</a></li>
          <li><a href="#">Safety Data Sheet</a></li>
          <li><a href="#">Terms of Use</a></li>
          <li><a href="#">Privacy Notice</a></li>
          <li><a href="#">California Supply Chain Act</a></li>
          <li><a href="#">Your Privacy Choices <i className="fa-solid fa-toggle-on"></i></a></li>
          <li><a href="#">Notice at Collection</a></li>
          <li><a href="#">Request My Personal Information</a></li>
          <li><a href="#">Brand Shop Directory</a></li>
          <li><a href="#">Pharmacy</a></li>
          <li><a href="#">Walmart Business</a></li>
          <li><a href="#">#IYWYK</a></li>
          <li><a href="#">Delete Account</a></li>
        </ul>
      </div>

      {/* Tier 3: Copyright Section */}
      <div className="footer-copyright-section">
        <p>© 2026 Walmart. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
