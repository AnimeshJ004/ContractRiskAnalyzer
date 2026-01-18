import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Button, Card, Row, Col, Badge, Spinner, Accordion } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaRobot,
    FaExclamationTriangle,
    FaCheckCircle,
    FaFileAlt,
    FaListUl,
    FaShieldAlt
} from 'react-icons/fa';

const ContractDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await api.get(`/contracts/${id}`);
                setContract(response.data);
                if (response.data.analysisJson) {
                    try {
                        setAnalysis(JSON.parse(response.data.analysisJson));
                    } catch (e) {
                        console.error("Failed to parse analysis JSON", e);
                    }
                }
            } catch (error) {
                console.error("Error fetching contract details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [id]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (!contract) return <div className="text-center mt-5">Contract not found</div>;

    // Helper to determine color based on risk level
    const getVariant = (level) => {
        if (!level) return 'secondary';
        const l = level.toString().toLowerCase();
        if (l.includes('high')) return 'danger';
        if (l.includes('medium')) return 'warning';
        return 'success';
    };

    const riskVariant = getVariant(analysis?.risk_level);

    return (
        <div className="min-vh-100 position-relative overflow-hidden d-flex flex-column">

            {/* --- BACKGROUND BLOBS --- */}
            <div className="position-absolute rounded-circle bg-primary"
                 style={{ top: '-10%', right: '-5%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', filter: 'blur(80px)', opacity: 0.05, zIndex: 0 }} />
            <div className="position-absolute rounded-circle bg-success"
                 style={{ bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', maxWidth: '700px', maxHeight: '700px', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <Container className="py-5 position-relative z-1">

                {/* --- HEADER --- */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <Button
                        variant="light"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-pill px-4 shadow-sm text-primary fw-bold hover-scale d-flex align-items-center"
                        style={{ background: 'rgba(255,255,255,0.8)' }}
                    >
                        <FaArrowLeft className="me-2" /> Back
                    </Button>
                    <div className="d-flex gap-2">
                        <Button
                            variant="primary"
                            className="rounded-pill px-4 shadow-sm fw-bold hover-scale d-flex align-items-center"
                            onClick={() => navigate(`/chat/${id}`)}
                        >
                            <FaRobot className="me-2" /> Chat with AI
                        </Button>
                    </div>
                </div>

                {/* --- TOP OVERVIEW CARD --- */}
                <Card className="border-0 shadow-sm mb-4 overflow-hidden hover-lift"
                      style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.4)' }}>
                    <Card.Body className="p-4 p-lg-5">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-primary">
                                        <FaFileAlt size={24} />
                                    </div>
                                    <h2 className="fw-bold text-dark mb-0 text-truncate">{contract.filename}</h2>
                                </div>
                                <p className="text-muted mb-4 ms-1 ps-5 small">Uploaded: {new Date(contract.uploadDate).toLocaleString()}</p>

                                <div className="bg-white bg-opacity-50 p-4 rounded-4 border border-light">
                                    <h6 className="fw-bold text-uppercase text-secondary small mb-2" style={{ letterSpacing: '1px' }}>Executive Summary</h6>
                                    <p className="lead fs-6 text-dark mb-0" style={{ lineHeight: '1.6' }}>
                                        {analysis?.summary || "No summary available."}
                                    </p>
                                </div>
                            </Col>

                            <Col md={4} className="text-center mt-4 mt-md-0 border-start border-light ps-md-5">
                                <h6 className="text-uppercase text-muted fw-bold mb-3 small" style={{ letterSpacing: '1px' }}>Risk Assessment</h6>

                                <div className="position-relative d-inline-flex align-items-center justify-content-center mb-3">
                                    {/* Glowing Ring */}
                                    <div style={{
                                        width: '140px', height: '140px', borderRadius: '50%',
                                        border: `10px solid var(--bs-${riskVariant})`,
                                        boxShadow: `0 0 20px var(--bs-${riskVariant}-rgb)`,
                                        opacity: 0.2,
                                        position: 'absolute'
                                    }}></div>

                                    {/* Inner Circle */}
                                    <div className="d-flex flex-column align-items-center justify-content-center bg-white shadow-sm rounded-circle"
                                         style={{ width: '120px', height: '120px', zIndex: 1 }}>
                                        <div className={`display-5 fw-bold text-${riskVariant}`}>
                                            {analysis?.risk_score || 0}
                                        </div>
                                        <div className="small text-muted fw-bold" style={{ fontSize: '0.7rem' }}>OUT OF 100</div>
                                    </div>
                                </div>

                                <div>
                                    <Badge bg={riskVariant} className="px-4 py-2 rounded-pill text-uppercase fw-bold shadow-sm">
                                        {analysis?.risk_level || "Unknown"} Risk
                                    </Badge>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row className="g-4">
                    {/* --- LEFT COL: ANALYSIS --- */}
                    <Col lg={7}>

                        {/* Key Risks */}
                        <Card className="border-0 shadow-sm mb-4"
                              style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2">
                                <h5 className="fw-bold text-danger m-0 d-flex align-items-center">
                                    <FaExclamationTriangle className="me-2" /> Key Risks Identified
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {analysis?.key_risks?.length > 0 ? (
                                    <Accordion flush className="custom-accordion">
                                        {analysis.key_risks.map((risk, idx) => (
                                            <Accordion.Item eventKey={idx.toString()} key={idx} className="mb-3 border-0 bg-transparent">
                                                <Accordion.Header className="shadow-sm rounded-3 overflow-hidden">
                                                    <Badge bg={getVariant(risk.severity)} className="me-3 rounded-pill px-3">{risk.severity}</Badge>
                                                    <span className="fw-semibold text-dark">{risk.clause}</span>
                                                </Accordion.Header>
                                                <Accordion.Body className="bg-white bg-opacity-50 rounded-bottom-3 border-top-0 pt-3">
                                                    <strong className="text-dark">Risk: </strong>
                                                    <span className="text-secondary">{risk.risk_explanation}</span>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                ) : <div className="text-muted">No significant risks detected.</div>}
                            </Card.Body>
                        </Card>

                        {/* Missing Clauses & Recs */}
                        <Row className="g-4">
                            <Col md={6}>
                                <Card className="h-100 border-0 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold text-warning mb-3 d-flex align-items-center"><FaListUl className="me-2" /> Missing Clauses</h5>
                                        <ul className="list-group list-group-flush bg-transparent">
                                            {analysis?.missing_clauses?.map((item, i) => (
                                                <li key={i} className="list-group-item bg-transparent px-0 border-0 py-2 d-flex align-items-start">
                                                    <span className="text-warning me-2">•</span> <span className="text-secondary small">{item}</span>
                                                </li>
                                            ))}
                                            {!analysis?.missing_clauses?.length && <li className="text-muted small">None found.</li>}
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100 border-0 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold text-success mb-3 d-flex align-items-center"><FaCheckCircle className="me-2" /> Recommendations</h5>
                                        <ul className="list-group list-group-flush bg-transparent">
                                            {analysis?.recommendations?.map((item, i) => (
                                                <li key={i} className="list-group-item bg-transparent px-0 border-0 py-2 d-flex align-items-start">
                                                    <span className="text-success me-2">✓</span> <span className="text-secondary small">{item}</span>
                                                </li>
                                            ))}
                                            {!analysis?.recommendations?.length && <li className="text-muted small">None found.</li>}
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* --- RIGHT COL: RAW TEXT --- */}
                    <Col lg={5}>
                        <Card className="h-100 border-0 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '20px', minHeight: '600px' }}>
                            <Card.Header className="bg-white bg-opacity-50 border-bottom border-light py-3 px-4 rounded-top-4">
                                <h6 className="fw-bold text-primary m-0 d-flex align-items-center">
                                    <FaFileAlt className="me-2" /> Original Contract Text
                                </h6>
                            </Card.Header>
                            <Card.Body className="p-0 position-relative">
                                <div className="p-4 h-100 w-100 position-absolute"
                                     style={{ overflowY: 'auto', fontSize: '0.85rem', lineHeight: '1.7', fontFamily: 'Menlo, Monaco, Consolas, monospace', color: '#444' }}>
                                    {contract.rawText || "No text content available."}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContractDetails;