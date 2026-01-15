# TODO Fixes for ContractRiskAnalyzer Project

## 1. Fix CORS Inconsistency
- [x] Remove @CrossOrigin from AuthController.java
- [x] Remove @CrossOrigin from AnalyzerController.java
- [x] Ensure SecurityConfiguration.java handles CORS properly

## 2. Secure Sensitive Configurations
- [x] Move MongoDB URI, AI API key, JWT secret from application.yml to environment variables
- [x] Update application.yml to use ${} placeholders

## 3. Add File Upload Limits
- [x] Add multipart file size limits in application.yml

## 4. Implement AI Response Caching
- [ ] Add Spring Cache dependency to pom.xml
- [ ] Enable caching in main application class
- [ ] Add @Cacheable annotations in AiAnalysis.java

## 5. Improve Error Handling
- [ ] Add proper exception handling in ContractService.java
- [ ] Add logging in services for performance monitoring

## 6. Testing and Verification
- [ ] Test all features: login, logout, register, findById, uploadPDF, chatting with AI, contracts
- [ ] Verify responsiveness improvements
- [ ] Check for any remaining issues
