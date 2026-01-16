import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import {
    FaUserPlus,
    FaUser,
    FaEnvelope,
    FaLock,
    FaShieldAlt,
    FaArrowLeft,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // States for toggling password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            toast.success("Registration successful! Please login.");
            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err.message);
            toast.error(`Registration error: ${err.message}`);
        } finally {
            setLoading(false);
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
                        <h2 className="fw-bold text-primary">Create Account</h2>
                        <p className="text-muted">Join Contract Risk Analyzer</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                <FaUser className="me-2 text-primary" />
                                Username
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        {/* Email Field */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                <FaEnvelope className="me-2 text-primary" />
                                Email Address
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        {/* Password Field with Eye Button */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                <FaLock className="me-2 text-primary" />
                                Password
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
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

                        {/* Confirm Password Field with Eye Button */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                <FaLock className="me-2 text-primary" />
                                Confirm Password
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="form-control-lg"
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus className="me-2" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </Form>

                    <div className="text-center mt-4">
                        <p className="text-muted mb-0">Already have an account?</p>
                        <Button variant="link" onClick={() => navigate('/login')} className="p-0">
                            Sign in here
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;