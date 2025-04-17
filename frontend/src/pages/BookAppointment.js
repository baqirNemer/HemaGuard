import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useHistory } from 'react-router-dom';
import ResponsiveAppBar from './components/Navbar';
import ResponsiveFooter from './components/footer';
import ContainedButton from './components/Button';

const BookAppointment = () => {
  const { id } = useParams();
  const [patientEmail, setPatientEmail] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const userEmail = localStorage.getItem('useremail');
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/doctors?hospital_id=${id}`);
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, [id]);

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/appointments', {
        patient_email: patientEmail,
        doctor_id: selectedDoctor,
        description,
        date,
      });
      setMessage('Appointment booked successfully!');
      // Optionally, redirect to a different page after booking
    } catch (error) {
      setMessage('Error booking appointment. Please try again.');
      console.error('Error booking appointment:', error);
    }
  };

  const renderLoginMessage = () => {
    return (
      <div className="alert alert-warning text-center">
        You need to login to book an appointment.
        <br />
        <Link to="/login">Login</Link>
      </div>
    );
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div className="container-fluid d-flex align-items-center justify-content-center vh-100">
        <div className="card w-50">
          <div className="card-body">
            <h5 className="card-title mb-4 text-center">Book Appointment</h5>
            {userEmail === null && renderLoginMessage()}
            {message && <div className="alert alert-info text-center">{message}</div>}
            {userEmail !== null && ( // Render form only if user is logged in
              <form onSubmit={handleAppointmentSubmit}>
                <div className="form-group">
                  <label>Patient Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userEmail ? userEmail : patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    disabled={!!userEmail}
                  />
                </div>

                <div className="form-group">
                  <label>Select Doctor:</label>
                  <select
                    className="form-control"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.doctor_email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <br />
                <div className="text-center">
                  <ContainedButton
                    type="submit"
                    text="Book Appointment"
                    className="btn btn-primary btn-block"
                    disabled={!userEmail} // Disable button if user is not logged in
                  />
                </div>
                <br />
              </form>
            )}
          </div>
        </div>
      </div>
      <ResponsiveFooter />
    </div>
  );
};

export default BookAppointment;
