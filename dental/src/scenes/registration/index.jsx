import React, { useState, useContext } from 'react';
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
import { AuthContext } from "../../context/AuthContext";
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
  const { login } = useContext(AuthContext);
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

      const data = await response.json();

      if (response.status === 201 && data.data) {
        // Handle new response format with tokens
        const tokens = {
          access_token: data.data.access_token,
          refresh_token: data.data.refresh_token,
          expires_in: data.data.expires_in,
          token_type: data.data.token_type
        };
        
        // Auto-login after successful registration
        login(tokens);
        
        setSubmitStatus({
          type: 'success',
          message: 'Пользователь успешно зарегистрирован! Добро пожаловать в команду ШАНС!'
        });
        resetForm();
      } else if (response.status === 400) {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Ошибка регистрации. Проверьте введенные данные и попробуйте снова.'
        });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Ошибка сети. Проверьте подключение и попробуйте снова.'
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
        title="РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ" 
        subtitle="Создание новой учетной записи для внутренних сотрудников" 
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
              Регистрация нового сотрудника
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
                    label="Электронная почта"
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
                    label="Полное имя"
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
                    label="Номер телефона"
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
                    label="Пароль"
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
                    <InputLabel>Роль</InputLabel>
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
                          Администратор
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
                          Врач
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
                          Регистратор
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
                        Регистрация...
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonAddIcon />
                        Зарегистрировать пользователя
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
    .email('Введите корректный адрес электронной почты')
    .required('Адрес электронной почты обязателен'),
  full_name: yup
    .string()
    .min(2, 'Полное имя должно содержать минимум 2 символа')
    .max(50, 'Полное имя должно быть короче 50 символов')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'Полное имя может содержать только буквы и пробелы')
    .required('Полное имя обязательно'),
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру'
    )
    .required('Пароль обязателен'),
  phone_number: yup
    .string()
    .matches(phoneRegExp, 'Введите корректный номер телефона')
    .required('Номер телефона обязателен'),
  role: yup
    .string()
    .oneOf(['admin', 'doctor', 'receptionist'], 'Выберите корректную роль')
    .required('Выбор роли обязателен'),
});

const initialValues = {
  email: '',
  full_name: '',
  password: '',
  phone_number: '',
  role: '',
};

export default RegistrationForm;