import { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import {
    FaKey,
    FaEnvelope,
    FaArrowLeft,
    FaPaperPlane,
    FaCheckCircle,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaRedo
} from 'react-icons/fa';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Verify OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // --- STEP 1: SEND OTP ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/auth/forgot-password/verify-email?email=${email}`);
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/auth/forgot-password/verify-otp?email=${email}&otp=${otp}`);
            toast.success("OTP Verified! Set your new password.");
            setStep(3);
        } catch (error) {
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
            await api.post('/auth/forgot-password/reset', { email, newPassword });
            toast.success("Password reset successful! Please login.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error("Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 position-relative overflow-hidden d-flex align-items-center justify-content-center bg-light">

            {/* --- BACKGROUND BLOBS --- */}
            <div className="position-absolute rounded-circle bg-primary"
                 style={{ top: '-10%', right: '-5%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', filter: 'blur(80px)', opacity: 0.05, zIndex: 0 }} />
            <div className="position-absolute rounded-circle bg-success"
                 style={{ bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', maxWidth: '700px', maxHeight: '700px', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            {/* --- FLOATING BACK BUTTON --- */}
            <div className="position-absolute top-0 start-0 p-4 z-2">
                <Button
                    variant="light"
                    onClick={() => navigate('/login')}
                    className="rounded-pill px-4 py-2 shadow-sm text-primary fw-bold hover-scale d-flex align-items-center"
                    style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,1)' }}
                >
                    <FaArrowLeft className="me-2" /> Back to Login
                </Button>
            </div>

            <Container className="position-relative z-1 d-flex justify-content-center">
                <Card className="border-0 shadow-lg overflow-hidden"
                      style={{
                          width: '500px',
                          maxWidth: '95%',
                          borderRadius: '24px',
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.5)'
                      }}>

                    {/* Decorative Top Gradient */}
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '6px', background: 'linear-gradient(90deg, #0d6efd, #198754)' }}></div>

                    <Card.Body className="p-4 px-md-5">

                        {/* --- HEADER --- */}
                        <div className="text-center mb-5 mt-3">
                            <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3 text-warning" style={{ width: '70px', height: '70px' }}>
                                <FaKey size={30} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">Recovery</h3>
                            <p className="text-muted small">
                                {step === 1 && "Enter your email to receive a code"}
                                {step === 2 && "Enter the code sent to your email"}
                                {step === 3 && "Create a secure new password"}
                            </p>
                        </div>

                        {/* --- STEP 1: EMAIL --- */}
                        {step === 1 && (
                            <Form onSubmit={handleSendOtp} className="fade-in">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold small text-secondary ps-2 mb-1">EMAIL ADDRESS</Form.Label>
                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                        <InputGroup.Text className="bg-white border-0 ps-3">
                                            <FaEnvelope className="text-primary opacity-50" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="border-0 bg-white py-2"
                                            style={{ boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center"
                                    disabled={loading}
                                    style={{ height: '45px' }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : <><FaPaperPlane className="me-2" /> Send Code</>}
                                </Button>
                            </Form>
                        )}

                        {/* --- STEP 2: OTP --- */}
                        {step === 2 && (
                            <Form onSubmit={handleVerifyOtp} className="fade-in">
                                <div className="alert alert-success py-1 text-center mb-4 border-0 rounded-pill small bg-success bg-opacity-10 text-success">
                                    <FaCheckCircle className="me-2" />
                                    Code sent to <strong>{email}</strong>
                                </div>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold small text-secondary ps-2 text-center w-100">ENTER 6-DIGIT CODE</Form.Label>
                                    <div className="d-flex justify-content-center">
                                        <Form.Control
                                            type="text"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="form-control-lg text-center rounded-pill border-0 shadow-sm"
                                            maxLength="6"
                                            style={{ letterSpacing: '5px', fontWeight: 'bold', maxWidth: '300px' }}
                                        />
                                    </div>
                                </Form.Group>

                                <div className="text-center mb-4">
                                    <Button variant="link" className="p-0 text-decoration-none small text-muted" onClick={() => setStep(1)}>
                                        <FaRedo className="me-1" /> Change Email
                                    </Button>
                                </div>

                                <Button
                                    variant="success"
                                    type="submit"
                                    className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale"
                                    disabled={loading}
                                    style={{ height: '45px' }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : "Verify Code"}
                                </Button>
                            </Form>
                        )}

                        {/* --- STEP 3: NEW PASSWORD --- */}
                        {step === 3 && (
                            <Form onSubmit={handleResetPassword} className="fade-in">
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold small text-secondary ps-2 mb-1">NEW PASSWORD</Form.Label>
                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                        <InputGroup.Text className="bg-white border-0 ps-3">
                                            <FaLock className="text-primary opacity-50" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 8 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="border-0 bg-white py-2"
                                            style={{ boxShadow: 'none' }}
                                        />
                                        <Button
                                            variant="white"
                                            className="bg-white border-0 text-secondary pe-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center"
                                    disabled={loading}
                                    style={{ height: '45px' }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-2" /> Reset Password</>}
                                </Button>
                            </Form>
                        )}

                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default ForgotPassword;