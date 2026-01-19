import { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import {
    FaUserPlus,
    FaUser,
    FaEnvelope,
    FaLock,
    FaArrowLeft,
    FaGoogle,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

// --- GLASSMORPHISM STYLE (Same as Login) ---
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', { username, email, password });
            toast.success("Registration Successful! Please Login.");
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Registration failed. Try again.";
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // Set cookie to tell backend we intend to REGISTER
        document.cookie = "auth_intent=register; path=/; max-age=300";
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 fade-in"
             style={{
                 background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
                 position: 'relative',
                 overflow: 'hidden'
             }}>

            {/* Background Blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: '#6366f1', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%', zIndex: '0' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '500px', height: '500px', background: '#10b981', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%', zIndex: '0' }}></div>

            <Container style={{ zIndex: 1, maxWidth: '450px' }}>
                <Card className="border-0 shadow-lg" style={glassStyle}>
                    <Card.Body className="p-4">
                        <div className="text-start mb-2">
                            <Button variant="link" onClick={() => navigate('/')} className="p-0 text-decoration-none text-muted fw-bold small">
                                <FaArrowLeft className="me-2" /> Back
                            </Button>
                        </div>

                        <div className="text-center mb-3">
                            <div className="bg-white p-2 rounded-circle shadow-sm d-inline-block mb-2 text-primary">
                                <FaUserPlus size={28} />
                            </div>
                            <h4 className="fw-bold text-dark mb-0">Create Account</h4>
                        </div>

                        <Form onSubmit={handleRegister}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold text-muted small text-uppercase ls-1 mb-1">Username</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaUser className="text-primary opacity-50" /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="form-control border-start-0 ps-0 shadow-none"
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold text-muted small text-uppercase ls-1 mb-1">Email Address</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaEnvelope className="text-primary opacity-50" /></InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-control border-start-0 ps-0 shadow-none"
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold text-muted small text-uppercase ls-1 mb-1">Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0"><FaLock className="text-primary opacity-50" /></InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="form-control border-start-0 border-end-0 ps-0 shadow-none"
                                    />
                                    <Button variant="outline-secondary" className="border-start-0 bg-white text-muted" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 btn fw-bold mb-3 shadow-sm rounded-pill py-2" disabled={loading}>
                                {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Creating...</> : "Sign Up"}
                            </Button>

                            <div className="d-flex align-items-center my-3">
                                <hr className="flex-grow-1 opacity-25" />
                                <span className="px-3 text-muted small fw-bold">OR</span>
                                <hr className="flex-grow-1 opacity-25" />
                            </div>

                            <Button variant="white" className="w-100 fw-bold border shadow-sm d-flex align-items-center justify-content-center py-2 rounded-pill bg-white text-dark hover-lift" onClick={handleGoogleRegister}>
                                <FaGoogle className="me-2 text-danger" /> Sign up with Google
                            </Button>
                        </Form>

                        <div className="text-center mt-3 pt-2 border-top">
                            <span className="text-muted small">Already have an account? </span>
                            <Button variant="link" onClick={() => navigate('/login')} className="p-0 fw-bold text-primary text-decoration-none small">
                                Login Here
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Register;