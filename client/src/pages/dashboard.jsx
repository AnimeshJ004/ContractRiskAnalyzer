import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Navbar, Button, Row, Col, Card, Form, ProgressBar, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaFileContract, FaSignOutAlt, FaUpload, FaRobot, FaClock } from 'react-icons/fa';

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await api.get('/contracts');
            setContracts(response.data);
        } catch (error) {
            console.error(error);
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

    // Simulate risk levels for demo purposes
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
            {/* Navbar */}
            <Navbar bg="primary" variant="dark" className="px-4 py-3 shadow-sm">
                <Container fluid>
                    <Navbar.Brand className="fw-bold">
                        <FaFileContract className="me-2" />
                        Contract Risk Analyzer
                    </Navbar.Brand>
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={handleLogout}
                        className="d-flex align-items-center"
                    >
                        <FaSignOutAlt className="me-1" />
                        Logout
                    </Button>
                </Container>
            </Navbar>

            <Container className="py-4">
                {/* Upload Section */}
                <Card className="mb-5 border-0 shadow-sm">
                    <Card.Body className="p-5 text-center">
                        <FaUpload size={48} className="text-primary mb-3" />
                        <h4 className="fw-bold mb-3">Upload New Contract</h4>
                        <p className="text-muted mb-4">Upload your contract PDF for AI-powered risk analysis</p>
                        <Form.Group controlId="formFile" className="mb-0 w-75 mx-auto">
                            <Form.Control
                                type="file"
                                onChange={handleUpload}
                                accept="application/pdf"
                                disabled={uploading}
                                className="form-control-lg"
                            />
                        </Form.Group>
                        {uploading && (
                            <div className="mt-3">
                                <div className="text-primary mb-2">
                                    <FaRobot className="me-2 pulse" />
                                    Analyzing contract with AI...
                                </div>
                                <ProgressBar animated now={75} className="w-50 mx-auto" />
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Contracts Grid */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">My Contracts</h4>
                    <Badge bg="secondary" className="fs-6">{contracts.length} contracts</Badge>
                </div>

                {contracts.length === 0 && (
                    <Card className="text-center py-5 border-dashed">
                        <Card.Body>
                            <FaFileContract size={64} className="text-muted mb-3" />
                            <h5 className="text-muted">No contracts found</h5>
                            <p className="text-muted">Upload your first contract to get started with risk analysis!</p>
                        </Card.Body>
                    </Card>
                )}

                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {contracts.map((contract) => {
                        const riskBadge = getRiskBadge(contract.riskLevel);
                        return (
                            <Col key={contract.id}>
                                <Card className="h-100 border-0 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <FaFileContract size={24} className="text-primary" />
                                            <Badge
                                                bg={riskBadge.variant}
                                                className={`d-flex align-items-center risk-${contract.riskLevel}`}
                                            >
                                                {riskBadge.icon}
                                                <span className="ms-1">{riskBadge.text}</span>
                                            </Badge>
                                        </div>

                                        <Card.Title className="text-truncate fw-semibold mb-2" title={contract.filename}>
                                            {contract.filename}
                                        </Card.Title>

                                        <Card.Text className="text-muted small mb-3">
                                            <FaClock className="me-1" />
                                            Uploaded: {new Date(contract.uploadDate).toLocaleDateString()}
                                        </Card.Text>

                                        <Button
                                            variant="primary"
                                            className="w-100 mt-auto d-flex align-items-center justify-content-center"
                                            onClick={() => navigate(`/chat/${contract.id}`)}
                                        >
                                            <FaRobot className="me-2" />
                                            Chat with AI
                                        </Button>
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