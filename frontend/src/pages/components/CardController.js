import React, { useState, useEffect } from 'react';
import ImgMediaCard from './Card';
import axios from 'axios';

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

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="card-container">
        {filteredHospitals.map((hospital, index) => (
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
    </div>
  );
}
