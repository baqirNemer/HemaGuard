import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';
import DoctorStats from './DoctorStats';

const DoctorRecordsView = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    recordsByCategory: [],
    recentActivity: [],
    recordsPerPatient: []
  });
  const [tabValue, setTabValue] = useState(0);
  const [timeFilter, setTimeFilter] = useState({
    interval: 'all',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const [newRecord, setNewRecord] = useState({
    patient_email: '',
    category_id: '',
    doctors_note: '',
    pdf_file: null,
    pdf_processing: false
  });

  const [pdfPreview, setPdfPreview] = useState(null);

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorEmail = localStorage.getItem('useremail');
        if (!doctorEmail) throw new Error('No doctor email found');

        const doctorResponse = await axios.get(`http://localhost:3001/api/doctors/email/${doctorEmail}`);
        const doctorId = doctorResponse.data._id;

        const recordsResponse = await axios.get(`http://localhost:3001/api/logs?doctor_id=${doctorId}`);
        setLogs(recordsResponse.data);
        setFilteredLogs(recordsResponse.data);

        const categoriesResponse = await axios.get('http://localhost:3001/api/categories');
        setCategories(categoriesResponse.data);
        
        const namesMap = {};
        categoriesResponse.data.forEach(cat => {
          namesMap[cat._id] = cat.cname;
        });
        setCategoryNames(namesMap);

        calculateStatistics(recordsResponse.data, namesMap);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterLogsByTime = (logs, filter) => {
    if (filter.interval === 'all') return logs;
    
    return logs.filter(log => {
      const logDate = new Date(log.createdAt);
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth() + 1;
      
      if (filter.interval === 'year') {
        return logYear === filter.year;
      } else if (filter.interval === 'month') {
        return logYear === filter.year && logMonth === filter.month;
      }
      return true;
    });
  };

  const calculateStatistics = (logs, categoryMap) => {
    const filtered = filterLogsByTime(logs, timeFilter);
    
    const totalRecords = filtered.length;

    const categoryCounts = {};
    filtered.forEach(log => {
      const categoryName = categoryMap[log.category_id] || 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    const recentActivity = [...filtered]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    const patientCounts = {};
    filtered.forEach(log => {
      patientCounts[log.patient_email] = (patientCounts[log.patient_email] || 0) + 1;
    });

    setStats({
      totalRecords,
      recordsByCategory: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
      recentActivity,
      recordsPerPatient: Object.entries(patientCounts).map(([email, count]) => ({ email, count }))
    });
  };

  const handleTimeFilterChange = (e) => {
    const { name, value } = e.target;
    setTimeFilter(prev => {
      const newFilter = { ...prev, [name]: value };
      
      if (name === 'interval' && value === 'all') {
        return { interval: 'all' };
      }
      
      return newFilter;
    });
  };

  useEffect(() => {
    if (logs.length > 0 && categories.length > 0) {
      calculateStatistics(logs, categoryNames);
    }
  }, [timeFilter, logs, categoryNames]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setNewRecord(prev => ({ ...prev, pdf_file: file }));
        
        const previewUrl = URL.createObjectURL(file);
        setPdfPreview(previewUrl);
      } else {
        setError('Please upload a PDF file only');
      }
    }
  };

  const processPdf = async (pdfFile) => {
    try {
      setNewRecord(prev => ({ ...prev, pdf_processing: true }));
      
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      
      const response = await axios.post('http://localhost:5001/process-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (err) {
      setError('Failed to process PDF: ' + (err.response?.data?.message || err.message));
      return null;
    } finally {
      setNewRecord(prev => ({ ...prev, pdf_processing: false }));
    }
  };

  const formatBloodTestResults = (results) => {
    if (!results) return '';
    
    let bloodTestString = '[{Bloodtest}';
    const bloodTestParams = [
      'GENDER', 'WBC', 'NE', 'LY', 'MO', 'EO', 'BA', 'RBC', 
      'HGB', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'PLT', 'MPV', 
      'PCT', 'PDW', 'SD', 'SDTSD', 'TSD', 'FERRITIN', 'FOLATE', 'B12'
    ];
    
    bloodTestParams.forEach(param => {
      if (results[param] !== undefined && results[param] !== null) {
        bloodTestString += `${param}:"${results[param]}"`;
        if (param !== bloodTestParams[bloodTestParams.length - 1]) {
          bloodTestString += '/';
        }
      }
    });
    
    bloodTestString += ']';
    return bloodTestString;
  };

  const handleAddRecord = async () => {
    try {
      const doctorEmail = localStorage.getItem('useremail');
      if (!doctorEmail) throw new Error('No doctor email found');

      const doctorResponse = await axios.get(`http://localhost:3001/api/doctors/email/${doctorEmail}`);
      const doctorId = doctorResponse.data._id;

      let description = `[DoctorNote:"${newRecord.doctors_note}"]`;
      
      if (newRecord.pdf_file) {
        const pdfResults = await processPdf(newRecord.pdf_file);
        if (pdfResults) {
          const bloodTestString = formatBloodTestResults(pdfResults.values);
          description += '\n' + bloodTestString;
          
          if (pdfResults.infection_type) {
            description += `\n[InfectionType:${JSON.stringify(pdfResults.infection_type)}]`;
          }
          if (pdfResults.anemia_type) {
            description += `\n[AnemiaType:${JSON.stringify(pdfResults.anemia_type)}]`;
          }
          if (pdfResults.deficiency_type) {
            description += `\n[DeficiencyType:${JSON.stringify(pdfResults.deficiency_type)}]`;
          }
          if (pdfResults.anemia_name) {
            description += `\n[AnemiaName:${JSON.stringify(pdfResults.anemia_name)}]`;
          }
        }
      }

      const response = await axios.post('http://localhost:3001/api/logs', {
        patient_email: newRecord.patient_email,
        category_id: newRecord.category_id,
        description: description,
        doctor_id: doctorId
      });
      
      const updatedLogs = [...logs, response.data];
      setLogs(updatedLogs);
      setFilteredLogs(updatedLogs);
      calculateStatistics(updatedLogs, categoryNames);
      
      setNewRecord({ 
        patient_email: '', 
        category_id: '', 
        doctors_note: '',
        pdf_file: null,
        pdf_processing: false
      });
      setPdfPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Paper sx={{ marginTop: '100px', p: 3 }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        centered
        sx={{ mb: 4 }}
      >
        <Tab label="Create Record" />
        <Tab label="View Statistics" />
      </Tabs>

      {tabValue === 0 ? (
        <>
          <Typography variant="h4" gutterBottom>Add New Medical Record</Typography>
          
          <Box sx={{ mb: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <TextField
              fullWidth
              label="Patient Email"
              name="patient_email"
              value={newRecord.patient_email}
              onChange={handleNewRecordChange}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={newRecord.category_id}
                onChange={handleNewRecordChange}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.cname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Doctor's Note"
              name="doctors_note"
              value={newRecord.doctors_note}
              onChange={handleNewRecordChange}
              sx={{ mb: 2 }}
              placeholder="Enter your observations and medical recommendations..."
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Blood Test PDF (Optional)
              </Typography>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="pdf-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="pdf-upload">
                <Button 
                  variant="outlined" 
                  component="span"
                  sx={{ mr: 2 }}
                >
                  Choose File
                </Button>
              </label>
              {newRecord.pdf_file && (
                <Typography variant="body2">
                  {newRecord.pdf_file.name}
                </Typography>
              )}
              {pdfPreview && (
                <Box sx={{ mt: 2 }}>
                  <iframe 
                    src={pdfPreview} 
                    width="100%" 
                    height="400px"
                    title="PDF Preview"
                    style={{ border: '1px solid #ddd' }}
                  />
                </Box>
              )}
            </Box>
            
            <Button 
              variant="contained" 
              onClick={handleAddRecord}
              disabled={
                !newRecord.patient_email || 
                !newRecord.category_id || 
                !newRecord.doctors_note ||
                newRecord.pdf_processing
              }
              sx={{ backgroundColor: '#008A88', '&:hover': { backgroundColor: '#006666' } }}
            >
              {newRecord.pdf_processing ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Processing PDF...
                </>
              ) : (
                'Add Record'
              )}
            </Button>
          </Box>
        </>
      ) : (
        <DoctorStats
        stats={stats}
        timeFilter={timeFilter}
        years={years}
        handleTimeFilterChange={handleTimeFilterChange}
      />
      )}
    </Paper>
  );
};

export default DoctorRecordsView;