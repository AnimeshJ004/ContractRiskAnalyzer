import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Card, Button, Modal, Form, Alert, InputGroup } from 'react-bootstrap';
import {
    FaUser,
    FaEnvelope,
    FaShieldAlt,
    FaArrowLeft,
    FaTrash,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

const Settings = () => {
    // --- STATE MANAGEMENT ---
    const [user, setUser] = useState({ username: '', email: '', role: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // New state for toggling password visibility
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // --- 1. FETCH PROFILE ON LOAD ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                setUser(response.data);
            } catch (error) {
                // Silently fail and redirect to login if session is invalid
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    // --- 2. DELETE ACCOUNT HANDLER ---
   const handleDeleteAccount = async () => {
           if (!password) {
               toast.error("Please enter your password.");
               return;
           }

           setLoading(true);
           try {
               await api.post('/auth/delete-account', {
                   password: password
               });

               localStorage.removeItem('jwtToken');
               toast.success("Account deleted successfully. Goodbye!");
               navigate('/');
           } catch (error) {
               // --- FIX IS HERE ---
               // Your interceptor already extracted the message into error.message
               // Do NOT check error.response here.
               const msg = error.message || "Failed to delete account.";
               toast.error(msg);
           } finally {
               setLoading(false);
               setShowDeleteModal(false);
           }
       };

    return (
        <Container className="py-5 fade-in" style={{ maxWidth: '800px' }}>

            {/* HEADER */}
            <div className="mb-4">
                <Button variant="link" onClick={() => navigate('/dashboard')} className="p-0 text-decoration-none mb-2">
                    <FaArrowLeft className="me-2" /> Back to Dashboard
                </Button>
                <h2 className="fw-bold"><FaUser className="me-2 text-primary"/> Account Settings</h2>
            </div>

            {/* PROFILE CARD */}
            <Card className="shadow-sm border-0 mb-5">
                <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4 text-muted border-bottom pb-2">Profile Information</h5>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold"><FaUser className="me-2 text-secondary"/> Username</Form.Label>
                        <Form.Control type="text" value={user.username} disabled className="bg-light" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold"><FaEnvelope className="me-2 text-secondary"/> Email</Form.Label>
                        <Form.Control type="text" value={user.email} disabled className="bg-light" />
                    </Form.Group>

                    <Form.Group className="mb-1">
                        <Form.Label className="fw-semibold"><FaShieldAlt className="me-2 text-secondary"/> Account Role</Form.Label>
                        <Form.Control type="text" value={user.role} disabled className="bg-light" />
                    </Form.Group>
                </Card.Body>
            </Card>

            {/* DANGER ZONE CARD */}
            <Card className="shadow-sm border-danger">
                <Card.Header className="bg-danger text-white fw-bold">
                    <FaExclamationTriangle className="me-2" /> Danger Zone
                </Card.Header>
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h5 className="fw-bold text-danger">Delete Account</h5>
                            <p className="text-muted mb-0 small">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                        </div>
                        <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                            Delete Account
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger fw-bold">
                        <FaTrash className="me-2" /> Confirm Account Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning" className="small">
                        All your uploaded contracts, chats, and personal data will be permanently removed.
                    </Alert>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Enter Password to Confirm</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    {/* FORGOT PASSWORD LINK */}
                    <div className="text-end">
                        <Button
                            variant="link"
                            className="p-0 text-decoration-none small"
                            onClick={() => {
                                setShowDeleteModal(false);
                                navigate('/forgot-password', {
                                    state: {
                                        returnPath: '/settings',
                                        username: user.username,
                                        email: user.email
                                    }
                                });
                            }}
                        >
                            Forgot Password?
                        </Button>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        disabled={loading || !password}
                    >
                        {loading ? "Deleting..." : "Permanently Delete Account"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Settings;