import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Button, Card, Form, Badge, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaRobot, FaUser, FaPaperPlane, FaClock, FaComments, FaFileContract } from 'react-icons/fa';

// --- GLASSMORPHISM STYLE ---
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
};

const Chat = () => {
    // --- 1. YOUR ORIGINAL LOGIC ---
    const { contractId } = useParams();
    const isGeneral = contractId === 'general';

    const [messages, setMessages] = useState([{
        sender: 'ai',
        text: isGeneral
            ? 'Hello! I am your General Legal Assistant. Ask me anything about legal concepts.'
            : 'Hello! I have analyzed this contract. Ask me anything about it.'
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Conversation Memory Logic
    const storageKey = `chat_session_${contractId}`;
    const [conversationId, setConversationId] = useState(localStorage.getItem(storageKey) || '');

    const bottomRef = useRef(null);
    const navigate = useNavigate();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    // --- 2. LAYOUT & STYLING ---
    return (
        <div className="d-flex flex-column"
             style={{
                 height: '100vh', // FORCE FULL VIEWPORT HEIGHT
                 background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
                 position: 'relative',
                 overflow: 'hidden'
             }}>

            {/* Background Blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: '#6366f1', filter: 'blur(150px)', opacity: '0.15', borderRadius: '50%', zIndex: '0' }}></div>

            <Container className="d-flex flex-column py-3" style={{ zIndex: 1, maxWidth: '900px', height: '100%' }}>

                {/* --- HEADER (Fixed Top) --- */}
                <Card className="mb-3 border-0 flex-shrink-0" style={glassStyle}>
                    <Card.Body className="d-flex align-items-center justify-content-between py-2 px-3">
                        <div className="d-flex align-items-center">
                            <Button variant="link" onClick={() => navigate('/dashboard')} className="p-0 text-decoration-none text-muted me-3">
                                <FaArrowLeft size={20} />
                            </Button>
                            <div>
                                <h6 className="fw-bold mb-0 d-flex align-items-center text-dark">
                                    {isGeneral ? <FaComments className="me-2 text-primary" /> : <FaFileContract className="me-2 text-primary" />}
                                    {isGeneral ? 'General Assistant' : 'Contract Assistant'}
                                </h6>
                                {isGeneral && <Badge bg="primary" style={{fontSize: '0.65rem'}}>General Mode</Badge>}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* --- CHAT AREA (Scrollable Middle) --- */}
                <Card className="border-0 mb-3 shadow-sm"
                      style={{
                          ...glassStyle,
                          background: 'rgba(255, 255, 255, 0.6)',
                          flexGrow: 1,  // TAKE REMAINING SPACE
                          minHeight: 0, // CRITICAL FOR SCROLLING: Allows container to shrink
                          overflow: 'hidden' // Hide outer scrollbar
                      }}>
                    <Card.Body className="p-0 d-flex flex-column h-100">
                        {/* SCROLLABLE DIV */}
                        <div className="flex-grow-1 overflow-auto p-3" style={{ scrollBehavior: 'smooth' }}>
                            {messages.map((msg, index) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <div key={index} className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>

                                        {!isUser && (
                                            <div className="me-2 mt-1">
                                                <div className="bg-white p-2 rounded-circle shadow-sm text-primary d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                    <FaRobot size={16} />
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`p-3 shadow-sm ${isUser ? 'text-white' : 'text-dark'}`}
                                            style={{
                                                maxWidth: '80%',
                                                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                background: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'white',
                                                border: isUser ? 'none' : '1px solid rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                {msg.text}
                                            </div>
                                            <div className={`small mt-1 text-end ${isUser ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
                                                <FaClock className="me-1"/>
                                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>

                                        {isUser && (
                                            <div className="ms-2 mt-1">
                                                <div className="bg-primary text-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                    <FaUser size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {loading && (
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="me-2 mt-1">
                                        <div className="bg-white p-2 rounded-circle shadow-sm text-primary" style={{ width: 32, height: 32 }}><FaRobot size={16} /></div>
                                    </div>
                                    <div className="bg-white px-3 py-2 shadow-sm text-muted rounded-pill border d-flex align-items-center small">
                                        <Spinner animation="grow" size="sm" className="me-2" /> Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </Card.Body>
                </Card>

                {/* --- INPUT AREA (Fixed Bottom) --- */}
                <div style={{ zIndex: 10 }}>
                    <Form onSubmit={sendMessage}>
                        <div className="position-relative shadow-lg rounded-pill bg-white p-1 d-flex align-items-center border">
                            <Form.Control
                                type="text"
                                placeholder={isGeneral ? "Ask a legal question..." : "Ask about this contract..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                                className="border-0 shadow-none bg-transparent ps-4 py-2"
                                style={{ paddingRight: '50px', fontSize: '1rem' }}
                                autoFocus
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading || !input.trim()}
                                className="rounded-circle position-absolute end-0 me-1 d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: 40, height: 40 }}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : <FaPaperPlane size={16} className="ms-1" />}
                            </Button>
                        </div>
                    </Form>
                </div>

            </Container>
        </div>
    );
};

export default Chat;