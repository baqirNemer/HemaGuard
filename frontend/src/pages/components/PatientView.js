import React from 'react';
import { Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import SearchBar from './SearchBar_filter';
import ContainedButtons from './Button';

const PatientView = ({ 
  logs, 
  categoryNames, 
  filteredLogs, 
  selectedRecord, 
  handleRecordClick, 
  handleSearchChange, 
  setSelectedRecord,
  formatDate,
}) => {
  // Helper function to extract AI predicted results
  const extractAIPredictedResult = (description) => {
    const result = {};
    const pattern = /\[(InfectionType|AnemiaType|DeficiencyType):({.*?})\]/g;
    let match;
    
    while ((match = pattern.exec(description)) !== null) {
      try {
        result[match[1]] = JSON.parse(match[2]);
      } catch (e) {
        console.error("Error parsing AI result:", e);
      }
    }
    return result;
  };

  return (
    <Paper mt={4} sx={{ marginTop: '100px', alignItems: 'center' }}>
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
          <Box sx={{ mt: 3 }}>
            <Typography><strong>Category:</strong> {categoryNames[selectedRecord.category_id] || 'Unknown'}</Typography>
            <Typography><strong>Doctor Email:</strong> {selectedRecord.doctor_email}</Typography>
            <Typography><strong>Hospital:</strong> {selectedRecord.hospital}</Typography>
            <Typography><strong>Date:</strong> {formatDate(selectedRecord.createdAt)}</Typography>
          </Box>

          <Box sx={{ mb: 4, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Doctor's Notes</Typography>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#f5f5f5', ml: -2 }}>
              {selectedRecord.description.includes('[DoctorNote:"') ? (
                <Typography>
                  {selectedRecord.description.split('[DoctorNote:"')[1].split('"]')[0]}
                </Typography>
              ) : (
                <Typography>No doctor notes available</Typography>
              )}
            </Paper>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>Blood Test Results</Typography>
            <Paper elevation={3} sx={{ p: 2, ml: -2 }}>
              {selectedRecord.description.includes('{Bloodtest}') ? (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                  gap: 2 
                }}>
                  {selectedRecord.description
                    .split('{Bloodtest}')[1]
                    .split(']')[0]
                    .split('/')
                    .filter(item => item.includes(':'))
                    .map(item => {
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

          {/* Updated AI Predicted Result Section */}
          <Box sx={{ mb: 4, mt: 3 }}>
            <Typography variant="h6" gutterBottom>AI Predicted Result</Typography>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#f5f5f5', ml: -2 }}>
              {(() => {
                const aiResult = extractAIPredictedResult(selectedRecord.description);
                
                if (Object.keys(aiResult).length === 0) {
                  return <Typography>No AI predicted results available</Typography>;
                }

                return (
                  <Box>
                    {/* Infection Type */}
                    {aiResult.InfectionType && (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Infection Type:</Typography>
                        {Object.entries(aiResult.InfectionType)
                          .filter(([_, value]) => value)
                          .map(([label]) => (
                            <Typography key={label} sx={{ pl: 2 }}>• {label}</Typography>
                          ))}
                        {!Object.values(aiResult.InfectionType).some(v => v) && (
                          <Typography sx={{ pl: 2, fontStyle: 'italic' }}>None detected</Typography>
                        )}
                      </Box>
                    )}

                    {/* Anemia Type */}
                    {aiResult.AnemiaType && (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>Anemia Type:</Typography>
                        {Object.entries(aiResult.AnemiaType)
                          .filter(([_, value]) => value)
                          .map(([label]) => (
                            <Typography key={label} sx={{ pl: 2 }}>• {label}</Typography>
                          ))}
                        {!Object.values(aiResult.AnemiaType).some(v => v) && (
                          <Typography sx={{ pl: 2, fontStyle: 'italic' }}>None detected</Typography>
                        )}
                      </Box>
                    )}

                    {/* Deficiency Type */}
                    {aiResult.DeficiencyType && (
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>Deficiency Type:</Typography>
                        {Object.entries(aiResult.DeficiencyType)
                          .filter(([_, value]) => value)
                          .map(([label]) => (
                            <Typography key={label} sx={{ pl: 2 }}>• {label}</Typography>
                          ))}
                        {!Object.values(aiResult.DeficiencyType).some(v => v) && (
                          <Typography sx={{ pl: 2, fontStyle: 'italic' }}>None detected</Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })()}
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
  );
};

export default PatientView;
