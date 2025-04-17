import React, { useState, useEffect } from 'react';
import { CircularProgress, TextField, Button, Typography, List, ListItem, ListItemText, Grid } from '@mui/material';
import ResponsiveAppBar from './Navbar';

const HealthSearch = () => {
  const [drugQuery, setDrugQuery] = useState('');
  const [nutritionQuery, setNutritionQuery] = useState('');
  const [drugInfo, setDrugInfo] = useState(null);
  const [nutritionData, setNutritionData] = useState([]);
  const [loadingDrug, setLoadingDrug] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  const fetchDrugInfo = async () => {
    if (!drugQuery) return;

    setLoadingDrug(true);
    try {
      const response = await fetch(`https://drug-info-and-price-history.p.rapidapi.com/1/druginfo?drug=${drugQuery}`, {
        headers: {
          'X-RapidAPI-Key': 'e83806bf41msh6b12c8c07cc7369p1338e3jsncafcc7eb46b0',
          'X-RapidAPI-Host': 'drug-info-and-price-history.p.rapidapi.com'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDrugInfo(data);
      } else {
        console.error('Failed to fetch drug info');
      }
    } catch (error) {
      console.error('Error fetching drug info:', error);
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
        console.log(data);
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
              Get Drug Info
            </Button>
            {drugInfo && drugInfo.length > 0 && (
              <List>
                {drugInfo.map((item, index) => (
                  <ListItem key={index}>
                    <div>
                      <ListItemText
                        primary={<strong>{item.generic_name}</strong>}
                        secondary={`Brand Name: ${item.brand_name}`}
                      />
                      <ListItemText
                        secondary={`Labeler Name: ${item.labeler_name}`}
                      />
                      <ListItemText
                        secondary={`Product Type: ${item.product_type}`}
                      />
                      <ListItemText
                        secondary={`Dosage Form: ${item.dosage_form}`}
                      />
                      <ListItemText
                        secondary={`Listing Expiration Date: ${item.listing_expiration_date}`}
                      />
                      <ListItemText
                        secondary={`Marketing Category: ${item.marketing_category}`}
                      />
                      <ListItemText
                        secondary={`Marketing Start Date: ${item.marketing_start_date}`}
                      />
                      <ListItemText
                        secondary={`Product NDC: ${item.product_ndc}`}
                      />
                    </div>

                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          {/* Right Column - Nutrition Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Nutrition Information
            </Typography>
            <TextField
              label="Enter food query"
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
              Get Nutrition Info
            </Button>
            {nutritionData.length > 0 && (
              <List>
                {nutritionData.map((item, index) => (
                  <ListItem key={index}>
                    <div>
                      <ListItemText
                        primary={<strong>{item.name}</strong>}
                        secondary={`Calories: ${item.calories}`}
                      />
                      <ListItemText
                        secondary={`Total Fat (g): ${item.fat_total_g}`}
                      />
                      <ListItemText
                        secondary={`Protein (g): ${item.protein_g}`}
                      />
                      <ListItemText
                        secondary={`Carbohydrates (g): ${item.carbohydrates_total_g}`}
                      />
                      <ListItemText
                        secondary={`Cholesterol (mg): ${item.cholesterol_mg}`}
                      />
                      <ListItemText
                        secondary={`Saturated Fat (g): ${item.fat_saturated_g}`}
                      />
                      <ListItemText
                        secondary={`Fiber (g): ${item.fiber_g}`}
                      />
                      <ListItemText
                        secondary={`Potassium (mg): ${item.potassium_mg}`}
                      />
                      <ListItemText
                        secondary={`Serving Size (g): ${item.serving_size_g}`}
                      />
                      <ListItemText
                        secondary={`Sodium (mg): ${item.sodium_mg}`}
                      />
                      <ListItemText
                        secondary={`Sugar (g): ${item.sugar_g}`}
                      />
                    </div>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default HealthSearch;
