import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress, Alert, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';

const API_URL = "http://127.0.0.1:5001/chat";
const RECORDS_UPDATE_URL = "http://127.0.0.1:5001/update-records";

const HealthAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm HemaguardGPT, your AI medical assistant specializing in blood diseases and hematology. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [userRecords, setUserRecords] = useState(null);
  const [showRecordOptions, setShowRecordOptions] = useState(false);
  const chatEndRef = useRef(null);
  const userEmail = localStorage.getItem('useremail');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Fetch user records when component mounts
    const fetchUserRecords = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/logs/${userEmail}`);
        if (!response.ok) throw new Error('Failed to fetch records');
        
        const records = await response.json();
        if (records.length > 0) {
          // Format the records for the chatbot
          const formattedRecords = records.map(record => {
            return record.description; // This contains the structured medical data
          }).join('\n\n');
          
          setUserRecords(formattedRecords);
          
          // Send records to chatbot backend
          await fetch(RECORDS_UPDATE_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: userEmail,
              records: formattedRecords 
            })
          });
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };
    
    if (userEmail) {
      fetchUserRecords();
    }
  }, [userEmail]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: 'user', text: input.trim() };
    const currentInput = input.trim();
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setConnectionError(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: currentInput,
          email: userEmail // Include user email to fetch their records
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const botText = data.response || data.error || 'Sorry, something went wrong.';
      
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
      
    } catch (error) {
      console.error('Chat error:', error);
      setConnectionError(true);
      
      let errorMessage = 'Network error. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again with a shorter message.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the medical assistant. Please check if the backend server is running on port 5001.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Medical assistant endpoint not found. Please contact support.';
      } else if (error.message.includes('500')) {
        errorMessage = 'The medical assistant encountered an error. Please try again later.';
      }
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: errorMessage,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRecords = async () => {
    if (!userRecords) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "I couldn't find any medical records to analyze. Please upload or provide your test results.",
        isError: true
      }]);
      return;
    }
    
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: "Please analyze my medical records and give me recommendations."
    }]);
    
    setLoading(true);
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: "Analyze my medical records",
          email: userEmail
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const botText = data.response || 'Here is my analysis of your records:';
      
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Failed to analyze records. Please try again.',
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 500, width: '100%' }}>
      {connectionError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Connection issues detected. Make sure the Flask backend is running on port 5001.
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ flex: 1, p: 2, overflowY: 'auto', mb: 2, background: '#f4f6fa' }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Box
              sx={{
                bgcolor: msg.sender === 'user' 
                  ? '#008A88' 
                  : msg.isError 
                    ? '#ffebee' 
                    : '#e0e0e0',
                color: msg.sender === 'user' 
                  ? 'white' 
                  : msg.isError 
                    ? '#c62828' 
                    : 'black',
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: '70%',
                border: msg.isError ? '1px solid #f44336' : 'none'
              }}
            >
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </Typography>
            </Box>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              HemaguardGPT is thinking...
            </Typography>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Paper>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {userRecords && (
          <Button
            variant="contained"
            startIcon={<MedicalInformationIcon />}
            onClick={() => setShowRecordOptions(!showRecordOptions)}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' }
            }}
          >
            Medical Records Options
          </Button>
        )}
        
        {showRecordOptions && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            p: 1,
            bgcolor: '#e8f5e9',
            borderRadius: 1
          }}>
            <Button
              variant="contained"
              onClick={handleAnalyzeRecords}
              disabled={loading}
              sx={{ 
                bgcolor: '#008A88',
                '&:hover': { bgcolor: '#006666' }
              }}
            >
              Analyze All Records
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setInput(prev => `Here are my latest test results: ${userRecords.split('\n\n')[0]}\n\nCan you explain them to me?`);
                setShowRecordOptions(false);
              }}
              disabled={loading}
            >
              Ask About Latest Test
            </Button>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Ask about blood tests, symptoms, or medical conditions..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={3}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            sx={{ 
              bgcolor: '#008A88',
              color: 'white',
              '&:hover': {
                bgcolor: '#006666'
              },
              '&:disabled': {
                bgcolor: '#cccccc'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default HealthAssistant;