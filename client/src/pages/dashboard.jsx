import { useEffect, useState, useRef } from 'react';
import api, { deleteContract } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Button, Row, Col, Card, Form, ProgressBar, Badge, Modal, Dropdown, Alert, InputGroup } from 'react-bootstrap';
import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaFileContract,
    FaSignOutAlt,
    FaUpload,
    FaRobot,
    FaClock,
    FaTrash,
    FaComments,
    FaUserCircle,
    FaCog,
    FaShieldAlt,
    FaUser,
    FaCreditCard,
    FaSearch,
    FaCloudUploadAlt,
    FaArrowRight,
    FaInfinity,
    FaCalendarCheck,
    FaGlobeAmericas
} from 'react-icons/fa';

// --- GLASSMORPHISM STYLE ---
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    transition: 'all 0.3s ease'
};

const hoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)'
};

const Dashboard = () => {
    // --- STATE MANAGEMENT ---
    const [contracts, setContracts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // User Profile State
    const [user, setUser] = useState({ username: 'User', email: '', role: 'USER' });

    // Rate Limiting State
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [timerString, setTimerString] = useState("");

    // File Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);

    // --- NEW: Analysis Options State ---
    const [jurisdiction, setJurisdiction] = useState('General');
    const [contractType, setContractType] = useState('General Contract');

    const navigate = useNavigate();
    const isAdmin = user.role === 'ADMIN';

    // --- INITIAL DATA FETCHING ---
    useEffect(() => {
        fetchUserProfile();
        fetchContracts();
        fetchQuota();
    }, []);

    // --- COUNTDOWN TIMER LOGIC ---
    useEffect(() => {
        let interval;
        if (remainingQuota?.resetTime && remainingQuota.remaining === 0) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = remainingQuota.resetTime - now;

                if (diff <= 0) {
                    setTimerString("");
                    fetchQuota();
                    clearInterval(interval);
                } else {
                    const minutes = Math.floor((diff / 1000 / 60) % 60);
                    const seconds = Math.floor((diff / 1000) % 60);
                    setTimerString(
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [remainingQuota]);

    // --- API CALLS ---
    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.log("Could not fetch navbar profile info");
        }
    };

    const fetchContracts = async () => {
        try {
            const response = await api.get('/contracts');
            setContracts(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchQuota = async () => {
        try {
            const response = await api.get('/contracts/rate-limit');
            setRemainingQuota(response.data);
        } catch (error) {
            console.error("Failed to fetch quota");
        }
    };

    // --- HANDLERS ---
    const handleDeleteClick = (id, e) => {
        e.stopPropagation();
        setContractToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!contractToDelete) return;
        try {
            await deleteContract(contractToDelete);
            toast.success("Contract deleted successfully!");
            fetchContracts();
        } catch (error) {
            toast.error("Failed to delete contract");
        } finally {
            setShowDeleteModal(false);
            setContractToDelete(null);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("jurisdiction", jurisdiction); // Send Jurisdiction
        formData.append("contractType", contractType); // Send Contract Type

        setUploading(true);
        try {
            toast.info(`Analyzing ${contractType} under ${jurisdiction} law...`);
            await api.post('/contracts/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Analysis Complete!");
            fetchContracts();
            fetchQuota();
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Upload failed!";
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch (e) { }
        localStorage.removeItem('jwtToken');
        navigate('/');
        toast.success("Logout Successful!")
    };

    const getRiskBadge = (riskLevel = 'low') => {
        const riskLevels = {
            low: { text: 'Low Risk', variant: 'success', icon: <FaCheckCircle /> },
            medium: { text: 'Medium Risk', variant: 'warning', icon: <FaExclamationTriangle /> },
            high: { text: 'High Risk', variant: 'danger', icon: <FaExclamationTriangle /> }
        };
        return riskLevels[riskLevel] || riskLevels.low;
    };

    const filteredContracts = contracts.filter(c =>
        c.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-vh-100 fade-in pb-5"
             style={{
                 background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
                 position: 'relative',
                 overflowX: 'hidden'
             }}>

            {/* Background Blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: '#6366f1', filter: 'blur(150px)', opacity: '0.15', borderRadius: '50%', zIndex: '0' }}></div>

            <Container style={{ position: 'relative', zIndex: 1 }} className="pt-4">

                {/* --- 1. NAVBAR --- */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        {/* CLICKABLE BRAND */}
                        <div
                            className="d-flex align-items-center gap-2 mb-1"
                            onClick={() => navigate('/')}
                            style={{ cursor: 'pointer' }}
                            title="Go to Home Page"
                        >
                             {isAdmin ? <FaShieldAlt className="text-danger" size={24} /> : <FaFileContract className="text-primary" size={24} />}
                             <h3 className="fw-bold text-dark mb-0">{isAdmin ? "Admin Console" : "Contract Risk Analyzer"}</h3>
                        </div>
                        <p className="text-muted mb-0 ms-1">Welcome back, <span className="fw-bold text-primary">{user.username}</span></p>
                    </div>

                    <div className="d-flex gap-3 align-items-center">
                        <Button variant="white" className="shadow-sm rounded-pill fw-bold text-primary border" onClick={() => navigate('/chat/general')}>
                            <FaComments className="me-2" /> AI Chat
                        </Button>

                        <Dropdown align="end">
                            <Dropdown.Toggle variant="white" id="profile-dropdown" className="d-flex align-items-center border shadow-sm rounded-pill px-3 py-2 text-dark bg-white">
                                <FaUserCircle size={20} className="me-2 text-secondary" />
                                {user.username} {isAdmin && <Badge bg="danger" className="ms-2">ADMIN</Badge>}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-lg border-0 p-0 mt-2 rounded-3 overflow-hidden" style={{ minWidth: '240px' }}>
                                <div className="px-4 py-3 bg-light border-bottom">
                                    <div className="fw-bold text-dark">{user.username}</div>
                                    <div className="small text-muted text-truncate">{user.email}</div>
                                </div>
                                <div className="p-2">
                                    <Dropdown.Item onClick={() => navigate('/settings')} className="rounded py-2">
                                        <FaCog className="me-2 text-muted" /> Settings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout} className="rounded py-2 text-danger">
                                        <FaSignOutAlt className="me-2" /> Logout
                                    </Dropdown.Item>
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {/* --- 2. QUOTA WARNING --- */}
                {!isAdmin && remainingQuota?.remaining === 0 && (
                    <Alert variant="warning" className="mb-4 shadow-sm border-0 border-start border-warning border-5 rounded-3 bg-white">
                        <div className="d-flex align-items-center fw-bold text-dark">
                            <FaClock className="me-2 text-warning" size={20} />
                            <span>
                                Daily Quota Exceeded. Refill in: <span className="text-danger fs-5 ms-2 font-monospace">{timerString || "..."}</span>
                            </span>
                        </div>
                    </Alert>
                )}

                {/* --- 3. STATS & UPLOAD ROW --- */}
                <Row className="g-4 mb-5">
                    {!isAdmin && (
                        <Col md={12} lg={6}>
                            {/* Credits Card */}
                            <Card className="border-0 h-100" style={{ ...glassStyle, background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white' }}>
                                <Card.Body className="p-4 d-flex flex-column justify-content-center">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="text-white-50 text-uppercase small fw-bold ls-1 mb-1">Daily Credits</h6>
                                            <h2 className="fw-bold mb-0 display-5">
                                                {remainingQuota?.isUnlimited ? <FaInfinity /> : remainingQuota?.remaining}
                                            </h2>
                                            <p className="text-white-50 small mt-2 mb-0">
                                                <FaCalendarCheck className="me-1"/> After Exceeded your quota limit, you have to wait 1 hour to upload new Contracts.
                                            </p>
                                        </div>
                                        <div className="bg-white bg-opacity-10 p-3 rounded-circle text-warning">
                                            <FaCreditCard size={32} />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}

                    <Col md={12} lg={!isAdmin ? 6 : 12}>
                        <Card className="border-0 h-100" style={glassStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0 text-dark"><FaUpload className="me-2 text-primary" />Quick Upload</h5>
                                    {selectedFile && <Badge bg="success">File Selected</Badge>}
                                </div>

                                {/* --- UPLOAD CONTROLS --- */}
                                <div className="d-flex flex-column gap-3">

                                    {/* Row 1: Dropdowns */}
                                    <div className="d-flex gap-2">
                                        {/* Jurisdiction Selector */}
                                        <Form.Select
                                            value={jurisdiction}
                                            onChange={(e) => setJurisdiction(e.target.value)}
                                            className="shadow-sm border-0 py-2 bg-light fw-bold text-dark flex-grow-1"
                                            disabled={uploading}
                                        >
                                            <option value="General">General Law</option>
                                            <option value="India">🇮🇳 India</option>
                                            <option value="United States">🇺🇸 USA</option>
                                            <option value="United Kingdom">🇬🇧 UK</option>
                                            <option value="European Union">🇪🇺 EU</option>
                                        </Form.Select>

                                        {/* Contract Type Selector */}
                                        <Form.Select
                                            value={contractType}
                                            onChange={(e) => setContractType(e.target.value)}
                                            className="shadow-sm border-0 py-2 bg-light fw-bold text-dark flex-grow-1"
                                            disabled={uploading}
                                        >
                                            <option value="General Contract">General Contract</option>
                                            <option value="Employment Agreement">Employment Agreement</option>
                                            <option value="Non-Disclosure Agreement (NDA)">NDA</option>
                                            <option value="Software License (SaaS)">SaaS Agreement</option>
                                            <option value="Lease Agreement">Lease Agreement</option>
                                            <option value="Freelance Contract">Freelance Contract</option>
                                        </Form.Select>
                                    </div>

                                    {/* Row 2: File & Button */}
                                    <div className="d-flex gap-2 align-items-center">
                                        <Form.Control
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="application/pdf"
                                            disabled={uploading || (!isAdmin && remainingQuota?.remaining === 0)}
                                            className="shadow-sm border-0 py-2"
                                        />

                                        <Button
                                            variant="primary"
                                            onClick={handleUpload}
                                            disabled={uploading || !selectedFile}
                                            className="shadow-lg rounded-pill px-4 fw-bold d-flex align-items-center"
                                            style={{ minWidth: '120px' }}
                                        >
                                            {uploading ? <><FaRobot className="me-2 pulse" /> Analyzing</> : "Analyze"}
                                        </Button>
                                    </div>
                                </div>

                                {uploading && <ProgressBar animated now={100} className="mt-3" style={{ height: '4px' }} />}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* --- 4. SEARCH & FILTER --- */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-dark mb-0">
                        {isAdmin ? "System Contracts" : "My Contracts"}
                        <span className="text-muted ms-2 fs-6 fw-normal">({filteredContracts.length})</span>
                    </h4>
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0 bg-white" style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-0 ps-3 text-muted"><FaSearch /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search..."
                            className="border-0 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>

                {/* --- 5. CONTRACTS GRID --- */}
                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {filteredContracts.map((contract) => {
                        let riskLevel = 'low';
                        try {
                            if (contract.analysisJson) {
                                const analysis = JSON.parse(contract.analysisJson);
                                if (analysis.risk_level) riskLevel = analysis.risk_level.toLowerCase();
                            }
                        } catch (e) { }
                        const riskBadge = getRiskBadge(riskLevel);

                        return (
                            <Col key={contract.id}>
                                <Card
                                    className={`h-100 border-0 ${isAdmin ? 'border-top border-warning border-3' : ''}`}
                                    style={glassStyle}
                                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = glassStyle.boxShadow;
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="bg-white p-2 rounded shadow-sm text-primary">
                                                <FaFileContract size={20} />
                                            </div>
                                            <Badge bg={riskBadge.variant} className="py-2 px-3 rounded-pill fw-normal d-flex align-items-center shadow-sm">
                                                {riskBadge.icon} <span className="ms-1">{riskBadge.text}</span>
                                            </Badge>
                                        </div>

                                        <Card.Title className="text-truncate fw-bold text-dark mb-1" title={contract.filename}>
                                            {contract.filename}
                                        </Card.Title>

                                        {isAdmin && (
                                            <div className="mb-2 text-muted small bg-light rounded p-1 px-2 d-inline-block border">
                                                <FaUser className="me-1" /> {contract.ownerUsername}
                                            </div>
                                        )}

                                        <Card.Text className="text-muted small mb-4">
                                            <FaClock className="me-1" />
                                            {new Date(contract.uploadDate).toLocaleDateString()}
                                        </Card.Text>

                                        <div className="mt-auto d-grid gap-2">
                                            <Button variant="outline-primary" size="sm" className="rounded-pill fw-semibold" onClick={() => navigate(`/contracts/${contract.id}`)}>
                                                View Report <FaArrowRight className="ms-1" size={10} />
                                            </Button>
                                            <div className="d-flex gap-2">
                                                <Button variant="primary" size="sm" className="flex-grow-1 rounded-pill fw-semibold shadow-sm" onClick={() => navigate(`/chat/${contract.id}`)}>
                                                    <FaComments className="me-1" /> Chat
                                                </Button>
                                                <Button variant="light" size="sm" className="rounded-circle text-danger shadow-sm" onClick={(e) => handleDeleteClick(contract.id, e)} title="Delete">
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

            </Container>

            {/* DELETE MODAL */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="text-danger fw-bold">
                        <FaExclamationTriangle className="me-2" /> Confirm Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <p className="mb-0 text-muted">Are you sure you want to permanently delete this contract?</p>
                    {isAdmin && <Alert variant="danger" className="mt-3 mb-0 py-2 small fw-bold">Admin Action: You are deleting a user's file.</Alert>}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4 fw-bold">
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} className="rounded-pill px-4 fw-bold shadow-sm">
                        Yes, Delete It
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Dashboard;