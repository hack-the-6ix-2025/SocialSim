# SocialSim

**AI-Powered Social Skills Training Platform for Healthcare, Law Enforcement, Education & Social Work Professionals**

SocialSim is an innovative platform that helps professionals develop critical communication and interpersonal skills through AI-powered video chat simulations. Practice real-world scenarios with intelligent avatars and receive personalized feedback to enhance your professional interactions.

## 🎯 Mission

Empower professionals in high-stakes, people-oriented fields to build confidence and competence through safe, realistic practice environments. Whether you're a medical professional, law enforcement officer, educator, or social worker, SocialSim provides the tools to master the social aspects of your profession.

## ✨ Key Features

### 🎭 **AI Video Chat Interface**
- **Real-time voice conversations** with AI avatars
- **Speaking avatars** that respond naturally to your communication style
- **Realistic scenarios** tailored to your professional field
- **Immersive experience** that mimics real-world interactions

### 🏥 **Professional Field Coverage**
- **Medical Professionals**: Patient consultations, difficult conversations, team coordination
- **Law Enforcement**: Community interactions, crisis de-escalation, witness interviews
- **Childcare & Education**: Parent-teacher conferences, student discipline, special needs support
- **Social Work**: Client intake, crisis intervention, family mediation

### 🎮 **Simulation Management**
- **Browse simulations** by category and difficulty level
- **Customize prompts** to match your specific learning goals
- **Track progress** across different scenarios
- **Star favorite simulations** for quick access

### 📊 **Comprehensive Analytics**
- **Performance scoring** based on communication effectiveness
- **Detailed feedback** on strengths and areas for improvement
- **Progress tracking** over time
- **Category-specific insights** to identify skill gaps

### 🏆 **Learning Features**
- **History tracking** of all completed simulations
- **Personalized recommendations** based on performance
- **Collaborative mode** for team training scenarios
- **Mentorship integration** for professional guidance


### Running the Application

1. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Visit `http://localhost:3000`

2. **Start the Backend** (optional - most features work frontend-only)
   ```bash
   cd backend
   python main.py
   ```

## 🏗️ Architecture

<img width="796" height="467" alt="image" src="https://github.com/user-attachments/assets/08feb845-3a9e-47ac-9c20-145301ec4b21" />

### Key Technologies
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python, Pydantic
- **Database**: Supabase (PostgreSQL)
- **Video Generation**: Tavus API for video generation
- **Scoring Model**: TwelveLabs summarizer and embedding, Gemini API, Google Cloud, SciKit 
- **Authentication**: Supabase Auth with Google OAuth

## 🎯 Use Cases

### Medical Professionals
- **Patient Consultations**: Practice breaking bad news, explaining procedures
- **Team Communication**: Coordinate with nurses, specialists, and families
- **Difficult Conversations**: Handle patient complaints, family conflicts
- **Cultural Competency**: Navigate diverse patient populations

### Law Enforcement
- **Community Policing**: Build trust with community members
- **Crisis De-escalation**: Calm volatile situations safely
- **Witness Interviews**: Gather information effectively
- **Victim Support**: Provide compassionate assistance

### Educators & Childcare
- **Parent Conferences**: Discuss student progress constructively
- **Student Discipline**: Handle behavioral issues appropriately
- **Special Needs Support**: Communicate with diverse learners
- **Team Collaboration**: Work with administrators and colleagues

### Social Workers
- **Client Intake**: Build rapport and gather information
- **Crisis Intervention**: Provide immediate support and resources
- **Family Mediation**: Facilitate difficult conversations
- **Case Management**: Coordinate with other service providers


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
