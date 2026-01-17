import { useEffect, useState, useRef } from 'react';
import api, { deleteContract } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Navbar, Button, Row, Col, Card, Form, ProgressBar, Badge, Modal, Dropdown, Alert } from 'react-bootstrap';
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
    FaBatteryHalf,
    FaInfinity
} from 'react-icons/fa';

const Dashboard = () => {
    // --- STATE MANAGEMENT ---
    const [contracts, setContracts] = useState([]);
    const [uploading, setUploading] = useState(false);
    // User Profile State
    const [user, setUser] = useState({ username: 'User', email: '', role: 'USER' });
    // Rate Limiting State
    const [remainingQuota, setRemainingQuota] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);

    const navigate = useNavigate();
    const isAdmin = user.role === 'ADMIN';

    // --- INITIAL DATA FETCHING ---
    useEffect(() => {
        fetchUserProfile();
        fetchContracts();
        fetchQuota();
    }, []);

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

    // 1. Delete Handlers
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
            fetchContracts(); // Refresh list
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
    // 2. Upload Handler
    const handleUpload = async (e) => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        setUploading(true);
        try {
            toast.info("Analyzing contract...");
            await api.post('/contracts/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Upload Complete!");
            fetchContracts(); // Refresh list
            fetchQuota();
           setSelectedFile(null);
           if (fileInputRef.current) {
               fileInputRef.current.value = "";
           }
        } catch (error) {
            // Display the specific error message from RateLimitingService if available
            const msg = error.response?.data?.message || "Upload failed!";
            toast.error(msg);
        } finally {
            setUploading(false);
            // Reset file input
            e.target.value = null;
        }
    };

    // 3. Logout Handler
    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch(e) {}
        localStorage.removeItem('jwtToken');
        navigate('/');
        toast.success("Logout Successful!")
    };

    // Helper for Risk Badges
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
               {/* NAVBAR */}
               <Navbar bg={isAdmin ? "dark" : "primary"} variant="dark" className="px-4 py-3 shadow-sm">
                   <Container fluid>
                       <Navbar.Brand className="fw-bold" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                           {isAdmin ? <FaShieldAlt className="me-2 text-warning" /> : <FaFileContract className="me-2" />}
                           {isAdmin ? "Admin Console" : "Contract Risk Analyzer"}
                       </Navbar.Brand>

                       <div className="d-flex gap-3 align-items-center">
                           <Button variant="light" className="d-flex align-items-center fw-bold text-primary" onClick={() => navigate('/chat/general')}>
                               <FaComments className="me-2" />General AI Chat
                           </Button>

                           <Dropdown align="end">
                               <Dropdown.Toggle variant="outline-light" id="profile-dropdown" className="d-flex align-items-center border-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                   <FaUserCircle size={20} className="me-2" />
                                   {user.username} {isAdmin && <Badge bg="warning" text="dark" className="ms-2">ADMIN</Badge>}
                               </Dropdown.Toggle>
                               <Dropdown.Menu className="shadow-lg border-0 p-0 mt-2" style={{ minWidth: '260px' }}>
                                   <div className="px-4 py-3 bg-light border-bottom rounded-top">
                                       <div className="fw-bold text-dark mb-1">{user.username}</div>
                                       <div className="small text-muted text-truncate">{user.email}</div>
                                       <div className="mt-1"><Badge bg={isAdmin ? "danger" : "info"}>{user.role}</Badge></div>
                                   </div>
                                   <div className="p-2">
                                       <Dropdown.Item onClick={() => navigate('/settings')} className="rounded py-2 d-flex align-items-center">
                                           <FaCog className="me-3 text-secondary" /> Profile Settings
                                       </Dropdown.Item>
                                       <Dropdown.Divider />
                                       <Dropdown.Item onClick={handleLogout} className="rounded py-2 text-danger d-flex align-items-center">
                                           <FaSignOutAlt className="me-3" /> Logout
                                       </Dropdown.Item>
                                   </div>
                               </Dropdown.Menu>
                           </Dropdown>
                       </div>
                   </Container>
               </Navbar>

               <Container className="py-4">

                   {/* QUOTA WARNING BANNER */}
                   {!isAdmin && remainingQuota?.remaining === 0 && (
                       <Alert variant="warning" className="mb-4 shadow-sm border-warning">
                           <div className="d-flex align-items-center justify-content-center fw-bold">
                               <FaClock className="me-2 text-danger" size={20} />
                               <span>
                                   Quota Exceeded: You have used your 2 free analysis credits.
                                   <br className="d-md-none"/> Please come back after 1 hour.
                               </span>
                           </div>
                       </Alert>
                   )}

                   {/* UPLOAD CARD */}
                   <Card className="mb-5 border-0 shadow-sm" style={{ opacity: (!isAdmin && remainingQuota?.remaining === 0) ? 0.6 : 1 }}>
                       <Card.Body className="p-5 text-center">
                           <FaUpload size={48} className="text-primary mb-3" />
                           <h4 className="fw-bold mb-3">Upload New Contract</h4>

                           <div className="w-75 mx-auto">
                               <Form.Group controlId="formFile" className="mb-3">
                                   <Form.Control
                                       type="file"
                                       ref={fileInputRef}
                                       onChange={handleFileSelect} // Changed from handleUpload
                                       accept="application/pdf"
                                       disabled={uploading || (!isAdmin && remainingQuota?.remaining === 0)}
                                       className="form-control-lg"
                                   />
                               </Form.Group>

                               {/* NEW UPLOAD BUTTON */}
                               {selectedFile && (
                                   <div className="fade-in">
                                       <p className="text-muted small mb-2">Selected: {selectedFile.name}</p>
                                       <Button
                                           variant="success"
                                           size="lg"
                                           onClick={handleUpload}
                                           disabled={uploading}
                                           className="w-100 shadow-sm"
                                       >
                                           {uploading ? (
                                               <>
                                                   <FaRobot className="me-2 pulse" /> Analyzing...
                                               </>
                                           ) : (
                                               <>
                                                   <FaUpload className="me-2" /> Upload & Analyze
                                               </>
                                           )}
                                       </Button>
                                   </div>
                               )}
                           </div>

                           {uploading && (
                               <div className="mt-4">
                                   <ProgressBar animated now={75} className="w-50 mx-auto" />
                                   <div className="text-muted mt-2 small">This may take up to 30 seconds...</div>
                               </div>
                           )}
                       </Card.Body>
                   </Card>

                   {/* CONTRACTS HEADER */}
                   <div className="d-flex justify-content-between align-items-center mb-4">
                       <div>
                           <h4 className="fw-bold mb-0">
                               {isAdmin ? <><FaShieldAlt className="me-2 text-danger"/>All System Contracts</> : "My Contracts"}
                           </h4>

                           {!isAdmin && remainingQuota !== null && (
                               <div className="mt-2">
                                   <Badge
                                       bg={remainingQuota.remaining > 0 ? "success" : "danger"}
                                       className="d-inline-flex align-items-center py-2 px-3"
                                   >
                                       {remainingQuota.isUnlimited ? (
                                           <>
                                               <FaInfinity className="me-2" />
                                               <span>Unlimited Uploads</span>
                                           </>
                                       ) : (
                                           <>
                                               <FaBatteryHalf className="me-2" />
                                               <span>Daily Credits: {remainingQuota.remaining} left</span>
                                           </>
                                       )}
                                   </Badge>
                               </div>
                           )}

                           {isAdmin && <small className="text-muted d-block mt-1">You have full access to view and delete all files.</small>}
                       </div>
                       <Badge bg="secondary" className="fs-6">{contracts.length} found</Badge>
                   </div>

                   {/* CONTRACTS GRID */}
                   <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                       {contracts.map((contract) => {
                           let riskLevel = 'low';
                           try {
                               if (contract.analysisJson) {
                                   const analysis = JSON.parse(contract.analysisJson);
                                   if (analysis.risk_level) riskLevel = analysis.risk_level.toLowerCase();
                               }
                           } catch(e) {}
                           const riskBadge = getRiskBadge(riskLevel);

                           return (
                               <Col key={contract.id}>
                                   <Card className={`h-100 border-0 shadow-sm ${isAdmin ? 'border-top border-warning border-3' : ''}`}>
                                       <Card.Body className="d-flex flex-column">
                                           <div className="d-flex justify-content-between align-items-start mb-3">
                                               <FaFileContract size={24} className="text-primary" />
                                               <Badge bg={riskBadge.variant} className="d-flex align-items-center">
                                                   {riskBadge.icon} <span className="ms-1">{riskBadge.text}</span>
                                               </Badge>
                                           </div>

                                           <Card.Title className="text-truncate fw-semibold mb-1" title={contract.filename}>
                                               {contract.filename}
                                           </Card.Title>

                                           {isAdmin && (
                                               <div className="mb-2 text-muted small bg-light rounded p-1 d-inline-block">
                                                   <FaUser className="me-1" /> Owner: <strong>{contract.ownerUsername}</strong>
                                               </div>
                                           )}

                                           <Card.Text className="text-muted small mb-3">
                                               <FaClock className="me-1" />
                                               {new Date(contract.uploadDate).toLocaleDateString()}
                                           </Card.Text>

                                           <div className="mt-auto d-flex gap-2">
                                               <Button variant="outline-primary" className="flex-grow-1" onClick={() => navigate(`/contracts/${contract.id}`)}>
                                                   Report
                                               </Button>
                                               <Button variant="primary" className="flex-grow-1" onClick={() => navigate(`/chat/${contract.id}`)}>
                                                   Chat
                                               </Button>
                                               <Button variant="outline-danger" onClick={(e) => handleDeleteClick(contract.id, e)} title="Delete Contract">
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

               {/* DELETE MODAL */}
               <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                   <Modal.Header closeButton>
                       <Modal.Title className="text-danger fw-bold">
                           <FaExclamationTriangle className="me-2" /> Confirm Deletion
                       </Modal.Title>
                   </Modal.Header>
                   <Modal.Body>
                       <p className="mb-0">Are you sure you want to delete this contract?</p>
                       <small className="text-muted">This action cannot be undone.</small>
                       {isAdmin && <p className="text-danger fw-bold mt-2 small">Warning: As an Admin, you are deleting a user's file.</p>}
                   </Modal.Body>
                   <Modal.Footer>
                       <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                           Cancel
                       </Button>
                       <Button variant="danger" onClick={confirmDelete}>
                           Yes, Delete It
                       </Button>
                   </Modal.Footer>
               </Modal>
           </div>
       );
   };

   export default Dashboard;