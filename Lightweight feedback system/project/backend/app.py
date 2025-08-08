from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import hashlib
import jwt
from datetime import datetime, timedelta
import os

app = FastAPI(title="Feedback Platform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
security = HTTPBearer()

# Database initialization
def init_db():
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('manager', 'employee')),
            manager_id INTEGER,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (manager_id) REFERENCES users (id)
        )
    ''')
    
    # Feedback table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_id INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            strengths TEXT NOT NULL,
            improvements TEXT NOT NULL,
            sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
            acknowledged BOOLEAN DEFAULT FALSE,
            acknowledged_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (manager_id) REFERENCES users (id),
            FOREIGN KEY (employee_id) REFERENCES users (id)
        )
    ''')
    
    # Insert demo users
    demo_users = [
        ('Priya Sharma', 'priya@company.com', 'demo123', 'manager', None, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
        ('Arjun Patel', 'arjun@company.com', 'demo123', 'employee', 1, 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
        ('Kavya Reddy', 'kavya@company.com', 'demo123', 'employee', 1, 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
        ('Rohan Kumar', 'rohan@company.com', 'demo123', 'employee', 1, 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop')
    ]
    
    for name, email, password, role, manager_id, avatar in demo_users:
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('''
            INSERT OR IGNORE INTO users (name, email, password_hash, role, manager_id, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, email, password_hash, role, manager_id, avatar))
    
    # Insert demo feedback
    demo_feedback = [
        (1, 2, 'Excellent problem-solving skills and strong technical knowledge. Arjun consistently delivers high-quality code and is always willing to help team members.', 'Could benefit from more proactive communication during project updates. Consider taking more initiative in team meetings.', 'positive', True, '2025-01-10 14:30:00'),
        (1, 3, 'Outstanding project management skills and great attention to detail. Kavya has shown excellent leadership in cross-functional projects.', 'Focus on time management when juggling multiple priorities. Consider delegating more tasks to optimize workflow.', 'positive', False, None),
        (1, 4, 'Creative approach to problem-solving and strong collaboration skills. Rohan brings fresh perspectives to team discussions.', 'Work on meeting deadlines more consistently. Consider breaking down large tasks into smaller, manageable chunks.', 'neutral', True, '2025-01-06 08:20:00'),
        (1, 2, 'Showed great improvement in code documentation and testing practices. Arjun has become more collaborative with the QA team.', 'Continue working on presentation skills for client meetings. Practice explaining technical concepts to non-technical stakeholders.', 'positive', True, '2024-12-21 09:15:00')
    ]
    
    for manager_id, employee_id, strengths, improvements, sentiment, acknowledged, acknowledged_at in demo_feedback:
        cursor.execute('''
            INSERT OR IGNORE INTO feedback (manager_id, employee_id, strengths, improvements, sentiment, acknowledged, acknowledged_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (manager_id, employee_id, strengths, improvements, sentiment, acknowledged, acknowledged_at))
    
    conn.commit()
    conn.close()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str
    manager_id: Optional[int] = None
    avatar: Optional[str] = None

class FeedbackCreate(BaseModel):
    employee_id: int
    strengths: str
    improvements: str
    sentiment: str

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    sentiment: Optional[str] = None

class Feedback(BaseModel):
    id: int
    manager_id: int
    employee_id: int
    strengths: str
    improvements: str
    sentiment: str
    acknowledged: bool
    acknowledged_at: Optional[str] = None
    created_at: str
    updated_at: str

# Auth functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(
        id=user_data[0],
        name=user_data[1],
        email=user_data[2],
        role=user_data[4],
        manager_id=user_data[5],
        avatar=user_data[6]
    )

# API Routes
@app.on_event("startup")
async def startup_event():
    init_db()

@app.post("/api/auth/login")
async def login(login_data: LoginRequest):
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
    cursor.execute('SELECT * FROM users WHERE email = ? AND password_hash = ?', 
                   (login_data.email, password_hash))
    user_data = cursor.fetchone()
    conn.close()
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(
        id=user_data[0],
        name=user_data[1],
        email=user_data[2],
        role=user_data[4],
        manager_id=user_data[5],
        avatar=user_data[6]
    )
    
    access_token = create_access_token({"user_id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/api/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/users/team")
async def get_team_members(current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can view team members")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE manager_id = ?', (current_user.id,))
    team_data = cursor.fetchall()
    conn.close()
    
    team_members = []
    for member_data in team_data:
        team_members.append(User(
            id=member_data[0],
            name=member_data[1],
            email=member_data[2],
            role=member_data[4],
            manager_id=member_data[5],
            avatar=member_data[6]
        ))
    
    return team_members

@app.get("/api/feedback")
async def get_feedback(current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    if current_user.role == 'manager':
        cursor.execute('SELECT * FROM feedback WHERE manager_id = ? ORDER BY created_at DESC', 
                       (current_user.id,))
    else:
        cursor.execute('SELECT * FROM feedback WHERE employee_id = ? ORDER BY created_at DESC', 
                       (current_user.id,))
    
    feedback_data = cursor.fetchall()
    conn.close()
    
    feedback_list = []
    for fb_data in feedback_data:
        feedback_list.append(Feedback(
            id=fb_data[0],
            manager_id=fb_data[1],
            employee_id=fb_data[2],
            strengths=fb_data[3],
            improvements=fb_data[4],
            sentiment=fb_data[5],
            acknowledged=bool(fb_data[6]),
            acknowledged_at=fb_data[7],
            created_at=fb_data[8],
            updated_at=fb_data[9]
        ))
    
    return feedback_list

@app.post("/api/feedback")
async def create_feedback(feedback_data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Verify employee belongs to manager
    cursor.execute('SELECT id FROM users WHERE id = ? AND manager_id = ?', 
                   (feedback_data.employee_id, current_user.id))
    if not cursor.fetchone():
        raise HTTPException(status_code=403, detail="Employee not in your team")
    
    cursor.execute('''
        INSERT INTO feedback (manager_id, employee_id, strengths, improvements, sentiment)
        VALUES (?, ?, ?, ?, ?)
    ''', (current_user.id, feedback_data.employee_id, feedback_data.strengths, 
          feedback_data.improvements, feedback_data.sentiment))
    
    feedback_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"id": feedback_id, "message": "Feedback created successfully"}

@app.put("/api/feedback/{feedback_id}")
async def update_feedback(feedback_id: int, feedback_data: FeedbackUpdate, 
                         current_user: User = Depends(get_current_user)):
    if current_user.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Verify feedback belongs to manager
    cursor.execute('SELECT id FROM feedback WHERE id = ? AND manager_id = ?', 
                   (feedback_id, current_user.id))
    if not cursor.fetchone():
        raise HTTPException(status_code=403, detail="Feedback not found or not authorized")
    
    update_fields = []
    values = []
    
    if feedback_data.strengths is not None:
        update_fields.append("strengths = ?")
        values.append(feedback_data.strengths)
    
    if feedback_data.improvements is not None:
        update_fields.append("improvements = ?")
        values.append(feedback_data.improvements)
    
    if feedback_data.sentiment is not None:
        update_fields.append("sentiment = ?")
        values.append(feedback_data.sentiment)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(feedback_id)
    
    query = f"UPDATE feedback SET {', '.join(update_fields)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    
    return {"message": "Feedback updated successfully"}

@app.post("/api/feedback/{feedback_id}/acknowledge")
async def acknowledge_feedback(feedback_id: int, current_user: User = Depends(get_current_user)):
    if current_user.role != 'employee':
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    # Verify feedback belongs to employee
    cursor.execute('SELECT id FROM feedback WHERE id = ? AND employee_id = ?', 
                   (feedback_id, current_user.id))
    if not cursor.fetchone():
        raise HTTPException(status_code=403, detail="Feedback not found or not authorized")
    
    cursor.execute('''
        UPDATE feedback 
        SET acknowledged = TRUE, acknowledged_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ''', (feedback_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "Feedback acknowledged successfully"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('feedback.db')
    cursor = conn.cursor()
    
    if current_user.role == 'manager':
        # Manager stats
        cursor.execute('SELECT COUNT(*) FROM users WHERE manager_id = ?', (current_user.id,))
        team_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE manager_id = ?', (current_user.id,))
        total_feedback = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE manager_id = ? AND sentiment = "positive"', 
                       (current_user.id,))
        positive_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE manager_id = ? AND acknowledged = FALSE', 
                       (current_user.id,))
        unacknowledged_count = cursor.fetchone()[0]
        
        stats = {
            "team_members": team_count,
            "total_feedback": total_feedback,
            "positive_count": positive_count,
            "unacknowledged_count": unacknowledged_count
        }
    else:
        # Employee stats
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE employee_id = ?', (current_user.id,))
        total_feedback = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE employee_id = ? AND acknowledged = TRUE', 
                       (current_user.id,))
        acknowledged_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE employee_id = ? AND acknowledged = FALSE', 
                       (current_user.id,))
        pending_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM feedback WHERE employee_id = ? AND sentiment = "positive"', 
                       (current_user.id,))
        positive_count = cursor.fetchone()[0]
        
        stats = {
            "total_feedback": total_feedback,
            "acknowledged_count": acknowledged_count,
            "pending_count": pending_count,
            "positive_count": positive_count
        }
    
    conn.close()
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)