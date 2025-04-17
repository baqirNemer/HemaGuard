import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Box, MenuItem} from '@mui/material';
import ContainedButton from './components/Button_nav';
import ContainedButtons from './components/Button';
import ResponsiveAppBar from './components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileEdit() {
  const [userDetails, setUserDetails] = useState({
    f_name: '',
    l_name: '',
    email: '',
    phone: '',
    dob: '',
    blood_type: '',
    location_id: ''
  });

  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem('useremail');
        const userResponse = await axios.get(`http://localhost:3001/api/users/${userEmail}`);
        if (!userResponse.data) {
          throw new Error('User not found');
        }
        setUserDetails(userResponse.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/locations');
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchUserDetails();
    fetchLocations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const userEmail = localStorage.getItem('useremail');
      const response = await axios.put(`http://localhost:3001/api/users/${userEmail}`, userDetails);
  
      // Check response status before navigating
      if (response.status === 200) {
        navigate('/profile'); // Redirect to profile page after saving
      } else {
        console.error('Unexpected response status:', response.status);
        // Handle unexpected response status
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      // Handle specific error cases (e.g., 404 Not Found)
      if (error.response && error.response.status === 404) {
        console.error('User not found:', error.response.data);
        // Display user-friendly message or take appropriate action
      } else {
        console.error('Unexpected error:', error.message);
        // Handle other types of errors
      }
    }
  };

  return (
    <div>
      <ResponsiveAppBar />
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '30px' }}>
          {/* Location Select Dropdown */}
          <div className="mb-3">
          <TextField
            select
            label="Choose Location"
            fullWidth
            id="locationSelect"
            name="location_id"
            value={userDetails.location_id}
            onChange={handleInputChange}
            margin="normal"
          >
            <MenuItem value="">Choose location...</MenuItem>
            {locations.map((location) => (
              <MenuItem key={location._id} value={location._id}>
                {`${location.city}, ${location.street}, ${location.address1}, ${location.address2}`}
              </MenuItem>
            ))}
          </TextField>
            <div className="mb-3">
              <br/>
              <label className="form-label">-----------------------------OR-----------------------------</label>
            </div>
            <div className="mb-3">
              <ContainedButton to="/addlocation">Add New Location</ContainedButton>
            </div>
          </div>

          {/* User Details Fields */}
          <div className="mb-3">
            <Box display="flex" flexDirection="column">
              <TextField
                label="First Name"
                value={userDetails.f_name}
                name="f_name"
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                value={userDetails.l_name}
                name="l_name"
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={userDetails.email}
                name="email"
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                value={userDetails.phone}
                name="phone"
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={userDetails.dob}
                name="dob"
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Blood Type"
                select
                fullWidth
                name="blood_type"
                value={userDetails.blood_type}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
                margin="normal"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </TextField>

            </Box>
          </div>

          {/* Save or Edit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ContainedButton to="/profile">Back</ContainedButton>
            <ContainedButtons text="Save Profile" onClick={handleSaveProfile} />
          </Box>

        </Box>
      </Container>
    </div>
  );
}

export default ProfileEdit;
