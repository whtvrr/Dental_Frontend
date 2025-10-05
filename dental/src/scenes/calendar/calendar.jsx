import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { formatDate } from "@fullcalendar/core";
import ruLocale from '@fullcalendar/core/locales/ru';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Button,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Switch,
  FormControlLabel,
  useMediaQuery,
} from "@mui/material";
import { buildApiUrl } from "../../config/api";
import API_CONFIG from "../../config/api";
import { Add, PersonAdd } from "@mui/icons-material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { AuthContext } from "../../context/AuthContext";
import ApiClient from "../../utils/apiClient";
import DentalChart from "../../components/dental-chart/DentalChart";
import { translations, translateStatus } from "../../utils/translations";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const authContext = useContext(AuthContext);
  const apiClient = useMemo(() => new ApiClient(authContext), [authContext]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Helper function to format date as DD.MM.YYYY for API
  const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    client_id: '',
    doctor_id: '',
    date_time: '',
    duration_minutes: 30,
    status: 'scheduled',
    comment: ''
  });
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [diagnosisStatuses, setDiagnosisStatuses] = useState([]);
  const [treatmentStatuses, setTreatmentStatuses] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    anamnesis: '',
    comment: '',
    complaint_id: '',
    custom_complaint: '',
    diagnosis_id: '',
    treatment_id: ''
  });
  const [useCustomComplaint, setUseCustomComplaint] = useState(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [formulaData, setFormulaData] = useState(null);
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientError, setClientError] = useState('');
  const [appointmentData, setAppointmentData] = useState({
    client_id: "",
    comment: "",
    date_time: "",
    doctor_id: "",
    duration_minutes: 30,
    status: "scheduled"
  });
  const [newClientData, setNewClientData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    birth_date: "",
    gender: "male"
  });

  // Fetch clients from API
  const fetchClients = useCallback(async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.CLIENTS + '?offset=0&limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.clients) {
          setClients(data.data.clients);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    }
  }, [apiClient]);

  // Fetch doctors from API  
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.DOCTORS + '?offset=0&limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.doctors) {
          setDoctors(data.data.doctors);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  }, [apiClient]);

  // Fetch appointments based on user role
  const fetchAppointments = useCallback(async (dateInfo = null) => {
    if (!authContext.isAuthenticated || !authContext.user) return;
    
    setAppointmentsLoading(true);
    try {
      let url = API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE + '?offset=0&limit=1000';
      
      // If user is a doctor, fetch only their appointments
      if (authContext.user.role === 'doctor') {
        url = `${API_CONFIG.ENDPOINTS.APPOINTMENTS.DOCTOR}/${authContext.user.id}`;
        
        // Add date range if provided (for calendar view changes)
        if (dateInfo) {
          const { start, end } = dateInfo;
          // Format dates as DD.MM.YYYY as expected by backend
          const fromDate = formatDateForAPI(start);
          const toDate = formatDateForAPI(end);
          url += `?from=${fromDate}&to=${toDate}`;
        }
      }
      
      const response = await apiClient.get(url);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.appointments) {
          setAppointments(data.data.appointments);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [apiClient, authContext.isAuthenticated, authContext.user]);

  // Load appointments, clients and doctors when component mounts
  useEffect(() => {
    if (authContext.isAuthenticated && authContext.user) {
      // Load appointments
      fetchAppointments();
      
      // Load clients and doctors for name resolution
      setLoading(true);
      setError('');
      Promise.all([fetchClients(), fetchDoctors()])
        .finally(() => setLoading(false));
    }
  }, [authContext.isAuthenticated, authContext.user, fetchAppointments, fetchClients, fetchDoctors]);

  // Format appointments for FullCalendar
  const formatAppointmentsForCalendar = useCallback(() => {
    return appointments.map((appointment) => {
      // Find client and doctor names for display
      const client = clients.find(c => c.id === appointment.client_id);
      const doctor = doctors.find(d => d.id === appointment.doctor_id);
      
      const clientName = client ? client.full_name : `Client ${appointment.client_id.slice(-4)}`;
      const doctorName = doctor ? doctor.full_name : `Doctor ${appointment.doctor_id.slice(-4)}`;
      
      // Calculate end time based on duration
      const startTime = new Date(appointment.date_time);
      const endTime = new Date(startTime.getTime() + appointment.duration_minutes * 60000);
      
      // Color based on status
      let backgroundColor = colors.greenAccent[600]; // default scheduled
      let borderColor = colors.greenAccent[500];
      
      switch (appointment.status) {
        case 'confirmed':
          backgroundColor = colors.blueAccent[600];
          borderColor = colors.blueAccent[500];
          break;
        case 'canceled':
          backgroundColor = colors.redAccent[600];
          borderColor = colors.redAccent[500];
          break;
        case 'completed':
          backgroundColor = colors.grey[600];
          borderColor = colors.grey[500];
          break;
        default:
          // Keep default scheduled colors
          break;
      }
      
      return {
        id: appointment.id,
        title: `${clientName} - ${doctorName}`,
        start: appointment.date_time,
        end: endTime.toISOString(),
        backgroundColor,
        borderColor,
        textColor: colors.grey[100],
        extendedProps: {
          client: clientName,
          doctor: doctorName,
          status: appointment.status,
          comment: appointment.comment,
          duration: appointment.duration_minutes,
          clientId: appointment.client_id,
          doctorId: appointment.doctor_id
        }
      };
    });
  }, [appointments, clients, doctors, colors]);

  // Get formatted events for calendar
  const calendarEvents = useMemo(() => {
    return formatAppointmentsForCalendar();
  }, [formatAppointmentsForCalendar]);

  const handleDateClick = (selected) => {
    // Just select the date, don't create appointment automatically
    console.log('Date selected:', selected.startStr);
  };

  const handleEventClick = async (selected) => {
    const appointmentId = selected.event.id;
    await fetchAppointmentDetail(appointmentId);
  };

  // Fetch appointment details and associated user info
  const fetchAppointmentDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      // Fetch appointment details
      const appointmentResponse = await apiClient.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.DETAIL}/${appointmentId}`);
      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json();
        if (appointmentData.status === 200 && appointmentData.data) {
          const appointment = appointmentData.data;
          setSelectedAppointment(appointment);
          
          // Fetch client and doctor details in parallel
          const [clientResponse, doctorResponse] = await Promise.all([
            apiClient.get(`${API_CONFIG.ENDPOINTS.USERS.DETAIL}/${appointment.client_id}`),
            apiClient.get(`${API_CONFIG.ENDPOINTS.USERS.DETAIL}/${appointment.doctor_id}`)
          ]);
          
          // Process client data
          if (clientResponse.ok) {
            const clientData = await clientResponse.json();
            if (clientData.status === 200 && clientData.data) {
              setSelectedClient(clientData.data);
            }
          }
          
          // Process doctor data
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            if (doctorData.status === 200 && doctorData.data) {
              setSelectedDoctor(doctorData.data);
            }
          }
          
          setOpenDetailModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle calendar view changes to fetch appointments for the new date range
  const handleDatesSet = (dateInfo) => {
    // For doctors, refetch appointments when view changes to get date-filtered results
    if (authContext.user && authContext.user.role === 'doctor') {
      fetchAppointments(dateInfo);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError('');
    setAppointmentData({
      client_id: "",
      comment: "",
      date_time: "",
      doctor_id: "",
      duration_minutes: 30,
      status: "scheduled"
    });
  };

  const handleInputChange = (field, value) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientInputChange = (field, value) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenClientModal = () => {
    setOpenClientModal(true);
    setClientError('');
    setNewClientData({
      full_name: "",
      phone_number: "",
      address: "",
      birth_date: "",
      gender: "male"
    });
  };

  const handleCloseClientModal = () => {
    setOpenClientModal(false);
    setClientError('');
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedAppointment(null);
    setSelectedClient(null);
    setSelectedDoctor(null);
  };

  const handleCancelAppointmentClick = () => {
    setCancelConfirmOpen(true);
  };

  const handleCancelAppointmentConfirm = async () => {
    if (!selectedAppointment) return;
    
    setCancelLoading(true);
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}/${selectedAppointment.id}/cancel`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200) {
          // Update the appointment status in state
          setSelectedAppointment(prev => ({
            ...prev,
            status: 'canceled'
          }));
          
          // Refresh appointments list to reflect changes
          await fetchAppointments();
          
          // Close confirmation dialog
          setCancelConfirmOpen(false);
          
          // Force refresh the appointment details to get updated status
          setTimeout(() => {
            if (selectedAppointment?.id) {
              fetchAppointmentDetail(selectedAppointment.id);
            }
          }, 1000);
          
          // Optional: Close detail modal after successful cancellation
          // handleCloseDetailModal();
        } else {
          console.error('Failed to cancel appointment:', data.message);
          setError(data.message || 'Failed to cancel appointment');
        }
      } else {
        console.error('Failed to cancel appointment');
        setError('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setError('Network error. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelAppointmentCancel = () => {
    setCancelConfirmOpen(false);
  };

  const handleEditAppointmentClick = () => {
    if (!selectedAppointment) return;

    // Format date_time for datetime-local input
    const dateTimeValue = new Date(selectedAppointment.date_time).toISOString().slice(0, 16);

    setEditFormData({
      client_id: selectedAppointment.client_id,
      doctor_id: selectedAppointment.doctor_id,
      date_time: dateTimeValue,
      duration_minutes: selectedAppointment.duration_minutes,
      status: selectedAppointment.status,
      comment: selectedAppointment.comment || ''
    });
    setEditModalOpen(true);
  };

  const handleEditAppointmentSubmit = async () => {
    if (!selectedAppointment) return;

    try {
      const formattedData = {
        ...editFormData,
        date_time: new Date(editFormData.date_time).toISOString()
      };

      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}/${selectedAppointment.id}`, formattedData);

      if (response.ok) {
        setEditModalOpen(false);
        await fetchAppointments();
        await fetchAppointmentDetail(selectedAppointment.id);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteAppointmentClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteAppointmentConfirm = async () => {
    if (!selectedAppointment) return;

    setDeleteLoading(true);
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}/${selectedAppointment.id}`);

      if (response.ok) {
        setDeleteConfirmOpen(false);
        handleCloseDetailModal();
        await fetchAppointments();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Network error. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCompleteAppointmentClick = async () => {
    // Load complaints and statuses when opening complete modal
    await fetchComplaintsAndStatuses();
    setCompleteModalOpen(true);
  };

  const handleCompleteAppointmentCancel = () => {
    setCompleteModalOpen(false);
    setCompleteFormData({
      anamnesis: '',
      comment: '',
      complaint_id: '',
      custom_complaint: '',
      diagnosis_id: '',
      treatment_id: ''
    });
    setUseCustomComplaint(false);
    setFormulaData(null);
  };

  const fetchComplaintsAndStatuses = async () => {
    setComplaintsLoading(true);
    try {
      const [complaintsResponse, diagnosisResponse, treatmentResponse] = await Promise.all([
        apiClient.get('/complaints?limit=100&offset=0'),
        apiClient.get('/statuses/diagnosis?limit=100&offset=0'),
        apiClient.get('/statuses/treatment?limit=100&offset=0')
      ]);

      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        if (complaintsData.status === 200 && complaintsData.data && complaintsData.data.complaints) {
          setComplaints(complaintsData.data.complaints);
        }
      }

      if (diagnosisResponse.ok) {
        const diagnosisData = await diagnosisResponse.json();
        if (diagnosisData.status === 200 && diagnosisData.data && diagnosisData.data.statuses) {
          setDiagnosisStatuses(diagnosisData.data.statuses);
        }
      }

      if (treatmentResponse.ok) {
        const treatmentData = await treatmentResponse.json();
        if (treatmentData.status === 200 && treatmentData.data && treatmentData.data.statuses) {
          setTreatmentStatuses(treatmentData.data.statuses);
        }
      }
    } catch (error) {
      console.error('Error fetching complaints and statuses:', error);
      setError('Failed to load medical data');
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleCompleteFormChange = (field, value) => {
    setCompleteFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompleteAppointmentSubmit = async () => {
    if (!selectedAppointment) return;

    setCompleteLoading(true);
    try {
      const completeData = {
        client_id: selectedAppointment.client_id,
        anamnesis: completeFormData.anamnesis,
        comment: completeFormData.comment,
        complaint_id: completeFormData.complaint_id || null,
        custom_complaint: completeFormData.custom_complaint || null,
        diagnosis_id: completeFormData.diagnosis_id || null,
        treatment_id: completeFormData.treatment_id || null,
        formula: formulaData || null
      };

      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}/${selectedAppointment.id}/complete`, completeData);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200) {
          // Update the appointment status in state
          setSelectedAppointment(prev => ({
            ...prev,
            status: 'completed'
          }));
          
          // Refresh appointments list to reflect changes
          await fetchAppointments();
          
          // Close complete modal
          setCompleteModalOpen(false);
          
          // Reset form data
          setCompleteFormData({
            anamnesis: '',
            comment: '',
            complaint_id: '',
            custom_complaint: '',
            diagnosis_id: '',
            treatment_id: ''
          });
          setUseCustomComplaint(false);
          setFormulaData(null);
        } else {
          console.error('Failed to complete appointment:', data.message);
          setError(data.message || 'Failed to complete appointment');
        }
      } else {
        console.error('Failed to complete appointment');
        setError('Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      setError('Network error. Please try again.');
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleCreateClient = async () => {
    setClientLoading(true);
    setClientError('');
    
    try {
      // Format birth date from DD.MM.YYYY to DD.MM.YYYY (keep the same format as expected)
      const formattedClientData = {
        ...newClientData,
        birth_date: newClientData.birth_date
      };

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USERS.BASE, formattedClientData);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 201 && data.data) {
          // Add new client to the clients list
          const newClient = data.data;
          setClients(prev => [...prev, newClient]);
          
          // Auto-select the new client in appointment form
          setAppointmentData(prev => ({
            ...prev,
            client_id: newClient.id
          }));
          
          // Close the client modal
          handleCloseClientModal();
        } else {
          setClientError(data.message || 'Failed to create client');
        }
      } else {
        const errorData = await response.json();
        setClientError(errorData.message || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setClientError('Network error. Please try again.');
    } finally {
      setClientLoading(false);
    }
  };

  const handleSubmitAppointment = async () => {
    try {
      const token = sessionStorage.getItem('access_token');

      // Convert datetime-local to ISO string format expected by backend
      const formattedData = {
        ...appointmentData,
        date_time: new Date(appointmentData.date_time).toISOString()
      };

      const response = await fetch(buildApiUrl('/appointments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointment created successfully:', result);

        // Refresh appointments after successful creation
        await fetchAppointments();

        handleCloseModal();
      } else {
        console.error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      <Header title={translations.calendarTitle} subtitle={translations.calendarSubtitle} />

      <Box
        display="flex"
        justifyContent="space-between"
        sx={{
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0
        }}
      >
        {/* CALENDAR SIDEBAR */}
        <Box
          flex={isMobile ? "none" : "1 1 20%"}
          width={isMobile ? "100%" : "auto"}
          backgroundColor={colors.primary[400]}
          p={isMobile ? "10px" : "15px"}
          borderRadius="4px"
        >
          <Typography variant="h5">{translations.upcomingAppointments}</Typography>
          {appointmentsLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List>
              {calendarEvents
                .filter(event => new Date(event.start) >= new Date())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .slice(0, 5)
                .map((event) => (
                <ListItem
                  key={event.id}
                  onClick={() => fetchAppointmentDetail(event.id)}
                  sx={{
                    backgroundColor: event.backgroundColor,
                    margin: "10px 0",
                    borderRadius: "2px",
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 0.8,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" color={colors.grey[100]}>
                          {formatDate(new Date(event.start), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                          Status: {event.extendedProps?.status?.toUpperCase() || 'SCHEDULED'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {calendarEvents.length === 0 && !appointmentsLoading && (
                <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 2 }}>
                  No appointments found
                </Typography>
              )}
            </List>
          )}
        </Box>

        {/* CALENDAR */}
        <Box
          flex={isMobile ? "none" : "1 1 100%"}
          width={isMobile ? "100%" : "auto"}
          ml={isMobile ? "0" : "15px"}
        >
          {/* Appointment Button */}
          <Box display="flex" justifyContent="flex-end" mb="10px">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenModal}
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.greenAccent[700],
                },
              }}
            >
              {translations.newAppointment}
            </Button>
          </Box>

          <FullCalendar
            height={isMobile ? "60vh" : "75vh"}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: isMobile ? "prev,next" : "prev,next today",
              center: "title",
              right: isMobile ? "dayGridMonth,listMonth" : "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            eventDisplay="block"
            eventOverlap={true}
            slotEventOverlap={false}
            select={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            events={calendarEvents}
            loading={appointmentsLoading}
            locale={ruLocale}
            buttonText={{
              today: translations.today,
              month: translations.month,
              week: translations.week,
              day: translations.day,
              list: translations.list
            }}
            eventDidMount={(info) => {
              // Add status badge to events
              const statusBadge = document.createElement('div');
              statusBadge.style.fontSize = '10px';
              statusBadge.style.opacity = '0.8';
              statusBadge.style.fontWeight = 'bold';
              statusBadge.textContent = translateStatus(info.event.extendedProps.status).toUpperCase();
              info.el.appendChild(statusBadge);
            }}
          />
        </Box>
      </Box>

      {/* Appointment Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="appointment-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.grey[100]}`,
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="appointment-modal-title"
            variant="h4"
            component="h2"
            mb={3}
            color={colors.grey[100]}
          >
            {translations.newAppointment}
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2, color: colors.grey[100] }}>
                  {translations.loadingClientsAndDoctors}
                </Typography>
              </Box>
            ) : (
              <>
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    required
                    error={!appointmentData.client_id}
                  >
                    <InputLabel
                      sx={{ color: colors.grey[100] }}
                    >
                      {translations.selectClient}
                    </InputLabel>
                    <Select
                      value={appointmentData.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      label={translations.selectClient}
                      sx={{
                        color: colors.grey[100],
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.grey[300],
                        },
                        '& .MuiSvgIcon-root': {
                          color: colors.grey[100],
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>{translations.chooseClient}</em>
                      </MenuItem>
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {client.full_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {client.phone_number} • {client.address}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Tooltip title={translations.addNewClient}>
                    <IconButton
                      onClick={handleOpenClientModal}
                      sx={{
                        color: colors.greenAccent[500],
                        backgroundColor: colors.primary[500],
                        '&:hover': {
                          backgroundColor: colors.greenAccent[900],
                        },
                        mt: 1,
                        ml: 1,
                      }}
                    >
                      <PersonAdd />
                    </IconButton>
                  </Tooltip>
                </Box>

                <FormControl
                  fullWidth
                  margin="normal"
                  required
                  error={!appointmentData.doctor_id}
                >
                  <InputLabel
                    sx={{ color: colors.grey[100] }}
                  >
                    {translations.selectDoctor}
                  </InputLabel>
                  <Select
                    value={appointmentData.doctor_id}
                    onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                    label={translations.selectDoctor}
                    sx={{
                      color: colors.grey[100],
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.grey[300],
                      },
                      '& .MuiSvgIcon-root': {
                        color: colors.grey[100],
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>{translations.chooseDoctor}</em>
                    </MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {doctor.full_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {doctor.phone_number} • {doctor.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="date_time"
              label={translations.dateTime}
              name="date_time"
              type="datetime-local"
              value={appointmentData.date_time}
              onChange={(e) => handleInputChange('date_time', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="duration_minutes"
              label={translations.durationMinutes}
              name="duration_minutes"
              type="number"
              value={appointmentData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="comment"
              label={translations.comment}
              name="comment"
              multiline
              rows={3}
              value={appointmentData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel
                id="status-label"
                sx={{ color: colors.grey[100] }}
              >
                {translations.status}
              </InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={appointmentData.status}
                label={translations.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.grey[300],
                  },
                  '& .MuiSvgIcon-root': {
                    color: colors.grey[100],
                  },
                }}
              >
                <MenuItem value="scheduled">{translations.scheduled}</MenuItem>
                <MenuItem value="confirmed">{translations.confirmed}</MenuItem>
                <MenuItem value="canceled">{translations.canceled}</MenuItem>
                <MenuItem value="completed">{translations.completed}</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                {translations.cancel}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitAppointment}
                disabled={loading || !appointmentData.client_id || !appointmentData.doctor_id || !appointmentData.date_time}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[700],
                  },
                  "&:disabled": {
                    backgroundColor: colors.grey[500],
                    color: colors.grey[300],
                  },
                }}
              >
                {translations.createAppointment}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* New Client Modal */}
      <Modal
        open={openClientModal}
        onClose={handleCloseClientModal}
        aria-labelledby="client-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.grey[100]}`,
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography
            id="client-modal-title"
            variant="h4"
            component="h2"
            mb={3}
            color={colors.grey[100]}
          >
            Добавить нового клиента
          </Typography>
          
          {clientError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {clientError}
            </Alert>
          )}
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="full_name"
                  label="Полное имя"
                  name="full_name"
                  value={newClientData.full_name}
                  onChange={(e) => handleClientInputChange('full_name', e.target.value)}
                  disabled={clientLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone_number"
                  label="Номер телефона"
                  name="phone_number"
                  value={newClientData.phone_number}
                  onChange={(e) => handleClientInputChange('phone_number', e.target.value)}
                  disabled={clientLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel
                    sx={{ color: colors.grey[100] }}
                  >
                    Пол
                  </InputLabel>
                  <Select
                    value={newClientData.gender}
                    onChange={(e) => handleClientInputChange('gender', e.target.value)}
                    label="Пол"
                    disabled={clientLoading}
                    sx={{
                      color: colors.grey[100],
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.grey[300],
                      },
                      '& .MuiSvgIcon-root': {
                        color: colors.grey[100],
                      },
                    }}
                  >
                    <MenuItem value="male">Мужской</MenuItem>
                    <MenuItem value="female">Женский</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="address"
                  label="Адрес"
                  name="address"
                  value={newClientData.address}
                  onChange={(e) => handleClientInputChange('address', e.target.value)}
                  disabled={clientLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="birth_date"
                  label="Дата рождения (ДД.ММ.ГГГГ)"
                  name="birth_date"
                  placeholder="24.06.2003"
                  value={newClientData.birth_date}
                  onChange={(e) => handleClientInputChange('birth_date', e.target.value)}
                  disabled={clientLoading}
                  helperText="Формат: ДД.ММ.ГГГГ (например, 24.06.2003)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
            </Grid>
            
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={handleCloseClientModal}
                disabled={clientLoading}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateClient}
                disabled={clientLoading || !newClientData.full_name || !newClientData.phone_number || !newClientData.address || !newClientData.birth_date}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[700],
                  },
                  "&:disabled": {
                    backgroundColor: colors.grey[500],
                    color: colors.grey[300],
                  },
                }}
              >
                {clientLoading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Создание...
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonAdd />
                    Создать клиента
                  </Box>
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        aria-labelledby="appointment-detail-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.grey[100]}`,
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="appointment-detail-title"
            variant="h4"
            component="h2"
            mb={3}
            color={colors.grey[100]}
          >
            {translations.appointmentDetails}
          </Typography>

          {detailLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2, color: colors.grey[100] }}>
                {translations.loadingAppointments}
              </Typography>
            </Box>
          ) : selectedAppointment ? (
            <Box>
              <Grid container spacing={3}>
                {/* Client Information */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color={colors.greenAccent[400]} gutterBottom>
                    {translations.clientInfo}
                  </Typography>
                  <Box sx={{ bgcolor: colors.primary[500], p: 2, borderRadius: 1, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Имя
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedClient?.full_name || `Client ${selectedAppointment.client_id.slice(-4)}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Телефон
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedClient?.phone_number || 'N/A'}
                        </Typography>
                      </Grid>
                      {selectedClient?.address && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Адрес
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {selectedClient.address}
                          </Typography>
                        </Grid>
                      )}
                      {selectedClient?.gender && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Пол
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]} sx={{ textTransform: 'capitalize' }}>
                            {selectedClient.gender === 'male' ? 'Мужской' : selectedClient.gender === 'female' ? 'Женский' : selectedClient.gender}
                          </Typography>
                        </Grid>
                      )}
                      {selectedClient?.birth_date && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Дата рождения
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {new Date(selectedClient.birth_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Doctor Information */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color={colors.blueAccent[400]} gutterBottom>
                    {translations.doctor}
                  </Typography>
                  <Box sx={{ bgcolor: colors.primary[500], p: 2, borderRadius: 1, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Имя
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedDoctor?.full_name || `Doctor ${selectedAppointment.doctor_id.slice(-4)}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Телефон
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedDoctor?.phone_number || 'N/A'}
                        </Typography>
                      </Grid>
                      {selectedDoctor?.email && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Email
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {selectedDoctor.email}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Appointment Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.grey[200]} gutterBottom>
                    Детали записи
                  </Typography>
                  <Box sx={{ bgcolor: colors.primary[500], p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Дата и время
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {new Date(selectedAppointment.date_time).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Длительность
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedAppointment.duration_minutes} минут
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Статус
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color={
                            selectedAppointment.status === 'confirmed' ? colors.blueAccent[400] :
                            selectedAppointment.status === 'canceled' ? colors.redAccent[400] :
                            selectedAppointment.status === 'completed' ? colors.grey[400] :
                            colors.greenAccent[400]
                          }
                          sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                        >
                          {selectedAppointment.status}
                        </Typography>
                      </Grid>
                      {selectedAppointment.comment && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Комментарий
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {selectedAppointment.comment}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography variant="body1" color={colors.grey[100]}>
              No appointment details available.
            </Typography>
          )}
          
          <Box display="flex" flexDirection="column" gap={2} mt={3}>
            {/* Action buttons row 1 */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {/* Edit button - only show for scheduled/confirmed appointments */}
              {selectedAppointment &&
               (selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                <Button
                  variant="contained"
                  onClick={handleEditAppointmentClick}
                  size="small"
                  sx={{
                    backgroundColor: colors.blueAccent[600],
                    color: colors.grey[100],
                    "&:hover": {
                      backgroundColor: colors.blueAccent[700],
                    },
                  }}
                >
                  Редактировать
                </Button>
              )}

              {/* Delete button - always available */}
              {selectedAppointment && (
                <Button
                  variant="contained"
                  onClick={handleDeleteAppointmentClick}
                  size="small"
                  sx={{
                    backgroundColor: colors.redAccent[700],
                    color: colors.grey[100],
                    "&:hover": {
                      backgroundColor: colors.redAccent[800],
                    },
                  }}
                >
                  Удалить
                </Button>
              )}

              {/* Cancel button - only show if not already canceled or completed */}
              {selectedAppointment &&
               selectedAppointment.status !== 'canceled' &&
               selectedAppointment.status !== 'completed' &&
               selectedAppointment.status?.toLowerCase() !== 'canceled' &&
               selectedAppointment.status?.toLowerCase() !== 'completed' && (
                <Button
                  variant="contained"
                  onClick={handleCancelAppointmentClick}
                  disabled={cancelLoading}
                  size="small"
                  sx={{
                    backgroundColor: colors.redAccent[600],
                    color: colors.grey[100],
                    "&:hover": {
                      backgroundColor: colors.redAccent[700],
                    },
                    "&:disabled": {
                      backgroundColor: colors.grey[500],
                      color: colors.grey[300],
                    },
                  }}
                >
                  {cancelLoading ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} color="inherit" />
                      Отмена...
                    </Box>
                  ) : (
                    'Отменить'
                  )}
                </Button>
              )}

              {/* Complete appointment button - only show if not canceled or completed */}
              {selectedAppointment &&
               selectedAppointment.status !== 'canceled' &&
               selectedAppointment.status !== 'completed' &&
               selectedAppointment.status?.toLowerCase() !== 'canceled' &&
               selectedAppointment.status?.toLowerCase() !== 'completed' && (
                <Button
                  variant="contained"
                  onClick={handleCompleteAppointmentClick}
                  size="small"
                  sx={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                    "&:hover": {
                      backgroundColor: colors.greenAccent[700],
                    },
                  }}
                >
                  Завершить
                </Button>
              )}

              {/* Status indicator for canceled/completed appointments */}
              {selectedAppointment &&
               (selectedAppointment.status === 'canceled' || selectedAppointment.status === 'completed' ||
                selectedAppointment.status?.toLowerCase() === 'canceled' || selectedAppointment.status?.toLowerCase() === 'completed') && (
                <Button
                  variant="contained"
                  disabled
                  size="small"
                  sx={{
                    backgroundColor: selectedAppointment.status === 'canceled'
                      ? colors.redAccent[600]
                      : colors.grey[600],
                    color: colors.grey[100],
                    "&.Mui-disabled": {
                      backgroundColor: selectedAppointment.status === 'canceled'
                        ? colors.redAccent[600]
                        : colors.grey[600],
                      color: colors.grey[100],
                      opacity: 1
                    }
                  }}
                >
                  {(selectedAppointment.status === 'canceled' || selectedAppointment.status?.toLowerCase() === 'canceled') ? 'ОТМЕНЕНА' : 'ЗАВЕРШЕНА'}
                </Button>
              )}
            </Box>

            {/* Close button row 2 */}
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleCloseDetailModal}
                size="small"
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                Закрыть
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Cancel Appointment Confirmation Dialog */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={handleCancelAppointmentCancel}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        PaperProps={{
          sx: { 
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.grey[600]}`
          }
        }}
      >
        <DialogTitle
          id="cancel-dialog-title"
          sx={{ color: colors.grey[100] }}
        >
          Отменить запись
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="cancel-dialog-description"
            sx={{ color: colors.grey[300] }}
          >
            Вы уверены, что хотите отменить эту запись?
            {selectedAppointment && selectedClient && selectedDoctor && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: colors.primary[500], borderRadius: 1 }}>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>Клиент:</strong> {selectedClient.full_name}
                </Typography>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>Врач:</strong> {selectedDoctor.full_name}
                </Typography>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>Дата и время:</strong> {new Date(selectedAppointment.date_time).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCancelAppointmentCancel}
            variant="outlined"
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": {
                borderColor: colors.grey[100],
                backgroundColor: colors.grey[900],
              },
            }}
          >
            Нет, оставить
          </Button>
          <Button
            onClick={handleCancelAppointmentConfirm}
            variant="contained"
            disabled={cancelLoading}
            sx={{
              backgroundColor: colors.redAccent[600],
              color: colors.grey[100],
              "&:hover": {
                backgroundColor: colors.redAccent[700],
              },
              "&:disabled": {
                backgroundColor: colors.grey[500],
                color: colors.grey[300],
              },
            }}
          >
            {cancelLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                Отмена...
              </Box>
            ) : (
              'Да, отменить запись'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Appointment Modal */}
      <Dialog
        open={completeModalOpen}
        onClose={handleCompleteAppointmentCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.grey[600]}`,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ color: colors.grey[100] }}>
          Завершить запись
          {selectedAppointment && selectedClient && selectedDoctor && (
            <Typography variant="subtitle1" color={colors.grey[300]} sx={{ mt: 1 }}>
              {selectedClient.full_name} у доктора {selectedDoctor.full_name}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {complaintsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2, color: colors.grey[100] }}>
                Загрузка медицинских данных...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Anamnesis - Full width at top */}
              <TextField
                fullWidth
                label="Анамнез"
                multiline
                rows={3}
                value={completeFormData.anamnesis}
                onChange={(e) => handleCompleteFormChange('anamnesis', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.grey[100],
                    '& fieldset': {
                      borderColor: colors.grey[300],
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.grey[100],
                  },
                }}
              />

              {/* Complaint Section with Toggle */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useCustomComplaint}
                      onChange={(e) => {
                        setUseCustomComplaint(e.target.checked);
                        // Clear the other complaint field when switching
                        if (e.target.checked) {
                          handleCompleteFormChange('complaint_id', '');
                        } else {
                          handleCompleteFormChange('custom_complaint', '');
                        }
                      }}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: colors.greenAccent[600],
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: colors.greenAccent[600],
                        },
                      }}
                    />
                  }
                  label="Использовать свою жалобу"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: colors.grey[100],
                    },
                    mb: 2,
                  }}
                />

                {/* Complaint Input - Full width below toggle */}
                {!useCustomComplaint ? (
                  <FormControl fullWidth>
                    <Select
                      value={completeFormData.complaint_id}
                      onChange={(e) => handleCompleteFormChange('complaint_id', e.target.value)}
                      label="Выбрать жалобу"
                      displayEmpty
                      fullWidth
                      sx={{
                        color: colors.grey[100],
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.grey[300],
                        },
                        '& .MuiSvgIcon-root': {
                          color: colors.grey[100],
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Жалоба не выбрана</em>
                      </MenuItem>
                      {complaints.map((complaint) => (
                        <MenuItem key={complaint.id} value={complaint.id}>
                          {complaint.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label="Своя жалоба"
                    multiline
                    rows={3}
                    value={completeFormData.custom_complaint}
                    onChange={(e) => handleCompleteFormChange('custom_complaint', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: colors.grey[100],
                        '& fieldset': {
                          borderColor: colors.grey[300],
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.grey[100],
                      },
                    }}
                  />
                )}
              </Box>

              {/* Diagnosis and Treatment - Side by side */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <Select
                      value={completeFormData.diagnosis_id}
                      onChange={(e) => handleCompleteFormChange('diagnosis_id', e.target.value)}
                      label="Статус диагноза"
                      displayEmpty
                      fullWidth
                      sx={{
                        color: colors.grey[100],
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.grey[300],
                        },
                        '& .MuiSvgIcon-root': {
                          color: colors.grey[100],
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Диагноз не выбран</em>
                      </MenuItem>
                      {diagnosisStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.title} ({status.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1, minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <Select
                      value={completeFormData.treatment_id}
                      onChange={(e) => handleCompleteFormChange('treatment_id', e.target.value)}
                      label="Статус лечения"
                      displayEmpty
                      fullWidth
                      sx={{
                        color: colors.grey[100],
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.grey[300],
                        },
                        '& .MuiSvgIcon-root': {
                          color: colors.grey[100],
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Лечение не выбрано</em>
                      </MenuItem>
                      {treatmentStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.title} ({status.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Comment */}
              <TextField
                fullWidth
                label="Комментарии"
                multiline
                rows={3}
                value={completeFormData.comment}
                onChange={(e) => handleCompleteFormChange('comment', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.grey[100],
                    '& fieldset': {
                      borderColor: colors.grey[300],
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.grey[100],
                  },
                }}
              />

              {/* Edit Formula Button - Last element */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => setFormulaModalOpen(true)}
                  sx={{
                    color: colors.blueAccent[400],
                    borderColor: colors.blueAccent[400],
                    "&:hover": {
                      borderColor: colors.blueAccent[300],
                      backgroundColor: colors.blueAccent[900],
                    },
                  }}
                >
                  Редактировать формулу
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCompleteAppointmentCancel}
            variant="outlined"
            disabled={completeLoading}
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": {
                borderColor: colors.grey[100],
                backgroundColor: colors.grey[900],
              },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleCompleteAppointmentSubmit}
            variant="contained"
            disabled={completeLoading || complaintsLoading}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              "&:hover": {
                backgroundColor: colors.greenAccent[700],
              },
              "&:disabled": {
                backgroundColor: colors.grey[500],
                color: colors.grey[300],
              },
            }}
          >
            {completeLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                Завершение...
              </Box>
            ) : (
              'Завершить запись'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dental Formula Modal */}
      <Dialog
        open={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.grey[600]}`,
            maxHeight: '95vh',
            height: '95vh'
          }
        }}
      >
        <DialogTitle sx={{ color: colors.grey[100] }}>
          Зубная формула
          {selectedAppointment && selectedClient && (
            <Typography variant="subtitle1" color={colors.grey[300]} sx={{ mt: 1 }}>
              Зубная формула для {selectedClient.full_name}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {selectedAppointment && selectedClient && (
              <DentalChart
                patientId={selectedClient.id}
                onFormulaChange={(data) => setFormulaData(data)}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setFormulaModalOpen(false)}
            variant="outlined"
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": {
                borderColor: colors.grey[100],
                backgroundColor: colors.grey[900],
              },
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-appointment-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.grey[100]}`,
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h4" component="h2" mb={3} color={colors.grey[100]}>
            Редактировать запись
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel sx={{ color: colors.grey[100] }}>Выбрать клиента</InputLabel>
              <Select
                value={editFormData.client_id}
                onChange={(e) => setEditFormData({ ...editFormData, client_id: e.target.value })}
                label="Выбрать клиента"
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[300] },
                  '& .MuiSvgIcon-root': { color: colors.grey[100] },
                }}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>{client.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel sx={{ color: colors.grey[100] }}>Выбрать врача</InputLabel>
              <Select
                value={editFormData.doctor_id}
                onChange={(e) => setEditFormData({ ...editFormData, doctor_id: e.target.value })}
                label="Выбрать врача"
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[300] },
                  '& .MuiSvgIcon-root': { color: colors.grey[100] },
                }}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>{doctor.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Дата и время"
              type="datetime-local"
              value={editFormData.date_time}
              onChange={(e) => setEditFormData({ ...editFormData, date_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': { borderColor: colors.grey[300] },
                },
                '& .MuiInputLabel-root': { color: colors.grey[100] },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Длительность (минуты)"
              type="number"
              value={editFormData.duration_minutes}
              onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: parseInt(e.target.value) })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': { borderColor: colors.grey[300] },
                },
                '& .MuiInputLabel-root': { color: colors.grey[100] },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Комментарий"
              multiline
              rows={3}
              value={editFormData.comment}
              onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': { borderColor: colors.grey[300] },
                },
                '& .MuiInputLabel-root': { color: colors.grey[100] },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: colors.grey[100] }}>Статус</InputLabel>
              <Select
                value={editFormData.status}
                label="Статус"
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[300] },
                  '& .MuiSvgIcon-root': { color: colors.grey[100] },
                }}
              >
                <MenuItem value="scheduled">Запланирована</MenuItem>
                <MenuItem value="confirmed">Подтверждена</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={() => setEditModalOpen(false)}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": { borderColor: colors.grey[100], backgroundColor: colors.grey[900] },
                }}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={handleEditAppointmentSubmit}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": { backgroundColor: colors.greenAccent[700] },
                }}
              >
                Сохранить изменения
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Appointment Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.grey[600]}`
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: colors.grey[100] }}>
          Удалить запись
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: colors.grey[300] }}>
            Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
            {selectedAppointment && selectedClient && selectedDoctor && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: colors.primary[500], borderRadius: 1 }}>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>Клиент:</strong> {selectedClient.full_name}
                </Typography>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>Врач:</strong> {selectedDoctor.full_name}
                </Typography>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>Дата и время:</strong> {new Date(selectedAppointment.date_time).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": { borderColor: colors.grey[100], backgroundColor: colors.grey[900] },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteAppointmentConfirm}
            variant="contained"
            disabled={deleteLoading}
            sx={{
              backgroundColor: colors.redAccent[600],
              color: colors.grey[100],
              "&:hover": { backgroundColor: colors.redAccent[700] },
              "&:disabled": { backgroundColor: colors.grey[500], color: colors.grey[300] },
            }}
          >
            {deleteLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                Удаление...
              </Box>
            ) : (
              'Удалить запись'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;