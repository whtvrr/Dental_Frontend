import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { tokens } from '../theme';
import { useTheme } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[500]} 100%)`
            : `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.grey[100]} 100%)`,
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: colors.greenAccent[500],
            mb: 3 
          }} 
        />
        <Typography 
          variant="h5" 
          color={colors.grey[100]}
          fontWeight="500"
        >
          Loading...
        </Typography>
        <Typography 
          variant="body2" 
          color={colors.grey[400]}
          mt={1}
        >
          Checking authentication
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;