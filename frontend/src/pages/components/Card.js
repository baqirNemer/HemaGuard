import React, { useState } from 'react';
import { Card, CardActions, CardContent, CardMedia, Button, Typography, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ImgMediaCard({ hospitalId, imageSrc, title, description, shareDestination }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyUrl = () => {
    const hospitalDetailsUrl = `${window.location.origin}/hospital_details/${hospitalId}`;

    navigator.clipboard.writeText(hospitalDetailsUrl)
      .then(() => {
        toast.success('URL copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy URL');
      });
  };

  const handleShareViaGmail = () => {
    const hospitalDetailsUrl = `${window.location.origin}/hospital_details/${hospitalId}`;
    const emailSubject = `Check out this hospital: ${title}`;
    const emailBody = `I found this hospital and thought you might be interested: ${hospitalDetailsUrl}`;

    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
   
  };

  return (
    <Card sx={{ maxWidth: 345, marginTop: 4, marginBottom: 4 }}>
      <CardMedia component="img" alt="Hospital" height="240" image={imageSrc} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" onClick={handleShareClick}>Share</Button>
        <Button size="small" component={Link} to={`/hospital_details/${hospitalId}`}>Learn More</Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleCopyUrl}>Copy URL</MenuItem>
          <MenuItem onClick={handleShareViaGmail}>Share via Gmail</MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}
