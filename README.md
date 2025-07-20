# SocialSim 🏥👮‍♂️👨‍🏫👨‍⚕️

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Supabase account
- Tavus API key (for AI video generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SocialSim.git
   cd SocialSim
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   
   Create `.env` files in both frontend and backend directories:
   
   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   TAVUS_API_KEY=your_tavus_api_key
   ```
   
   **Backend (.env):**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   ```

5. **Database Setup**
   
   Set up the following tables in your Supabase database:
   
   ```sql
   -- Users and profiles
   CREATE TABLE profiles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     name TEXT,
     email TEXT,
     role TEXT,
     field TEXT,
     experience TEXT,
     goals TEXT[],
     interests TEXT[],
     study_level TEXT,
     focus_areas TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Simulations
   CREATE TABLE simulations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     description TEXT,
     category TEXT,
     difficulty TEXT,
     thumbnail_url TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- History tracking
   CREATE TABLE history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     simulation_id UUID REFERENCES simulations(id),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- User starred simulations
   CREATE TABLE user_simulations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     simulation_id UUID REFERENCES simulations(id),
     starred BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

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

## 🎮 How to Use

### 1. **Onboarding & Setup**
- Sign in with your Google account
- Complete the onboarding questionnaire to personalize your experience
- Select your professional field and experience level
- Choose your learning goals and focus areas

### 2. **Discover Simulations**
- Browse available simulations by category
- Use search and filters to find relevant scenarios
- Read descriptions and difficulty levels
- Star simulations you want to practice

### 3. **Practice with AI**
- Select a simulation to start
- Engage in real-time voice conversation with AI avatars
- Practice your communication skills in realistic scenarios
- Complete the simulation to receive feedback

### 4. **Review & Improve**
- Check your performance score and detailed feedback
- Review analytics to track your progress over time
- Identify areas for improvement
- Revisit simulations to practice specific skills

### 5. **Track Progress**
- View your simulation history
- Monitor performance trends
- Celebrate improvements and milestones
- Share progress with mentors or supervisors

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router**: Modern Next.js routing with server components
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first styling with custom components
- **Supabase Client**: Direct database access for real-time features
- **Framer Motion**: Smooth animations and transitions

### Backend (FastAPI - Optional)
- **RESTful API**: Clean endpoints for data management
- **Supabase Integration**: Database operations and authentication
- **Pydantic Models**: Request/response validation
- **Async Support**: High-performance concurrent operations

### Database (Supabase)
- **PostgreSQL**: Reliable relational database
- **Real-time Subscriptions**: Live updates across the application
- **Row Level Security**: Secure data access
- **Authentication**: Built-in user management

### AI Integration
- **Tavus API**: AI video generation and avatar interactions
- **Real-time Communication**: WebRTC for voice conversations
- **Custom Prompts**: Tailored scenarios for different professions

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

## 🔧 Development

### Project Structure
```
SocialSim/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── utils/               # Supabase and API utilities
├── backend/                 # FastAPI server (optional)
│   ├── routers/            # API endpoints
│   └── utils/              # Database utilities
└── tavus-vibecode-quickstart/  # AI video integration example
```

### Key Technologies
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python, Pydantic
- **Database**: Supabase (PostgreSQL)
- **AI**: Tavus API for video generation
- **Authentication**: Supabase Auth with Google OAuth

## 🤝 Contributing

We welcome contributions from professionals, educators, and developers who share our vision of improving social skills training.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution
- **New Simulation Scenarios**: Create realistic scenarios for different professions
- **UI/UX Improvements**: Enhance the user experience
- **Analytics Features**: Add more detailed performance insights
- **Accessibility**: Improve accessibility for users with disabilities
- **Documentation**: Help improve guides and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Healthcare Professionals**: For insights into real-world communication challenges
- **Law Enforcement Officers**: For guidance on community interaction scenarios
- **Educators**: For understanding classroom dynamics and parent communication
- **Social Workers**: For expertise in client relationships and crisis intervention
- **AI Research Community**: For advancing conversational AI technology

## 📞 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@socialsim.com

---

**Built with ❤️ for professionals who make a difference in people's lives every day.**
