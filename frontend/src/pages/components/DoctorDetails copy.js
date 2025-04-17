import React, { useState, useEffect } from 'react';
import { ListItemText } from '@mui/material';

const DoctorDetails = ({ doctorId }) => {
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/doctors/${doctorId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctor details');
        }
        const doctorData = await response.json();
        const hospitalData = await fetchHospitalName(doctorData.hospital_id);

        const doctorUserEmail = doctorData.doctor_email;
        setDoctorDetails({ ...doctorData, hospital_name: hospitalData.name, doctorUserEmail });
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setDoctorDetails(null); // Reset doctorDetails state in case of error
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const fetchHospitalName = async (hospitalId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/hospitals/${hospitalId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hospital details');
      }
      const hospitalData = await response.json();
      return { name: hospitalData.name };
    } catch (error) {
      console.error('Error fetching hospital name:', error);
      return { name: 'Unknown Hospital' }; 
    }
  };

  if (!doctorDetails) {
    return null; 
  }

  return (
    
    <>
      <ListItemText
        primary={`Hospital: ${doctorDetails.hospital_name}`}
        secondary={`Doctor Email: ${doctorDetails.doctorUserEmail}`}
      />
    </>
  );
};

export default DoctorDetails;
