# LocalFix AI - Project TODO

## Design & Visual Style
- [x] Establish elegant color palette (primary, secondary, accent, neutral)
- [x] Define typography system (font families, sizes, weights)
- [x] Create design tokens in Tailwind CSS
- [x] Design landing/home page layout
- [x] Design problem submission form UI
- [x] Design report display card layout
- [x] Design impact score visualization
- [x] Design admin dashboard layout

## Database Schema
- [x] Create problems table (id, userId, title, description, status, createdAt, updatedAt)
- [x] Create reports table (id, problemId, classification, priority, department, subject, description, impactScore, riskLevel, affectedArea, suggestedUrgency)
- [x] Create problem classifications enum (pothole, streetlight, trash, graffiti, sidewalk, other)
- [x] Create priority enum (low, medium, high, critical)
- [x] Create status enum (submitted, in_progress, resolved, rejected)
- [x] Add indexes for efficient querying
- [x] Run database migrations

## Backend - AI Report Generation
- [x] Set up OpenAI/LLM integration for problem classification
- [x] Create procedure to classify problem type and priority
- [x] Create procedure to generate structured report (subject, description, department)
- [x] Create procedure to calculate impact score (risk level, affected area, urgency)
- [x] Create tRPC procedure for problem submission with AI processing
- [x] Add error handling and validation for AI responses
- [ ] Write vitest tests for AI classification logic

## Backend - Data Management
- [x] Create tRPC procedure to fetch user's own reports
- [x] Create tRPC procedure to fetch all reports (paginated)
- [x] Create tRPC procedure to fetch single report details
- [x] Create tRPC procedure to update report status (admin only)
- [x] Create tRPC procedure to delete report (admin only)
- [x] Create admin-only procedures for dashboard queries
- [ ] Write vitest tests for data procedures

## Frontend - Authentication & Layout
- [x] Set up authentication context and hooks
- [x] Create main navigation layout
- [x] Implement user profile menu
- [x] Create login/logout flow
- [x] Add role-based access control (user vs admin)
- [x] Create responsive mobile-friendly layout

## Frontend - Problem Submission
- [x] Build problem description input form
- [x] Add form validation and error states
- [x] Create loading state during AI processing
- [x] Display generated report preview (subject, description, department)
- [x] Display impact score visualization
- [x] Add submit confirmation and success feedback
- [x] Create error handling for failed submissions

## Frontend - Problem History
- [x] Create problem history feed/list page
- [ ] Add filtering by status (submitted, in_progress, resolved)
- [ ] Add sorting options (newest, oldest, priority)
- [ ] Implement pagination for large lists
- [x] Create problem detail view modal/page
- [x] Add ability to view full report details
- [x] Display report metadata (date, status, impact score)

## Frontend - Admin Dashboard
- [x] Create admin-only dashboard page
- [x] Build reports management table
- [x] Add status update controls (in_progress, resolved, rejected)
- [ ] Add filtering and search functionality
- [x] Create analytics/statistics view (total reports, by type, by status)
- [ ] Add bulk action capabilities
- [x] Implement admin-only report deletion

## Testing & Quality
- [ ] Write vitest tests for classification logic
- [ ] Write vitest tests for report generation
- [ ] Write vitest tests for data procedures
- [ ] Test form validation and error states
- [ ] Test authentication flow
- [ ] Test admin-only access restrictions
- [ ] Manual testing of end-to-end workflows

## Polish & Deployment
- [ ] Review visual consistency across all pages
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Add loading skeletons and transitions
- [ ] Implement toast notifications for user feedback
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Create checkpoint for deployment
- [ ] Deploy to production


## Image Upload Feature
- [x] Add image_url column to problems table
- [x] Update database schema and run migrations
- [x] Create image upload handler in backend
- [x] Implement S3 storage integration for images
- [x] Add image preview in problem submission form
- [x] Display images in problem history and admin dashboard
- [x] Add image validation (file size, format)
- [x] Create image gallery component for viewing problem photos


## Map View Feature
- [x] Add latitude and longitude columns to problems table
- [x] Update database schema and run migrations
- [x] Create map page component with Google Maps integration
- [x] Implement problem markers with status-based colors
- [ ] Add marker clustering for performance
- [x] Create info windows showing problem details on marker click
- [x] Add map filters by status and problem type
- [ ] Implement geolocation for user's current location
- [ ] Add problem submission from map location


## Bug Fixes
- [x] Fix image upload bug during problem reporting
- [x] Verify image base64 encoding works correctly
- [x] Test image upload with various file sizes and formats

## Backend Report Generation Enhancement
- [x] Implement comprehensive AI analysis with image processing
- [x] Add detailed problem assessment based on description and image
- [x] Implement multi-factor impact scoring algorithm
- [x] Add environmental and safety considerations analysis
- [x] Create detailed urgency timeline recommendations
- [x] Implement cost estimation for repairs
- [x] Add affected stakeholder analysis
- [x] Create comprehensive report with all analysis aspects


