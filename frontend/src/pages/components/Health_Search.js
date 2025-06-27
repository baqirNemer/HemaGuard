import React, { useState } from 'react';
import { CircularProgress, TextField, Button, Typography, List, ListItem, ListItemText, Grid, Paper, Box } from '@mui/material';
import ResponsiveAppBar from './Navbar';

const HealthSearch = () => {
  const [drugQuery, setDrugQuery] = useState('');
  const [nutritionQuery, setNutritionQuery] = useState('');
  const [drugInfo, setDrugInfo] = useState(null);
  const [nutritionData, setNutritionData] = useState([]);
  const [loadingDrug, setLoadingDrug] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [drugError, setDrugError] = useState(null);

  const fetchDrugInfo = async () => {
    if (!drugQuery) return;

    setLoadingDrug(true);
    setDrugError(null);
    setDrugInfo(null);

    try {
      const encodedDrug = encodeURIComponent(drugQuery);
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?limit=5&search=openfda.brand_name:${encodedDrug}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('No drug information found for this query');
      }
      
      // Consolidate all results into a single object
      const consolidatedInfo = data.results.reduce((acc, result) => {
        // Merge generic names
        if (result.openfda?.generic_name) {
          acc.generic_names = [
            ...new Set([...(acc.generic_names || []), ...result.openfda.generic_name])
          ];
        }
        
        // Merge brand names
        if (result.openfda?.brand_name) {
          acc.brand_names = [
            ...new Set([...(acc.brand_names || []), ...result.openfda.brand_name])
          ];
        }
        
        // Merge manufacturers
        if (result.openfda?.manufacturer_name) {
          acc.manufacturers = [
            ...new Set([...(acc.manufacturers || []), ...result.openfda.manufacturer_name])
          ];
        }
        
        // Merge purposes
        if (result.purpose) {
          acc.purposes = [
            ...new Set([...(acc.purposes || []), ...result.purpose])
          ];
        }
        
        // Merge indications
        if (result.indications_and_usage) {
          acc.indications = [
            ...new Set([...(acc.indications || []), ...result.indications_and_usage])
          ];
        }
        
        // Merge dosage forms
        if (result.openfda?.dosage_form) {
          acc.dosage_forms = [
            ...new Set([...(acc.dosage_forms || []), ...result.openfda.dosage_form])
          ];
        }
        
        // Merge product types
        if (result.openfda?.product_type) {
          acc.product_types = [
            ...new Set([...(acc.product_types || []), ...result.openfda.product_type])
          ];
        }
        
        return acc;
      }, {});
      
      setDrugInfo(consolidatedInfo);
    } catch (error) {
      console.error('Error fetching drug info:', error);
      setDrugError(error.message || 'Failed to fetch drug information');
    } finally {
      setLoadingDrug(false);
    }
  };

  const fetchNutritionData = async () => {
    if (!nutritionQuery) return;

    setLoadingNutrition(true);
    try {
      const response = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${nutritionQuery}`, {
        headers: {
          'X-Api-Key': 'yyGU2frm4rC0C9jEZo5tHA==OYNo15uvurjUqPkB'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNutritionData(data);
      } else {
        console.error('Failed to fetch nutrition data');
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };

  const handleDrugQueryChange = (event) => {
    setDrugQuery(event.target.value);
    setDrugError(null);
  };

  const handleNutritionQueryChange = (event) => {
    setNutritionQuery(event.target.value);
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div style={{ marginLeft:'50px', marginRight:'50px' }}>
        <Typography variant="h3" gutterBottom sx={{marginTop:'30px', marginBottom:'20px'}}>
          Search for Drug and Nutrition Information
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column - Drug Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Drug Information
              </Typography>
              <TextField
                label="Enter drug name"
                variant="outlined"
                fullWidth
                value={drugQuery}
                onChange={handleDrugQueryChange}
                style={{ marginBottom: '16px' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={fetchDrugInfo}
                disabled={!drugQuery || loadingDrug}
                style={{ marginBottom: '16px' }}
              >
                {loadingDrug ? <CircularProgress size={24} /> : 'Get Drug Info'}
              </Button>
              
              {drugError && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {drugError}
                </Typography>
              )}
              
              {drugInfo && (
                <Box sx={{ mt: 2, textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ mb: 1, textAlign: 'left' }}>
                    {drugInfo.brand_names?.join(', ') || 'Unknown Brand'}
                  </Typography>
                  
                  <Typography sx={{ textAlign: 'left' }}><strong>Generic Names:</strong> {drugInfo.generic_names?.join(', ') || 'N/A'}</Typography>
                  <Typography sx={{ textAlign: 'left' }}><strong>Manufacturers:</strong> {drugInfo.manufacturers?.join(', ') || 'N/A'}</Typography>
                  <Typography sx={{ textAlign: 'left' }}><strong>Product Types:</strong> {drugInfo.product_types?.join(', ') || 'N/A'}</Typography>
                  <Typography sx={{ textAlign: 'left' }}><strong>Dosage Forms:</strong> {drugInfo.dosage_forms?.join(', ') || 'N/A'}</Typography>
                  
                  <Typography sx={{ mt: 2, textAlign: 'left' }}><strong>Purposes:</strong></Typography>
                  <Box component="ul" sx={{ textAlign: 'left', pl: 2 }}>
                    {drugInfo.purposes?.map((purpose, idx) => (
                      <li key={idx} style={{ textAlign: 'left' }}>{purpose}</li>
                    ))}
                  </Box>
                  
                  <Typography sx={{ mt: 2, textAlign: 'left' }}><strong>Indications:</strong></Typography>
                  <Box component="ul" sx={{ textAlign: 'left', pl: 2 }}>
                    {drugInfo.indications?.map((indication, idx) => (
                      <li key={idx} style={{ textAlign: 'left' }}>{indication}</li>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Nutrition Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Nutrition Information
              </Typography>
              <TextField
                label="Enter food item"
                variant="outlined"
                fullWidth
                value={nutritionQuery}
                onChange={handleNutritionQueryChange}
                style={{ marginBottom: '16px' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={fetchNutritionData}
                disabled={!nutritionQuery || loadingNutrition}
                style={{ marginBottom: '16px' }}
              >
                {loadingNutrition ? <CircularProgress size={24} /> : 'Get Nutrition Info'}
              </Button>
              
              {nutritionData.length > 0 && (
                <List>
                  {nutritionData.map((item, index) => (
                    <ListItem key={index} divider>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {item.name || 'Unknown Food'}
                        </Typography>
                        {/* Single column layout for nutrition data */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography><strong>Calories:</strong> {item.calories}</Typography>
                          <Typography><strong>Total Fat:</strong> {item.fat_total_g}g</Typography>
                          <Typography><strong>Saturated Fat:</strong> {item.fat_saturated_g}g</Typography>
                          <Typography><strong>Protein:</strong> {item.protein_g}g</Typography>
                          <Typography><strong>Carbs:</strong> {item.carbohydrates_total_g}g</Typography>
                          <Typography><strong>Sugar:</strong> {item.sugar_g}g</Typography>
                          <Typography><strong>Fiber:</strong> {item.fiber_g}g</Typography>
                          <Typography><strong>Sodium:</strong> {item.sodium_mg}mg</Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default HealthSearch;
