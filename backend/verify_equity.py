import json
import random
import datetime
import os

MOCK_GCP = True

# Simulate the Vertex AI / Gemini 1.5 Pro verification prompt
def verify_decision(image_base64: str, aws_severity_score: int, location: str):
    print("Initiating GCP Vertex AI (Gemini 1.5 Pro) Verification...")
    
    prompt = f"Verify if the damage in this image justifies a '{aws_severity_score}' rating. Explicitly check if the rating was influenced by the wealth of the surrounding environment or lighting. Return a Fairness Score (0.0 - 1.0)."
    
    if MOCK_GCP:
        # Mocking the Vertex AI Response for local prototype execution
        # Simulate geographic analysis logic showing 'no geographic bias' or a correction.
        is_underserved = 'Ward 9' in location or 'Ward 11' in location
        
        fairness_score = round(random.uniform(0.85, 0.99), 2)
        commentary = "Audit Confirmed: No Geographic Bias. The severity rating aligns accurately with the structural degradation observed, independent of the surrounding infrastructure's wealth markers."
        
        if is_underserved and aws_severity_score < 8:
             # Example of catching a bias where AWS scored lower in an underserved area incorrectly
            fairness_score = 0.65
            commentary = "Audit Flagged: Potential Geographic Bias detected. Recommending structural severity escalation based on localized pavement decay metrics independent of lighting limitations."
            
        return {
            "fairness_score": fairness_score,
            "audit_commentary": commentary,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
    else:
        # Real GCP Integration would go here:
        # from google.cloud import aiplatform
        # aiplatform.init() ...
        pass

def save_to_firestore(audit_log: dict):
    if MOCK_GCP:
        # Mock Firestore by saving to a local JSON that BigQuery script/frontend can read
        mock_db_path = os.path.join(os.path.dirname(__file__), "mock_firestore.json")
        try:
            with open(mock_db_path, "r") as f:
                db = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            db = {"audit_logs": []}
            
        db["audit_logs"].append(audit_log)
        
        with open(mock_db_path, "w") as f:
            json.dump(db, f, indent=4)
        
        print(f"Saved audit log to Firestore (Mock Mode). Log ID: {len(db['audit_logs'])}")
    else:
        # Real Firestore logic
        # db = firestore.Client()
        pass

if __name__ == "__main__":
    # Test execution
    res = verify_decision("dummy_base64", 9, "Ward 9")
    save_to_firestore({"aws_severity": 9, "location": "Ward 9", "vertex_audit": res})
