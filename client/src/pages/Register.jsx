import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
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
                role: 'USER' // Default role
            });
            toast.success("Registration Successful! Please login.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const msg = error.message || "Registration failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // Set intent to REGISTER so backend knows to create user
        document.cookie = "auth_intent=register; path=/; max-age=300";
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <Container className="d-flex justify-content-center align-items-center fade-in" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '500px', maxWidth: '90%' }} className="shadow-lg border-0">
                <Card.Body className="p-5">

                    <div className="text-start mb-4">
                        <Button variant="link" onClick={() => navigate('/')} className="p-0 text-decoration-none text-muted">
                            <FaArrowLeft className="me-2" /> Back to Home
                        </Button>
                    </div>

                    <div className="text-center mb-4">
                        <FaUserPlus size={40} className="text-primary mb-3" />
                        <h3 className="fw-bold text-primary">Create Account</h3>
                        <p className="text-muted small">Join Contract Risk Analyzer today</p>
                    </div>

                    <Form onSubmit={handleRegister}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light"><FaUser className="text-secondary"/></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="johndoe123"
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Email Address</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light"><FaEnvelope className="text-secondary"/></InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@example.com"
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Password</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light"><FaLock className="text-secondary"/></InputGroup.Text>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Min 8 characters"
                                />
                                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 btn-lg fw-bold" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Register Now"}
                        </Button>
                    </Form>

                    <div className="text-center my-3 text-muted">OR</div>

                    <Button
                        variant="outline-danger"
                        className="w-100 fw-bold"
                        onClick={handleGoogleRegister}
                    >
                        <FaGoogle className="me-2" /> Sign up with Google
                    </Button>

                    <div className="text-center mt-4">
                        <p className="text-muted mb-0">Already have an account?</p>
                        <Button variant="link" onClick={() => navigate('/login')} className="p-0 fw-bold">
                            Login here
                        </Button>
                    </div>

                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;