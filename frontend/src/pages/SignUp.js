import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResponsiveAppBar from './components/Navbar';
import ContainedButton from './components/Button_nav';
import ContainedButtons from './components/Button';

function SignUp() {
  const [formData, setFormData] = useState({
    id: 10,
    pass: '',
    f_name: '',
    l_name: '',
    location_id: '',
    email: '',
    phone: '',
    dob: '',
    blood_type: '',
    role_name: 'patient',
    image: ''
  });

  const [existingLocations, setExistingLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({
    f_name: false,
    l_name: false,
    email: false,
    phone: false,
    dob: false,
    blood_type: false,
    pass: false,
    location: false // Error state for location selection
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing locations from your API
    axios.get('http://localhost:3001/api/locations')
      .then((response) => {
        setExistingLocations(response.data);
      })
      .catch((error) => {
        console.error('Error fetching existing locations:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'locationSelect') {
      const selectedLocation = existingLocations.find(loc => loc._id === value);
      setSelectedLocation(selectedLocation); // Set selected location
      setFormData((prevData) => ({
        ...prevData,
        location_id: selectedLocation ? selectedLocation._id : '', // Update location_id
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value || ''
      }));
    }
  };
  
  
  const handleNextStep = (e) => {
    console.log('Current Form Data:', formData);
    e.preventDefault();
  
    const requiredFields = ['f_name', 'l_name', 'email', 'phone', 'dob', 'blood_type', 'pass'];
  const areRequiredFieldsFilled = requiredFields.every((field) => {
    const isFieldFilled = formData[field].trim() !== '';
    if (!isFieldFilled) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [field]: true // Set error state for empty required field
      }));
    }
    return isFieldFilled;
  });
    if (step === 1 && selectedLocation) {
      // console.log('Selected Location ID:', selectedLocation._id);
    }
    if (step === 1 && !selectedLocation) {
      alert('Please select a location to proceed');
      // console.log('Selected Location ID:');
      return;
    }
    if (step === 2 && selectedLocation) {
      // Update formData with the selected location
      setFormData((prevData) => ({
        ...prevData,
        location_id: selectedLocation._id,
        // Include other form data updates if needed
      }));
  
      // Now log the updated formData after the state update
      console.log('Updated FormData:', {
        ...formData,
        location_id: selectedLocation._id // Ensure location_id is correctly updated
      });
    }

    if (step === 2 && !areRequiredFieldsFilled) {
      alert('Please fill in all required fields to proceed');
      return; // Prevent proceeding if there are empty required fields or no selected location
    }
  
    setStep((prevStep) => prevStep + 1);
  };

  const handleBackStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Phone number validation
    const phoneRegex = /^\d{8,}$/; // Minimum 8 digits
    if (!phoneRegex.test(formData.phone)) {
      alert('Please input a valid phone number with at least 8 digits.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format check
    if (!emailRegex.test(formData.email)) {
      alert('Please input a valid email address.');
      return;
    }
    const existingEmailsResponse = await axios.get('http://localhost:3001/api/users/emails');
    const existingEmails = existingEmailsResponse.data.map(emailObj => emailObj.email);

    // Check if the new user's email already exists
    if (existingEmails.includes(formData.email)) {
      alert('Email is already taken. Please choose another email.');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/; // Minimum 8 characters with at least 1 digit and 1 special character Like :Password1!
    if (!passwordRegex.test(formData.pass)) {
      alert('Password must be at least 8 characters long and contain at least 1 digit and 1 special character.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users', formData);
      console.log('User created:', response.data);
      localStorage.setItem('NewuserEmail', formData.email);
      navigate('/login');
    } catch (error) {
      console.error('Error creating user:', error.response.data);
    }
  };
 
  
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
          <div style={{ marginTop: '180px' }}> 
            <div className="mb-3 ">
              <label htmlFor="locationSelect" className="form-label">Select Existing Location</label>
              <select className="form-select" id="locationSelect" name="locationSelect" onChange={handleChange}>
                <option value="">Choose location...</option>
                {existingLocations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.city}, {location.street}, {location.address1}, {location.address2}
                  </option>
                ))}
              </select>
            </div>
              
            <div className="mb-3">
              <label className="form-label">-----------------------------OR-----------------------------</label>
            </div>

            <div className="mb-3">
              
            <ContainedButton to="/addlocation">Add New Location</ContainedButton>
            </div>
            <ContainedButtons text="Next" className="btn btn-primary" onClick={handleNextStep} />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="mb-3">
              <label htmlFor="f_name" className="form-label">First Name</label>
              <input type="text" className="form-control" id="f_name" name="f_name" value={formData.f_name} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="l_name" className="form-label">Last Name</label>
              <input type="text" className="form-control" id="l_name" name="l_name" value={formData.l_name} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="blood_type" className="form-label">Blood Type</label>
              <select className="form-select" id="blood_type" name="blood_type" value={formData.blood_type} onChange={handleChange}>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="dob" className="form-label">Date of Birth</label>
              <input type="date" className="form-control" id="dob" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="pass" className="form-label">Password</label>
              <input type="password" className="form-control" id="pass" name="pass" value={formData.pass} onChange={handleChange} />
            </div>
            <div className="d-flex justify-content-between">
            <ContainedButtons text="Back" className="btn btn-secondary" onClick={handleBackStep} />
            <ContainedButtons text="Sign Up" type="submit" className="btn btn-primary" onClick={handleSubmit} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form>
              {renderStep()}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
