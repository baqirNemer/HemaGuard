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
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null); // NEW: to hold selected log

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const userEmail = localStorage.getItem('useremail');
        const appointmentsResponse = await fetch(`http://localhost:3001/api/appointments/${userEmail}`);
        if (!appointmentsResponse.ok) throw new Error('Failed to fetch user appointments');
        const appointmentsData = await appointmentsResponse.json();

        const updatedAppointments = await Promise.all(
          appointmentsData.map(async appointment => {
            const doctorResponse = await fetch(`http://localhost:3001/api/doctors/${appointment.doctor_id}`);
            const doctorData = await doctorResponse.json();
            const hospitalResponse = await fetch(`http://localhost:3001/api/hospitals/${doctorData.hospital_id}`);
            const hospitalData = await hospitalResponse.json();
            return {
              ...appointment,
              doctor_email: doctorData.doctor_email,
              hospital: hospitalData.name,
            };
          })
        );

        setUserAppointments(updatedAppointments);
      } catch (error) {
        console.error('Error fetching user appointments or doctor details:', error);
      }
    };

    fetchUserAppointments();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userEmail = localStorage.getItem('useremail');
        const userResponse = await fetch(`http://localhost:3001/api/users/${userEmail}`);
        const userData = await userResponse.json();
        setUserDetails(userData);

        const locationResponse = await fetch(`http://localhost:3001/api/locations/${userData.location_id}`);
        const locationData = await locationResponse.json();
        setLocationDetails(locationData);

        const logsResponse = await fetch(`http://localhost:3001/api/logs/${userEmail}`);
        const logsData = await logsResponse.json();

        const doctorIds = [...new Set(logsData.map(log => log.doctor_id))];
        const updatedLogsMap = {};

        await Promise.all(
          doctorIds.map(async doctorId => {
            const doctorResponse = await fetch(`http://localhost:3001/api/doctors/${doctorId}`);
            const doctorData = await doctorResponse.json();

            const hospitalResponse = await fetch(`http://localhost:3001/api/hospitals/${doctorData.hospital_id}`);
            const hospitalData = await hospitalResponse.json();

            logsData
              .filter(log => log.doctor_id === doctorId)
              .forEach(log => {
                updatedLogsMap[log._id] = {
                  ...log,
                  doctor_email: doctorData.doctor_email,
                  hospital: hospitalData.name,
                };
              });
          })
        );

        const updatedLogs = Object.values(updatedLogsMap);
        setLogs(updatedLogs);

        const categoryIds = updatedLogs.map(log => log.category_id);
        const uniqueCategoryIds = [...new Set(categoryIds)];
        const categoryNamesData = {};

        for (const categoryId of uniqueCategoryIds) {
          const categoryResponse = await fetch(`http://localhost:3001/api/categories/${categoryId}`);
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

  useEffect(() => {
    const filterLogs = () => {
      if (logs.length === 0 || Object.keys(categoryNames).length === 0) {
        setFilteredLogs([]);
        return;
      }

      const filtered = logs.filter(log => {
        const categoryName = categoryNames[log.category_id] || 'Unknown Category';
        const hospitalName = log.hospital || '';
        const doctorEmail = log.doctor_email || '';
        const searchText = searchTerm.toLowerCase();

        if (selectedCategory === 'category') return categoryName.toLowerCase().includes(searchText);
        if (selectedCategory === 'hospital') return hospitalName.toLowerCase().includes(searchText);
        if (selectedCategory === 'doctor') return doctorEmail.toLowerCase().includes(searchText);

        return false;
      });

      setFilteredLogs(filtered);
    };

    filterLogs();
  }, [logs, categoryNames, selectedCategory, searchTerm]);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSelectedRecord(null);
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('useremail');
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profileEdit');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleSearchChange = (value, category) => {
    setSearchTerm(value);
    setSelectedCategory(category);
  };

  const handleRecordClick = (log) => {
    setSelectedRecord(log);
  };

  const renderProfileSection = () => (
    <Container maxWidth="sm">
      {selectedSection === 'profile' && userDetails && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '100px' }}>
          <Box>
            <img alt="User Avatar" src={userDetails.image} style={{ width: 300, height: 300 }} />
          </Box>
          <Box sx={{ marginLeft: '20px', marginTop: '20px' }}>
            <Typography variant="h5">{userDetails.f_name} {userDetails.l_name}</Typography>
            <Typography><strong>Email:</strong> {userDetails.email}</Typography>
            {locationDetails && (
              <Typography>
                <strong>Location:</strong> {locationDetails.city}, {locationDetails.street}, {locationDetails.address1}, {locationDetails.address2}
              </Typography>
            )}
            <Typography><strong>Phone:</strong> {userDetails.phone}</Typography>
            <Typography><strong>Date of Birth:</strong> {formatDate(userDetails.dob)}</Typography>
            <Typography><strong>Blood Type:</strong> {userDetails.blood_type}</Typography>
            <Typography><strong>Role:</strong> {userDetails.role_name}</Typography>
            <ContainedButtons text="Edit Profile" onClick={handleEditProfile} />
          </Box>
        </Box>
      )}

      {selectedSection === 'records' && (
        <Paper mt={4} sx={{marginTop: '100px', alignItems: 'center'}}>
          <Typography variant="h4" gutterBottom>Records</Typography>
          {!selectedRecord && (
            <>
              <SearchBar onSearchChange={handleSearchChange} categoryNames={['Category', 'Hospital', 'Doctor Email']} />
              {filteredLogs.length > 0 ? (
                <List>
                  {filteredLogs.map(log => (
                    <ListItem button key={log._id} onClick={() => handleRecordClick(log)} divider>
                      <ListItemText
                        primary={`Category: ${categoryNames[log.category_id] || 'Unknown'}`}
                        style={{ width: '175px' }}
                      />
                      <ListItemText
                        primary={`Hospital: ${log.hospital}`}
                        secondary={`Doctor Email: ${log.doctor_email}`}
                        style={{ width: '345px' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No records found.</Typography>
              )}
            </>
          )}

          {selectedRecord && (
            <Box sx={{ textAlign: 'left', pl: 2 }}>
              
              {/* Record Metadata */}
              <Box sx={{ mt: 3 }}>
                <Typography><strong>Category:</strong> {categoryNames[selectedRecord.category_id] || 'Unknown'}</Typography>
                <Typography><strong>Doctor Email:</strong> {selectedRecord.doctor_email}</Typography>
                <Typography><strong>Hospital:</strong> {selectedRecord.hospital}</Typography>
                <Typography><strong>Date:</strong> {formatDate(selectedRecord.createdAt)}</Typography>
              </Box>

              {/* Doctor's Notes Section */}
              <Box sx={{ mb: 4, mt:3 }}>
                <Typography variant="h6" gutterBottom>Doctor's Notes</Typography>
                <Paper elevation={3} sx={{ p: 2, backgroundColor: '#f5f5f5', ml:-2  }}>
                  {selectedRecord.description.includes('[DoctorNote:"') ? (
                    <Typography>
                      {selectedRecord.description.split('[DoctorNote:"')[1].split('"]')[0]}
                    </Typography>
                  ) : (
                    <Typography>No doctor notes available</Typography>
                  )}
                </Paper>
              </Box>

              {/* Blood Test Results Section */}
              <Box>
                <Typography variant="h6" gutterBottom>Blood Test Results</Typography>
                <Paper elevation={3} sx={{ p: 2, ml:-2 }}>
                  {selectedRecord.description.includes('{Bloodtest}') ? (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                      gap: 2 
                    }}>
                      {selectedRecord.description
                        .split('{Bloodtest}')[1]  // Get everything after {Bloodtest}
                        .split(']')[0]            // Get everything before the closing ]
                        .split('/')               // Split by parameters
                        .filter(item => item.includes(':'))  // Only include items with values
                        .map(item => {
                          // Clean up each parameter-value pair
                          const [parameter, value] = item.split(':').map(s => s.replace(/"/g, '').trim());
                          return (
                            <Box key={parameter} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography sx={{ fontWeight: 'bold' }}>{parameter}:</Typography>
                              <Typography>{value}</Typography>
                            </Box>
                          );
                        })}
                    </Box>
                  ) : (
                    <Typography>No blood test results available</Typography>
                  )}
                </Paper>
              </Box>

              <Box sx={{ mb: 4, mt:3 }}>
                <Typography variant="h6" gutterBottom>AI Predicted Result</Typography>
                <Paper elevation={3} sx={{ p: 2, backgroundColor: '#f5f5f5', ml:-2  }}>
                  {selectedRecord.description.includes('[DoctorNote:"') ? (
                    <Typography>
                      {selectedRecord.description.split('[DoctorNote:"')[1].split('"]')[0]}
                    </Typography>
                  ) : (
                    <Typography>No doctor notes available</Typography>
                  )}
                </Paper>
              </Box>

              <ContainedButtons 
                text="Back to Records" 
                onClick={() => setSelectedRecord(null)} 
                sx={{ mt: 3 }}
              />
            </Box>
          )}
        </Paper>
      )}

      {selectedSection === 'appointments' && (
        <Paper mt={4} sx={{ marginTop: '100px' }}>
          <Typography variant="h4" gutterBottom>Appointments</Typography>
          {userAppointments.length > 0 ? (
            <List>
              {userAppointments.map(appointment => (
                <ListItem key={appointment._id} divider>
                  <ListItemText
                    primary={`Date: ${formatDate(appointment.date)}`}
                    secondary={`Details: ${appointment.description}`}
                    style={{ width: '200px' }}
                  />
                  <ListItemText
                    primary={`Hospital: ${appointment.hospital}`}
                    secondary={`Doctor Email: ${appointment.doctor_email}`}
                    style={{ width: '400px' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No appointments found.</Typography>
          )}
        </Paper>
      )}
    </Container>
  );

  return (
    <div>
      <ResponsiveAppBar />
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            backgroundColor: '#008A88',
          }}
        >
          <List>
            {['profile', 'records', 'appointments'].map(section => (
              <ListItem 
                key={section} 
                onClick={() => handleSectionClick(section)}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#006666',
                  }
                }}
              >
                <ListItemText 
                  primary={section.charAt(0).toUpperCase() + section.slice(1)} 
                  primaryTypographyProps={{ color: 'inherit' }}
                />
              </ListItem>
            ))}
            <ListItem 
              onClick={handleLogoutClick}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: '#006666',
                }
              }}
            >
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ color: 'inherit' }}
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          {renderProfileSection()}
        </Box>
      </Box>
    </div>
  );
}

export default Profile;
