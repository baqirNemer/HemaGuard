import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Container, Box, Paper, Drawer, List, ListItem, ListItemText } from '@mui/material';
import ResponsiveAppBar from './components/Navbar';
import ContainedButtons from './components/Button';
import { useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar_filter';



function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedSection, setSelectedSection] = useState('profile');
  const [categoryNames, setCategoryNames] = useState({});
  const [userAppointments, setUserAppointments] = useState([]);

  const navigate = useNavigate(); // Hook for navigation

  

  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('category');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user appointments and doctor details
  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const userEmail = localStorage.getItem('useremail');
        const appointmentsResponse = await fetch(`http://localhost:3001/api/appointments/${userEmail}`);
        
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch user appointments');
        }
        
        const appointmentsData = await appointmentsResponse.json();
  
        // Fetch doctor details for each appointment and update with hospital and doctor email
        const updatedAppointments = await Promise.all(
          appointmentsData.map(async appointment => {
            const doctorId = appointment.doctor_id;
  
            // Fetch doctor details
            const doctorResponse = await fetch(`http://localhost:3001/api/doctors/${doctorId}`);
            if (!doctorResponse.ok) {
              throw new Error(`Failed to fetch doctor details for doctor ID: ${doctorId}`);
            }
            const doctorData = await doctorResponse.json();
            // Fetch hospital details using doctor's hospital_id
            const hospitalId = doctorData.hospital_id;
            const hospitalResponse = await fetch(`http://localhost:3001/api/hospitals/${hospitalId}`);
            if (!hospitalResponse.ok) {
              throw new Error(`Failed to fetch hospital details for hospital ID: ${hospitalId}`);
            }
            const hospitalData = await hospitalResponse.json();
            // Update appointment with doctor email and hospital name
            return {
              ...appointment,
              doctor_email: doctorData.doctor_email,
              hospital: hospitalData.name
            };
          })
        );
  
        // Set the updated appointments with doctor email and hospital name
        setUserAppointments(updatedAppointments);
      } catch (error) {
        console.error('Error fetching user appointments or doctor details:', error);
      }
    };
  
    fetchUserAppointments();
  }, []);
  
  // Fetch user details, location details, logs, doctor email , hospital name and category names
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem('useremail');
  
        // Fetch user details
        const userResponse = await fetch(`http://localhost:3001/api/users/${userEmail}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }
        const userData = await userResponse.json();
        setUserDetails(userData);
  
        // Fetch location details
        const locationId = userData.location_id;
        const locationResponse = await fetch(`http://localhost:3001/api/locations/${locationId}`);
        if (!locationResponse.ok) {
          throw new Error('Failed to fetch location details');
        }
        const locationData = await locationResponse.json();
        setLocationDetails(locationData);
  
        // Fetch logs based on user email
        const logsResponse = await fetch(`http://localhost:3001/api/logs/${userEmail}`);
        if (!logsResponse.ok) {
          throw new Error('Failed to fetch user logs');
        }
        const logsData = await logsResponse.json();
  
        // Fetch additional details for each log
        const doctorIds = [...new Set(logsData.map(log => log.doctor_id))]; // Get unique doctor IDs
  
        const updatedLogsMap = {}; // Object to collect updated logs
  
        // Fetch doctor and hospital data for each unique doctor ID
        await Promise.all(
          doctorIds.map(async doctorId => {
            const doctorResponse = await fetch(`http://localhost:3001/api/doctors/${doctorId}`);
            if (!doctorResponse.ok) {
              throw new Error(`Failed to fetch doctor details for doctor ID: ${doctorId}`);
            }
            const doctorData = await doctorResponse.json();
  
            const hospitalResponse = await fetch(`http://localhost:3001/api/hospitals/${doctorData.hospital_id}`);
            if (!hospitalResponse.ok) {
              throw new Error(`Failed to fetch hospital details for hospital ID: ${doctorData.hospital_id}`);
            }
            const hospitalData = await hospitalResponse.json();
  
            // Update the log entry with doctor's email and hospital name
            logsData
              .filter(log => log.doctor_id === doctorId)
              .forEach(log => {
                updatedLogsMap[log._id] = {
                  ...log,
                  doctor_email: doctorData.doctor_email,
                  hospital: hospitalData.name
                };
              });
          })
        );
  
        // Convert updatedLogsMap values to an array of logs
        const updatedLogs = Object.values(updatedLogsMap);
  
        // Set the updated logs in the state
        setLogs(updatedLogs);
  
        // Fetch category names for logs
        const categoryIds = updatedLogs.map(log => log.category_id);
        const uniqueCategoryIds = [...new Set(categoryIds)]; // Get unique category IDs
  
        const categoryNamesData = {};
        for (const categoryId of uniqueCategoryIds) {
          const categoryResponse = await fetch(`http://localhost:3001/api/categories/${categoryId}`);
          if (!categoryResponse.ok) {
            throw new Error(`Failed to fetch category details for category ID: ${categoryId}`);
          }
          const categoryData = await categoryResponse.json();
          categoryNamesData[categoryId] = categoryData.cname;
        }
        setCategoryNames(categoryNamesData);
      } catch (error) {
        console.error('Error fetching user details or related data:', error);
      }
    };
  
    fetchUserDetails();
  }, []);
  
  // Filter logs when searchTerm or selectedCategory changes
  useEffect(() => {
    const filterLogs = () => {
      if (logs.length === 0 || Object.keys(categoryNames).length === 0) {
        setFilteredLogs([]);
        return;
      }
  
      const filtered = logs.filter(log => {
        const categoryId = log.category_id;
        const categoryName = categoryNames[categoryId] || 'Unknown Category';

        const hospitalName = log.hospital || 'Unknown Hospital';
        const doctorEmail = log.doctor_email || 'Unknown Doctor';

        const searchText = searchTerm.toLowerCase();
  
        // Example console log to inspect each log item
        // console.log(log);
        // console.log(categoryName);
        // console.log(hospitalName);
        // console.log(doctorEmail);
  
        if (selectedCategory === 'category') {
          // Filter by log category name
          const categoryValue = categoryName.toLowerCase();
          return categoryValue.includes(searchText);
        } else if (selectedCategory === 'hospital') {
          // Filter by hospital name associated with the log
          const hospitalName = log.hospital ? log.hospital.toLowerCase() : '';
          return hospitalName.includes(searchText);
        } else if (selectedCategory === 'doctor') {
          // Filter by doctor email associated with the log
          const doctorEmail = log.doctor_email ? log.doctor_email.toLowerCase() : '';
          return doctorEmail.includes(searchText);
        }
  
        return false;
      });
  
      setFilteredLogs(filtered);
    };
  
    filterLogs();
  }, [logs, categoryNames, selectedCategory, searchTerm]);
  
  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleEditProfile = () => {
    navigate('/profileEdit');
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('useremail');
    navigate('/'); 
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleSearchChange = (value, category) => {
    setSearchTerm(value);
    setSelectedCategory(category);
  };
  
  const renderProfileSection = () => (
    <Container maxWidth="sm">

      
      {selectedSection === 'profile' && userDetails && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: '-100px', marginTop: '100px' }}>
          {/* User Image */}
          <Box>
            <img alt="User Avatar" src={userDetails.image} style={{ width: 300, height: 300, marginBottom: 10 }} />
          </Box>
          {/* User Details */}
          <Box sx={{ marginLeft: '20px', marginTop: '20px' }}> {/* Adjust the margin as needed */}
            <Typography variant="h5" gutterBottom>
              {userDetails.f_name} {userDetails.l_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {userDetails.email}
            </Typography>
            {locationDetails && (
              <Typography variant="body1" gutterBottom>
                <strong>Location:</strong> {locationDetails.city}, {locationDetails.street}, {locationDetails.address1}, {locationDetails.address2}
              </Typography>
            )}
            <Typography variant="body1" gutterBottom>
              <strong>Phone:</strong> {userDetails.phone}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Date of Birth:</strong> {formatDate(userDetails.dob)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Blood Type:</strong> {userDetails.blood_type}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Role:</strong> {userDetails.role_name}
            </Typography>
           <ContainedButtons text="Edit Profile" onClick={handleEditProfile} />
          </Box>
        </Box>
      )}

      {selectedSection === 'records' && (
        <Paper mt={4} sx={{marginTop: '100px' }}>
          <Typography variant="h4" gutterBottom>
            Records
          </Typography>
          <SearchBar
            onSearchChange={handleSearchChange}
            categoryNames={['Category', 'Hospital', 'Doctor Email']}
          />
          {filteredLogs.length > 0 ? (
            <List>
              {filteredLogs.map(log => (
                <ListItem key={log._id} alignItems="flex-start" divider>
                  {/* Left side: Category and Description */}
                  <ListItemText
                    primary={`Category: ${categoryNames[log.category_id] || 'Unknown Category'}`}
                    secondary={`Description: ${log.description}`}
                    style={{ width: '175px' }}
                  />
                  {/* Right side: Hospital name and Doctor's email */}
                  <ListItemText
                    primary={`Hospital: ${log.hospital || 'Loading...'}`}
                    secondary={`Doctor Email: ${log.doctor_email || 'Loading...'}`}
                    style={{ width: '345px' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" gutterBottom>
              No records found.
            </Typography>
          )}
        </Paper>
      )}
  
      {selectedSection === 'appointments' && (
        <Paper mt={4} sx={{marginTop: '100px' }}>
          <Typography variant="h4" gutterBottom>
            Appointments
          </Typography>
          {userAppointments.length > 0 ? (
            <List>
              {userAppointments.map(appointment => (
                <ListItem key={appointment._id} alignItems="flex-start" divider>
                  {/* Left side: Date and Details */}
                  <ListItemText
                    primary={`Date: ${formatDate(appointment.date)}`}
                    secondary={`Details: ${appointment.description}`}
                    style={{ width: '200px' }}
                  />
                  {/* Right side: Hospital name and Doctor's email */}
                  {appointment.doctor_id && (
                    <ListItemText
                      primary={`Hospital: ${appointment.hospital || 'Unknown Hospital'}`}
                      secondary={`Doctor Email: ${appointment.doctor_email || 'Unknown Doctor'}`}
                      style={{ width: '400px' }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" gutterBottom>
              No appointments found.
            </Typography>
          )}
        </Paper>
      )}
    </Container>
  );
  

  return (
    <div>
      <ResponsiveAppBar />
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            position: 'absolute',
            top: '68px', // Adjust top position to match the navbar height
            left: 0,
            backgroundColor: '#008A88',
            height: 'calc(100vh - 64px)', // Calculate height to fill remaining viewport
            overflowY: 'auto', // Enable scrolling if content exceeds sidebar height
          }}
        >
          <List>
            {['profile', 'records', 'appointments'].map((section) => (
              <ListItem key={section} onClick={() => handleSectionClick(section)}>
                <ListItemText primary={section.charAt(0).toUpperCase() + section.slice(1)} />
              </ListItem>
            ))}
            <ListItem onClick={handleLogoutClick}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, marginLeft: '240px' /* Adjust left margin to match sidebar width */ }}>
          {renderProfileSection()}
        </Box>
      </Box>
    </div>
  );
}

export default Profile;
