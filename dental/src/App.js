import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import DentalChartPage from "./scenes/dental-chart";
import RegistrationForm from "./scenes/registration";
import LoginPage from "./scenes/login";
import FAQ from "./scenes/faq";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Calendar from "./scenes/calendar/calendar";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="app">
                  <Sidebar isSidebar={isSidebar} />
                  <main className="content">
                    <Topbar setIsSidebar={setIsSidebar} />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/dental-chart" element={<DentalChartPage />} />
                      <Route path="/patients/:patientId/dental-chart" element={<DentalChartPage />} />
                      <Route path="/registration" element={<RegistrationForm />} />  
                      <Route path="/faq" element={<FAQ />} /> 
                      <Route path="/calendar" element={<Calendar />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App;
