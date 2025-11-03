# QR Code Generation for Flashcards and Quizzes

This implementation adds QR code generation functionality to the ClassroomAI application, allowing teachers to create interactive learning sessions that students can access by scanning QR codes.

## 🚀 Features Implemented

### 1. **QR Code Generation**
- Generate QR codes for flashcards and quizzes
- QR codes link directly to student-accessible pages
- Support for both individual and bulk session creation

### 2. **Student Access Pages**
- Mobile-optimized flashcards interface (`/student/[sessionId]/flashcards`)
- Interactive quiz interface (`/student/[sessionId]/quiz`)
- Real-time scoring and feedback
- Responsive design for all devices

### 3. **Session Management**
- In-memory session storage (demo implementation)
- Participant tracking
- Session activation/deactivation
- Automatic cleanup of old sessions

### 4. **Teacher Dashboard**
- Monitor active sessions
- View participant counts
- Generate new QR codes
- Preview student interfaces

## 📁 File Structure

```
app/
├── api/
│   ├── qr/route.ts                    # QR code generation API
│   ├── session/route.ts               # Session data API
│   └── sessions/
│       ├── route.ts                   # List all sessions
│       └── [sessionId]/route.ts       # Session management
├── student/
│   └── [sessionId]/
│       ├── flashcards/page.tsx        # Student flashcards interface
│       └── quiz/page.tsx              # Student quiz interface
├── dashboard/page.tsx                 # Teacher dashboard
└── ppt/
    ├── study/page.tsx                 # Updated with QR generation
    └── placement/page.tsx             # Updated with QR generation

components/
└── qr-code-generator.tsx              # QR code generation component

lib/
└── session-manager.ts                 # Session management logic
```

## 🔧 How It Works

### 1. **Teacher Workflow**
1. Upload PowerPoint presentation
2. AI generates flashcards and quizzes
3. Teacher clicks "Generate QR Code" button
4. QR code modal opens with:
   - QR code image
   - Student URL
   - Copy/share options
5. Teacher displays QR code to students
6. Monitor session via dashboard

### 2. **Student Workflow**
1. Student scans QR code with phone camera
2. Redirected to student interface
3. Access flashcards or quiz questions
4. Interactive learning experience
5. Real-time feedback and scoring

### 3. **Session Management**
- Each QR code generates a unique session ID
- Sessions store flashcards/quiz data
- Track participant count
- Auto-cleanup after 24 hours

## 🛠️ Technical Implementation

### Dependencies Added
```json
{
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

### Key Components

#### QRCodeGenerator Component
```tsx
<QRCodeGenerator
  sessionId={sessionId}
  type="flashcards" // or "quiz"
  data={flashcardsData}
  title="Flashcards"
  description="Students can scan this QR code to access flashcards"
/>
```

#### API Endpoints
- `POST /api/qr` - Generate QR code and create session
- `GET /api/session?sessionId=X&type=Y` - Get session data for students
- `GET /api/sessions` - List all active sessions (dashboard)
- `DELETE /api/sessions/[sessionId]` - Deactivate session

### Session Data Structure
```typescript
interface SessionData {
  sessionId: string
  type: "flashcards" | "quiz"
  data: any
  createdAt: string
  studentUrl: string
  isActive: boolean
  participants: string[]
}
```

## 🎯 Usage Examples

### Generate QR Code for Flashcards
1. Go to `/ppt/study` page
2. Click "Generate QR Code for Flashcards" button
3. QR code modal opens
4. Display QR code to students
5. Students scan and access flashcards

### Generate QR Code for Quiz
1. Go to `/ppt/study` page
2. Click "Generate QR Code for Quiz" button
3. QR code modal opens
4. Display QR code to students
5. Students scan and participate in quiz

### Monitor Sessions
1. Go to `/dashboard` page
2. View active sessions
3. See participant counts
4. Generate new QR codes
5. Deactivate sessions when done

## 🔮 Future Enhancements

### Real-time Features
- WebSocket connections for live updates
- Real-time participant tracking
- Live quiz results aggregation
- Teacher can see student responses in real-time

### Database Integration
- Replace in-memory storage with Redis/MongoDB
- Persistent session storage
- User authentication and session history
- Analytics and reporting

### Advanced Features
- Custom QR code styling
- Session scheduling
- Multiple choice question types
- Image support in flashcards
- Export session data

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install qrcode @types/qrcode
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test QR Code Generation**
   - Upload a PowerPoint file
   - Generate flashcards/quizzes
   - Click "Generate QR Code" buttons
   - Test student access via QR codes

4. **Monitor Sessions**
   - Visit `/dashboard` to see active sessions
   - Monitor participant counts
   - Manage session lifecycle

## 📱 Mobile Testing

To test the student experience:
1. Generate a QR code
2. Use your phone's camera to scan it
3. Or copy the student URL and open on mobile
4. Test the responsive interface

## 🔒 Security Considerations

- Session IDs are randomly generated
- No sensitive data in QR codes
- Sessions auto-expire after 24 hours
- Participant tracking is anonymous

## 📊 Performance Notes

- QR codes are generated on-demand
- Session data is stored in memory (demo)
- Images are optimized for mobile viewing
- Automatic cleanup prevents memory leaks

This implementation provides a complete QR code-based learning system that transforms static presentations into interactive learning experiences!
