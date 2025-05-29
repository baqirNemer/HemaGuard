import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, Paper, IconButton, List, ListItem, ListItemText } from '@mui/material';
import ResponsiveAppBar from './components/Navbar';
import ContainedButtons from './components/Button';
import { useNavigate } from 'react-router-dom';
import DoctorView from './components/DoctorView';
import PatientView from './components/PatientView';
import DeleteIcon from '@mui/icons-material/Delete';
import HealthAssistant from './components/HealthAssistant';
import axios from 'axios';

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
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newRecord, setNewRecord] = useState({
    patient_email: '',
    category_id: '',
    description: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

        const logsEndpoint = userData.role_name === 'doctor'
          ? `http://localhost:3001/api/doctor-logs/${userEmail}`
          : `http://localhost:3001/api/logs/${userEmail}`;

        const logsResponse = await fetch(logsEndpoint);
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

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRecord = async () => {
    try {
      if (!newRecord.patient_email?.trim()) {
        throw new Error('Patient email is required');
      }
      if (!newRecord.category_id) {
        throw new Error('Category is required');
      }
      if (!newRecord.description?.trim()) {
        throw new Error('Description is required');
      }

      const recordData = {
        patient_email: newRecord.patient_email.trim(),
        doctor_id: "66354f359d4d18b6e9468302",
        category_id: newRecord.category_id,
        description: newRecord.description.trim()
      };

      const response = await fetch('http://localhost:3001/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add record');
      }

      const responseData = await response.json();
      setLogs(prevLogs => [...prevLogs, responseData]);
      setNewRecord({ patient_email: '', category_id: '', description: '' });
      alert('Record added successfully!');

    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:3001/api/appointments/${appointmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setUserAppointments(prev => prev.filter(a => a._id !== appointmentId));
        alert('Appointment canceled successfully');
      }
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const [doctorAppointments, setDoctorAppointments] = useState([]);
  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      try {
        const userEmail = localStorage.getItem('useremail');
        const doctorResponse = await fetch(
          `http://localhost:3001/api/doctors/email/${encodeURIComponent(userEmail)}`
        );
        if (!doctorResponse.ok) {
          throw new Error('Failed to fetch doctor info');
        }
        const doctor = await doctorResponse.json();
        const appointmentsResponse = await fetch(
          `http://localhost:3001/api/appointments?doctor_id=${doctor._id}`
        );
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const appointmentsData = await appointmentsResponse.json();
        setDoctorAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching doctor appointments:', error);
      }
    };

    if (userDetails?.role_name === 'doctor') {
      fetchDoctorAppointments();
    }
  }, [userDetails]);

  // --------- SIDEBAR LOGIC STARTS HERE ---------
  const sidebarSections = userDetails?.role_name === 'doctor'
    ? [
        { key: 'profile', label: 'Profile' },
        { key: 'records', label: 'Create Record' }
      ]
    : [
        { key: 'profile', label: 'Profile' },
        { key: 'records', label: 'Records' },
        { key: 'appointments', label: 'Appointments' },
        { key: 'assistant', label: 'Health Assistant' }
      ];

  // --------- MAIN CONTENT ---------
  const renderProfileSection = () => (
    <Container Width='80%'>
      {selectedSection === 'profile' && userDetails && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '100px', marginLeft:'20%' }}>
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
        userDetails?.role_name === 'doctor' ? (
          <DoctorView
            logs={logs}
            categoryNames={categoryNames}
            categories={categories}
            filteredLogs={filteredLogs}
            selectedRecord={selectedRecord}
            newRecord={newRecord}
            handleNewRecordChange={handleNewRecordChange}
            handleAddRecord={handleAddRecord}
            handleRecordClick={handleRecordClick}
            handleSearchChange={handleSearchChange}
            setSelectedRecord={setSelectedRecord}
            formatDate={formatDate}
            appointments={doctorAppointments}
            handleDeleteAppointment={handleDeleteAppointment}
            title="Create Record"
          />
        ) : (
          <PatientView
            logs={logs}
            categoryNames={categoryNames}
            filteredLogs={filteredLogs}
            selectedRecord={selectedRecord}
            handleRecordClick={handleRecordClick}
            handleSearchChange={handleSearchChange}
            setSelectedRecord={setSelectedRecord}
            formatDate={formatDate}
          />
        )
      )}

      {selectedSection === 'appointments' && (
        <Paper mt={4} sx={{ marginTop: '100px' }}>
          <Typography variant="h4" gutterBottom>Appointments</Typography>
          {userAppointments.length > 0 ? (
            <List>
              {userAppointments.map(appointment => (
                <ListItem 
                  key={appointment._id} 
                  divider
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this appointment?')) {
                          handleDeleteAppointment(appointment._id);
                        }
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`Date: ${formatDate(appointment.date)}`}
                    secondary={`Time: ${appointment.time}`}
                    style={{ width: '200px' }}
                  />
                  <ListItemText
                    primary={`Hospital: ${appointment.hospital}`}
                    secondary={`Doctor: ${appointment.doctor_email}`}
                    style={{ width: '400px' }}
                  />
                  <ListItemText
                    primary={`Status: ${appointment.status}`}
                    secondary={`Reason: ${appointment.description}`}
                    style={{ width: '300px' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No appointments found.</Typography>
          )}
        </Paper>
      )}

      {selectedSection === 'assistant' && (
        <Container maxWidth="80%" sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>Health Assistant</Typography>
          <HealthAssistant />
        </Container>
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
            {sidebarSections.map(section => (
              <ListItem
                key={section.key}
                onClick={() => handleSectionClick(section.key)}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#006666',
                  }
                }}
              >
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{
                    fontWeight: selectedSection === section.key ? 'bold' : 'normal',
                    color: 'white'
                  }}
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
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  color: 'white'
                }}
              />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          {renderProfileSection()}
        </Box>
      </Box>
    </div>
  );
}

export default Profile;
