import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup, Alert } from 'react-bootstrap';
import {
    FaEnvelope,
    FaLock,
    FaKey,
    FaArrowLeft,
    FaCheckCircle,
    FaEye,
    FaEyeSlash,
    FaShieldAlt
} from 'react-icons/fa';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- SMART REDIRECT DATA ---
    // Check if we passed data from Settings.jsx (username & return path)
    const returnPath = location.state?.returnPath || '/login';
    const autoLoginUsername = location.state?.username || '';
    const preFilledEmail = location.state?.email || '';

    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState(preFilledEmail);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- HANDLER: STEP 1 (SEND OTP) ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Call backend to generate and email the OTP
            await api.post('/auth/forgot-password/send-otp', { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to send OTP. Email might not exist.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER: STEP 2 (VERIFY OTP) ---
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password/verify-otp', { email, otp });
            toast.success("OTP Verified Successfully!");
            setStep(3);
        } catch (error) {
            toast.error("Invalid OTP. Please check and try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER: STEP 3 (RESET & AUTO-LOGIN) ---
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            // 1. Perform the Reset
            await api.post('/auth/forgot-password/reset', {
                email,
                newPassword,
                otp // Send OTP again for double verification security
            });

            toast.success("Password has been reset!");

            // 2. SMART REDIRECT LOGIC
            if (returnPath === '/settings' && autoLoginUsername) {
                // CASE A: User came from Settings -> Auto-login them back
                try {
                    const loginResponse = await api.post('/auth/login', {
                        username: autoLoginUsername,
                        password: newPassword
                    });

                    // Save new token
                    localStorage.setItem('jwtToken', loginResponse.data.token);
                    toast.info("Logged in automatically. Redirecting to Settings...");

                    // Small delay for UX
                    setTimeout(() => navigate('/settings'), 1500);

                } catch (loginErr) {
                    // Fallback if auto-login fails
                    toast.warning("Password set, but auto-login failed. Please login manually.");
                    navigate('/login');
                }
            } else {
                // CASE B: User came from Login -> Send to Login
                toast.info("Please login with your new password.");
                setTimeout(() => navigate('/login'), 2000);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center fade-in" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '450px', maxWidth: '90%' }} className="shadow-lg border-0">
                <Card.Body className="p-5">

                    {/* DYNAMIC BACK BUTTON */}
                    <div className="text-start mb-4">
                        <Button
                            variant="link"
                            onClick={() => navigate(returnPath === '/settings' ? '/settings' : '/login')}
                            className="p-0 text-decoration-none text-muted"
                        >
                            <FaArrowLeft className="me-2" />
                            {returnPath === '/settings' ? "Back to Settings" : "Back to Login"}
                        </Button>
                    </div>

                    <div className="text-center mb-4">
                        <FaKey size={40} className="text-primary mb-3" />
                        <h3 className="fw-bold text-primary">Reset Password</h3>
                        <p className="text-muted small">
                            {step === 1 && "Enter your email to receive a code"}
                            {step === 2 && "Enter the code sent to your email"}
                            {step === 3 && "Create a secure new password"}
                        </p>
                    </div>

                    {/* --- STEP 1 FORM: EMAIL --- */}
                    {step === 1 && (
                        <Form onSubmit={handleSendOtp}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Registered Email</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light"><FaEnvelope className="text-secondary"/></InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-control-lg"
                                        // If email was passed from Settings, disable editing for safety
                                        disabled={!!preFilledEmail}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 btn-lg fw-semibold" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Send OTP Code"}
                            </Button>
                        </Form>
                    )}

                    {/* --- STEP 2 FORM: OTP --- */}
                    {step === 2 && (
                        <Form onSubmit={handleVerifyOtp}>
                            <Alert variant="info" className="py-2 text-center small border-info bg-light text-dark">
                                Code sent to <strong>{email}</strong>
                            </Alert>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Enter 6-Digit Code</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light"><FaShieldAlt className="text-secondary"/></InputGroup.Text>
                                    <Form.Control
                                        className="text-center fw-bold fs-4"
                                        type="text"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        placeholder="000000"
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 btn-lg fw-semibold" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Verify Code"}
                            </Button>
                            <div className="text-center mt-3">
                                <Button variant="link" className="text-muted small" onClick={() => setStep(1)}>
                                    Change Email
                                </Button>
                            </div>
                        </Form>
                    )}

                    {/* --- STEP 3 FORM: NEW PASSWORD --- */}
                    {step === 3 && (
                        <Form onSubmit={handleResetPassword}>
                            <Alert variant="success" className="py-2 text-center small border-0">
                                <FaCheckCircle className="me-1"/> Identity Verified!
                            </Alert>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">New Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light"><FaLock className="text-secondary"/></InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Min 6 characters"
                                        className="form-control-lg"
                                    />
                                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                            <Button variant="success" type="submit" className="w-100 btn-lg fw-bold" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Reset & Continue"}
                            </Button>
                        </Form>
                    )}

                </Card.Body>
            </Card>
        </Container>
    );
};

export default ForgotPassword;