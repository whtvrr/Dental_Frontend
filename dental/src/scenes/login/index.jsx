import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
  Container
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { buildApiUrl } from "../../config/api";
import { AuthContext } from "../../context/AuthContext";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const LoginPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    try {
      const response = await fetch(buildApiUrl('/auth/signin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.tokens) {
        // Handle new response format with nested tokens
        const tokens = data.data.tokens;
        
        // Save tokens to session storage
        sessionStorage.setItem('access_token', tokens.access_token);
        sessionStorage.setItem('refresh_token', tokens.refresh_token);
        sessionStorage.setItem('expires_in', tokens.expires_in);
        sessionStorage.setItem('token_type', tokens.token_type);
        
        // Update auth context
        login(tokens);
        
        setSubmitStatus({
          type: 'success',
          message: 'Login successful! Redirecting...'
        });
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Login failed. Please check your credentials.'
        });
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
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[500]} 100%)`
          : `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.grey[100]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              backgroundColor: colors.primary[400],
              borderRadius: '20px',
              border: `1px solid ${colors.grey[700]}`,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 20px 60px ${colors.primary[900]}60, 0 8px 32px ${colors.primary[900]}40`
                : `0 20px 60px ${colors.grey[300]}40, 0 8px 32px ${colors.grey[400]}20`,
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
                backgroundSize: '200% 100%',
                animation: 'gradient 3s ease infinite',
              },
              '@keyframes gradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]})`,
                  mb: 3,
                  boxShadow: `0 8px 32px ${colors.greenAccent[500]}40`,
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Typography
                variant="h2"
                color={colors.grey[100]}
                fontWeight="bold"
                mb={1}
              >
                ШАНС Dental
              </Typography>
              
              <Typography
                variant="h5"
                color={colors.grey[300]}
                fontWeight="300"
              >
                Sign in to your account
              </Typography>
            </Box>

            {submitStatus.message && (
              <Fade in timeout={500}>
                <Alert 
                  severity={submitStatus.type} 
                  sx={{ 
                    mb: 3,
                    borderRadius: '12px',
                    '& .MuiAlert-icon': {
                      color: submitStatus.type === 'success' 
                        ? colors.greenAccent[500] 
                        : colors.redAccent[500]
                    },
                    backgroundColor: submitStatus.type === 'success'
                      ? `${colors.greenAccent[500]}15`
                      : `${colors.redAccent[500]}15`,
                    border: `1px solid ${submitStatus.type === 'success' 
                      ? colors.greenAccent[500] 
                      : colors.redAccent[500]}30`
                  }}
                  onClose={() => setSubmitStatus({ type: '', message: '' })}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {submitStatus.message}
                  </Typography>
                </Alert>
              </Fade>
            )}

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
                  <Box display="flex" flexDirection="column" gap="24px">
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: colors.grey[300] }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiFilledInput-root': {
                          borderRadius: '12px',
                          backgroundColor: `${colors.primary[500]}80`,
                          border: `1px solid ${colors.grey[700]}`,
                          '&:hover': {
                            backgroundColor: `${colors.primary[500]}60`,
                            border: `1px solid ${colors.grey[600]}`,
                          },
                          '&.Mui-focused': {
                            backgroundColor: `${colors.primary[500]}40`,
                            border: `1px solid ${colors.greenAccent[500]}`,
                          },
                        },
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
                      sx={{
                        '& .MuiFilledInput-root': {
                          borderRadius: '12px',
                          backgroundColor: `${colors.primary[500]}80`,
                          border: `1px solid ${colors.grey[700]}`,
                          '&:hover': {
                            backgroundColor: `${colors.primary[500]}60`,
                            border: `1px solid ${colors.grey[600]}`,
                          },
                          '&.Mui-focused': {
                            backgroundColor: `${colors.primary[500]}40`,
                            border: `1px solid ${colors.greenAccent[500]}`,
                          },
                        },
                      }}
                    />

                    <Button 
                      type="submit" 
                      fullWidth
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{ 
                        height: 56,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: `linear-gradient(135deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]})`,
                        boxShadow: `0 8px 32px ${colors.greenAccent[500]}40`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.blueAccent[600]})`,
                          boxShadow: `0 12px 40px ${colors.greenAccent[500]}60`,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: colors.grey[500],
                          color: colors.grey[300],
                          transform: 'none',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s',
                        },
                        '&:hover::before': {
                          left: '100%',
                        },
                        mt: 2,
                      }}
                    >
                      {isSubmitting ? (
                        <Box display="flex" alignItems="center" gap={2}>
                          <CircularProgress size={24} color="inherit" />
                          Signing in...
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center" gap={1}>
                          <LoginIcon />
                          Sign In
                        </Box>
                      )}
                    </Button>
                  </Box>
                </form>
              )}
            </Formik>

            {/* Footer */}
            <Box textAlign="center" mt={4}>
              <Typography 
                variant="body2" 
                color={colors.grey[400]}
                sx={{ opacity: 0.8 }}
              >
                Secure login for authorized personnel only
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: yup
    .string()
    .min(1, 'Password is required')
    .required('Password is required'),
});

const initialValues = {
  email: '',
  password: '',
};

export default LoginPage;