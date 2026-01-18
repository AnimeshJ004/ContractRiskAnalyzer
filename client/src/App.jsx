import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import home from './pages/home';
import login from './pages/login';
import register from './pages/register';
import dashboard from './pages/dashboard';
import chat from './pages/chat';
import contractDetails from './pages/contractDetails';
import settings from './pages/settings';
import forgotPassword from './pages/forgotPassword';
import completeRegistration from './pages/completeRegistration';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('jwtToken');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<home />} />
        <Route path="/login" element={<login />} />
        <Route path="/register" element={<register />} />
        <Route path="/forgot-password" element={<forgotPassword />} />
        <Route
            path="/dashboard"
            element={
                <PrivateRoute>
                    <dashboard />
                </PrivateRoute>
            }
        />
        <Route path="/complete-registration" element={<completeRegistration />} />
        <Route
            path="/chat/:contractId"
            element={
                <PrivateRoute>
                    <chat />
                </PrivateRoute>
            }
        />
        <Route
            path="/contracts/:id"
            element={
                <PrivateRoute>
                    <contractDetails />
                </PrivateRoute>
            }
        />
        <Route
            path="/settings"
            element={
                <PrivateRoute>
                    <settings />
                </PrivateRoute>
            }
        />
      </Routes>
    </Router>
  );
}

export default App;