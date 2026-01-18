import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup, Row, Col } from 'react-bootstrap';
import {
    FaShieldAlt,
    FaUser,
    FaLock,
    FaCheckCircle,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
    FaRedo,
    FaSignInAlt,
    FaGoogle
} from 'react-icons/fa';

const Login = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- OAUTH2 SUCCESS HANDLING ---
    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (token) {
            localStorage.setItem("jwtToken", token);
            toast.success("Login Successful!");
            navigate("/dashboard");
        } else if (error) {
            toast.error("Login failed. Please try again.");
        }
    }, [searchParams, navigate]);

    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval;
        if (step === 2 && !canResend && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, canResend, timer]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- HANDLERS ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/login', { username, password });
            setStep(2);
            setTimer(300);
            setCanResend(false);
            toast.success("OTP sent to your email!");
        } catch (err) {
            toast.error("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await api.post('/auth/login', { username, password });
            toast.success("New OTP sent successfully!");
            setTimer(300);
            setCanResend(false);
            setOtp('');
        } catch (err) {
            toast.error("Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/auth/login/verify?username=${username}&otp=${otp}`);
            localStorage.setItem('jwtToken', response.data.token);
            toast.success("Login Successful!");
            navigate('/dashboard');
        } catch (err) {
            toast.error("Invalid or Expired OTP.");
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
                    onClick={() => navigate('/')}
                    className="rounded-pill px-4 py-2 shadow-sm text-primary fw-bold hover-scale d-flex align-items-center"
                    style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,1)' }}
                >
                    <FaArrowLeft className="me-2" /> Back to Home
                </Button>
            </div>

            <Container className="position-relative z-1 d-flex justify-content-center">
                <Card className="border-0 shadow-lg overflow-hidden"
                      style={{
                          width: '550px', // Adjusted width for vertical inputs
                          maxWidth: '95%',
                          borderRadius: '24px',
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.5)'
                      }}>

                    {/* Decorative Top Gradient */}
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '6px', background: 'linear-gradient(90deg, #0d6efd, #198754)' }}></div>

                    <Card.Body className="p-4 px-md-5"> {/* Reduced vertical padding */}

                        {/* --- HEADER --- */}
                        <div className="text-center mb-4">
                            <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-2 text-primary" style={{ width: '60px', height: '60px' }}>
                                <FaShieldAlt size={28} />
                            </div>
                            <h3 className="fw-bold text-dark mb-0">Welcome Back</h3>
                            <p className="text-muted small">Secure Contract Risk Analyzer Portal</p>
                        </div>

                        {step === 1 ? (
                            <div className="fade-in">
                                <Form onSubmit={handleLogin}>

                                    {/* --- VERTICAL INPUTS (Line Wise) --- */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold small text-secondary ps-2 mb-1">USERNAME</Form.Label>
                                        <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                            <InputGroup.Text className="bg-white border-0 ps-3">
                                                <FaUser className="text-primary opacity-50" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter your username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                className="border-0 bg-white py-2"
                                                style={{ boxShadow: 'none' }}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold small text-secondary ps-2 mb-1">PASSWORD</Form.Label>
                                        <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                            <InputGroup.Text className="bg-white border-0 ps-3">
                                                <FaLock className="text-primary opacity-50" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
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
                                        <div className="text-end mt-1">
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none small text-muted"
                                                style={{ fontSize: '0.75rem' }}
                                                onClick={() => navigate('/forgot-password')}
                                            >
                                                Forgot Password?
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    {/* --- SIDE-BY-SIDE BUTTONS (To Save Height) --- */}
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center"
                                                disabled={loading}
                                                style={{ height: '45px' }}
                                            >
                                                {loading ? <Spinner animation="border" size="sm" /> : <><FaSignInAlt className="me-2" /> Sign In</>}
                                            </Button>
                                        </Col>
                                        <Col md={6}>
                                            <Button
                                                variant="white"
                                                className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center border"
                                                onClick={handleGoogleLogin}
                                                style={{ background: 'white', color: '#333', height: '45px' }}
                                            >
                                                <FaGoogle className="me-2 text-danger" /> Google Login
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        ) : (
                            <Form onSubmit={handleVerify} className="fade-in">
                                <div className="alert alert-success py-1 text-center mb-4 border-0 rounded-pill small bg-success bg-opacity-10 text-success">
                                    <FaCheckCircle className="me-2" />
                                    OTP sent to your email!
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

                                <div className="d-flex justify-content-center mb-4">
                                    <Button
                                        variant="link"
                                        onClick={handleResendOtp}
                                        disabled={!canResend || loading}
                                        className="p-0 text-decoration-none small text-muted"
                                    >
                                        {canResend ? (
                                            <span className="text-primary fw-bold"><FaRedo className="me-1" /> Resend OTP</span>
                                        ) : (
                                            <span>Resend code in {formatTime(timer)}</span>
                                        )}
                                    </Button>
                                </div>

                                <Button variant="success" type="submit" className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale" style={{ height: '45px' }}>
                                    Verify & Login
                                </Button>
                            </Form>
                        )}

                        {step === 1 && (
                            <div className="text-center mt-3 pt-3 border-top border-light d-flex justify-content-center align-items-center">
                                <span className="text-muted small me-2">Don't have an account?</span>
                                <Button variant="link" onClick={() => navigate('/register')} className="p-0 fw-bold text-decoration-none">
                                    Create Free Account
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Login;