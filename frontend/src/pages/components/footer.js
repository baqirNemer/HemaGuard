import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';

function ResponsiveFooter() {
  return (
    <footer className="bg-light text-muted pt-2" style={{ paddingBottom: '0' }}>
      <div className="container">
        {/* Social Links Section */}
        <section className='d-flex justify-content-center justify-content-lg-between p-4 border-bottom'>
          <div className='me-5 d-none d-lg-block'>
            <span>Get connected with us on social networks:</span>
          </div>

          <div>
            <a className='me-4 text-reset'>
              <i className="bi bi-facebook"></i>
            </a>
            <a className='me-4 text-reset'>
              <i className="bi bi-twitter"></i>
            </a>
            <a className='me-4 text-reset'>
              <i className="bi bi-google"></i>
            </a>
            <a className='me-4 text-reset'>
              <i className="bi bi-instagram"></i>
            </a>
            <a className='me-4 text-reset'>
              <i className="bi bi-linkedin"></i>
            </a>
            <a className='me-4 text-reset'>
              <i className="bi bi-github"></i>
            </a>
          </div>
        </section>

        <div className="row pt-4">
          <div className="col-lg-6">
            <h6 className="fw-bold mb-4">MEDIRECORD</h6>
            <p>Our aim is to keep your health records safe and secure.</p>
            <p>We provide a platform for you to access your health records from anywhere in the world.</p>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-bold mb-4">Services</h6>
            <ul className="list-unstyled">
              <li><Link to="/hospitals" className='text-reset'>Hospitals</Link></li>
              <li><Link to="/health_search" className='text-reset'>Health Search</Link></li>
              <li><Link to="/about" className='text-reset'>About Us</Link></li>
              <li><Link to="/contactus" className='text-reset'>Contact</Link></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-bold mb-4">Useful Links</h6>
            <ul className="list-unstyled">
              <li><a href="http://localhost:3000/hospital_details/661d8a29e86727b44a28e7b7" className='text-reset'>American University of Beirut Medical Center</a></li>
              <li><a href="http://localhost:3000/hospital_details/661d8b3cad15d87e8aec1e3b" className='text-reset'>Baabda Governmental Hospital</a></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-bold mb-4">Contact</h6>
            <address>
              <i className="fas fa-home me-2"></i> Beirut, Lebanon<br />
              <i className="fas fa-envelope me-2"></i> MediRec@gmail.com<br />
              <i className="fas fa-phone me-2"></i> +961 71 849 637<br />
              <i className="fas fa-print me-2"></i> +961 71 220 571
            </address>
          </div>
        </div>
      </div>
      <div className="text-center py-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
        <p className="mb-0">&copy; 2024 Copyright: <a href="" className="fw-bold">MediRec.com</a></p>
      </div>
    </footer>
  );
}

export default ResponsiveFooter;
