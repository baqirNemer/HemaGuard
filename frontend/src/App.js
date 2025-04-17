import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import AddLocation from './pages/AddLocation';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Hospitals from './pages/Hospitals';
import HospitalDetails from './pages/HospitalDetails';
import ContactUs from './pages/ContactUs';
import HealthSearch from './pages/components/Health_Search';
import BookAppointment from './pages/BookAppointment';
import About from './pages/About';
import AnemiaDetection from './pages/AnemiaDetection';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/addlocation" element={<AddLocation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profileEdit" element={<ProfileEdit />} />
          <Route path="/anemia_detection" element={<AnemiaDetection />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospital_details/:id" element={<HospitalDetails />} /> 
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/health_search" element={<HealthSearch/>} />
          <Route path="/bookappointment/:id" element={<BookAppointment />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
