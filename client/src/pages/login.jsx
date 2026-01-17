import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import {
    FaShieldAlt,
    FaUser,
    FaLock,
    FaCheckCircle,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
    FaRedo, // New Icon
    FaGoogle
} from 'react-icons/fa';

const Login = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // State for toggling password visibility
    const [showPassword, setShowPassword] = useState(false);

    // --- RESEND OTP STATES ---
    const [timer, setTimer] = useState(60); // 60 seconds = 1 Minutes
    const [canResend, setCanResend] = useState(false);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
//    Google LoginHandler
    useEffect(() => {
        // Check if URL has ?token=...
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');
        if (token) {
            localStorage.setItem('jwtToken', token);
            toast.success("Login Successful via Google!");
            navigate('/dashboard');
        }else if (error === 'user_exists') {
             // This catches the redirect from the Register page
             toast.error("User already exists! Please login.");
         }
    }, []);
    // --- TIMER LOGIC ---
    useEffect(() => {
        let interval;
        // Run timer only if in Step 2 (OTP Step) and button is disabled
        if (step === 2 && !canResend && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true); // Time's up, enable button
        }
        return () => clearInterval(interval);
    }, [step, canResend, timer]);

    // Format seconds into MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- STEP 1: LOGIN (SEND OTP) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/login', { username, password });
            setStep(2);
            setTimer(60); // Start Timer
            setCanResend(false);
            toast.success("OTP sent to your email!");
        } catch (err) {
           if (err.response && err.response.status === 404) {
               toast.error("Account does not exist. Redirecting to Register...");
               setTimeout(() => navigate('/register'), 2000);
           } else {
               toast.error("Login failed. Check username/password.");
           }
        } finally {
            setLoading(false);
        }
    };
//  Handler Google Button
   const handleGoogleLogin = () => {
       // Set cookie to tell backend this is a LOGIN attempt
        document.cookie = "auth_intent=login; path=/; max-age=300";
        // Redirect browser directly to backend OAuth endpoint
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    // --- RESEND OTP HANDLER ---
    const handleResendOtp = async () => {
        setLoading(true);
        try {
            // Re-submit credentials to generate a fresh OTP
            await api.post('/auth/login', { username, password });
            toast.success("New OTP sent successfully!");
            setTimer(60); // Reset timer
            setCanResend(false); // Disable button
            setOtp(''); // Clear old OTP input
        } catch (err) {
            toast.error("Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/auth/login/verify?username=${username}&otp=${otp}`);
            localStorage.setItem('jwtToken', response.data.token);
            toast.success("Login Successful!");
            navigate('/dashboard');
        } catch (err) {
            toast.error("Invalid OTP");
            console.log("OTP verification failed:", err.message);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center fade-in" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '450px', maxWidth: '90%' }} className="shadow-lg border-0">
                <Card.Body className="p-5">

                    {/* Back Button */}
                    <div className="text-start mb-4">
                        <Button
                            variant="link"
                            onClick={() => navigate('/')}
                            className="p-0 text-decoration-none"
                        >
                            <FaArrowLeft className="me-2" /> Back to Home
                        </Button>
                    </div>

                    <div className="text-center mb-4">
                        <FaShieldAlt size={48} className="text-primary mb-3" />
                        <h2 className="fw-bold text-primary">Contract Risk Analyzer</h2>
                        <p className="text-muted">Secure Login Portal</p>
                    </div>

                    {step === 1 ? (
                        <Form onSubmit={handleLogin}>
                            {/* Username Field */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">
                                    <FaUser className="me-2 text-primary" />
                                    Username
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="form-control-lg"
                                />
                            </Form.Group>

                            {/* Password Field */}
                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Label className="fw-semibold mb-0">
                                        <FaLock className="me-2 text-primary" />
                                        Password
                                    </Form.Label>
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none small"
                                        style={{ fontSize: '0.9rem' }}
                                        onClick={() => navigate('/forgot-password')}
                                    >
                                        Forgot Password?
                                    </Button>
                                </div>
                                <InputGroup className="mt-2">
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="form-control-lg"
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 btn-lg fw-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <FaLock className="me-2" />
                                        Send OTP
                                    </>
                                )}
                            </Button>
                            <div className="text-center my-3 text-muted">OR</div>
                                <Button
                                    variant="outline-danger"
                                    className="w-100 fw-bold d-flex align-items-center justify-content-center"
                                    onClick={handleGoogleLogin}
                                >
                                    <FaGoogle className="me-2" /> Login with Google
                                </Button>
                        </Form>
                    ) : (
                        <Form onSubmit={handleVerify}>
                            <div className="alert alert-success py-3 text-center mb-4 border-0">
                                <FaCheckCircle className="me-2" />
                                OTP sent to your email! Please check your inbox.
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    <FaShieldAlt className="me-2 text-success" />
                                    Enter OTP
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="form-control-lg text-center"
                                    maxLength="6"
                                />
                            </Form.Group>

                            {/* --- RESEND OTP BUTTON --- */}
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
                            {/* ------------------------- */}

                            <Button variant="success" type="submit" className="w-100 btn-lg fw-semibold">
                                <FaCheckCircle className="me-2" />
                                Verify & Login
                            </Button>
                        </Form>
                    )}

                    {step === 1 && (
                        <div className="text-center mt-4">
                            <p className="text-muted mb-0">Don't have an account?</p>
                            <Button variant="link" onClick={() => navigate('/register')} className="p-0">
                                Register here
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;