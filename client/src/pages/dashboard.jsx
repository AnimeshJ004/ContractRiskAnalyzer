import { useEffect, useState } from 'react';
import api, { deleteContract } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Navbar, Button, Row, Col, Card, Form, ProgressBar, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaFileContract, FaSignOutAlt, FaUpload, FaRobot, FaClock, FaTrash, FaComments } from 'react-icons/fa';

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchContracts(); }, []);

    const fetchContracts = async () => {
        try {
            const response = await api.get('/contracts');
            setContracts(response.data);
        } catch (error) { console.error(error); }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this contract?")) {
            try {
                await deleteContract(id);
                toast.success("Contract deleted!");
                fetchContracts();
            } catch (error) {
                toast.error("Failed to delete contract");
            }
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        setUploading(true);
        try {
            toast.info("Analyzing contract...");
            await api.post('/contracts/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Upload Complete!");
            fetchContracts();
        } catch (error) {
            toast.error("Upload failed!");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch(e) {}
        localStorage.removeItem('jwtToken');
        navigate('/');
    };

    const getRiskBadge = (riskLevel = 'low') => {
        const riskLevels = {
            low: { text: 'Low Risk', variant: 'success', icon: <FaCheckCircle /> },
            medium: { text: 'Medium Risk', variant: 'warning', icon: <FaExclamationTriangle /> },
            high: { text: 'High Risk', variant: 'danger', icon: <FaExclamationTriangle /> }
        };
        return riskLevels[riskLevel] || riskLevels.low;
    };

    return (
        <div className="min-vh-100 fade-in">
            <Navbar bg="primary" variant="dark" className="px-4 py-3 shadow-sm">
                <Container fluid>
                    <Navbar.Brand className="fw-bold"><FaFileContract className="me-2" />Contract Risk Analyzer</Navbar.Brand>
                    <div className="d-flex gap-2">
                        {/* --- GENERAL CHAT BUTTON --- */}
                        <Button variant="light" className="d-flex align-items-center fw-bold text-primary" onClick={() => navigate('/chat/general')}>
                            <FaComments className="me-2" />General AI Chat
                        </Button>
                        <Button variant="outline-light" onClick={handleLogout} className="d-flex align-items-center">
                            <FaSignOutAlt className="me-1" />Logout
                        </Button>
                    </div>
                </Container>
            </Navbar>

            <Container className="py-4">
                <Card className="mb-5 border-0 shadow-sm">
                    <Card.Body className="p-5 text-center">
                        <FaUpload size={48} className="text-primary mb-3" />
                        <h4 className="fw-bold mb-3">Upload New Contract</h4>
                        <Form.Group controlId="formFile" className="mb-0 w-75 mx-auto">
                            <Form.Control type="file" onChange={handleUpload} accept="application/pdf" disabled={uploading} className="form-control-lg" />
                        </Form.Group>
                        {uploading && <div className="mt-3"><div className="text-primary mb-2"><FaRobot className="me-2 pulse" />Analyzing...</div><ProgressBar animated now={75} className="w-50 mx-auto" /></div>}
                    </Card.Body>
                </Card>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">My Contracts</h4>
                    <Badge bg="secondary" className="fs-6">{contracts.length} contracts</Badge>
                </div>

                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {contracts.map((contract) => {
                        const riskBadge = getRiskBadge(contract.riskLevel);
                        return (
                            <Col key={contract.id}>
                                <Card className="h-100 border-0 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <FaFileContract size={24} className="text-primary" />
                                            <Badge bg={riskBadge.variant} className={`d-flex align-items-center risk-${contract.riskLevel}`}>{riskBadge.icon}<span className="ms-1">{riskBadge.text}</span></Badge>
                                        </div>
                                        <Card.Title className="text-truncate fw-semibold mb-2" title={contract.filename}>{contract.filename}</Card.Title>
                                        <Card.Text className="text-muted small mb-3"><FaClock className="me-1" />{new Date(contract.uploadDate).toLocaleDateString()}</Card.Text>
                                        <div className="mt-auto d-flex gap-2">
                                            <Button variant="primary" className="flex-grow-1 d-flex align-items-center justify-content-center" onClick={() => navigate(`/chat/${contract.id}`)}>
                                                <FaRobot className="me-2" />Chat
                                            </Button>
                                            {/* --- DELETE BUTTON --- */}
                                            <Button variant="outline-danger" onClick={(e) => handleDelete(contract.id, e)} title="Delete Contract">
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </div>
    );
};
export default Dashboard;