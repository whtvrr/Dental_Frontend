import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Fade,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { buildApiUrl } from "../../config/api";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BadgeIcon from "@mui/icons-material/Badge";

const RegistrationForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
      // Use config for API endpoint
      const response = await fetch(buildApiUrl('/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.status === 201) {
        setSubmitStatus({
          type: 'success',
          message: 'User registered successfully! Welcome to the ШАНС dental team.'
        });
        resetForm();
      } else if (response.status === 400) {
        const errorData = await response.json();
        setSubmitStatus({
          type: 'error',
          message: errorData.message || 'Registration failed. Please check your input and try again.'
        });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box m="20px">
      <Header 
        title="USER REGISTRATION" 
        subtitle="Create a new user account for internal staff members" 
      />

      <Fade in timeout={800}>
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: colors.primary[400],
            borderRadius: '12px',
            border: `1px solid ${colors.grey[700]}`,
            boxShadow: `0 8px 32px ${colors.primary[900]}40`,
            backdropFilter: 'blur(8px)',
          }}
        >
          {submitStatus.message && (
            <Fade in timeout={500}>
              <Alert 
                severity={submitStatus.type} 
                sx={{ 
                  mb: 3,
                  borderRadius: '8px',
                  '& .MuiAlert-icon': {
                    color: submitStatus.type === 'success' ? colors.greenAccent[500] : colors.redAccent[500]
                  }
                }}
                onClose={() => setSubmitStatus({ type: '', message: '' })}
              >
                <Typography variant="body1" fontWeight="medium">
                  {submitStatus.message}
                </Typography>
              </Alert>
            </Fade>
          )}

          <Box display="flex" alignItems="center" mb={4} gap={2}>
            <PersonAddIcon sx={{ fontSize: 32, color: colors.greenAccent[500] }} />
            <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
              New Staff Member Registration
            </Typography>
          </Box>

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={validationSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="24px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="email"
                    label="Email Address"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled={isSubmitting}
                    sx={{ gridColumn: "span 4" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: colors.grey[300] }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Full Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.full_name}
                    name="full_name"
                    error={!!touched.full_name && !!errors.full_name}
                    helperText={touched.full_name && errors.full_name}
                    disabled={isSubmitting}
                    sx={{ gridColumn: "span 2" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: colors.grey[300] }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="tel"
                    label="Phone Number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phone_number}
                    name="phone_number"
                    error={!!touched.phone_number && !!errors.phone_number}
                    helperText={touched.phone_number && errors.phone_number}
                    disabled={isSubmitting}
                    sx={{ gridColumn: "span 2" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: colors.grey[300] }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    disabled={isSubmitting}
                    sx={{ gridColumn: "span 3" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: colors.grey[300] }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            disabled={isSubmitting}
                            sx={{ color: colors.grey[300] }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl 
                    fullWidth 
                    variant="filled" 
                    error={!!touched.role && !!errors.role}
                    sx={{ gridColumn: "span 1" }}
                    disabled={isSubmitting}
                  >
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="role"
                      startAdornment={
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: colors.grey[300], mr: 1 }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="admin">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box 
                            width={8} 
                            height={8} 
                            borderRadius="50%" 
                            bgcolor={colors.redAccent[500]}
                          />
                          Admin
                        </Box>
                      </MenuItem>
                      <MenuItem value="doctor">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box 
                            width={8} 
                            height={8} 
                            borderRadius="50%" 
                            bgcolor={colors.blueAccent[500]}
                          />
                          Doctor
                        </Box>
                      </MenuItem>
                      <MenuItem value="receptionist">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box 
                            width={8} 
                            height={8} 
                            borderRadius="50%" 
                            bgcolor={colors.greenAccent[500]}
                          />
                          Receptionist
                        </Box>
                      </MenuItem>
                    </Select>
                    {touched.role && errors.role && (
                      <Typography 
                        variant="caption" 
                        color="error" 
                        sx={{ mt: 1, ml: 2 }}
                      >
                        {errors.role}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box 
                  display="flex" 
                  justifyContent="center" 
                  mt="32px"
                  gap={2}
                >
                  <Button 
                    type="submit" 
                    color="secondary" 
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ 
                      minWidth: 160,
                      height: 48,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${colors.greenAccent[500]}, ${colors.greenAccent[400]})`,
                      boxShadow: `0 4px 16px ${colors.greenAccent[500]}40`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${colors.greenAccent[600]}, ${colors.greenAccent[500]})`,
                        boxShadow: `0 6px 20px ${colors.greenAccent[500]}60`,
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: colors.grey[500],
                        color: colors.grey[300],
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={20} color="inherit" />
                        Registering...
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonAddIcon />
                        Register User
                      </Box>
                    )}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Paper>
      </Fade>
    </Box>
  );
};

const phoneRegExp = /^[\+]?[\d\s\-\(\)]{10,}$/;

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  full_name: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'Full name can only contain letters and spaces')
    .required('Full name is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    )
    .required('Password is required'),
  phone_number: yup
    .string()
    .matches(phoneRegExp, 'Please enter a valid phone number')
    .required('Phone number is required'),
  role: yup
    .string()
    .oneOf(['admin', 'doctor', 'receptionist'], 'Please select a valid role')
    .required('Role selection is required'),
});

const initialValues = {
  email: '',
  full_name: '',
  password: '',
  phone_number: '',
  role: '',
};

export default RegistrationForm;