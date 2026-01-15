import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Button, Card, Form, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaRobot, FaUser, FaPaperPlane, FaClock } from 'react-icons/fa';

const Chat = () => {
    const { contractId } = useParams();
    const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I have analyzed this contract. Ask me anything about it.' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const navigate = useNavigate();

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
                ContractId: contractId // Matches your DTO
            });
            setMessages([...newMessages, { sender: 'ai', text: response.data.response }]);
        } catch (error) {
            setMessages([...newMessages, { sender: 'ai', text: "Error: Could not connect to the AI." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column vh-100 fade-in">
            {/* Header */}
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
                <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="d-flex align-items-center"
                >
                    <FaArrowLeft className="me-1" />
                    Back to Dashboard
                </Button>
                <div className="text-center">
                    <FaRobot className="me-2" />
                    <span className="fw-bold">AI Legal Assistant</span>
                </div>
                <div style={{ width: '140px' }}></div> {/* Spacer for centering */}
            </div>

            {/* Chat Area */}
            <Container className="flex-grow-1 overflow-auto p-4 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                        <div className="d-flex align-items-start" style={{ maxWidth: '80%' }}>
                            {msg.sender === 'ai' && (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '40px', height: '40px' }}>
                                    <FaRobot size={16} />
                                </div>
                            )}
                            <Card
                                className={`border-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                                style={{
                                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    maxWidth: '100%'
                                }}
                            >
                                <Card.Body className="py-3 px-4">
                                    <div className="mb-2">{msg.text}</div>
                                    <div className={`small ${msg.sender === 'user' ? 'text-white-50' : 'text-muted'} d-flex align-items-center`}>
                                        <FaClock size={10} className="me-1" />
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </Card.Body>
                            </Card>
                            {msg.sender === 'user' && (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center ms-3 mt-1" style={{ width: '40px', height: '40px' }}>
                                    <FaUser size={16} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="d-flex mb-4 justify-content-start">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 mt-1 pulse" style={{ width: '40px', height: '40px' }}>
                            <FaRobot size={16} />
                        </div>
                        <Card className="border-0 shadow-sm bg-white text-dark" style={{ borderRadius: '18px 18px 18px 4px', maxWidth: '60%' }}>
                            <Card.Body className="py-3 px-4">
                                <div className="d-flex align-items-center">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span className="ms-2 text-muted small">AI is thinking...</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                )}
                <div ref={bottomRef} />
            </Container>

            {/* Input Area */}
            <div className="p-4 bg-white border-top shadow-lg">
                <Container>
                    <Form onSubmit={sendMessage} className="d-flex gap-3">
                        <Form.Control
                            type="text"
                            placeholder="Ask a question about this contract..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="form-control-lg border-2"
                            style={{ borderRadius: '25px' }}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || !input.trim()}
                            className="btn-lg px-4 d-flex align-items-center"
                            style={{ borderRadius: '25px' }}
                        >
                            <FaPaperPlane className="me-2" />
                            Send
                        </Button>
                    </Form>
                </Container>
            </div>
        </div>
    );
};

export default Chat;