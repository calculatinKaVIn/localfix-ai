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
