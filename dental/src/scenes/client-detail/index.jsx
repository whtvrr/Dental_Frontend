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
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  LocationOn,
  Cake,
  Edit,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useApi } from '../../hooks/useApi';
import API_CONFIG from '../../config/api';
import DentalChart from '../../components/dental-chart/DentalChart';
import AppointmentDetailsModal from '../../components/AppointmentDetailsModal';
import { translations, translateGender, translateStatus } from '../../utils/translations';
import { exportMedicalDocument } from '../../utils/exportMedicalDocument';

const ClientDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toothConditions, setToothConditions] = useState({});
  const [formulaLoading, setFormulaLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);

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

  const convertFormulaToConditions = (formulaData) => {
    const conditions = {};

    if (!formulaData || !formulaData.teeth) {
      return conditions;
    }

    formulaData.teeth.forEach(tooth => {
      const toothNumber = tooth.number;
      conditions[toothNumber] = {};

      if (tooth.gum && tooth.gum.status_id) {
        conditions[toothNumber].jaw = tooth.gum.status_id;
      }

      if (tooth.whole && tooth.whole.status_id) {
        conditions[toothNumber].crown = tooth.whole.status_id;
      }

      if (tooth.roots && Array.isArray(tooth.roots)) {
        tooth.roots.forEach((root, index) => {
          if (root && root.status_id) {
            conditions[toothNumber][`root_${index + 1}`] = root.status_id;
          }

          // Handle channels within each root
          if (root && root.channels && Array.isArray(root.channels)) {
            root.channels.forEach((channel, channelIndex) => {
              if (channel && channel.status_id) {
                conditions[toothNumber][`channel_${index + 1}_${channelIndex + 1}`] = channel.status_id;
              }
            });
          }
        });
      }

      if (tooth.segments) {
        const segmentMapping = {
          'mid': 'pulp',
          'rt': 'occlusal',
          'rb': 'distal',
          'lb': 'cervical',
          'lt': 'mesial'
        };

        Object.entries(segmentMapping).forEach(([backendKey, frontendKey]) => {
          if (tooth.segments[backendKey] && tooth.segments[backendKey].status_id) {
            conditions[toothNumber][frontendKey] = tooth.segments[backendKey].status_id;
          }
        });
      }
    });

    return conditions;
  };

  const fetchUserFormula = async () => {
    if (formulaLoading) return; // Prevent multiple simultaneous calls

    setFormulaLoading(true);
    setToothConditions({}); // Reset conditions while loading

    try {
      const response = await api.get(`/formulas/user/${id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data) {
          const conditions = convertFormulaToConditions(data.data);
          setToothConditions(conditions);
          console.log('Loaded dental formula for user:', id);
          console.log('Raw formula data:', data.data);
          console.log('Converted conditions:', conditions);
        } else {
          console.log('No formula data found for this user');
          setToothConditions({});
        }
      } else {
        console.log('No formula found for this user, response status:', response.status);
        setToothConditions({});
      }
    } catch (err) {
      console.error('Failed to fetch user formula:', err);
      setToothConditions({});
    } finally {
      setFormulaLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return translations.notSpecified;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
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

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.CLIENT}/${id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.appointments) {
          setAppointments(data.data.appointments);
        } else {
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

  const fetchClientsAndDoctors = async () => {
    try {
      const [clientsResponse, doctorsResponse] = await Promise.all([
        api.get(API_CONFIG.ENDPOINTS.USERS.CLIENTS + '?offset=0&limit=1000'),
        api.get(API_CONFIG.ENDPOINTS.USERS.DOCTORS + '?offset=0&limit=1000')
      ]);

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        if (clientsData.status === 200 && clientsData.data && clientsData.data.clients) {
          setClients(clientsData.data.clients);
        }
      }

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        if (doctorsData.status === 200 && doctorsData.data && doctorsData.data.doctors) {
          setDoctors(doctorsData.data.doctors);
        }
      }
    } catch (error) {
      console.error('Error fetching clients and doctors:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    if (newValue === 1 && appointments.length === 0) {
      fetchAppointments();
      fetchClientsAndDoctors();
    } else if (newValue === 2) {
      // Always fetch formula when dental chart tab is selected
      fetchUserFormula();
    }
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  const handleExportMedicalDocument = (appointment, event) => {
    event.stopPropagation(); // Prevent opening appointment details modal

    // Find doctor data
    const doctor = doctors.find(d => d.id === appointment.doctor_id) || {
      full_name: 'Не указано'
    };

    // Export the document
    exportMedicalDocument(appointment, client, doctor);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.full_name : `${translations.client} ${clientId.slice(-4)}`;
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.full_name : `${translations.doctor} ${doctorId.slice(-4)}`;
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return translations.notSpecified;
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    return translateStatus(status);
  };

  if (loading) {
    return (
      <Box m={isMobile ? "10px" : "20px"} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, color: colors.grey[100] }}>
          {translations.loadingClientDetails}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={isMobile ? "10px" : "20px"}>
        <Header title={translations.clientDetails} subtitle={translations.clientInfo} />
        <Alert severity="error" sx={{ mt: 2 }}>
          {translations.error}: {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2, color: colors.grey[100] }}
        >
          {translations.backToClients}
        </Button>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box m={isMobile ? "10px" : "20px"}>
        <Header title={translations.clientDetails} subtitle={translations.clientInfo} />
        <Alert severity="warning" sx={{ mt: 2 }}>
          {translations.noDataFound}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mt: 2, color: colors.grey[100] }}
        >
          {translations.backToClients}
        </Button>
      </Box>
    );
  }

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        mb={3}
        sx={{
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0
        }}
      >
        <Header
          title={translations.clientDetails}
          subtitle={`${translations.clientInfo}: ${client.full_name}`}
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
            {translations.backToClients}
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
            {translations.editClient}
          </Button>
        </Box>
      </Box>

      {/* Client Information Card */}
      <Card sx={{ backgroundColor: colors.primary[400], mb: 3 }}>
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
                label={client.role?.toUpperCase() || translations.client.toUpperCase()}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderColor: colors.grey[600] }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <Phone sx={{ color: colors.blueAccent[500], mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color={colors.grey[300]}>
                    {translations.phoneNumber}
                  </Typography>
                  <Typography variant="body1" color={colors.grey[100]}>
                    {client.phone_number || translations.notSpecified}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOn sx={{ color: colors.redAccent[500], mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color={colors.grey[300]}>
                    {translations.address}
                  </Typography>
                  <Typography variant="body1" color={colors.grey[100]}>
                    {client.address || translations.notSpecified}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <Person sx={{ color: colors.greenAccent[500], mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color={colors.grey[300]}>
                    {translations.gender}
                  </Typography>
                  <Chip
                    label={translateGender(client.gender)}
                    color={client.gender === 'male' ? 'primary' : client.gender === 'female' ? 'secondary' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <Cake sx={{ color: colors.blueAccent[400], mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color={colors.grey[300]}>
                    {translations.birthDate}
                  </Typography>
                  <Typography variant="body1" color={colors.grey[100]}>
                    {formatDate(client.birth_date)}
                    {client.birth_date && (
                      <Typography variant="body2" color={colors.grey[300]} component="span" sx={{ ml: 1 }}>
                        ({translations.age}: {calculateAge(client.birth_date)})
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Different Sections */}
      <Paper sx={{ backgroundColor: colors.primary[400] }}>
        <Box sx={{ borderBottom: 1, borderColor: colors.grey[600] }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: colors.grey[300],
                '&.Mui-selected': {
                  color: colors.blueAccent[400],
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.blueAccent[400],
              },
            }}
          >
            <Tab
              label={translations.overview}
              icon={<Person />}
              iconPosition="start"
            />
            <Tab
              label={translations.appointments}
              icon={<EventIcon />}
              iconPosition="start"
            />
            <Tab
              label={translations.dentalChart}
              icon={<MedicalIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" color={colors.grey[100]} gutterBottom>
                {translations.overview}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                Полная информация о клиенте отображается выше. Используйте вкладки для просмотра записей и зубной карты.
              </Typography>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" color={colors.grey[100]} gutterBottom>
                {translations.appointmentsHistory}
              </Typography>
              {appointmentsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="body1" color={colors.grey[400]}>
                    {translations.loadingAppointments}
                  </Typography>
                </Box>
              ) : appointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 64, color: colors.grey[500], mb: 2 }} />
                  <Typography variant="h6" color={colors.grey[400]}>
                    {translations.noAppointments}
                  </Typography>
                  <Typography variant="body2" color={colors.grey[500]}>
                    {translations.noAppointmentsDesc}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {appointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id || index}>
                      <ListItem
                        sx={{
                          backgroundColor: index % 2 === 0 ? colors.primary[500] : colors.primary[400],
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: colors.blueAccent[800],
                            transform: 'translateY(-1px)',
                            boxShadow: theme.shadows[4]
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <ListItemIcon>
                          <EventIcon sx={{ color: colors.blueAccent[400] }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" color={colors.grey[100]}>
                                Dr. {getDoctorName(appointment.doctor_id)} - {formatDate(appointment.date_time)} at {formatTime(appointment.date_time)}
                              </Typography>
                              <Chip
                                label={getStatusText(appointment.status)}
                                color={getStatusColor(appointment.status)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color={colors.grey[300]}>
                                {translations.duration}: {appointment.duration_minutes || translations.notSpecified} {translations.minutes}
                              </Typography>
                              {appointment.comment && (
                                <Typography variant="body2" color={colors.grey[400]} sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                  "{appointment.comment}"
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        {/* Export button for completed appointments */}
                        {appointment.status === 'completed' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={(e) => handleExportMedicalDocument(appointment, e)}
                            sx={{
                              ml: 2,
                              borderColor: colors.greenAccent[400],
                              color: colors.greenAccent[400],
                              '&:hover': {
                                borderColor: colors.greenAccent[300],
                                backgroundColor: colors.greenAccent[900],
                              },
                            }}
                          >
                            Экспорт документа
                          </Button>
                        )}
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" color={colors.grey[100]} gutterBottom>
                {translations.dentalChart}
              </Typography>
              {formulaLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="body1" color={colors.grey[400]}>
                    {translations.loadingDentalChart}
                  </Typography>
                </Box>
              ) : Object.keys(toothConditions).length > 0 ? (
                <DentalChart
                  patientId={id}
                  toothConditions={toothConditions}
                  readOnly={true}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MedicalIcon sx={{
                    fontSize: 64,
                    color: colors.grey[500],
                    mb: 2
                  }} />
                  <Typography variant="h6" color={colors.grey[400]}>
                    {translations.noDentalChart}
                  </Typography>
                  <Typography variant="body2" color={colors.grey[500]}>
                    {translations.noDentalChartDesc}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        open={appointmentDetailsOpen}
        onClose={() => setAppointmentDetailsOpen(false)}
        appointment={selectedAppointment}
        clientName={client?.full_name || 'Unknown Client'}
        doctorName={selectedAppointment ? getDoctorName(selectedAppointment.doctor_id) : ''}
        onRefresh={fetchAppointments}
      />
    </Box>
  );
};

export default ClientDetail;