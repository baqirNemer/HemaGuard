import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ResponsiveAppBar from './components/Navbar';
import ResponsiveFooter from './components/footer';
import ContainedButtons from './components/Button';
import { Link } from 'react-router-dom';

const HospitalDetails = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        console.log('Fetching hospital details for ID:', id);
        const response = await axios.get(`http://localhost:3001/api/hospitals/${id}`);
        console.log('Fetched hospital data:', response.data);
        setHospital(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hospital details:', error);
        setError('Error fetching hospital details. Please try again.');
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id]);

  const handleBookAppointmentClick = () => {
    console.log('Redirecting to book appointment for hospital ID:', id);
  };

  if (loading) {
    return <div>Loading Hospital Details for ID: {id}...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!hospital) {
    return <div>No hospital details found for ID: {id}</div>;
  }

  return (
    <div>
      <ResponsiveAppBar />
      <div style={{ padding: '20px' }}>
        <h1>{hospital.name}</h1>
        <p>{hospital.description}</p>
        <p>Phone: {hospital.phone}</p>
        {hospital.image && <img src={hospital.image} alt={hospital.name} style={{ maxWidth: '400px' }} />}
        <br /><br />
        <Link to={`/bookappointment/${id}`} onClick={handleBookAppointmentClick}>
          <ContainedButtons text="BOOK APPOINTMENT"  className="btn btn-primary btn-block"  ></ContainedButtons>
        </Link>
      </div>
      <ResponsiveFooter />
    </div>
  );
};

export default HospitalDetails;
