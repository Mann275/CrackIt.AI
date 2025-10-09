# Deploying CrackIt.AI on Render.com

This guide explains how to deploy the CrackIt.AI application (both frontend and backend) on Render.com.

## Prerequisites

- A Render.com account
- GitHub repository with your CrackIt.AI code
- MongoDB database (either MongoDB Atlas or another MongoDB provider)

## Environment Variables

The following environment variables are required for the application to run properly:

- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `DB_NAME` - Name of your MongoDB database
- `GEMINI_API_KEY` - API key for Google Gemini AI (if using)
- `CORS_ORIGINS` - Comma-separated list of allowed origins for CORS

## Deploying the Backend

1. Log in to your Render.com dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service as follows:
   - **Name**: `crackit-ai-backend` (or your preferred name)
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python app.py`
5. Add all required environment variables under "Environment Variables"
6. Click "Create Web Service"

## Deploying the Frontend

1. Log in to your Render.com dashboard
2. Click on "New" and select "Static Site"
3. Connect your GitHub repository
4. Configure the service as follows:
   - **Name**: `crackit-ai-frontend` (or your preferred name)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
5. Click "Create Static Site"

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. **Missing Requirements**: Ensure `requirements.txt` points to your backend requirements
2. **Environment Variables**: Verify all required environment variables are set correctly
3. **Import Paths**: If React build fails, check import paths in UI components 
   (should be `from "../../../lib/utils"` not `from "../../lib/utils"`)
4. **Database Connection**: Make sure your MongoDB connection string is correct and the database is accessible

## Updating the Deployment

After pushing changes to your GitHub repository:

1. Go to your service in the Render dashboard
2. Click "Manual Deploy" 
3. Select "Deploy latest commit"

This will deploy the latest version of your application.