import React from 'react';
import { Box, TextField, Grid, useTheme } from '@mui/material';
import { tokens } from '../../theme';

const ColorPicker = ({ value, onChange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const presetColors = [
    '#ffffff', '#ff4081', '#9c9cff', '#d0d0ff', 
    '#000000', '#424242', '#757575', '#e0e0e0',
    '#ffb3ba', '#ff8a95', '#ffd700', '#fff176',
    '#87ceeb', '#90caf9', '#81c784', '#a5a5a5'
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={1}>
        {presetColors.map((color) => (
          <Grid item key={color}>
            <Box
              onClick={() => onChange(color)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: color,
                border: `3px solid ${value === color ? colors.blueAccent[400] : colors.grey[500]}`,
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  borderColor: colors.blueAccent[300]
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
      
      <TextField
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{ 
          width: 120,
          '& .MuiInputBase-input': {
            color: colors.grey[100]
          },
          '& .MuiInputLabel-root': {
            color: colors.grey[300]
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.grey[600]
            },
            '&:hover fieldset': {
              borderColor: colors.grey[500]
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.blueAccent[400]
            }
          }
        }}
        label="Пользовательский"
      />
    </Box>
  );
};

export default ColorPicker;