## User Profile Section
- [x] Create user profile page component
- [x] Display user information (name, email, join date)
- [x] Show total problems reported by user
- [x] Create problems list with filtering by status
- [x] Add sorting options (newest, oldest, priority)
- [x] Display problem statistics (submitted, in progress, resolved, rejected)
- [x] Show detailed problem view with full report
- [x] Add ability to edit problem status (if applicable)
- [x] Create profile navigation link in main navigation
- [x] Add profile settings/preferences section


## Enhanced Image Upload Backend
- [x] Implement S3 upload with proper error handling
- [x] Add image validation (size, format, dimensions)
- [x] Create image processing pipeline
- [x] Add image URL generation with CDN support
- [x] Implement image deletion on problem removal
- [x] Add image metadata storage

## Interactive Map for Adding Problems
- [x] Create interactive map component with click-to-add functionality
- [x] Implement geolocation to show user's current location
- [x] Add nearby incidents display within radius
- [x] Create location-based problem submission form
- [x] Add map search functionality by address
- [ ] Implement problem clustering for performance
- [x] Add real-time incident updates on map


## Bug Fixes
- [x] Fix problem submission error - "Failed to submit problem"
- [x] Fix duplicate entry error in reports table
- [x] Verify database schema for reports table
- [x] Test problem submission with and without location data


## Analytics Dashboard
- [x] Create analytics data models and backend procedures
- [x] Build analytics dashboard UI with visualizations
- [x] Implement problem type distribution charts
- [x] Add priority level analytics
- [ ] Create geographic heat maps for problem areas
- [x] Implement time-series trends (submissions over time)
- [x] Add department-wise problem distribution
- [x] Create impact score analytics
- [x] Implement pattern detection algorithms
- [x] Add insights and recommendations generation
- [ ] Create export functionality for analytics data


## Live Community Map
- [x] Backend: fetch all problems with location + full report data for map
- [x] Frontend: live map page with status-colored markers for all users' problems
- [x] Marker click: pop-up showing full report, submitter, date submitted
- [x] Geolocation: auto-center map on user's current location
- [x] Filter controls: filter markers by status and problem type
- [x] Legend: color key for marker statuses
- [x] Add/update map link in main navigation


## Live Map Backend Enhancement
- [x] Add filtering by status, priority, and classification
- [x] Add sorting options (newest, oldest, highest impact)
- [x] Implement pagination for large datasets
- [ ] Add geospatial queries (radius search)
- [ ] Implement marker clustering algorithm
- [x] Add caching for frequently accessed data
- [x] Optimize database queries with indexes
- [ ] Add rate limiting for API endpoints
- [ ] Implement real-time updates with WebSocket
- [ ] Add performance monitoring and logging


## Navigation Bug Fixes
- [x] Investigate navbar missing on report pages
- [x] Create persistent navbar component
- [x] Add navbar to all pages (SubmitProblem, ProblemHistory, UserProfile, AdminDashboard, Analytics, CommunityMap, etc.)
- [x] Test navigation between all pages
- [x] Verify home page is accessible from all pages
- [x] Verify live map is accessible from all pages


## Bug Fixes - Duplicate Navbar & Geolocation
- [x] Find pages with duplicate navbar (Home, SubmitProblem, etc.)
- [x] Remove duplicate navbar components from pages
- [x] Ensure only one persistent navbar appears on all pages
- [x] Implement geolocation permission request on app initialization
- [x] Add location capture in SubmitProblem when filing a report
- [x] Display live location marker on map for newly filed reports
- [x] Test geolocation on different browsers and devices


## Bug Fixes - Google Maps Duplicate Load Error
- [x] Identify root cause: Map.tsx created new script on every mount
- [x] Create global script loader (mapsScriptLoader.ts) with state management
- [x] Update Map.tsx to use global loader instead of local loadMapScript()
- [x] Add error handling with try-catch in Map component
- [x] Write and pass vitest tests verifying the fix
- [x] Verify /profile page no longer throws duplicate API error


## Real-time WebSocket Updates for Live Map
- [x] Set up WebSocket server with ws library
- [x] Create WebSocket event handlers for problem submissions
- [x] Implement problem broadcast to all connected clients
- [x] Add real-time client-side map marker updates
- [x] Create connection status indicator in UI
- [x] Add reconnection logic with exponential backoff
- [x] Implement error handling and fallback to polling
- [x] Write vitest tests for WebSocket functionality
- [ ] Test real-time updates on multiple browser tabs


## Bug Fixes - WebSocket Connection Errors
- [x] Fix WebSocket connection failure on community map
- [x] Improve error handling and logging in useWebSocket hook
- [x] Fix WebSocket Server constructor import issue
- [x] Test WebSocket connection with proper error recovery


