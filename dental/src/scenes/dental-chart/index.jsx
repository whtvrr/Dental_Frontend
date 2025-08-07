import React from 'react';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { DentalChart } from '../../components/dental-chart';

const DentalChartPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // In a real app, you'd get this from URL params or context
  const patientId = 'patient-123';

  return (
    <Box m="20px">
      <Header 
        title="ЗУБНАЯ ФОРМУЛА" 
        subtitle="Интерактивная карта состояния зубов пациента" 
      />
      
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <DentalChart patientId={patientId} />
      </Box>
    </Box>
  );
};

export default DentalChartPage;