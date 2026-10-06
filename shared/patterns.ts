import type { Difficulty } from './types.ts';

export interface Pattern {
  id: string;
  /** Phrases score 3, single words 1 — see matcher.ts */
  keywords: string[];
  projectName: string;
  summary: string;
  upgrades: [title: string, description: string, concept: string][];
  techStack: string[];
  difficulty: Difficulty;
  estimatedTime: string;
  score: number;
  whyItWorks: string;
}

export const PATTERNS: Pattern[] = [
  {
    id: 'attendance',
    keywords: ['attendance', 'roll call', 'biometric', 'present', 'absent', 'attendance system'],
    projectName: 'AI-Powered Attendance Intelligence',
    summary: 'A smart attendance system enhanced with computer vision, prediction and AI-generated insights.',
    upgrades: [
      ['Face recognition', 'Automated attendance using camera-based identification.', 'Computer vision'],
      ['Attendance prediction', 'Identify students at risk of low attendance before it’s too late.', 'Classification'],
      ['AI insights', 'Generate natural-language attendance reports for faculty.', 'LLM'],
      ['Anomaly detection', 'Flag proxy attendance and unusual patterns automatically.', 'Anomaly detection'],
    ],
    techStack: ['Python', 'OpenCV', 'FastAPI', 'LLM', 'MongoDB'],
    difficulty: 'Intermediate',
    estimatedTime: '1–2 weeks',
    score: 8.7,
    whyItWorks:
      'Attendance produces clean, labelled data every single day — exactly what models need. Face recognition removes the manual work, prediction turns a register into an early-warning system, and LLM reports make the output useful to faculty. Examiners see three distinct AI techniques in a project everyone understands.',
  },
  {
    id: 'parking',
    keywords: ['parking', 'parking lot', 'car park', 'parking slot', 'vehicle parking', 'smart parking'],
    projectName: 'AI Smart Parking Intelligence',
    summary: 'A parking system that sees free spots, predicts demand before it peaks and answers drivers in plain language.',
    upgrades: [
      ['Computer vision', 'Detect free and occupied spots from existing CCTV feeds.', 'Computer vision'],
      ['Parking prediction', 'Forecast which zones fill up in the next 30 minutes.', 'Time series'],
      ['Demand forecasting', 'Plan pricing and staffing around weekly demand curves.', 'Forecasting'],
      ['AI assistant', 'Drivers ask “where can I park near Block C?” and get an answer.', 'LLM'],
    ],
    techStack: ['Python', 'OpenCV', 'YOLOv8', 'FastAPI', 'LLM', 'PostgreSQL'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 9.1,
    whyItWorks:
      'Parking is a near-perfect AI problem: the camera data already exists, demand follows patterns a model can learn, and drivers want answers, not dashboards. You get real computer vision, real prediction and a usable assistant in one project — and a live demo that works on any campus.',
  },
  {
    id: 'library',
    keywords: ['library', 'book', 'books', 'library management', 'catalogue', 'catalog', 'borrow'],
    projectName: 'AI Research Assistant for Libraries',
    summary: 'A library system that understands what students mean, recommends what to read next and summarises it for them.',
    upgrades: [
      ['Semantic search', 'Find books and papers by meaning, not exact titles.', 'Embeddings'],
      ['Smart recommendations', 'Suggest titles from borrowing history and course.', 'Recommender'],
      ['Paper summariser', 'Summarise chapters and papers into exam-ready notes.', 'LLM'],
      ['Demand prediction', 'Predict which titles need extra copies before exams.', 'Forecasting'],
    ],
    techStack: ['Python', 'FastAPI', 'Vector DB', 'LLM', 'React', 'PostgreSQL'],
    difficulty: 'Intermediate',
    estimatedTime: '2 weeks',
    score: 8.6,
    whyItWorks:
      'Every library already has a catalogue and borrowing history — the hard part of AI, the data, is done. Semantic search and RAG-style summaries are exactly what employers mean by “applied LLMs”, and demand prediction adds a classic ML component.',
  },
  {
    id: 'placement',
    keywords: ['placement', 'placement portal', 'recruitment', 'campus placement', 'job portal', 'tnp', 'training and placement'],
    projectName: 'AI Interview Coach & Placement Portal',
    summary: 'A placement portal that screens resumes, runs mock interviews and tells students what actually moves their chances.',
    upgrades: [
      ['Resume screening', 'Score each resume against each job description.', 'NLP'],
      ['Mock interviews', 'An LLM interviewer that asks follow-ups and grades answers.', 'LLM'],
      ['Placement prediction', 'Estimate placement chances and the skills that change them.', 'Classification'],
      ['Job matching', 'Match students to drives using skill embeddings.', 'Embeddings'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM', 'Embeddings', 'MongoDB'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 9.0,
    whyItWorks:
      'Every final-year student cares about placements, so your demo audience is already invested. The project combines NLP, embeddings, prediction and an LLM interviewer — and you can test it on your own batch.',
  },
  {
    id: 'ecommerce',
    keywords: ['e-commerce', 'ecommerce', 'shopping', 'online store', 'shop', 'cart', 'marketplace', 'e commerce'],
    projectName: 'AI Shopping Assistant',
    summary: 'An online store that recommends, searches by photo and answers shoppers like a good salesperson would.',
    upgrades: [
      ['Personal recommendations', 'Suggestions from browsing and purchase behaviour.', 'Recommender'],
      ['Conversational shopping', 'Ask “a black hoodie under ₹1,500” and get real results.', 'LLM'],
      ['Visual search', 'Upload a photo, find similar products.', 'Computer vision'],
      ['Review intelligence', 'Summarise thousands of reviews into pros and cons.', 'NLP'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'Embeddings', 'LLM', 'PostgreSQL'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.8,
    whyItWorks:
      'A plain e-commerce site is one of the most common final-year projects. Recommendations, visual search and a shopping assistant turn it into the kind of system real retailers build — and each upgrade is independently demo-able.',
  },
  {
    id: 'food-delivery',
    keywords: ['food delivery', 'food', 'restaurant', 'canteen', 'swiggy', 'zomato', 'order food', 'meal'],
    projectName: 'AI Food Delivery Intelligence',
    summary: 'A food ordering platform that predicts delivery times, recommends dishes and helps kitchens prepare for the rush.',
    upgrades: [
      ['Delivery time prediction', 'Accurate ETAs from distance, traffic and kitchen load.', 'Regression'],
      ['Dish recommendations', 'Personal picks from order history and time of day.', 'Recommender'],
      ['Kitchen demand forecasting', 'Tell kitchens what to prep before the lunch rush.', 'Forecasting'],
      ['Order assistant', '“Something spicy and veg under ₹200” — answered.', 'LLM'],
    ],
    techStack: ['React Native', 'Node.js', 'Python', 'XGBoost', 'LLM', 'MongoDB'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.5,
    whyItWorks:
      'Delivery platforms run on prediction — ETAs, demand, recommendations. Adding those turns a CRUD ordering app into a data product, and the campus canteen makes a perfect real-world test bed.',
  },
  {
    id: 'hospital',
    keywords: ['hospital', 'clinic', 'patient', 'doctor', 'healthcare', 'medical', 'appointment'],
    projectName: 'AI Hospital Care Assistant',
    summary: 'A hospital system that routes patients, predicts no-shows and turns medical reports into plain language.',
    upgrades: [
      ['Symptom triage', 'Suggest the right department — guidance, never a diagnosis.', 'LLM'],
      ['No-show prediction', 'Predict missed appointments and send smart reminders.', 'Classification'],
      ['Report summariser', 'Explain lab reports to patients in plain language.', 'NLP'],
      ['Bed occupancy forecasting', 'Forecast ward occupancy for the next 72 hours.', 'Forecasting'],
    ],
    techStack: ['React', 'FastAPI', 'Python', 'scikit-learn', 'LLM', 'PostgreSQL'],
    difficulty: 'Advanced',
    estimatedTime: '3–4 weeks',
    score: 8.9,
    whyItWorks:
      'Healthcare is where AI has visible impact, and hospital management projects already model patients, doctors and appointments. The upgrades are practical and safety-aware — triage suggests, it doesn’t diagnose — which is exactly what reviewers look for.',
  },
  {
    id: 'agriculture',
    keywords: ['agriculture', 'farm', 'farmer', 'crop', 'crops', 'plant', 'soil', 'irrigation', 'farming'],
    projectName: 'AI Crop Health Advisor',
    summary: 'A farming platform that spots leaf disease from a photo, predicts yield and advises farmers in their own language.',
    upgrades: [
      ['Leaf disease detection', 'Identify crop disease from a phone photo.', 'Computer vision'],
      ['Yield prediction', 'Estimate yield from soil, weather and crop history.', 'Regression'],
      ['Irrigation advice', 'Weather-aware watering schedules that save water.', 'Forecasting'],
      ['Farmer assistant', 'Answers questions in Telugu, Hindi or Tamil.', 'LLM'],
    ],
    techStack: ['Python', 'TensorFlow', 'FastAPI', 'Weather API', 'LLM', 'Flutter'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 9.0,
    whyItWorks:
      'Agri-tech projects stand out because the impact is obvious. Public plant-disease datasets make the vision model achievable in days, and a local-language assistant shows you can ship AI to real users, not just a notebook.',
  },
  {
    id: 'fitness',
    keywords: ['fitness', 'gym', 'workout', 'exercise', 'health tracker', 'diet', 'yoga'],
    projectName: 'AI Personal Fitness Coach',
    summary: 'A fitness app that corrects your form through the camera and adapts the plan to how you actually progress.',
    upgrades: [
      ['Pose correction', 'Real-time form feedback from the phone camera.', 'Pose estimation'],
      ['Adaptive workout plans', 'Plans that adjust to missed days and progress.', 'Recommender'],
      ['Progress prediction', 'Predict when you’ll hit your goal at the current pace.', 'Regression'],
      ['Nutrition assistant', 'Log meals by describing them; get macros back.', 'LLM'],
    ],
    techStack: ['React Native', 'MediaPipe', 'Python', 'FastAPI', 'LLM', 'Firebase'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.8,
    whyItWorks:
      'Pose estimation is the showpiece — it runs on a phone and looks impressive live. Combined with adaptive plans and a nutrition assistant, a basic tracker becomes a genuinely personal coach.',
  },
  {
    id: 'expense',
    keywords: ['expense', 'expenses', 'budget', 'finance tracker', 'money', 'spending', 'expense tracker', 'wallet'],
    projectName: 'AI Expense Intelligence',
    summary: 'An expense tracker that reads receipts, categorises spending on its own and answers “where did my money go?”.',
    upgrades: [
      ['Receipt scanning', 'Snap a bill; amount, date and merchant are filled in.', 'OCR'],
      ['Auto-categorisation', 'Every transaction tagged without manual effort.', 'Classification'],
      ['Spending forecasts', 'See next month’s spend before it happens.', 'Forecasting'],
      ['Money assistant', 'Ask “where did my money go this month?”', 'LLM'],
    ],
    techStack: ['React', 'Node.js', 'Tesseract OCR', 'Python', 'LLM', 'MongoDB'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.3,
    whyItWorks:
      'The base app is simple, so the AI is the story. OCR, classification and forecasting are each small, well-documented builds — a strong pick if you want an AI project you can finish with time to polish.',
  },
  {
    id: 'learning',
    keywords: ['learning platform', 'e-learning', 'elearning', 'lms', 'online course', 'education', 'course', 'tutor', 'study'],
    projectName: 'AI Adaptive Learning Platform',
    summary: 'A learning platform that builds each student a path, tutors them through it and spots who is about to drop out.',
    upgrades: [
      ['Personal learning paths', 'Next lesson chosen from what the student got wrong.', 'Recommender'],
      ['AI tutor', 'Explains any lesson again, differently, on demand.', 'LLM'],
      ['Auto-generated quizzes', 'Fresh practice questions from any chapter.', 'LLM'],
      ['Dropout prediction', 'Flag disengaging students early.', 'Classification'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM', 'Embeddings', 'PostgreSQL'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.9,
    whyItWorks:
      'EdTech is where LLMs are already changing products. A tutor plus quiz generation plus a predictive model shows range, and your classmates are the perfect test users.',
  },
  {
    id: 'hostel',
    keywords: ['hostel', 'mess', 'dormitory', 'room allocation', 'warden', 'pg'],
    projectName: 'AI Hostel Management Assistant',
    summary: 'A hostel system that sorts complaints, cuts mess food waste and answers residents instantly.',
    upgrades: [
      ['Complaint triage', 'Route and prioritise complaints automatically.', 'NLP'],
      ['Mess demand forecasting', 'Predict headcount per meal to cut food waste.', 'Forecasting'],
      ['Smart room allocation', 'Match roommates by preferences and schedules.', 'Optimisation'],
      ['Hostel assistant', '“What’s for dinner?” “Is the laundry free?” — answered.', 'LLM'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'scikit-learn', 'LLM', 'MySQL'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.1,
    whyItWorks:
      'You live the problem, so your data and testing are real. Food-waste forecasting gives you a measurable result to present, which examiners love.',
  },
  {
    id: 'campus-navigation',
    keywords: ['campus navigation', 'navigation', 'campus map', 'indoor navigation', 'wayfinding', 'campus guide', 'map'],
    projectName: 'AI Campus Guide',
    summary: 'A campus navigator you can just ask — with landmark recognition and live crowd predictions.',
    upgrades: [
      ['Natural-language directions', '“Where is the CSE seminar hall?” — with landmarks.', 'LLM'],
      ['Landmark recognition', 'Point the camera at a building to know where you are.', 'Computer vision'],
      ['Crowd prediction', 'Know when the canteen and library are quiet.', 'Forecasting'],
      ['Accessible routing', 'Step-free routes for wheelchair users.', 'Graph search'],
    ],
    techStack: ['Flutter', 'Python', 'FastAPI', 'OpenCV', 'LLM', 'Firebase'],
    difficulty: 'Intermediate',
    estimatedTime: '2 weeks',
    score: 8.6,
    whyItWorks:
      'Freshers and visitors genuinely need it, so the demo writes itself. Vision, forecasting and an LLM layer sit on top of a map you already have.',
  },
  {
    id: 'event',
    keywords: ['event', 'events', 'fest', 'event management', 'hackathon', 'club', 'ticket'],
    projectName: 'AI Event Planner & Engagement Engine',
    summary: 'An event platform that predicts turnout, recommends events to the right students and writes its own promos.',
    upgrades: [
      ['Turnout prediction', 'Estimate registrations before you book the hall.', 'Regression'],
      ['Event recommendations', 'Students see events that match their interests.', 'Recommender'],
      ['Promo generator', 'Posters, captions and WhatsApp copy in seconds.', 'Generative AI'],
      ['Feedback analysis', 'Sentiment and themes from every feedback form.', 'NLP'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM', 'Image generation API', 'MongoDB'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.2,
    whyItWorks:
      'Every college runs events, so you have real users and real data from day one. The generative piece makes for a fun live demo, and turnout prediction gives you numbers to report.',
  },
  {
    id: 'resume',
    keywords: ['resume', 'cv', 'resume analyzer', 'resume builder', 'ats', 'resume analyser'],
    projectName: 'AI Resume Intelligence',
    summary: 'A resume analyser that scores like an ATS, finds skill gaps and rewrites weak bullet points.',
    upgrades: [
      ['ATS scoring', 'Score a resume the way hiring software does.', 'NLP'],
      ['Skill gap analysis', 'Compare a resume against a target role.', 'Embeddings'],
      ['Bullet rewriter', 'Turn vague lines into measurable achievements.', 'LLM'],
      ['Role matching', 'Suggest the roles a resume is actually strongest for.', 'Recommender'],
    ],
    techStack: ['React', 'FastAPI', 'Python', 'spaCy', 'LLM', 'PostgreSQL'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.7,
    whyItWorks:
      'Your whole batch will use it during placement season — instant real users. It’s a compact, finishable build that still covers NLP, embeddings and generation.',
  },
  {
    id: 'interview',
    keywords: ['interview', 'interview preparation', 'mock interview', 'interview prep', 'aptitude'],
    projectName: 'AI Mock Interview Studio',
    summary: 'A voice-based mock interviewer that asks follow-ups, scores answers and coaches delivery.',
    upgrades: [
      ['Voice interviewer', 'Spoken questions, spoken answers, real follow-ups.', 'Speech + LLM'],
      ['Answer scoring', 'Rubric-based feedback on every answer.', 'LLM evaluation'],
      ['Delivery analysis', 'Pace, filler words and confidence signals.', 'Speech analysis'],
      ['Question generator', 'Questions tailored to the company and role.', 'LLM'],
    ],
    techStack: ['React', 'Web Speech API', 'Node.js', 'Whisper', 'LLM', 'MongoDB'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 9.0,
    whyItWorks:
      'Voice plus LLM evaluation is a current, impressive stack, and the problem is one every examiner remembers. It demos beautifully live.',
  },
  {
    id: 'waste',
    keywords: ['waste', 'garbage', 'recycling', 'trash', 'waste management', 'dustbin', 'segregation'],
    projectName: 'AI Waste Segregation System',
    summary: 'A waste system that sorts waste by camera, predicts when bins fill and plans collection routes.',
    upgrades: [
      ['Waste classification', 'Identify plastic, paper, metal and organic waste on camera.', 'Computer vision'],
      ['Fill-level prediction', 'Predict when each bin needs emptying.', 'Time series'],
      ['Route optimisation', 'Shortest collection routes for full bins only.', 'Optimisation'],
      ['Citizen assistant', '“Which bin does a tetra pack go in?”', 'LLM'],
    ],
    techStack: ['Python', 'TensorFlow Lite', 'Raspberry Pi', 'FastAPI', 'LLM', 'Firebase'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.9,
    whyItWorks:
      'Sustainability plus edge AI is a standout combination. Public datasets make the classifier achievable, and a Raspberry Pi prototype gives you a physical demo.',
  },
  {
    id: 'traffic',
    keywords: ['traffic', 'signal', 'traffic management', 'congestion', 'road', 'vehicle detection'],
    projectName: 'AI Traffic Flow Intelligence',
    summary: 'A traffic system that counts vehicles, predicts congestion and adapts signal timing.',
    upgrades: [
      ['Vehicle detection', 'Count and classify vehicles from camera feeds.', 'Computer vision'],
      ['Congestion prediction', 'Forecast jams 15–30 minutes ahead.', 'Time series'],
      ['Adaptive signals', 'Signal timing that responds to real flow.', 'Reinforcement learning'],
      ['Incident detection', 'Spot accidents and stalled vehicles automatically.', 'Anomaly detection'],
    ],
    techStack: ['Python', 'YOLOv8', 'OpenCV', 'PyTorch', 'FastAPI', 'PostgreSQL'],
    difficulty: 'Advanced',
    estimatedTime: '3–4 weeks',
    score: 9.2,
    whyItWorks:
      'Smart-city projects score highly because they combine vision, prediction and control. Reinforcement learning for signals is ambitious but well documented — a strong project for a confident team.',
  },
  {
    id: 'tourism',
    keywords: ['tourism', 'travel', 'trip', 'tour', 'itinerary', 'hotel', 'booking'],
    projectName: 'AI Travel Companion',
    summary: 'A travel platform that plans the whole trip, recognises landmarks and warns you before the crowds.',
    upgrades: [
      ['Itinerary generator', 'A day-by-day plan from budget, dates and interests.', 'LLM'],
      ['Personal recommendations', 'Places matched to how you actually travel.', 'Recommender'],
      ['Landmark recognition', 'Photo of a monument → its story.', 'Computer vision'],
      ['Crowd & price forecasting', 'Best day to visit, best time to book.', 'Forecasting'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM', 'Maps API', 'MongoDB'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.4,
    whyItWorks:
      'Trip planning is one of the most natural uses of LLMs, so the core feature works quickly. Vision and forecasting add depth without much extra infrastructure.',
  },
  {
    id: 'community',
    keywords: ['student community', 'community', 'forum', 'social', 'discussion', 'social network', 'alumni'],
    projectName: 'AI Student Community Hub',
    summary: 'A student community that answers repeat questions itself, connects the right peers and stays respectful.',
    upgrades: [
      ['Smart Q&A', 'Answers from past discussions before anyone has to reply.', 'RAG'],
      ['Peer matching', 'Find teammates and mentors by skills and goals.', 'Embeddings'],
      ['Toxicity moderation', 'Catch abuse and spam before it spreads.', 'NLP'],
      ['Weekly digests', 'What your branch talked about, summarised.', 'LLM'],
    ],
    techStack: ['React', 'Node.js', 'Vector DB', 'LLM', 'Socket.io', 'MongoDB'],
    difficulty: 'Intermediate',
    estimatedTime: '2 weeks',
    score: 8.5,
    whyItWorks:
      'RAG over your own community’s posts is one of the most hireable AI skills right now. Moderation and matching round it out into a complete, defensible system.',
  },
  {
    id: 'enquiry',
    keywords: ['chatbot', 'college website', 'enquiry', 'admission', 'helpdesk', 'faq', 'college portal', 'college management'],
    projectName: 'AI College Enquiry Assistant',
    summary: 'A college assistant that answers admissions and student questions from official documents, in any language.',
    upgrades: [
      ['Document Q&A', 'Answers grounded in prospectus, circulars and rules.', 'RAG'],
      ['Multilingual replies', 'Ask in Telugu, Hindi or English.', 'LLM'],
      ['Lead scoring', 'Spot serious applicants for the admissions team.', 'Classification'],
      ['FAQ insights', 'Cluster questions to fix what confuses students most.', 'Clustering'],
    ],
    techStack: ['React', 'Python', 'FastAPI', 'Vector DB', 'LLM', 'PostgreSQL'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.4,
    whyItWorks:
      'Grounded answers over real documents is the most common AI feature companies ship. It’s quick to build, easy to evaluate and your own college is the dataset.',
  },
  {
    id: 'smart-home',
    keywords: ['smart home', 'home automation', 'iot', 'energy', 'electricity', 'smart meter', 'sensor'],
    projectName: 'AI Smart Home Energy Brain',
    summary: 'A home automation system that forecasts energy use, detects faulty appliances and takes voice commands.',
    upgrades: [
      ['Energy forecasting', 'Predict tomorrow’s usage and bill.', 'Forecasting'],
      ['Fault detection', 'Spot appliances drawing abnormal power.', 'Anomaly detection'],
      ['Voice assistant', 'Natural commands, not fixed keywords.', 'Speech + LLM'],
      ['Auto-scheduling', 'Run heavy appliances when power is cheapest.', 'Optimisation'],
    ],
    techStack: ['ESP32', 'MQTT', 'Python', 'FastAPI', 'LLM', 'InfluxDB'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.7,
    whyItWorks:
      'IoT projects collect time-series data by design, which is ideal for forecasting and anomaly detection. A physical prototype plus an AI layer is hard to beat at a project expo.',
  },
  {
    id: 'transport',
    keywords: ['bus', 'college bus', 'transport', 'vehicle tracking', 'gps', 'shuttle', 'metro'],
    projectName: 'AI Campus Transit Predictor',
    summary: 'A transport tracker that predicts real arrival times, estimates crowding and answers commuters.',
    upgrades: [
      ['ETA prediction', 'Arrival times that learn from daily traffic.', 'Regression'],
      ['Occupancy estimation', 'How full is the bus? Estimated from the cabin camera.', 'Computer vision'],
      ['Route optimisation', 'Better stops and timings from ridership data.', 'Optimisation'],
      ['Commuter assistant', '“When’s the next bus to Miyapur?”', 'LLM'],
    ],
    techStack: ['Flutter', 'Node.js', 'Python', 'GPS', 'LLM', 'Firebase'],
    difficulty: 'Intermediate',
    estimatedTime: '2 weeks',
    score: 8.6,
    whyItWorks:
      'Students wait for college buses every day — a real, measurable problem. ETA prediction gives you clear accuracy numbers to present.',
  },
  {
    id: 'inventory',
    keywords: ['inventory', 'stock', 'warehouse', 'billing', 'pharmacy', 'supermarket', 'pos', 'point of sale'],
    projectName: 'AI Inventory Forecaster',
    summary: 'An inventory system that forecasts demand, suggests reorders and reads supplier invoices.',
    upgrades: [
      ['Demand forecasting', 'Predict what will sell next week.', 'Forecasting'],
      ['Reorder suggestions', 'Optimal reorder points to avoid stock-outs.', 'Optimisation'],
      ['Invoice OCR', 'Supplier bills entered automatically.', 'OCR'],
      ['Inventory assistant', '“What’s running low before Diwali?”', 'LLM'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'Prophet', 'LLM', 'PostgreSQL'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.2,
    whyItWorks:
      'Small businesses near every campus need this, so you can test with real sales data. Forecasting is the classic ML skill, and the assistant makes it usable.',
  },
  {
    id: 'blood-bank',
    keywords: ['blood bank', 'blood', 'donor', 'donation', 'organ'],
    projectName: 'AI Blood Bank Network',
    summary: 'A donor network that forecasts shortages, matches donors fast and handles eligibility questions.',
    upgrades: [
      ['Shortage forecasting', 'Predict which blood groups run low and when.', 'Forecasting'],
      ['Donor matching', 'Rank nearby eligible donors in seconds.', 'Ranking'],
      ['Eligibility assistant', '“Can I donate after a tattoo?” — answered.', 'LLM'],
      ['Smart outreach', 'Contact donors at the time they usually respond.', 'Classification'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM', 'WhatsApp API', 'MongoDB'],
    difficulty: 'Beginner',
    estimatedTime: '1–2 weeks',
    score: 8.3,
    whyItWorks: 'High social impact with a simple core. Forecasting and matching are well-scoped, and the assistant removes friction for first-time donors.',
  },
  {
    id: 'exam',
    keywords: ['quiz', 'exam', 'online exam', 'test', 'assessment', 'examination', 'question paper'],
    projectName: 'AI Exam Practice & Integrity Engine',
    summary: 'An exam platform that writes questions, adapts difficulty, proctors fairly and shows students their weak topics.',
    upgrades: [
      ['Question generation', 'Fresh questions from any syllabus unit.', 'LLM'],
      ['Adaptive difficulty', 'Harder or easier based on each answer.', 'Adaptive testing'],
      ['AI proctoring', 'Detect multiple faces or looking away.', 'Computer vision'],
      ['Weak-topic analysis', 'Pinpoint what to revise before the real exam.', 'Clustering'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'OpenCV', 'LLM', 'PostgreSQL'],
    difficulty: 'Intermediate',
    estimatedTime: '2–3 weeks',
    score: 8.8,
    whyItWorks: 'Generation, adaptation and vision in one product most students have used. Easy to test with your own class before internals.',
  },
];

const STRIP = new Set(['system', 'app', 'application', 'website', 'web', 'portal', 'project', 'management', 'using', 'based', 'for', 'a', 'an', 'the', 'smart', 'online', 'platform', 'my', 'of', 'and', 'with', 'in', 'simple', 'basic']);

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Used when nothing in the library fits — honest, generic, still useful. */
export function genericPattern(input: string): Pattern {
  const words = input.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w && !STRIP.has(w));
  const core = titleCase(words.slice(0, 3).join(' ')) || 'Project';
  return {
    id: 'generic',
    keywords: [],
    projectName: `AI-Powered ${core} Assistant`,
    summary: `Your ${input.trim().toLowerCase()} — with personalisation, prediction and an assistant users can talk to.`,
    upgrades: [
      ['Smart recommendations', 'Personalise what each user sees from their behaviour.', 'Recommender'],
      ['AI assistant', 'Let users ask questions in plain language.', 'LLM'],
      ['Predictive insights', 'Forecast the numbers your users care about.', 'Forecasting'],
      ['Auto-generated reports', 'Summaries written for admins every week.', 'LLM'],
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM', 'Embeddings', 'PostgreSQL'],
    difficulty: 'Intermediate',
    estimatedTime: '2 weeks',
    score: 7.8,
    whyItWorks: `Almost every app has users, data and questions — the three ingredients for useful AI. Start with the assistant (fastest to build), then add one predictive feature you can measure. In the workshop we’ll narrow this down to the single upgrade that fits ${core.toLowerCase()} best.`,
  };
}
