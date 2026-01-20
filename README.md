# 📜 Contract Risk Analyzer

**Contract Risk Analyzer** is an AI-powered legal tech platform that simplifies contract review. It scans PDF documents, identifies hidden risks, calculates a risk score, and provides actionable recommendations using advanced Large Language Models (LLMs).

> **Stop signing blindly.** Get an instant legal audit in seconds.
**LIVE LINK** =>(https://intellectual-wilona-animeshj425-62b84662.koyeb.app/)
---

## 🚀 Key Features

* **📄 AI Contract Analysis:** Upload PDF contracts to get a detailed breakdown of risks, loopholes, and missing clauses.
* **📊 Risk Scoring:** Automatically calculates a "Risk Score" (0-100) and categorizes contracts as Low, Medium, or High risk.
* **💬 Chat with Your Contract:** An interactive AI chat allowing users to ask specific questions about their document (e.g., *"What is the termination notice period?"*).
* **📥 PDF Report Generation:** Download a professional summary report of the analysis.
* **🔐 Secure Authentication:** Complete user management system with JWT Authentication and **Google OAuth2** support.
* **⏳ Rate Limiting & Quotas:** Built-in quota system to manage API usage per user (e.g., free tier limits).
* **📱 Mobile Responsive:** Fully responsive "Glassmorphism" UI that works on Desktop, Tablets, and Mobile.
* **🛡️ Admin Console:** Dedicated dashboard for admins to manage users and system-wide contracts.

---

## 🛠️ Tech Stack

### **Backend**
* **Java 17+**
* **Spring Boot 3.x** (Web, Security, Data MongoDB)
* **Spring AI** (for LLM integration)
* **Apache PDFBox** (PDF Text Extraction)
* **Tesseract OCR** (Optical Character Recognition for scanned PDFs)
* **MongoDB** (Database)

### **Frontend**
* **React.js** (Vite)
* **Bootstrap 5** (Styling & Layouts)
* **Axios** (API Requests)
* **React Router** (Navigation)
* **React Toastify** (Notifications)

### **AI & Infrastructure**
* **LLM Provider:** Groq (Llama-3) or OpenAI (Configurable)
* **Containerization:** Docker
* **Build Tools:** Maven (Backend), NPM (Frontend)

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### **Prerequisites**
* Java 17 or higher
* Node.js & npm
* MongoDB (running locally or cloud URI)
* An API Key from [Groq](https://console.groq.com/) (or OpenAI)
