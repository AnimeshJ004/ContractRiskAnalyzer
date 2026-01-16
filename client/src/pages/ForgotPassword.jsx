import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaShieldAlt, FaArrowLeft, FaEye, FaEyeSlash, FaKey, FaCheckCircle, FaRedo } from 'react-icons/fa';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Password Input
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // UI States
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- RESEND OTP STATES ---
    const [timer, setTimer] = useState(60); // 60 seconds = 1 Minutes
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval;
        // Only run timer if we are in Step 2 (OTP Step) and button is disabled
        if (step === 2 && !canResend && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true); // Enable button when time is up
        }
        return () => clearInterval(interval);
    }, [step, canResend, timer]);

    // Format seconds into MM:SS (e.g., 00:59)
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- STEP 1: SEND OTP ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/auth/forgot-password?email=${email}`);
            toast.success("OTP sent to your email!");
            setStep(2);
            setTimer(60); // Start 1 min countdown
            setCanResend(false);
        } catch (err) {
            console.error("OTP Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: RESEND OTP HANDLER ---
    const handleResendOtp = async () => {
        setLoading(true);
        try {
            // Re-use the same endpoint to generate a new OTP
            await api.post(`/auth/forgot-password?email=${email}`);
            toast.success("New OTP sent successfully!");
            setTimer(60); // Reset timer to 5 minutes
            setCanResend(false); // Disable button again
            setOtp(''); // Clear old input
        } catch (err) {
            toast.error("Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        try {
            await api.post(`/auth/verify-otp?email=${email}&otp=${otp}`);
            toast.success("OTP Verified! Set your new password.");
            setIsOtpVerified(true);
        } catch (err) {
            toast.error("Invalid or Expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 3: RESET PASSWORD ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: email,
                otp: otp,
                newPassword: newPassword
            });
            toast.success("Password changed successfully! Please login.");
            navigate('/login');
        } catch (err) {
            console.error("Reset Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center fade-in" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '450px', maxWidth: '90%' }} className="shadow-lg border-0">
                <Card.Body className="p-5">

                    <div className="text-start mb-4">
                        <Button variant="link" onClick={() => navigate('/login')} className="p-0 text-decoration-none">
                            <FaArrowLeft className="me-2" /> Back to Login
                        </Button>
                    </div>

                    <div className="text-center mb-4">
                        <FaShieldAlt size={48} className="text-primary mb-3" />
                        <h3 className="fw-bold text-primary">
                            {step === 1 ? "Forgot Password" : "Reset Password"}
                        </h3>
                        <p className="text-muted">
                            {step === 1
                                ? "Enter your email to receive a verification code."
                                : isOtpVerified
                                    ? "Set your new secure password."
                                    : "Enter the OTP sent to your email."}
                        </p>
                    </div>

                    {step === 1 ? (
                        /* --- FORM 1: EMAIL --- */
                        <Form onSubmit={handleSendOtp}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">
                                    <FaEnvelope className="me-2 text-primary" />
                                    Email Address
                                </Form.Label>
                                <Form.Control type="email" placeholder="Enter registered email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-control-lg" />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100 btn-lg fw-semibold" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Send OTP"}
                            </Button>
                        </Form>
                    ) : (
                        /* --- FORM 2: OTP & PASSWORD --- */
                        <Form onSubmit={handleResetPassword}>
                            <div className="alert alert-info py-2 text-center mb-3 small">
                                Code sent to <strong>{email}</strong>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    <FaKey className="me-2 text-primary" />
                                    Enter OTP
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="form-control-lg text-center letter-spacing-2"
                                        maxLength="6"
                                        disabled={isOtpVerified}
                                    />
                                    {isOtpVerified && (
                                        <InputGroup.Text className="bg-success text-white">
                                            <FaCheckCircle />
                                        </InputGroup.Text>
                                    )}
                                </InputGroup>
                            </Form.Group>

                            {/* --- RESEND OTP BUTTON --- */}
                            {!isOtpVerified && (
                                <div className="d-flex justify-content-end mb-3">
                                    <Button
                                        variant="link"
                                        onClick={handleResendOtp}
                                        disabled={!canResend || loading}
                                        className="p-0 text-decoration-none small"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        {canResend ? (
                                            <>
                                                <FaRedo className="me-1" /> Resend OTP
                                            </>
                                        ) : (
                                            <span className="text-muted">Resend in {formatTime(timer)}</span>
                                        )}
                                    </Button>
                                </div>
                            )}
                            {/* ------------------------- */}

                            {!isOtpVerified && (
                                <Button variant="warning" onClick={handleVerifyOtp} className="w-100 mb-3 fw-bold text-white" disabled={loading}>
                                    {loading ? <Spinner animation="border" size="sm" /> : "Verify OTP"}
                                </Button>
                            )}

                            {isOtpVerified && (
                                <div className="fade-in">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">
                                            <FaLock className="me-2 text-primary" />
                                            New Password
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="form-control-lg"
                                                minLength="6"
                                            />
                                            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Button variant="success" type="submit" className="w-100 btn-lg fw-semibold" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : "Reset Password"}
                                    </Button>
                                </div>
                            )}
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};
export default ForgotPassword;