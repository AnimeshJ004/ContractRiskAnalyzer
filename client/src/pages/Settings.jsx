import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Container, Card, Button, Form, Modal, Spinner, Badge, InputGroup } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaUserCog,
    FaEnvelope,
    FaUser,
    FaTrashAlt,
    FaExclamationTriangle,
    FaShieldAlt,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

const Settings = () => {
    const [user, setUser] = useState({ username: '', email: '', role: '' });
    const [loading, setLoading] = useState(true);

    // Delete Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggle for Eye Icon

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setUser(response.data);
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.post('/users/delete-account', { password: deletePassword });
            localStorage.removeItem('jwtToken');
            toast.success("Account deleted successfully.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account.");
        }
    };

    // Helper to close modal and go to forgot password
    const handleForgotPassword = () => {
        setShowDeleteModal(false);
        navigate('/forgot-password');
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <div className="min-vh-100 position-relative overflow-hidden d-flex flex-column">

            {/* --- BACKGROUND BLOBS --- */}
            <div className="position-absolute rounded-circle bg-primary"
                 style={{ top: '-10%', right: '-5%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', filter: 'blur(80px)', opacity: 0.05, zIndex: 0 }} />
            <div className="position-absolute rounded-circle bg-success"
                 style={{ bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', maxWidth: '700px', maxHeight: '700px', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <Container className="py-5 position-relative z-1" style={{ maxWidth: '800px' }}>

                {/* --- HEADER --- */}
                <div className="d-flex align-items-center mb-5">
                    <Button
                        variant="light"
                        onClick={() => navigate('/dashboard')}
                        className="me-3 rounded-circle p-2 shadow-sm text-primary hover-scale d-flex align-items-center justify-content-center"
                        style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.8)' }}
                    >
                        <FaArrowLeft size={18} />
                    </Button>
                    <div>
                        <h2 className="fw-bold mb-0 text-dark">Account Settings</h2>
                        <p className="text-muted mb-0">Manage your profile and preferences</p>
                    </div>
                </div>

                {/* --- PROFILE CARD --- */}
                <Card className="border-0 shadow-sm mb-5 overflow-hidden hover-lift"
                      style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.4)' }}>

                    {/* Decorative Gradient Top */}
                    <div className="position-absolute top-0 start-0 w-100" style={{ height: '6px', background: 'linear-gradient(90deg, #0d6efd, #198754)' }}></div>

                    <Card.Body className="p-5">
                        <div className="d-flex align-items-center mb-4 border-bottom pb-4" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                            <div className="bg-white p-3 rounded-circle shadow-sm text-primary me-4 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                <FaUserCog size={36} />
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1">{user.username}</h4>
                                <Badge bg="light" text="primary" className="border shadow-sm rounded-pill fw-normal px-3">
                                    <FaShieldAlt className="me-1" /> {user.role || 'User Role'}
                                </Badge>
                            </div>
                        </div>

                        <Form>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="text-uppercase text-muted small fw-bold mb-2 ps-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Username</Form.Label>
                                        <div className="d-flex align-items-center p-3 border-0 rounded-4 bg-white shadow-sm">
                                            <FaUser className="text-primary me-3 opacity-50" />
                                            <span className="fw-semibold text-dark">{user.username}</span>
                                        </div>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="text-uppercase text-muted small fw-bold mb-2 ps-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Email Address</Form.Label>
                                        <div className="d-flex align-items-center p-3 border-0 rounded-4 bg-white shadow-sm">
                                            <FaEnvelope className="text-primary me-3 opacity-50" />
                                            <span className="fw-semibold text-dark">{user.email}</span>
                                        </div>
                                    </Form.Group>
                                </div>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>

                {/* --- DANGER ZONE --- */}
                <h5 className="fw-bold text-danger mb-3 ps-2 d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" /> Danger Zone
                </h5>
                <Card className="border-0 shadow-sm"
                      style={{ background: 'rgba(255, 235, 238, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(220, 53, 69, 0.2)' }}>
                    <Card.Body className="p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <h6 className="fw-bold text-dark mb-1">Delete Account</h6>
                            <p className="text-muted mb-0 small" style={{ maxWidth: '450px', lineHeight: '1.4' }}>
                                This will permanently remove your account, all uploaded contracts, and analysis history. This action cannot be undone.
                            </p>
                        </div>
                        <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="px-4 py-2 rounded-pill shadow-sm fw-semibold hover-scale">
                            <FaTrashAlt className="me-2" /> Delete My Account
                        </Button>
                    </Card.Body>
                </Card>

                {/* --- DELETE CONFIRMATION MODAL --- */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                    <Modal.Header className="bg-danger text-white border-0 py-3">
                        <Modal.Title className="fw-bold h5">
                            <FaExclamationTriangle className="me-2" /> Delete Account?
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <p className="mb-3 text-center fs-5 fw-semibold">Are you absolutely sure?</p>
                        <p className="text-center text-muted small mb-4">
                            Please confirm your password to proceed.
                        </p>

                        <Form.Group>
                            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                <Form.Label className="fw-bold small text-secondary mb-0">PASSWORD</Form.Label>
                                <Button
                                    variant="link"
                                    onClick={handleForgotPassword}
                                    className="p-0 text-decoration-none small text-primary"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Forgot Password?
                                </Button>
                            </div>

                            <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="border-0 py-2 ps-3 bg-light"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                />
                                <Button
                                    variant="light"
                                    className="border-0 text-muted px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 justify-content-center pb-4 pt-0">
                        <Button variant="light" className="px-4 rounded-pill fw-semibold" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" className="px-4 rounded-pill shadow-sm fw-semibold" onClick={handleDeleteAccount} disabled={!deletePassword}>
                            Yes, Delete Everything
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </div>
    );
};

export default Settings;