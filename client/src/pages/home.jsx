import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import {
    FaShieldAlt,
    FaRocket,
    FaCode,
    FaServer,
    FaDatabase,
    FaFileContract,
    FaCheckCircle,
    FaArrowRight,
    FaBrain,
    FaLock
} from 'react-icons/fa';

// --- GLASSMORPHISM STYLE OBJECT ---
// We use this object to apply the "Frosted Glass" effect easily
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.65)', // Semi-transparent white
    backdropFilter: 'blur(12px)',           // The "Blur" effect
    WebkitBackdropFilter: 'blur(12px)',     // Safari support
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
};

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="min-vh-100 fade-in d-flex flex-column"
             style={{
                 background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)', // Subtle gradient bg
                 position: 'relative',
                 overflow: 'hidden'
             }}>

            {/* Background Blobs for depth */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: '#6366f1', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%', zIndex: '0' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '500px', height: '500px', background: '#10b981', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%', zIndex: '0' }}></div>

            {/* --- 1. GLASSY NAVBAR --- */}
            <Navbar className="px-4 py-3 sticky-top" style={{ ...glassStyle, zIndex: 10 }}>
                <Container fluid>
                    <Navbar.Brand className="fw-bold d-flex align-items-center text-primary" style={{ fontSize: '1.5rem' }}>
                        <FaShieldAlt className="me-2" />
                        Contract<span className="text-dark">Analyzer</span>
                    </Navbar.Brand>
                    <div className="d-flex gap-3">
                        {!isLoggedIn ? (
                            <>
                                <Button variant="outline-primary" className="px-4 fw-bold" onClick={() => navigate('/login')} style={{ borderRadius: '50px' }}>
                                    Login
                                </Button>
                                <Button variant="primary" className="px-4 fw-bold" onClick={() => navigate('/register')} style={{ borderRadius: '50px' }}>
                                    Get Started
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" className="px-4 fw-bold shadow-lg" onClick={() => navigate('/dashboard')} style={{ borderRadius: '50px' }}>
                                Go to Dashboard <FaArrowRight className="ms-2" />
                            </Button>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* --- 2. HERO SECTION --- */}
            <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="align-items-center w-100">
                    <Col lg={6} className="mb-5 mb-lg-0">
                        <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill fw-normal" style={{ letterSpacing: '1px' }}>
                            <FaBrain className="me-2" /> AI-POWERED LEGAL TECH
                        </Badge>
                        <h1 className="display-3 fw-bold mb-4 text-dark lh-sm">
                            Smarter Contracts.<br />
                            <span className="text-primary" style={{ background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Zero Risk.
                            </span>
                        </h1>
                        <p className="lead text-muted mb-5 pe-lg-5" style={{ fontSize: '1.2rem' }}>
                            Don't sign blindly. Our advanced AI scans your contracts, identifies hidden risks, and translates legal jargon into plain English.
                        </p>
                        <div className="d-flex gap-3">
                            <Button size="lg" variant="primary" className="px-5 py-3 shadow-lg fw-bold rounded-pill" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}>
                                Analyze My Contract
                            </Button>
                            <Button size="lg" variant="outline-dark" className="px-4 py-3 fw-bold rounded-pill" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                                How it Works
                            </Button>
                        </div>
                    </Col>

                    <Col lg={6}>
                        {/* Glassy Hero Card */}
                        <Card className="border-0 p-4" style={{ ...glassStyle, transform: 'rotate(-2deg)' }}>
                            <Card.Body>
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-success text-white p-3 rounded-circle me-3">
                                        <FaCheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0">Analysis Complete</h5>
                                        <small className="text-muted">Just now</small>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded mb-3 border shadow-sm opacity-75">
                                    <div className="d-flex justify-content-between text-muted small mb-2">
                                        <span>Risk Score</span>
                                        <span className="text-success fw-bold">Low Risk (92/100)</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className="progress-bar bg-success" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border shadow-sm opacity-75">
                                    <h6 className="fw-bold text-danger mb-2"><FaShieldAlt className="me-2"/>Critical Flag Found</h6>
                                    <p className="small text-muted mb-0">"Clause 4.2 contains an unlimited liability waiver which poses significant financial risk."</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- 3. HOW IT WORKS --- */}
            <div id="how-it-works" className="py-5">
                <Container>
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase ls-2">Workflow</h6>
                        <h2 className="fw-bold">How ContractAnalyzer Works</h2>
                    </div>
                    <Row className="g-4">
                        {[
                            { icon: <FaFileContract />, title: "1. Upload PDF", desc: "Drag & drop your contract file. We support scanned documents via OCR." },
                            { icon: <FaBrain />, title: "2. AI Processing", desc: "Our Gemini AI engine reads every clause, comparing it against legal standards." },
                            { icon: <FaShieldAlt />, title: "3. Risk Report", desc: "Get an instant summary, risk score, and list of missing clauses." }
                        ].map((step, idx) => (
                            <Col md={4} key={idx}>
                                <Card className="h-100 text-center p-4 border-0 shadow-sm" style={glassStyle}>
                                    <div className="mx-auto bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '70px', height: '70px', fontSize: '1.75rem' }}>
                                        {step.icon}
                                    </div>
                                    <h5 className="fw-bold">{step.title}</h5>
                                    <p className="text-muted">{step.desc}</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* --- 4. TECH STACK INFO --- */}
            <div className="py-5" style={{ background: 'rgba(255,255,255,0.4)' }}>
                <Container>
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase">Under the Hood</h6>
                        <h2 className="fw-bold">Built with Modern Tech</h2>
                    </div>
                    <Row xs={2} md={4} className="g-4 text-center">
                        {[
                            { icon: <FaServer />, title: "Spring Boot", text: "Robust Java Backend" },
                            { icon: <FaCode />, title: "React + Vite", text: "Fast Frontend" },
                            { icon: <FaDatabase />, title: "MongoDB", text: "Scalable Database" },
                            { icon: <FaRocket />, title: "Docker", text: "Containerized" },
                        ].map((tech, idx) => (
                            <Col key={idx}>
                                <div className="p-3 rounded border bg-white shadow-sm h-100">
                                    <div className="text-primary mb-3" style={{ fontSize: '2rem' }}>{tech.icon}</div>
                                    <h5 className="fw-bold">{tech.title}</h5>
                                    <small className="text-muted">{tech.text}</small>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* --- 5. FOOTER --- */}
            <footer className="py-4 text-center text-muted small mt-5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <Container>
                    <p className="mb-0">
                        &copy; {new Date().getFullYear()} Contract Risk Analyzer.
                        <span className="mx-2">|</span>
                        Secure. Private. Intelligent.
                    </p>
                </Container>
            </footer>

        </div>
    );
};

export default Home;