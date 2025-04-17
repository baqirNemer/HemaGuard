import React, { useState, useEffect } from 'react';
import ImgMediaCard from './Card';
import axios from 'axios';
import ContainedButton from './Button_nav';

export default function CardController({ searchTerm }) {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/hospitals');
      setHospitals(response.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  // Get only the first three hospitals
  const firstThreeHospitals = hospitals.slice(0, 3);

  return (
    <div>
      <div className="card-container">
        {firstThreeHospitals.map((hospital, index) => (
          <ImgMediaCard
            key={index}
            hospitalId={hospital._id}
            imageSrc={hospital.image}
            title={hospital.name}
            description={hospital.description}
            shareDestination={hospital.shareDestination}
          />
        ))}
      </div>
      <ContainedButton to="/hospitals">Show All hospitals</ContainedButton>
      <br/><br/>
    </div>
  );
}
