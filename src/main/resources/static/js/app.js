// Contracts Page Logic
if (document.getElementById('contractsList')) {
    const contractsListDiv = document.getElementById('contractsList');

    async function loadContracts() {
        try {
            const contracts = await getContracts();
            displayContracts(contracts);
        } catch (error) {
            contractsListDiv.innerHTML = '<p>Error loading contracts: ' + error.message + '</p>';
        }
    }

    loadContracts();

    function displayContracts(contracts) {
        if (contracts.length === 0) {
            contractsListDiv.innerHTML = '<p>No contracts found.</p>';
            return;
        }

        const html = contracts.map(contract => `
            <div class="contract-card">
                <h3>${contract.title || 'Contract ' + contract.id}</h3>
                <p><strong>ID:</strong> ${contract.id}</p>
                <p><strong>Uploaded:</strong> ${new Date(contract.uploadDate).toLocaleDateString()}</p>
                <button onclick="viewContract('${contract.id}')">View Details</button>
            </div>
        `).join('');

        contractsListDiv.innerHTML = html;
    }

    window.viewContract = async (id) => {
        try {
            const contract = await getContractById(id);
            alert(`Contract Details:\nID: ${contract.id}\nTitle: ${contract.title}\nContent: ${contract.content.substring(0, 200)}...`);
        } catch (error) {
            alert('Error loading contract: ' + error.message);
        }
    };
}

// Upload Page Logic
if (document.getElementById('uploadForm')) {
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (!file) {
            uploadStatus.innerHTML = '<p style="color: red;">Please select a file.</p>';
            return;
        }

        try {
            uploadStatus.innerHTML = '<p>Uploading...</p>';
            const result = await uploadContract(file);
            uploadStatus.innerHTML = '<p style="color: green;">Upload successful! Contract ID: ' + result.id + '</p>';
            fileInput.value = '';
        } catch (error) {
            uploadStatus.innerHTML = '<p style="color: red;">Upload failed: ' + error.message + '</p>';
        }
    });
}

// Chat Page Logic
if (document.getElementById('chatContainer')) {
    const questionInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');

    sendBtn.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        if (!question) return;

        // Add user message
        addMessage('You', question);
        questionInput.value = '';

        try {
            const response = await chatWithAI(question);
            addMessage('AI', response.answer || response);
        } catch (error) {
            addMessage('AI', 'Error: ' + error.message);
        }
    });

    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    function addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const currentPage = window.location.pathname.split('/').pop();
    if (!token && currentPage !== 'login.html') {
        window.location.href = 'login.html';
    }
});
