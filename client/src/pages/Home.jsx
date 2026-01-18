import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button, Row, Col, Card, Form, InputGroup, Alert } from 'react-bootstrap';
import { FaFileContract, FaUpload, FaSearch, FaEye, FaUserPlus, FaSignInAlt, FaRobot, FaShieldAlt } from 'react-icons/fa';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const Home = () => {
    const [contracts, setContracts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        setIsLoggedIn(!!token);
        if (token) {
            fetchContracts();
        }
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await api.get('/contracts');
            setContracts(response.data);
        } catch (error) {
            console.error('Failed to fetch contracts:', error);
        }
    };

    const handleUpload = async (e) => {
        if (!isLoggedIn) {
            toast.warning('Please login to upload contracts');
            navigate('/login');
            return;
        }

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
            // Improved Error Handling for Quota Limits
            const msg = error.response?.data?.message || "Upload failed!";
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleSearch = () => {
        if (!isLoggedIn) {
            toast.warning('Please login to search contracts');
            navigate('/login');
            return;
        }
    };

    const filteredContracts = contracts.filter(contract =>
        contract.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.id.toString().includes(searchTerm)
    );

    const getRiskBadge = (riskLevel = 'low') => {
        const riskLevels = {
            low: { text: 'Low Risk', variant: 'success', icon: '🟢' },
            medium: { text: 'Medium Risk', variant: 'warning', icon: '🟡' },
            high: { text: 'High Risk', variant: 'danger', icon: '🔴' }
        };
        return riskLevels[riskLevel] || riskLevels.low;
    };

    return (
        <div className="min-vh-100">
            {/* Navigation */}
            <Navbar bg="primary" variant="dark" className="px-4 py-3 shadow-sm">
                <Container fluid>
                    <Navbar.Brand className="fw-bold">
                        <FaShieldAlt className="me-2" />
                        Contract Risk Analyzer
                    </Navbar.Brand>
                    <div className="d-flex gap-2">
                        {!isLoggedIn ? (
                            <>
                                <Button variant="outline-light" onClick={() => navigate('/register')}>
                                    <FaUserPlus className="me-1" />
                                    Register
                                </Button>
                                <Button variant="light" onClick={() => navigate('/login')}>
                                    <FaSignInAlt className="me-1" />
                                    Login
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline-light" onClick={() => navigate('/dashboard')}>
                                <FaFileContract className="me-1" />
                                Dashboard
                            </Button>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <div className="bg-gradient-primary text-white py-5">
                <Container className="text-center">
                    <FaRobot size={64} className="mb-4 text-primary" />
                    <h1 className="display-4 fw-bold mb-3">AI-Powered Contract Risk Analysis</h1>
                    <p className="lead mb-4">Upload your contracts and let our AI analyze potential risks, liabilities, and compliance issues</p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <Button
                            size="lg"
                            variant="light"
                            className="d-flex align-items-center"
                            onClick={() => isLoggedIn ? document.getElementById('file-upload').click() : navigate('/login')}
                        >
                            <FaUpload className="me-2" />
                            Upload Contract
                        </Button>
                        <Button
                            size="lg"
                            variant="outline-light"
                            onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
                        >
                            <FaEye className="me-2" />
                            View Contracts
                        </Button>
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleUpload}
                        accept="application/pdf"
                        style={{ display: 'none' }}
                    />
                </Container>
            </div>

            <Container className="py-5">
                {/* Search Section */}
                {isLoggedIn && (
                    <Card className="mb-5 border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <InputGroup size="lg">
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search contracts by name or ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Button variant="primary" size="lg" onClick={handleSearch} className="w-100">
                                        <FaSearch className="me-2" />
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}

                {/* Contracts Section */}
                {isLoggedIn ? (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold mb-0">Your Contracts</h3>
                            <span className="badge bg-secondary fs-6">{filteredContracts.length} contracts</span>
                        </div>

                        {filteredContracts.length === 0 ? (
                            <Card className="text-center py-5 border-dashed">
                                <Card.Body>
                                    <FaFileContract size={64} className="text-muted mb-3" />
                                    <h5 className="text-muted">No contracts found</h5>
                                    <p className="text-muted">Upload your first contract to get started with risk analysis!</p>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                                {filteredContracts.map((contract) => {
                                    const riskBadge = getRiskBadge(contract.riskLevel);
                                    return (
                                        <Col key={contract.id}>
                                            <Card className="h-100 border-0 shadow-sm">
                                                <Card.Body className="d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <FaFileContract size={24} className="text-primary" />
                                                        <span className={`badge bg-${riskBadge.variant} d-flex align-items-center`}>
                                                            {riskBadge.icon}
                                                            <span className="ms-1">{riskBadge.text}</span>
                                                        </span>
                                                    </div>

                                                    <Card.Title className="text-truncate fw-semibold mb-2" title={contract.filename}>
                                                        {contract.filename}
                                                    </Card.Title>

                                                    <Card.Text className="text-muted small mb-3">
                                                        ID: {contract.id} • Uploaded: {new Date(contract.uploadDate).toLocaleDateString()}
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
                        )}
                    </>
                ) : (
                    <Alert variant="info" className="text-center py-5">
                        <FaSignInAlt size={48} className="mb-3 text-primary" />
                        <h4>Please Login to Access Your Contracts</h4>
                        <p className="mb-3">Login to upload contracts, view risk analysis, and chat with our AI assistant.</p>
                        <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
                            <FaSignInAlt className="me-2" />
                            Login Now
                        </Button>
                    </Alert>
                )}
            </Container>
        </div>
    );
};

export default Home;