import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  LocationOn,
  Cake,
  Edit,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useApi } from '../../hooks/useApi';
import API_CONFIG from '../../config/api';

const ClientDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const fetchClientDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USERS.DETAIL}/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data) {
          setClient(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch client details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleBack = () => {
    navigate('/contacts');
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit client:', client.id);
  };

  const handleViewAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.CLIENT}/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.appointments) {
          setAppointments(data.data.appointments);
          console.log('Client appointments:', data.data.appointments);
          // TODO: Show appointments in a modal or navigate to appointments view
        } else {
          console.log('No appointments found for this client');
          setAppointments([]);
        }
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching client appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, color: colors.grey[100] }}>
          Loading client details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Header title="CLIENT DETAILS" subtitle="Detailed client information" />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading client details: {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2, color: colors.grey[100] }}
        >
          Back to Clients
        </Button>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box m="20px">
        <Header title="CLIENT DETAILS" subtitle="Detailed client information" />
        <Alert severity="warning" sx={{ mt: 2 }}>
          Client not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2, color: colors.grey[100] }}
        >
          Back to Clients
        </Button>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Header 
          title="CLIENT DETAILS" 
          subtitle={`Detailed information for ${client.full_name}`} 
        />
        <Box display="flex" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              '&:hover': {
                borderColor: colors.grey[100],
                backgroundColor: colors.grey[900],
              },
            }}
          >
            Back to Clients
          </Button>
          <Button
            startIcon={<Edit />}
            onClick={handleEdit}
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[600],
              '&:hover': {
                backgroundColor: colors.greenAccent[700],
              },
            }}
          >
            Edit Client
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Client Information */}
        <Grid item xs={12} md={9}>
          <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: colors.greenAccent[500],
                    fontSize: '2rem',
                    mr: 3,
                  }}
                >
                  <Person fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h3" color={colors.grey[100]} fontWeight="bold">
                    {client.full_name}
                  </Typography>
                  <Chip
                    label={client.role?.toUpperCase() || 'CLIENT'}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: colors.grey[600] }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Phone sx={{ color: colors.blueAccent[500], mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color={colors.grey[300]}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" color={colors.grey[100]}>
                        {client.phone_number || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ color: colors.redAccent[500], mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color={colors.grey[300]}>
                        Address
                      </Typography>
                      <Typography variant="body1" color={colors.grey[100]}>
                        {client.address || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Person sx={{ color: colors.greenAccent[500], mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color={colors.grey[300]}>
                        Gender
                      </Typography>
                      <Chip
                        label={client.gender?.toUpperCase() || 'Not specified'}
                        color={client.gender === 'male' ? 'primary' : client.gender === 'female' ? 'secondary' : 'default'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Cake sx={{ color: colors.blueAccent[400], mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color={colors.grey[300]}>
                        Birth Date
                      </Typography>
                      <Typography variant="body1" color={colors.grey[100]}>
                        {formatDate(client.birth_date)}
                        {client.birth_date && (
                          <Typography variant="body2" color={colors.grey[300]} component="span" sx={{ ml: 1 }}>
                            (Age: {calculateAge(client.birth_date)})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h5" color={colors.grey[100]} gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2, borderColor: colors.grey[600] }} />
              
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  mb: 1,
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  '&:hover': {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
                onClick={() => navigate(`/patients/${client.id}/dental-chart`)}
              >
                View Dental Chart
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  '&:hover': {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
                onClick={handleViewAppointments}
                disabled={appointmentsLoading}
              >
                {appointmentsLoading ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Loading...
                  </Box>
                ) : (
                  'View Appointments'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDetail;