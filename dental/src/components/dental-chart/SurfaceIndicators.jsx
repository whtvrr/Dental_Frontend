import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { DENTAL_CONDITIONS } from '../../data/dentalConditions';

const SurfaceIndicators = ({ conditions }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const getIndicatorColor = (surface) => {
    const condition = conditions[surface];
    if (!condition) return theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[400];
    return DENTAL_CONDITIONS[condition]?.color || (theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[400]);
  };

  const activeSurfaces = Object.keys(conditions).filter(surface => conditions[surface]);

  if (activeSurfaces.length === 0) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 0.3,
      mt: 0.5,
      maxWidth: 60
    }}>
      {activeSurfaces.slice(0, 6).map((surface) => (
        <Box
          key={surface}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: getIndicatorColor(surface),
            border: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[500] : colors.grey[600]}`,
            boxShadow: `0 1px 2px ${theme.palette.mode === 'dark' ? colors.grey[800] : colors.grey[300]}`
          }}
        />
      ))}
      {activeSurfaces.length > 6 && (
        <Typography variant="caption" sx={{ 
          color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600], 
          fontSize: '0.6rem' 
        }}>
          +{activeSurfaces.length - 6}
        </Typography>
      )}
    </Box>
  );
};

export default SurfaceIndicators;