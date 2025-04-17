

const express = require('express'); //for creating the server
const cors = require('cors'); //for cross origin resource sharing

const mongoose = require('mongoose'); //for connecting to the database
const bodyParser = require('body-parser'); //for parsing the body of the request message

const net = require('net'); //for checking if the port is in use

const User = require('./models/users');
const Location = require('./models/locations');
const Hospital = require('./models/hospitals');
const Categories = require('./models/categories');
const Doctors = require('./models/doctors');
const Logs = require('./models/logs');
const Appointment = require('./models/appointments');

const app = express(); //creating the server

app.use(cors()); //permission to access the server
app.use(bodyParser.json()); //this is to parse the body of the request message


app.get('/', function(req, res) {
    res.send('Hello World!');
  });

app.listen(3001, function() {
    console.log('App listening on port 3001!');
  });

mongoose.connect('mongodb+srv://baqirnemer:123@db.zuvlwa8.mongodb.net/MediRecord')
.then(() => {
console.log('Connected to database!'); 
})
.catch(() => {
console.log("Failed to connect!");
});


const defaultImageUrl = 'https://i.ibb.co/chBcjyv/default-profile-picture-male-icon.png';

app.post('/api/users', async (req, res) => {
  try {
    const { id, pass, f_name, l_name, location_id, email, phone, dob, blood_type, role_name, image } = req.body;
    if (location_id) {
        const locationExists = await Location.exists({ _id: location_id });
        if (!locationExists) {
            return res.status(400).json({ message: 'Location does not exist' });
        }
    }
    const imageUrl = image || defaultImageUrl;
    const user = await User.create({ _id: new mongoose.Types.ObjectId(), id, pass, f_name, l_name, location_id, email, phone, dob, blood_type, role_name, image: imageUrl });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the database
    res.json(users); // Send the users as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
app.post('/api/login', async (req, res) => {
  try {
    const { email, pass } = req.body;

    // Find the user with the provided email
    const user = await User.findOne({ email });

    // Check if user exists and validate password
    if (!user || user.pass !== pass) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Authentication successful
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});
app.get('/api/users/emails', async (req, res) => {
  try {
    const emails = await User.find().select('email'); // Assuming 'User' is your Mongoose model for users
    res.json(emails);
  } catch (error) {
    console.error('Error fetching user emails:', error);
    res.status(500).json({ message: 'Error fetching user emails' });
  }
});
app.get('/api/users/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});
app.get('/api/users/emails', async (req, res) => {
  try {
    const emails = await User.find().select('email'); // Assuming 'User' is your Mongoose model for users
    res.json(emails);
  } catch (error) {
    console.error('Error fetching user emails:', error);
    res.status(500).json({ message: 'Error fetching user emails' });
  }
});
app.put('/api/users/:email', async (req, res) => {
  try {
    const userEmail = req.params.email; // Retrieve email from URL params
    const updatedUserDetails = req.body; // Updated user details sent in the request body

    // Find the user by email and update their details
    const user = await User.findOneAndUpdate({ email: userEmail }, updatedUserDetails, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // Respond with the updated user object
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});


const defaultHospitalImageUrl = 'https://i.ibb.co/fpL4Fwz/194879060-hospital-medical-center-clinic-icon-isolated-on-white-background.jpg';
app.post('/api/hospitals', async (req, res) => {
  try {
    const { location_id, name, phone, image, description } = req.body;
    if (location_id) {
      const locationExists = await Location.exists({ _id: location_id });
      if (!locationExists) {
          return res.status(400).json({ message: 'Location does not exist' });
      }
    }
    const imageUrl = image || defaultHospitalImageUrl;
    const hospital = await Hospital.create({_id: new mongoose.Types.ObjectId(), location_id, name, phone, image: imageUrl, description });
    
    res.status(201).json(hospital);
  } catch (error) {
    console.error('Error creating hospital:', error);
    res.status(500).json({ message: 'Error creating hospital' });
  }
});
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find(); 
    res.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});
app.get('/api/hospitals/:id', async (req, res) => {
  const hospitalId = req.params.id;

  try {
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital by ObjectId:', error);
    res.status(500).json({ message: 'Error fetching hospital' });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const { doctor_email, hospital_id } = req.body;
    
    // Check if the user (doctor) exists based on the provided email
    const userExists = await User.exists({ email: doctor_email });
    const hospitalExists = await Hospital.exists({ _id: hospital_id });

    if (!userExists) {
        return res.status(400).json({ message: 'User (doctor) does not exist' });
    }
    if (!hospitalExists) {
      return res.status(400).json({ message: 'Hospital does not exist' });
    } 

    const user = await User.findOne({ email: doctor_email });2
    const userRole = user.role_name;

    if (userRole !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }

    // Create the doctor entry
    const doctor = await Doctors.create({ doctor_email, hospital_id });
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor' });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const doctors = await Doctors.find({ hospital_id });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});
app.get('/api/doctors/:id', async (req, res) => {
  const doctorId = req.params.id;

  try {
    const doctor = await Doctors.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    res.status(500).json({ message: 'Error fetching doctor' });
  }
});



app.post('/api/locations', async (req, res) => {
  try {
    const { city, street, address1, address2 } = req.body;

     const location = await Location.create({_id: new mongoose.Types.ObjectId(), city, street, address1, address2 });

    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Error creating location' });
  }
});
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find(); 
    res.json(locations);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});
app.get('/api/locations/:id', async (req, res) => {
  const locationId = req.params.id;

  try {
    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location by ObjectId:', error);
    res.status(500).json({ message: 'Error fetching location' });
  }
});


app.post('/api/categories', async (req, res) => {
  try {
    const { cname } = req.body;
    const category = await Categories.create({ _id: new mongoose.Types.ObjectId(), cname });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Categories.find(); 
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});
app.get('/api/categories/:id', async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Categories.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ cname: category.cname }); // Return category name only
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
});


app.post('/api/logs', async (req, res) => {
  try {
    const { patient_email, doctor_id, category_id, description } = req.body;

    const patientExists = await User.exists({ email: patient_email, role_name: 'patient' });
    const doctorExists = await Doctors.exists({ _id: doctor_id });
    const categoryExists = await Categories.exists({ _id: category_id });

    if (!patientExists ) {
        return res.status(400).json({ message: 'Patient does not exist or is not a patient' });
    }
    if (!doctorExists) {
      return res.status(400).json({ message: 'Doctor does not exist' });
    }
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category does not exist' });
    }

    const log = await Logs.create({ _id: new mongoose.Types.ObjectId(), patient_email, doctor_id, category_id, description });
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Error creating log' });
  }
});
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Logs.find(); 
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});
app.get('/api/logs/:email', async (req, res) => {
  try {
    const patient_email = req.params.email; // Access email from URL params

    if (!patient_email) {
      return res.status(400).json({ message: 'Patient email is required' });
    }

    const logs = await Logs.find({ patient_email });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
      const { patient_email, doctor_id, description, date } = req.body;

      // Check if patient exists and is a patient
      const patientExists = await User.exists({ email: patient_email, role_name: 'patient' });
      if (!patientExists) {
          return res.status(400).json({ message: 'Patient does not exist or is not a patient' });
      }

      // Check if doctor exists
      const doctorExists = await Doctors.exists({ _id: doctor_id });
      if (!doctorExists) {
          return res.status(400).json({ message: 'Doctor does not exist' });
      }

      // Create the appointment
      const appointment = await Appointment.create({_id: new mongoose.Types.ObjectId(), patient_email, doctor_id, description, date: new Date(date) });

      res.status(201).json(appointment);
  } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Error creating appointment',error: error.message});
  }
});
app.get('/api/appointments', async (req, res) => {
  try {
      const appointments = await Appointment.find();
      res.json(appointments);
  } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Error fetching appointments' });
  }
});
app.get('/api/appointments/:email', async (req, res) => {
  const { email } = req.params;

  try {
      // Find all appointments for the specified user
      const appointments = await Appointment.find({ patient_email: email });
      res.json(appointments);
  } catch (error) {
      console.error(`Error fetching appointments for ${email}:`, error);
      res.status(500).json({ message: `Error fetching appointments for ${email}` });
  }
});
