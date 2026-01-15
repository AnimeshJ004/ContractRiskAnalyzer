import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Container, Button, Card, Form, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaRobot, FaUser, FaPaperPlane, FaClock } from 'react-icons/fa';

const Chat = () => {
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

    // Create a unique key for storing this conversation ID in local storage
    const storageKey = `chat_session_${contractId}`;
    const [conversationId, setConversationId] = useState(localStorage.getItem(storageKey) || '');

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
                contractId: isGeneral ? null : contractId,
                conversationId: conversationId
            });

            // Save the conversation ID returned from backend
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
        <div className="d-flex flex-column vh-100 fade-in">
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
                <Button variant="outline-light" size="sm" onClick={() => navigate('/dashboard')}>
                    <FaArrowLeft className="me-1" /> Dashboard
                </Button>
                <div className="text-center">
                    <FaRobot className="me-2" />
                    <span className="fw-bold">{isGeneral ? 'General AI Assistant' : 'Contract Legal Assistant'}</span>
                    {isGeneral && <Badge bg="warning" text="dark" className="ms-2">General Mode</Badge>}
                </div>
                <div style={{ width: '100px' }}></div>
            </div>

            <Container className="flex-grow-1 overflow-auto p-4 d-flex flex-column" style={{ background: '#f8fafc' }}>
                {messages.map((msg, index) => (
                    <div key={index} className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className="d-flex align-items-start" style={{ maxWidth: '80%' }}>
                            {msg.sender === 'ai' && <div className="bg-primary text-white rounded-circle p-2 me-2"><FaRobot /></div>}
                            <Card className={`border-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white'}`}>
                                <Card.Body className="py-2 px-3">
                                    <div className="mb-1">{msg.text}</div>
                                    <div className="small opacity-50 text-end"><FaClock className="me-1"/>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </Card.Body>
                            </Card>
                            {msg.sender === 'user' && <div className="bg-secondary text-white rounded-circle p-2 ms-2"><FaUser /></div>}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-muted ms-5">AI is thinking...</div>}
                <div ref={bottomRef} />
            </Container>

            <div className="p-3 bg-white border-top">
                <Container>
                    <Form onSubmit={sendMessage} className="d-flex gap-2">
                        <Form.Control
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isGeneral ? "Ask general legal questions..." : "Ask about this contract..."}
                            className="rounded-pill"
                        />
                        <Button type="submit" variant="primary" className="rounded-circle p-3" disabled={loading}>
                            <FaPaperPlane />
                        </Button>
                    </Form>
                </Container>
            </div>
        </div>
    );
};

export default Chat;