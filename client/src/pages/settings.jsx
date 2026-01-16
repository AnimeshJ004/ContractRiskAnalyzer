import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { Container, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaUserCog, FaEnvelope, FaUser, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

const Settings = () => {
    const [user, setUser] = useState({ username: '', email: '', role: '' });
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
            await api.delete('/auth/delete');
            localStorage.removeItem('jwtToken');
            toast.success("Account deleted successfully.");
            navigate('/login');
        } catch (error) {
            toast.error("Failed to delete account.");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-5 fade-in" style={{ maxWidth: '800px' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/dashboard')} className="me-3">
                    <FaArrowLeft /> Back
                </Button>
                <h2 className="fw-bold mb-0 text-primary"><FaUserCog className="me-2" /> Account Settings</h2>
            </div>

            {/* Profile Card */}
            <Card className="shadow-sm border-0 mb-5">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Profile Information</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted small fw-bold">USERNAME</Form.Label>
                            <div className="d-flex align-items-center p-2 border rounded bg-light">
                                <FaUser className="text-primary me-3" />
                                <span className="fw-semibold">{user.username}</span>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted small fw-bold">EMAIL ADDRESS</Form.Label>
                            <div className="d-flex align-items-center p-2 border rounded bg-light">
                                <FaEnvelope className="text-primary me-3" />
                                <span>{user.email}</span>
                            </div>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="text-muted small fw-bold">ROLE</Form.Label>
                            <div><span className="badge bg-info">{user.role}</span></div>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>

            {/* Danger Zone */}
            <Card className="shadow-sm border-0 border-start border-danger border-5">
                <Card.Body className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h5 className="fw-bold text-danger">Delete Account</h5>
                        <p className="text-muted mb-0 small">
                            Permanently delete your account and all associated contracts. This action cannot be undone.
                        </p>
                    </div>
                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                        <FaTrashAlt className="me-2" /> Delete My Account
                    </Button>
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="text-danger fw-bold">
                        <FaExclamationTriangle className="me-2" /> Delete Account?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you absolutely sure you want to delete your account?</p>
                    <p className="fw-bold text-danger">Warning: This will delete all your uploaded contracts and analysis history.</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>Yes, Delete Everything</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Settings;