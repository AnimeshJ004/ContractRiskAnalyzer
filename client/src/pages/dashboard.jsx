import { useEffect, useState } from 'react';
import api, { deleteContract } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Navbar, Button, Row, Col, Card, Form, ProgressBar, Badge, Modal, Dropdown } from 'react-bootstrap';
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
    FaSearch,
    FaPlus,
    FaUserTag,
    FaUserShield // New Icon for Admin
} from 'react-icons/fa';

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState({ username: 'User', email: '', role: 'USER' });

    // --- MODAL STATE ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchContracts();
        fetchUserProfile();
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await api.get('/contracts');
            setContracts(response.data);
        } catch (error) { console.error(error); }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.log("Could not fetch navbar profile info");
        }
    };

    // --- CHECK ADMIN ROLE ---
    const isAdmin = user.role === 'ADMIN';

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
        toast.success("Logout Successful!")
    };

    // Helper for Risk Badges
    const getRiskBadge = (riskLevel = 'low') => {
        const riskLevels = {
            low: { text: 'Low Risk', bg: 'success', icon: <FaCheckCircle /> },
            medium: { text: 'Medium Risk', bg: 'warning', icon: <FaExclamationTriangle /> },
            high: { text: 'High Risk', bg: 'danger', icon: <FaExclamationTriangle /> }
        };
        return riskLevels[riskLevel?.toLowerCase()] || riskLevels.low;
    };

    return (
        <div className="min-vh-100 position-relative overflow-hidden d-flex flex-column">

            {/* --- BACKGROUND BLOBS (Dynamic for Admin) --- */}
            <div className={`position-absolute rounded-circle ${isAdmin ? 'bg-danger' : 'bg-primary'}`}
                 style={{ top: '-10%', right: '-5%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', filter: 'blur(80px)', opacity: 0.05, zIndex: 0 }} />
            <div className={`position-absolute rounded-circle ${isAdmin ? 'bg-dark' : 'bg-success'}`}
                 style={{ bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', maxWidth: '700px', maxHeight: '700px', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            {/* --- NAVBAR (Dynamic Styling) --- */}
            <Navbar
                expand="lg"
                className="px-4 py-3 fixed-top transition-all"
                style={{
                    backdropFilter: 'blur(10px)',
                    backgroundColor: isAdmin ? 'rgba(30, 30, 45, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                    borderBottom: isAdmin ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
                    transition: 'background-color 0.3s ease'
                }}
                variant={isAdmin ? "dark" : "light"}
            >
                <Container fluid>
                    <Navbar.Brand className={`fw-bold fs-4 d-flex align-items-center ${isAdmin ? 'text-white' : 'text-primary'}`} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <FaFileContract className="me-2" />
                        Contract Risk Analyzer
                        {isAdmin && (
                            <Badge bg="danger" className="ms-3 fs-6 rounded-pill px-3 shadow-sm d-flex align-items-center">
                                <FaUserShield className="me-2" /> ADMIN PANEL
                            </Badge>
                        )}
                    </Navbar.Brand>

                    <div className="d-flex gap-3 align-items-center">
                        <Button
                            variant={isAdmin ? "outline-light" : "light"}
                            className={`d-flex align-items-center fw-semibold rounded-pill px-3 shadow-sm ${!isAdmin && 'text-primary'}`}
                            onClick={() => navigate('/chat/general')}
                        >
                            <FaComments className="me-2" /> General Chat
                        </Button>

                        <Dropdown align="end">
                            <Dropdown.Toggle
                                variant="transparent"
                                id="profile-dropdown"
                                className={`d-flex align-items-center border-0 p-0 fw-bold bg-transparent ${isAdmin ? 'text-white' : 'text-dark'}`}
                            >
                                <div className={`rounded-circle p-2 me-2 ${isAdmin ? 'bg-danger text-white' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                    {isAdmin ? <FaUserShield size={20} /> : <FaUserCircle size={20} />}
                                </div>
                                <div className="d-flex flex-column align-items-start lh-1 d-none d-md-block">
                                    <span>{user.username || 'Account'}</span>
                                    {isAdmin && <span className="small text-danger fw-light" style={{ fontSize: '0.7rem' }}></span>}
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow-lg border-0 p-2 mt-3 rounded-4" style={{ minWidth: '220px' }}>
                                <div className="px-3 py-2 border-bottom mb-2">
                                    <div className="fw-bold text-dark">{user.username}</div>
                                    <div className="small text-muted text-truncate">{user.email}</div>
                                </div>
                                <Dropdown.Item onClick={() => navigate('/settings')} className="rounded-3 py-2"><FaCog className="me-2 text-secondary" /> Settings</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="rounded-3 py-2 text-danger"><FaSignOutAlt className="me-2" /> Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Container>
            </Navbar>

            {/* --- MAIN CONTENT --- */}
            <Container className="py-5 mt-5 position-relative z-1 flex-grow-1">

                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <h2 className="fw-bold mb-1">Dashboard</h2>
                        <p className="text-muted mb-0">Manage your contracts and view risk reports.</p>
                    </div>
                    {/* Hidden input trigger logic */}
                    <div className="d-none">
                        <input id="hidden-file-input" type="file" onChange={handleUpload} accept="application/pdf" />
                    </div>
                </div>

                {/* Upload Card */}
                <Card className="border-0 shadow-sm mb-5 overflow-hidden position-relative" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                    <div className={`position-absolute top-0 start-0 w-100 h-100 opacity-10 ${isAdmin ? 'bg-gradient-danger' : 'bg-gradient-primary'}`} style={{ pointerEvents: 'none' }}></div>
                    <Card.Body className="p-5 text-center position-relative z-1">
                        <div className={`mb-4 d-inline-flex p-4 rounded-circle bg-white shadow-sm ${isAdmin ? 'text-danger' : 'text-primary'}`}>
                            <FaUpload size={32} />
                        </div>
                        <h3 className="fw-bold mb-3">Upload New Contract</h3>
                        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                            Upload your PDF contract to get an instant AI risk assessment, summary, and recommendation report.
                        </p>

                        <div className="d-flex justify-content-center">
                            <Button
                                variant={isAdmin ? "danger" : "primary"}
                                size="lg"
                                className="px-5 py-3 rounded-pill shadow-lg hover-scale fw-bold d-flex align-items-center"
                                onClick={() => document.getElementById('hidden-file-input').click()}
                                disabled={uploading}
                            >
                                {uploading ? <><FaRobot className="me-2 fa-spin" /> Analyzing...</> : <><FaPlus className="me-2" /> Upload PDF</>}
                            </Button>
                        </div>

                        {uploading && (
                            <div className="mt-4 w-50 mx-auto">
                                <ProgressBar animated variant={isAdmin ? "danger" : "primary"} now={80} className="rounded-pill" style={{ height: '8px' }} />
                                <div className="small text-muted mt-2">Processing document with AI...</div>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Contracts List */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0">
                        <FaFileContract className={`me-2 ${isAdmin ? 'text-danger' : 'text-primary'}`} />
                        {isAdmin ? "All System Contracts" : "My Contracts"}
                    </h4>
                    <Badge bg="white" text="dark" className="border shadow-sm px-3 py-2 rounded-pill">
                        {contracts.length} Documents
                    </Badge>
                </div>

                {contracts.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <div className="mb-3 opacity-50"><FaSearch size={40} /></div>
                        <p>No contracts uploaded yet.</p>
                    </div>
                ) : (
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                        {contracts.map((contract) => {
                            // Parse Risk Logic
                            let riskData = { level: 'low', score: 0 };
                            try {
                                if (contract.analysisJson) {
                                    const json = JSON.parse(contract.analysisJson);
                                    riskData.level = json.risk_level || 'low';
                                }
                            } catch(e) {}

                            const badge = getRiskBadge(riskData.level);

                            return (
                                <Col key={contract.id}>
                                    <Card className="h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '16px', transition: 'transform 0.2s' }}>
                                        <Card.Body className="d-flex flex-column p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-light rounded p-2 text-secondary">
                                                    <FaFileContract size={20} />
                                                </div>
                                                <Badge bg={badge.bg} className="d-flex align-items-center py-2 px-3 rounded-pill">
                                                    {badge.icon} <span className="ms-1 text-capitalize">{badge.text}</span>
                                                </Badge>
                                            </div>

                                            <Card.Title className="fw-bold text-truncate mb-2" title={contract.filename}>
                                                {contract.filename}
                                            </Card.Title>

                                            {/* --- OWNER INFO --- */}
                                            <div className="d-flex align-items-center mb-2">
                                                <Badge bg={isAdmin ? "danger" : "light"} text={isAdmin ? "white" : "dark"} className={`border fw-normal d-flex align-items-center px-2 py-1 ${isAdmin && 'bg-opacity-75'}`}>
                                                    <FaUserTag className={`me-2 ${isAdmin ? 'text-white' : 'text-primary'} opacity-75`} />
                                                    {contract.ownerUsername || 'Unknown'}
                                                </Badge>
                                            </div>

                                            <Card.Text className="text-muted small mb-4">
                                                <FaClock className="me-1" /> {new Date(contract.uploadDate).toLocaleDateString()}
                                            </Card.Text>

                                            <div className="mt-auto d-grid gap-2">
                                                <Button
                                                    variant={isAdmin ? "outline-danger" : "outline-primary"}
                                                    size="sm"
                                                    className="rounded-pill fw-semibold"
                                                    onClick={() => navigate(`/contracts/${contract.id}`)}
                                                >
                                                    View Report
                                                </Button>

                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        className={`flex-grow-1 rounded-pill ${isAdmin ? 'text-danger' : 'text-primary'}`}
                                                        onClick={() => navigate(`/chat/${contract.id}`)}
                                                    >
                                                        <FaRobot /> Chat
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        className="rounded-circle text-danger hover-bg-danger"
                                                        onClick={(e) => handleDeleteClick(contract.id, e)}
                                                        title="Delete"
                                                    >
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
                )}
            </Container>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                <Modal.Header className="bg-danger text-white border-0">
                    <Modal.Title className="fw-bold h5">
                        <FaExclamationTriangle className="me-2" /> Confirm Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center">
                    <p className="mb-1 fs-5">Are you sure?</p>
                    <p className="text-muted small">This action will permanently delete the contract and all associated AI analysis data.</p>
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center pb-4">
                    <Button variant="light" className="px-4 rounded-pill" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" className="px-4 rounded-pill shadow-sm" onClick={confirmDelete}>
                        Yes, Delete It
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Dashboard;