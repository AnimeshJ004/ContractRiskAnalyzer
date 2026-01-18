import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { FaUserCheck, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaUser, FaArrowLeft } from 'react-icons/fa';

const CompleteRegistration = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const emailParam = searchParams.get("email");
        const nameParam = searchParams.get("name");

        if (emailParam) {
            setEmail(emailParam);
            if (nameParam) setUsername(nameParam.replace(/\s+/g, '').toLowerCase());
        } else {
            toast.error("Invalid registration link.");
            navigate("/login");
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/oauth2/complete-registration', { email, username, password });
            toast.success("Account setup complete! Please login.");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete registration.");
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
                          width: '550px',
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
                        <div className="text-center mb-4 mt-3">
                            <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3 text-success" style={{ width: '70px', height: '70px' }}>
                                <FaUserCheck size={32} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">Final Step</h3>
                            <p className="text-muted small">Choose a username & password to finish setup</p>
                        </div>

                        <Form onSubmit={handleSubmit} className="fade-in">

                            {/* Read-Only Email Field */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small text-secondary ps-2 mb-1">EMAIL ADDRESS</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={email}
                                    readOnly
                                    className="border-0 bg-light text-muted py-2 rounded-pill ps-3 shadow-sm"
                                    style={{ cursor: 'not-allowed' }}
                                />
                            </Form.Group>

                            {/* Username Field */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small text-secondary ps-2 mb-1">CHOOSE USERNAME</Form.Label>
                                <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <FaUser className="text-primary opacity-50" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="border-0 bg-white py-2"
                                        style={{ boxShadow: 'none' }}
                                    />
                                </InputGroup>
                            </Form.Group>

                            {/* Password Field */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small text-secondary ps-2 mb-1">CREATE PASSWORD</Form.Label>
                                <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <FaLock className="text-primary opacity-50" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 8 characters"
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
                            </Form.Group>

                            <Button
                                variant="success"
                                type="submit"
                                className="w-100 rounded-pill py-2 fw-bold shadow-sm hover-scale d-flex align-items-center justify-content-center"
                                disabled={loading}
                                style={{ height: '45px' }}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-2" /> Complete Setup</>}
                            </Button>

                        </Form>

                        <div className="text-center mt-4 mb-2">
                            <p className="text-muted small">
                                This ensures you have full access to all features.
                            </p>
                        </div>

                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default CompleteRegistration;