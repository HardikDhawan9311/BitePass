# BitePass

## 1. Database Setup
1. Ensure you have MySQL installed and running.
2. Create a new empty database for the project using your preferred tool (e.g., MySQL terminal, phpMyAdmin, or DBeaver).

## 2. Server (Backend) Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the server directory and configure your database and environment variables.
4. Start the backend server:
   ```bash
   npm start
   ```

## 3. Client (Frontend) Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## 4. QR Service Integration Steps

Navigate to the QR service folder
Go into the qr-service/ folder in the project:

"cd qr-service"

----------------------------------------------------------------------------------
Create and activate a Python virtual environment

PowerShell:

"python -m venv venv
.\venv\Scripts\Activate.ps1"

OR

CMD:

"python -m venv venv
venv\Scripts\activate.bat"


Install dependencies

"pip install --upgrade pip
pip install -r requirements.txt"

--------------------------------------------------------------------------------

Run the FastAPI server

"uvicorn main:app --host 0.0.0.0 --port 8000"


The service will run at http://localhost:8000

Endpoint for QR generation: POST /generate_qr

----------------------------------------------------------------------------------
Testing the QR service

Use Postman, PowerShell, or a simple Node.js script to send a POST request:

Example JSON body:

{
  "token_id": "ABC123"
}


Example Node.js call using Axios:

const axios = require("axios");

const response = await axios.post("http://localhost:8000/generate_qr", {
  token_id: "ABC123"
});

console.log(response.data.qr_base64); // base64 QR string



-------------------------------------------------------------------
Integration Notes

The service runs independently; no changes are needed in the frontend or backend.

Make sure port 8000 is open and accessible from the Node.js backend.

This setup works locally for testing before deploying the QR service to the cloud.


-------------------------------------------------------------------------------

To check POST method on server use this command on powershell :
Invoke-RestMethod -Uri http://127.0.0.1:8000/generate_qr `
  -Method POST `
  -Body (@{token_id="TEST123"} | ConvertTo-Json) `
  -ContentType "application/json"