## 🧠 AI Analysis Features
- [ ] Detect problem category (pothole, trash, streetlight, graffiti)
- [ ] Estimate urgency level
- [ ] Predict danger level for pedestrians
- [ ] Suggest best city department to contact
- [ ] Generate professional complaint message
- [ ] Convert casual text to formal report language
- [ ] Suggest temporary safety advice
- [ ] Detect duplicate reports in same area
- [ ] Summarize long reports
- [ ] Translate report into multiple languages

## 📍 Location Intelligence Features
- [ ] Identify nearest city district
- [ ] Suggest closest government office
- [ ] Detect school zones near issue
- [ ] Predict if problem is near hospital/emergency route
- [ ] Estimate population affected
- [ ] Determine if issue is on public vs private property
- [ ] Suggest map coordinates
- [ ] Suggest landmarks for easier reporting
- [ ] Predict traffic impact
- [ ] Detect if location is high accident area

## 🛠 Smart Reporting Tools
- [ ] Generate email report format
- [ ] Generate tweet/social report for awareness
- [ ] Generate phone script for calling city services
- [ ] Auto-fill report forms
- [ ] Suggest attachments needed
- [ ] Generate short report version
- [ ] Generate detailed engineering description
- [ ] Suggest estimated repair type
- [ ] Suggest repair priority ranking
- [ ] Suggest maintenance category

## 🚨 Safety Features
- [ ] Predict injury risk level
- [ ] Suggest temporary warning signs
- [ ] Detect danger for cyclists
- [ ] Detect danger for disabled pedestrians
- [ ] Suggest temporary route changes
- [ ] Warn about night visibility risks
- [ ] Identify fire hazard risks
- [ ] Identify flood risk
- [ ] Predict vehicle damage risk
- [ ] Identify public safety urgency

## 🌍 Smart City Insights
- [ ] Identify trend of similar problems nearby
- [ ] Predict which areas need maintenance most
- [ ] Suggest city improvement ideas
- [ ] Rank neighborhoods by infrastructure issues
- [ ] Detect repeated unresolved problems
- [ ] Predict maintenance backlog
- [ ] Suggest community volunteer solutions
- [ ] Highlight frequent complaint types
- [ ] Suggest urban planning improvements
- [ ] Detect neglected areas needing attention

## 📊 User Experience Features
- [ ] Simplify complex reports
- [ ] Generate friendly summary for users
- [ ] Suggest next steps after reporting
- [ ] Explain why issue matters
- [ ] Show expected repair timeline estimate
- [ ] Predict city response probability
- [ ] Show similar reports solved recently
- [ ] Recommend additional details to include
- [ ] Generate impact explanation
- [ ] Suggest photo angles to document issue

## 🤖 AI Assistant Features
- [ ] Chatbot to guide reporting
- [ ] Ask follow-up questions about issue
- [ ] Clarify vague reports
- [ ] Detect incomplete reports
- [ ] Suggest better wording
- [ ] Offer step-by-step reporting help
- [ ] Suggest category corrections
- [ ] Explain which department handles issue
- [ ] Provide legal or city rule references
- [ ] Recommend community resources

## 📷 Image Analysis Features
- [ ] Detect pothole from photo
- [ ] Detect broken streetlight from photo
- [ ] Detect trash pile from photo
- [ ] Estimate pothole size
- [ ] Identify graffiti
- [ ] Identify sidewalk cracks
- [ ] Detect dangerous road damage
- [ ] Identify blocked drains
- [ ] Detect fallen trees
- [ ] Identify construction hazards

## 🌟 Unique Hackathon Features
- [ ] Predict cost of repair
- [ ] Estimate repair time needed
- [ ] Predict which department will respond fastest
- [ ] Generate before/after improvement suggestions
- [ ] Suggest community voting on issues
- [ ] Detect environmental impact
- [ ] Identify accessibility issues for disabled users
- [ ] Suggest temporary community fixes
- [ ] Predict future infrastructure failures
- [ ] Generate city improvement report summary

## 🧩 Extra Demo Features
- [ ] AI generates public awareness message
- [ ] AI generates local news headline about issue
- [ ] AI creates short social media campaign
- [ ] AI explains issue to city officials clearly
- [ ] AI generates repair priority score
- [ ] AI explains why city should fix it quickly
- [ ] AI suggests community petition text
- [ ] AI estimates number of complaints needed for action
- [ ] AI identifies similar problems in other cities
- [ ] AI suggests long-term infrastructure solutions


## Bug Fixes - Image Loading on Map
- [x] Investigate image loading failures on community map
- [x] Identify root cause of inconsistent image display (presigned URL expiration)
- [x] Implement ImageLoader component with retry logic and error handling
- [x] Integrate ImageLoader into CommunityMap and fix data structure issues
- [x] Write and pass vitest tests for image loading functionality
