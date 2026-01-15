import { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { FaShieldAlt, FaUser, FaLock, FaCheckCircle } from 'react-icons/fa';

const Login = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/login', { username, password });
            setStep(2);
            toast.success("OTP sent to your email!");
        } catch (err) {
            toast.error("Login failed! Check credentials.");
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
            toast.error("Invalid OTP!");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center fade-in" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '450px', maxWidth: '90%' }} className="shadow-lg border-0">
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <FaShieldAlt size={48} className="text-primary mb-3" />
                        <h2 className="fw-bold text-primary">Contract Risk Analyzer</h2>
                        <p className="text-muted">Secure Login Portal</p>
                    </div>

                    {step === 1 ? (
                        <Form onSubmit={handleLogin}>
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

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">
                                    <FaLock className="me-2 text-primary" />
                                    Password
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="form-control-lg"
                                />
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
                        </Form>
                    ) : (
                        <Form onSubmit={handleVerify}>
                            <div className="alert alert-success py-3 text-center mb-4 border-0">
                                <FaCheckCircle className="me-2" />
                                OTP sent to your email! Please check your inbox.
                            </div>
                            <Form.Group className="mb-4">
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

                            <Button variant="success" type="submit" className="w-100 btn-lg fw-semibold">
                                <FaCheckCircle className="me-2" />
                                Verify & Login
                            </Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;