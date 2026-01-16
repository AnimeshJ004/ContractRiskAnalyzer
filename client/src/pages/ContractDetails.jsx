import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Button, Card, Row, Col, Badge, Spinner, Accordion } from 'react-bootstrap';
import { FaArrowLeft, FaRobot, FaExclamationTriangle, FaCheckCircle, FaFileAlt, FaListUl, FaShieldAlt } from 'react-icons/fa';

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
                        // The AI returns a JSON string, so we must parse it into an Object
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

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    if (!contract) return <div className="text-center mt-5">Contract not found</div>;

    // Helper to determine color based on severity/risk
    const getVariant = (level) => {
        if (!level) return 'secondary';
        const l = level.toString().toLowerCase();
        if (l.includes('high')) return 'danger';
        if (l.includes('medium')) return 'warning';
        return 'success';
    };

    return (
        <Container className="py-5 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
                    <FaArrowLeft className="me-2" /> Back to Dashboard
                </Button>
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => navigate(`/chat/${id}`)}>
                        <FaRobot className="me-2" /> Chat with Contract
                    </Button>
                </div>
            </div>

            {/* Top Overview Card */}
            <Card className="shadow-sm border-0 mb-4 bg-white">
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={8}>
                            <h2 className="fw-bold text-primary mb-1">{contract.filename}</h2>
                            <p className="text-muted mb-3">Uploaded on: {new Date(contract.uploadDate).toLocaleString()}</p>
                            <h5 className="fw-bold text-dark">Executive Summary</h5>
                            <p className="lead fs-6 text-secondary">{analysis?.summary || "No summary available."}</p>
                        </Col>
                        <Col md={4} className="text-center border-start border-light">
                            <h6 className="text-muted text-uppercase fw-bold mb-3">Risk Assessment</h6>
                            <div className="position-relative d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 120, height: 120, borderRadius: '50%', border: `8px solid var(--bs-${getVariant(analysis?.risk_level)})` }}>
                                <div className={`display-6 fw-bold text-${getVariant(analysis?.risk_level)}`}>
                                    {analysis?.risk_score || 0}
                                </div>
                            </div>
                            <div className="mt-2">
                                <Badge bg={getVariant(analysis?.risk_level)} className="px-3 py-2 fs-6 rounded-pill">
                                    {analysis?.risk_level || "Unknown"} Risk
                                </Badge>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row>
                {/* Left Column: Analysis Details */}
                <Col lg={7}>
                    {/* Key Risks Accordion */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="fw-bold text-danger m-0"><FaExclamationTriangle className="me-2" /> Key Risks Identified</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {analysis?.key_risks?.length > 0 ? (
                                <Accordion flush>
                                    {analysis.key_risks.map((risk, idx) => (
                                        <Accordion.Item eventKey={idx.toString()} key={idx}>
                                            <Accordion.Header>
                                                <Badge bg={getVariant(risk.severity)} className="me-2">{risk.severity}</Badge>
                                                {risk.clause}
                                            </Accordion.Header>
                                            <Accordion.Body className="text-muted">
                                                <strong>Why it's risky: </strong> {risk.risk_explanation}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            ) : <div className="p-3 text-muted">No significant risks detected.</div>}
                        </Card.Body>
                    </Card>

                    {/* Two Column Section for Missing Clauses & Recommendations */}
                    <Row>
                        <Col md={6}>
                            <Card className="shadow-sm border-0 mb-4 h-100">
                                <Card.Body>
                                    <h5 className="fw-bold text-warning mb-3"><FaListUl className="me-2" /> Missing Clauses</h5>
                                    <ul className="list-group list-group-flush small">
                                        {analysis?.missing_clauses?.map((item, i) => (
                                            <li key={i} className="list-group-item px-0 text-secondary border-0 py-1">
                                                • {item}
                                            </li>
                                        ))}
                                        {!analysis?.missing_clauses?.length && <li className="text-muted">None found.</li>}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="shadow-sm border-0 mb-4 h-100">
                                <Card.Body>
                                    <h5 className="fw-bold text-success mb-3"><FaCheckCircle className="me-2" /> Recommendations</h5>
                                    <ul className="list-group list-group-flush small">
                                        {analysis?.recommendations?.map((item, i) => (
                                            <li key={i} className="list-group-item px-0 text-secondary border-0 py-1">
                                                • {item}
                                            </li>
                                        ))}
                                        {!analysis?.recommendations?.length && <li className="text-muted">None found.</li>}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Right Column: Raw Contract Text */}
                <Col lg={5}>
                    <Card className="shadow-sm border-0 h-100" style={{ minHeight: '500px' }}>
                        <Card.Header className="bg-primary text-white py-3 fw-bold">
                            <FaFileAlt className="me-2" /> Original Contract Content
                        </Card.Header>
                        <Card.Body className="p-0 position-relative">
                            <div className="p-3 bg-light h-100 w-100 position-absolute" style={{ overflowY: 'auto', fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                {contract.rawText || "No text content available."}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ContractDetails;