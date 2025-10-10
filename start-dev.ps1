# Development Environment Setup Script
# Run this script to start both backend and frontend servers

Write-Host "🚀 Starting CrackIt.AI Development Environment" -ForegroundColor Green

# Start Backend
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'D:\Project\Major Project\Crackit.Ai'; .\.venv\Scripts\activate; cd backend; uvicorn server:app --reload --host 127.0.0.1 --port 8000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend  
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'D:\Project\Major Project\Crackit.Ai\frontend'; npm start"

Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "🔗 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan