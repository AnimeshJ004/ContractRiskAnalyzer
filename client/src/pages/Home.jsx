import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import {
    FaShieldAlt,
    FaRobot,
    FaSearch,
    FaCheckCircle,
    FaBolt,
    FaArrowRight,
    FaFileContract
} from 'react-icons/fa';

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        setIsLoggedIn(!!token);
    }, []);

    const handleGetStarted = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column position-relative overflow-hidden">

            {/* --- BACKGROUND BLOBS (Fixed Positioning) --- */}
            {/* Top Right Blob - Blue */}
            <div
                className="position-absolute rounded-circle bg-primary"
                style={{
                    top: '-10%',
                    right: '-5%',
                    width: '50vw',
                    height: '50vw',
                    maxWidth: '600px',
                    maxHeight: '600px',
                    filter: 'blur(80px)',
                    opacity: 0.08,
                    zIndex: 0
                }}
            />
            {/* Bottom Left Blob - Green */}
            <div
                className="position-absolute rounded-circle bg-success"
                style={{
                    bottom: '-10%',
                    left: '-10%',
                    width: '60vw',
                    height: '60vw',
                    maxWidth: '700px',
                    maxHeight: '700px',
                    filter: 'blur(100px)',
                    opacity: 0.08,
                    zIndex: 0
                }}
            />

            {/* --- 1. NAVBAR --- */}
            <Navbar expand="lg" className="px-4 py-3 fixed-top" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                <Container fluid>
                    <Navbar.Brand className="fw-bold text-primary fs-4 d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <FaShieldAlt className="me-2" />
                        Contract Risk Analyzer
                    </Navbar.Brand>
                    <div className="d-flex gap-3">
                        {!isLoggedIn ? (
                            <>
                                <Button variant="link" className="text-decoration-none text-secondary fw-semibold" onClick={() => navigate('/login')}>
                                    Login
                                </Button>
                                <Button variant="primary" className="px-4 rounded-pill shadow-sm" onClick={() => navigate('/register')}>
                                    Get Started
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline-primary" className="px-4 rounded-pill" onClick={() => navigate('/dashboard')}>
                                Dashboard
                            </Button>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* --- 2. HERO SECTION --- */}
            <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative z-1 pt-5">
                <Container className="text-center py-5">
                    <div className="fade-in">
                        <Badge bg="white" text="primary" className="mb-4 px-3 py-2 border shadow-sm rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                            <FaBolt className="me-2" /> AI-Powered Legal Analysis
                        </Badge>

                        <h1 className="display-3 fw-bold mb-4 text-dark" style={{ letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                            Smart Risk Detection <br />
                            <span className="text-primary">For Your Contracts</span>
                        </h1>

                        <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: '650px', fontSize: '1.25rem' }}>
                            Upload documents and let our AI instantly identify liabilities, missing clauses, and risky terms before you sign.
                        </p>

                        <div className="d-flex justify-content-center gap-3">
                            <Button size="lg" variant="primary" className="px-5 py-3 rounded-pill shadow-lg hover-scale fw-bold d-flex align-items-center" onClick={handleGetStarted}>
                                {isLoggedIn ? "Go to Dashboard" : "Analyze My Contract"} <FaArrowRight className="ms-2" />
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            {/* --- 3. FEATURES SECTION --- */}
            <div className="py-5 position-relative z-1" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.8))' }}>
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold mb-3">Powerful Features</h2>
                        <p className="text-muted">Everything you need to sign with confidence.</p>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {/* Feature 1 */}
                        <Col md={4} lg={3}>
                            <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                                <Card.Body>
                                    <div className="mb-4 text-primary">
                                        <FaSearch size={40} className="opacity-75" />
                                    </div>
                                    <h5 className="fw-bold mb-3">Risk Scoring</h5>
                                    <p className="text-muted small">
                                        Get a 0-100 risk score based on dangerous clauses and unfair terms.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Feature 2 */}
                        <Col md={4} lg={3}>
                            <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                                <Card.Body>
                                    <div className="mb-4 text-success">
                                        <FaRobot size={40} className="opacity-75" />
                                    </div>
                                    <h5 className="fw-bold mb-3">AI Chat</h5>
                                    <p className="text-muted small">
                                        Ask questions like "Is there a termination fee?" and get instant answers.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Feature 3 */}
                        <Col md={4} lg={3}>
                            <Card className="h-100 border-0 shadow-sm text-center p-4 hover-lift" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                                <Card.Body>
                                    <div className="mb-4 text-warning">
                                        <FaFileContract size={40} className="opacity-75" />
                                    </div>
                                    <h5 className="fw-bold mb-3">Smart Summary</h5>
                                    <p className="text-muted small">
                                        Turn 50 pages of legal jargon into a clear, 1-page executive summary.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-muted mt-auto position-relative z-1">
                <small>© 2026 Contract Risk Analyzer</small>
            </footer>
        </div>
    );
};

export default Home;