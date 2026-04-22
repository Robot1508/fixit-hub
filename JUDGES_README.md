# FixIt Hub - Agentic Integrity Layer (Google Solution Challenge 2026)

Welcome Judges! 

FixIt Hub is built to be the gold standard for Unbiased AI in civic reporting, actively aligning with **UN SDG 11.3 (Inclusive & Sustainable Urbanization)**. We didn't just build a smart platform; we built a completely equitable one that actively fights "Algorithmic Redlining" and bias.

## Core Features: Agentic Integrity

### 1. The "Bias-Aware" Data Pipeline (Agentic Self-Audit)
Most AI-driven civic apps blindly trust the AI's grading. Our system doesn't. 
Using an **Integrity Engine Middleware**, every image processed by AWS Bedrock runs through a "Fairness Metadata" check. 

- **Confidence-to-Environment Ratio:** It calculates whether the Bedrock API is artificially less confident due to low lighting or rural road textures. 
- **Real-Time Auditing Dashboard:** For every request, we append fairness context and generate a `BIAS_REPORT.json` that administrators can actively use to monitor biases in the models.
- **AWS Bedrock Guardrails:** Model interactions enforce content filtering and guardrails via Amazon's API policies.

### 2. Explainable AI Interfaces ("Winner's" Transparency)
Trust requires transparency. In our Report Dashboard, users and staff can toggle the **"Logic View"**.
- This plain-language overlay explains exactly *why* the AI assigned a severity score. 
- *Example Context:* "Detected: Pothole (92%). Normalized for low-lighting to ensure equitable verification."
- **Multilingual Support:** We integrated Google Translate (Bhashini-style architecture) to toggle our reports and logic-views seamlessly into local languages like Marathi and Hindi, ensuring accessibility for non-English speakers.

### 3. "Anti-Gravity" Self-Correction (Data Desert Prevention)
We've tackled a systemic problem: *The Silent Zone / Data Desert Bias*, where underserved areas are ignored simply because they lack historical reporting data.
- If a report originates from a historically low-reporting coordinate (e.g., Ward 9 or Ward 11), our Data Logic context automatically detects the "Silent Zone".
- It dynamically increases the report's priority weight to **Critical**.
- By overriding standard AI severity scores based on regional under-representation, our platform continuously self-corrects against algorithmic redlining.

---
*Built in the `feature/equity-layer` branch for true equitable transparency.*
