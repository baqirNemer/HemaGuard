import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResponsiveAppBar from './components/Navbar';
import ResponsiveFooter from './components/footer';

function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('useremail');

  useEffect(() => {
    // If user is logged in, set the email field
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const submittedName = name.trim() ? name : 'Anonymous'; // Set name to 'Anonymous' if it's empty
      
      const response = await axios.post('http://localhost:3001/api/contact', {
        name: submittedName,
        email,
        message
      });

      setSubmissionMessage('Your message has been sent! We will get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setSubmissionMessage('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div className="container-fluid d-flex align-items-center justify-content-center vh-100">
        <div className="card w-50">
          <div className="card-body">
            <h5 className="card-title mb-4 text-center">Contact Us</h5>
            {submissionMessage && <div className="alert alert-info text-center">{submissionMessage}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email address:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!userEmail}
                />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={submitting || (!name.trim() && !email) || !message}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ResponsiveFooter />
    </div>
  );
}

export default ContactUs;
