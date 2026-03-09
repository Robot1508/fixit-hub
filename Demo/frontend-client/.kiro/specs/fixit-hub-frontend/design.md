graph TB
    subgraph "Frontend (React)"
        UI[User Interface Components]
        EL[Expert Logic Layer - Local Fallback]
        SM[State Management - React Hooks]
    end
    
    subgraph "AWS Backend (Existing)"
        LB[Lambda Functions]
        BR[Bedrock RAG/Agents]
    end
    
    UI --> EL
    EL --> SM
    SM --> LB
    LB --> BR
    ## System Integration Flow

### Diagnostic Execution Flow (Hybrid AI)
```mermaid
sequenceDiagram
    participant User
    participant App as App.tsx (React)
    participant EL as Expert Logic (Local)
    participant AWS as Bedrock (Cloud)

    User->>App: Submits "Laptop is clicking"
    App->>EL: Scan for critical keywords
    EL-->>App: Match found: "clicking"
    App->>User: Display Instant Expert Advice (100% Uptime)
    
    Note over App,AWS: Parallel Async Process
    App->>AWS: Request deep analysis via Lambda
    AWS-->>App: Detailed Solution Data
    App->>User: Update UI with Cloud Solution