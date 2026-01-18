import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup, Row, Col } from 'react-bootstrap';
import {
    FaUserPlus,
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowLeft,
    FaGoogle
} from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- CHECK FOR REDIRECT ERROR ---
    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'account_not_found') {
            toast.warning("Account not found. Please create an account first.");
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', {
                ...formData,
                role: 'USER'
            });
            toast.success("Registration Successful! Please login.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        document.cookie = "auth_intent=register; path=/; max-age=300";
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
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
                          width: '700px', // INCREASED WIDTH
                          maxWidth: '95%',
                          borderRadius: '24px',
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.5)'
                      }}>

                    {/* Decorative Top Gradient */}
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '6px', background: 'linear-gradient(90deg, #0d6efd, #198754)' }}></div>

                    <Card.Body className="p-4 px-md-5"> {/* Reduced Padding (p-5 -> p-4) */}

                        {/* --- HEADER (COMPACT) --- */}
                        <div className="text-center mb-4">
                            <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-2 text-primary"
                                 style={{ width: '60px', height: '60px' }}> {/* Reduced Icon Size */}
                                <FaUserPlus size={28} />
                            </div>
                            <h3 className="fw-bold text-dark mb-0">Create Account</h3>
                            <p className="text-muted small">Join Contract Risk Analyzer today</p>
                        </div>

                        <Form onSubmit={handleRegister} className="fade-in">

                            {/* --- ROW 1: USERNAME & EMAIL (SIDE-BY-SIDE) --- */}
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Form.Label className="fw-bold small text-secondary ps-2 mb-1">USERNAME</Form.Label>
                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                        <InputGroup.Text className="bg-white border-0 ps-3">
                                            <FaUser className="text-primary opacity-50" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            placeholder="User123"
                                            className="border-0 bg-white py-2"
                                            style={{ boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="fw-bold small text-secondary ps-2 mb-1">EMAIL ADDRESS</Form.Label>
                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                        <InputGroup.Text className="bg-white border-0 ps-3">
                                            <FaEnvelope className="text-primary opacity-50" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="name@mail.com"
                                            className="border-0 bg-white py-2"
                                            style={{ boxShadow: 'none' }}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>

                            {/* --- ROW 2: PASSWORD (FULL WIDTH) --- */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small text-secondary ps-2 mb-1">PASSWORD</Form.Label>
                                <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <FaLock className="text-primary opacity-50" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Min 8 characters"
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

                            {/* --- ACTION BUTTONS --- */}
                            <Row className="g-3 align-items-center">
                                <Col md={6}>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center"
                                        disabled={loading}
                                        style={{ height: '45px' }}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : "Register Now"}
                                    </Button>
                                </Col>
                                <Col md={6}>
                                    <Button
                                        variant="white"
                                        className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center border"
                                        onClick={handleGoogleRegister}
                                        style={{ background: 'white', color: '#333', height: '45px' }}
                                    >
                                        <FaGoogle className="me-2 text-danger" /> Google Signup
                                    </Button>
                                </Col>
                            </Row>
                        </Form>

                        {/* --- FOOTER (COMPACT) --- */}
                        <div className="text-center mt-3 pt-3 border-top border-light d-flex justify-content-center align-items-center">
                            <span className="text-muted small me-2">Already have an account?</span>
                            <Button variant="link" onClick={() => navigate('/login')} className="p-0 fw-bold text-decoration-none">
                                Login here
                            </Button>
                        </div>

                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Register;