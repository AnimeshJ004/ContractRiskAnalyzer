import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Button, Card, Form, Spinner, Badge, Navbar, Dropdown } from 'react-bootstrap';
import {
    FaArrowLeft,
    FaRobot,
    FaUser,
    FaPaperPlane,
    FaEraser,
    FaClock,
    FaInfoCircle,
    FaUserCircle,
    FaCog,
    FaSignOutAlt,
    FaFileContract
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Chat = () => {
    const { contractId } = useParams();
    const isGeneral = contractId === 'general';

    const [messages, setMessages] = useState([{
        sender: 'ai',
        text: isGeneral
            ? 'Hello! I am your General Legal Assistant. Ask me anything about legal concepts.'
            : 'Hello! I have analyzed this contract. Ask me about risks, clauses, or summaries.'
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({ username: 'Account', email: '' });

    // Persist conversation ID
    const storageKey = `chat_session_${contractId}`;
    const [conversationId, setConversationId] = useState(localStorage.getItem(storageKey) || '');

    const bottomRef = useRef(null);
    const navigate = useNavigate();

    // Auto-scroll logic
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Fetch User Profile for Header
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                setUser(response.data);
            } catch (error) {
                console.log("Could not fetch profile");
            }
        };
        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch(e) {}
        localStorage.removeItem('jwtToken');
        navigate('/');
        toast.success("Logout Successful!")
    };

    const clearChat = () => {
        setMessages([{
            sender: 'ai',
            text: isGeneral ? 'Chat cleared. How can I help you now?' : 'Chat cleared. Ask me about the contract.'
        }]);
        setConversationId('');
        localStorage.removeItem(storageKey);
        toast.info("Chat history cleared.");
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/contracts/chat', {
                question: input,
                contractId: isGeneral ? null : contractId,
                conversationId: conversationId
            });

            if (response.data.conversationId && response.data.conversationId !== conversationId) {
                setConversationId(response.data.conversationId);
                localStorage.setItem(storageKey, response.data.conversationId);
            }

            setMessages([...newMessages, { sender: 'ai', text: response.data.response }]);
        } catch (error) {
            setMessages([...newMessages, { sender: 'ai', text: "Error: Could not connect to the AI." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        // 1. OUTER CONTAINER: Locks page scrolling entirely.
        <div className="vh-100 vw-100 overflow-hidden bg-light position-relative">

            {/* --- BACKGROUND BLOBS --- */}
            <div className="position-absolute rounded-circle bg-primary"
                 style={{ top: '-10%', right: '-5%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', filter: 'blur(80px)', opacity: 0.05, zIndex: 0 }} />
            <div className="position-absolute rounded-circle bg-success"
                 style={{ bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', maxWidth: '700px', maxHeight: '700px', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            {/* 2. HEADER: Fixed Height (80px) & Fixed Position */}
            <Navbar fixed="top" className="px-4 border-bottom shadow-sm" style={{ height: '80px', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 1050 }}>
                <Container fluid className="h-100 d-flex align-items-center">

                    {/* LEFT: Dashboard Button */}
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-pill px-3 shadow-sm text-primary fw-bold hover-scale d-flex align-items-center border me-3"
                        style={{ background: 'white' }}
                    >
                        <FaArrowLeft className="me-2" /> Dashboard
                    </Button>

                    {/* CENTER: Chat Title */}
                    <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ pointerEvents: 'none' }}>
                        <div className="d-flex align-items-center justify-content-center">
                            <div className="bg-primary text-white rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{width:'28px', height:'28px'}}>
                                <FaRobot size={14} />
                            </div>
                            <span className="fw-bold text-dark d-none d-md-block">{isGeneral ? 'General Assistant' : 'Contract Chat'}</span>
                        </div>
                        {isGeneral && <Badge bg="warning" text="dark" className="rounded-pill" style={{fontSize: '0.6rem'}}>GENERAL MODE</Badge>}
                    </div>

                    {/* RIGHT: User Controls */}
                    <div className="d-flex align-items-center gap-2 ms-auto">
                        <Button
                            variant="white"
                            size="sm"
                            onClick={clearChat}
                            className="rounded-circle p-2 shadow-sm text-secondary hover-scale d-flex align-items-center justify-content-center border"
                            style={{ width: '38px', height: '38px' }}
                            title="Clear Chat"
                        >
                            <FaEraser />
                        </Button>

                        <Dropdown align="end">
                            <Dropdown.Toggle variant="white" id="profile-dropdown" className="d-flex align-items-center border-0 p-0 text-dark fw-bold bg-transparent">
                                <div className="bg-white shadow-sm rounded-circle p-1 me-2 text-primary border border-light">
                                    <FaUserCircle size={28} />
                                </div>
                                <span className="d-none d-lg-block">{user.username}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow-lg border-0 p-2 mt-3 rounded-4" style={{ minWidth: '220px' }}>
                                <Dropdown.Item onClick={() => navigate('/settings')} className="rounded-3 py-2"><FaCog className="me-2" /> Settings</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="rounded-3 py-2 text-danger"><FaSignOutAlt className="me-2" /> Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Container>
            </Navbar>

            {/* 3. MAIN CONTENT: Padded top to push it below header */}
            <div className="w-100 d-flex justify-content-center position-relative z-1"
                 style={{ marginTop: '160px', height: 'calc(100vh - 80px)', paddingBottom: '20px', paddingLeft:'15px', paddingRight:'15px' }}>

                <Card className="w-100 shadow-lg border-0 overflow-hidden d-flex flex-column"
                      style={{
                          maxWidth: '1000px',
                          height: '100%', // Fills the remaining calculated space
                          borderRadius: '24px',
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.5)'
                      }}>

                    {/* Decorative Gradient Line */}
                    <div className="w-100" style={{ height: '4px', background: 'linear-gradient(90deg, #0d6efd, #198754)' }}></div>

                    {/* SCROLLABLE MESSAGES */}
                    <Card.Body className="overflow-auto p-4 custom-scrollbar flex-grow-1" style={{ scrollBehavior: 'smooth' }}>

                        {/* Session Start Indicator */}
                        <div className="text-center mb-4">
                            <span className="badge bg-light text-muted border fw-normal px-3 py-2 rounded-pill shadow-sm">
                                <FaClock className="me-2" /> Session Started: {new Date().toLocaleTimeString()}
                            </span>
                        </div>

                        {messages.map((msg, index) => (
                            <div key={index} className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div className={`d-flex align-items-end ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`} style={{ maxWidth: '80%' }}>

                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center shadow-sm ${msg.sender === 'ai' ? 'me-3 bg-white' : 'ms-3 bg-primary text-white'}`}
                                         style={{ width: '40px', height: '40px', border: '2px solid rgba(255,255,255,0.8)' }}>
                                        {msg.sender === 'ai' ? <FaRobot className="text-primary" size={20} /> : <FaUser size={18} />}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`p-3 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                                          style={{
                                              borderRadius: '20px',
                                              borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '20px',
                                              borderBottomRightRadius: msg.sender === 'user' ? '2px' : '20px',
                                              fontSize: '0.95rem',
                                              lineHeight: '1.6'
                                          }}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="d-flex align-items-center text-muted ms-5 mb-3">
                                <Spinner animation="grow" size="sm" className="me-2 text-primary" />
                                <span className="small fw-bold text-primary">AI is analyzing...</span>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </Card.Body>

                    {/* INPUT AREA (Pinned to bottom of card) */}
                    <div className="p-3 bg-white bg-opacity-75 border-top">
                        <Form onSubmit={sendMessage}>
                            <div className="position-relative">
                                <Form.Control
                                    type="text"
                                    placeholder={isGeneral ? "Ask legal questions..." : "Ask about contract clauses..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="form-control-lg border-0 shadow-sm ps-4 pe-5"
                                    style={{ borderRadius: '50px', background: 'white', fontSize: '1rem', paddingRight: '60px' }}
                                    autoFocus
                                    disabled={loading}
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm hover-scale"
                                    style={{ width: '42px', height: '42px' }}
                                    disabled={loading || !input.trim()}
                                >
                                    <FaPaperPlane size={18} />
                                </Button>
                            </div>
                        </Form>
                        <div className="text-center mt-2 d-flex align-items-center justify-content-center text-muted small opacity-75">
                            <FaInfoCircle size={10} className="me-1" />
                            <span style={{ fontSize: '0.7rem' }}>AI responses may vary. Please verify important details.</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Chat;