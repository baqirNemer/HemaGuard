import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';

export default function ContainedButton({ children, to }) {
  return (
    <Stack direction="row" justifyContent="center" spacing={2}>
      <Button component={Link} to={to} variant="contained" style={{ backgroundColor: '#008A88', color: '#fff' }}>
        {children}
      </Button>
    </Stack>
  );
}
