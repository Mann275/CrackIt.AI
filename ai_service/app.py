from flask import Flask, request, jsonify
from flask_cors import CORS
from roadmap_engine import generate_roadmap, analyze_test_results
from fetch_qna import scrape_geeksforgeeks, scrape_glassdoor
import json
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/generate-roadmap', methods=['POST'])
def api_generate_roadmap():
    try:
        data = request.get_json()
        
        # Extract required parameters
        user_skills = data.get('skills', {})
        user_goals = data.get('goals', {})
        target_companies = data.get('targetCompanies', [])
        timeframe_months = data.get('timeframeMonths', 3)
        
        # Generate personalized roadmap
        roadmap = generate_roadmap(
            user_skills=user_skills,
            user_goals=user_goals,
            target_companies=target_companies,
            timeframe_months=timeframe_months
        )
        
        return jsonify({"success": True, "roadmap": roadmap})
    
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analyze-test', methods=['POST'])
def api_analyze_test_results():
    try:
        data = request.get_json()
        
        # Extract test results
        test_results = data.get('testResults', [])
        user_skills = data.get('skills', {})
        target_companies = data.get('targetCompanies', [])
        
        # Analyze test results
        analysis = analyze_test_results(
            test_results=test_results,
            user_skills=user_skills,
            target_companies=target_companies
        )
        
        return jsonify({"success": True, "analysis": analysis})
    
    except Exception as e:
        print(f"Error analyzing test results: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/fetch-questions', methods=['GET'])
def api_fetch_questions():
    try:
        company = request.args.get('company', 'Amazon')
        source = request.args.get('source', 'GeeksForGeeks')
        
        # Cache file path to avoid repeated scraping
        cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f"{company}_{source}.json")
        
        # Check if cached data exists
        if os.path.exists(cache_file):
            with open(cache_file, 'r') as f:
                questions = json.load(f)
        else:
            # Fetch questions based on source
            if source.lower() == 'glassdoor':
                questions = scrape_glassdoor(company)
            else:
                questions = scrape_geeksforgeeks(company)
            
            # Cache the results
            with open(cache_file, 'w') as f:
                json.dump(questions, f)
        
        return jsonify({
            "success": True, 
            "company": company, 
            "source": source,
            "questions": questions
        })
    
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/companies', methods=['GET'])
def api_companies():
    """Return list of supported companies for interview preparation"""
    companies = [
        {"id": "amazon", "name": "Amazon", "logo": "amazon_logo.png"},
        {"id": "google", "name": "Google", "logo": "google_logo.png"},
        {"id": "microsoft", "name": "Microsoft", "logo": "microsoft_logo.png"},
        {"id": "meta", "name": "Meta", "logo": "meta_logo.png"},
        {"id": "apple", "name": "Apple", "logo": "apple_logo.png"},
        {"id": "netflix", "name": "Netflix", "logo": "netflix_logo.png"},
    ]
    
    return jsonify({"success": True, "companies": companies})

if __name__ == '__main__':
    app.run(debug=True, port=5002)
