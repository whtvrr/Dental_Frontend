import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import RegistrationForm from "./scenes/registration";
import LoginPage from "./scenes/login";
import FAQ from "./scenes/faq";
import ClientDetail from "./scenes/client-detail";
import Complaints from "./scenes/complaints";
import Statuses from "./scenes/statuses";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { StatusProvider } from "./context/StatusContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Calendar from "./scenes/calendar/calendar";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <StatusProvider>
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
                      <Route path="/clients/:id" element={<ClientDetail />} />
                      <Route path="/complaints" element={<Complaints />} />
                      <Route path="/statuses" element={<Statuses />} />
                      <Route path="/registration" element={<RegistrationForm />} />  
                      <Route path="/faq" element={<FAQ />} /> 
                      <Route path="/calendar" element={<Calendar />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
          </StatusProvider>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App;
