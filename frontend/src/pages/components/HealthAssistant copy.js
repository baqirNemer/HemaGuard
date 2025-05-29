// components/HealthAssistant.js
import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const HealthAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm your Health Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Replace this with your backend AI API call
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "I'm an AI assistant. This is a placeholder response." }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 500, width: '100%' }}>
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
                bgcolor: msg.sender === 'user' ? '#008A88' : '#e0e0e0',
                color: msg.sender === 'user' ? 'white' : 'black',
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: '70%'
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        <div ref={chatEndRef} />
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <IconButton color="primary" onClick={handleSend} disabled={loading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default HealthAssistant;
