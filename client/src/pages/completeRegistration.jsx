import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Card, Form, Button, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUserCheck, FaEye, FaEyeSlash, FaSyncAlt, FaCopy, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CompleteRegistration = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        username: '',
        password: '',
        tempToken: ''
    });

    const [showPassword, setShowPassword] = useState(true);

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pass = "";
        for(let i=0; i<14; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    useEffect(() => {
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const tempToken = searchParams.get('tempToken');

        if (!email || !tempToken) {
            toast.error("Invalid registration session.");
            navigate('/login');
            return;
        }

        setFormData({
            email,
            name,
            username: email.split('@')[0], // Default username from email
            password: generateRandomPassword(),
            tempToken
        });
    }, [searchParams, navigate]);

    const handleRegenerate = () => {
        const newPass = generateRandomPassword();
        setFormData({ ...formData, password: newPass });
        toast.info("New password generated!");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formData.password);
        toast.success("Password copied to clipboard!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Call the completion endpoint
            // This endpoint creates the user AND returns the JWT token
            const response = await api.post('/auth/oauth-complete', {
                email: formData.email,
                username: formData.username,
                password: formData.password,
                tempToken: formData.tempToken
            });

            // 2. Use the token directly from the response
            const token = response.data.token;

            if (token) {
                localStorage.setItem('jwtToken', token);
                toast.success("Account Created! Welcome to the Dashboard.");
                navigate('/dashboard');
            } else {
                throw new Error("Registration successful, but login failed. Please login manually.");
            }

        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed.";
            toast.error(msg);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100 fade-in">
            <Card style={{ width: '500px' }} className="shadow-lg border-0">
                <Card.Body className="p-5">

                    {/* BACK BUTTON */}
                    <div className="text-start mb-4">
                        <Button
                            variant="link"
                            onClick={() => navigate('/')}
                            className="p-0 text-decoration-none text-muted"
                        >
                            <FaArrowLeft className="me-2" /> Back to Home
                        </Button>
                    </div>

                    <div className="text-center mb-4">
                        <FaUserCheck size={40} className="text-success mb-2" />
                        <h3 className="fw-bold text-primary">Finalize Account</h3>
                        <p className="text-muted small">
                            Google verified! Set your credentials to finish.
                        </p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Email (Verified)</Form.Label>
                            <Form.Control type="email" value={formData.email} disabled className="bg-light" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold d-flex justify-content-between">
                                Password
                                <small className="text-muted fw-normal">Auto-generated for security</small>
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} title="Show/Hide">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>

                                <OverlayTrigger placement="top" overlay={<Tooltip>Regenerate Random Password</Tooltip>}>
                                    <Button variant="outline-primary" onClick={handleRegenerate}>
                                        <FaSyncAlt />
                                    </Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement="top" overlay={<Tooltip>Copy to Clipboard</Tooltip>}>
                                    <Button variant="outline-success" onClick={handleCopy}>
                                        <FaCopy />
                                    </Button>
                                </OverlayTrigger>
                            </InputGroup>
                            <Form.Text className="text-muted small">
                                You can use this strong password or type your own.
                            </Form.Text>
                        </Form.Group>

                        <Button variant="primary" type="submit" size="lg" className="w-100 fw-bold">
                            Create Account & Login
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CompleteRegistration;