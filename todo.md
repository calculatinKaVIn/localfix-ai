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


## Bug Fixes - Vite WebSocket HMR Connection
- [x] Fix Vite HMR WebSocket connection to production URL
- [x] Configure HMR settings for proper browser-to-server communication
- [x] Test WebSocket connection stability


## Bug Fixes - WebSocket Connection Failures
- [x] Diagnose WebSocket connection failure on community map
- [x] Fix WebSocket URL configuration for production environment
- [x] Improve error handling and reconnection logic
- [x] Increase heartbeat timeout from 30s to 45s
- [x] Prevent duplicate error handling in error and close events
- [x] Reset reconnection attempts after max reached
- [x] Test WebSocket stability with 12 passing tests


## Bug Fixes - WebSocket Error on Profile Page
- [x] Investigate WebSocket error on profile page
- [x] Identified CommunityMap WebSocket initialization during component unmount
- [x] Added isMounted flag to prevent callbacks on unmounted components
- [x] Improved error suppression for unmounted component errors
- [x] Verified error is resolved


## Bug Investigation - Image Loading on Live Map
- [x] Deep analysis of image rendering pipeline
- [x] Check S3 storage and URL generation (CloudFront CDN)
- [x] Analyze browser network logs
- [x] Identify root cause (CORS, cache-busting, presigned URLs)
- [x] Implement comprehensive fix with cache-busting timestamps
- [x] Add CORS support with crossOrigin attribute
- [x] Add lazy loading and async decoding
- [x] Write and pass 13 image loading tests


## Image Analytics Feature
- [x] Design analytics schema and data model with 23 columns
- [x] Create imageAnalytics table in database
- [x] Implement backend analytics service with 6 major functions
- [x] Add database migration (0006_conscious_morlun.sql)
- [x] Write and pass 15 image analytics tests
- [ ] Add client-side image event tracking
- [ ] Create analytics dashboard UI
- [ ] Add analytics API endpoints


## Multi-Language Reporting Feature
- [x] Design multi-language schema for storing translations (problemTranslations table)
- [x] Implement AI translation service with language detection (12 languages supported)
- [x] Add language field to problems table (originalLanguage, detectedLanguage)
- [x] Create language selection UI components (LanguageSelector, LanguageDetectionBanner)
- [x] Add translation API endpoints (6 tRPC procedures)
- [x] Integrate translation router into main app router
- [x] Write and pass 15 multi-language tests


## Photo Reporting Feature (Big Improvement)
- [x] Create AI image analysis service for issue detection (12 issue types)
- [x] Implement image upload with validation (10MB max, 4 formats)
- [x] Build photo preview component with upload UI
- [x] Create AI-generated description from image analysis
- [x] Auto-generate report from image analysis
- [x] Build photo reporting UI with analysis display (PhotoReportingUI)
- [x] Create tRPC procedures for photo reporting (3 procedures)
- [x] Integrate photo reporting router into main app
- [x] Write and pass 16 photo reporting tests


## Image Gallery on Live Map
- [x] Create image modal component for full-size view
- [x] Add thumbnail display to map markers
- [x] Integrate image modal into CommunityMap
- [x] Add image gallery navigation (prev/next)
- [x] Add image metadata display (date, uploader)
- [x] Write and pass image gallery tests


## Bug Fix - AI Hallucination in Category Classification
- [x] Analyze current AI analysis logic for hallucination sources
- [x] Implement strict category validation with confidence scoring
- [x] Add predefined category list enforcement (vegetation, water damage, sidewalks, graffiti, trash, streetlights, pothole, other)
- [x] Update report generation to prevent fabrication of unrelated details
- [x] Add validation tests for category classification accuracy
- [x] Verify "other" category handles non-standard issues correctly
- [x] Test with various edge case reports (31 tests passing)


## Typography - Lora Serif Font
- [x] Research and select unique yet balanced serif font
- [x] Add Lora font import to Google Fonts
- [x] Update CSS to use Lora for body and headings
- [x] Verify font renders correctly across all pages


## Theme Toggle & Animations
- [x] Create theme toggle component with light/dark mode
- [x] Implement theme context and localStorage persistence
- [x] Add theme toggle to navigation menu
- [x] Create smooth button hover/active animations
- [x] Add card and container transition effects
- [x] Enhance form input focus states with animations
- [x] Add icon animations for interactive elements
- [x] Test theme switching across all pages
- [x] Verify animations are smooth and professional


## Bug Fixes - Navbar Theme Toggle
- [x] Fix theme toggle not updating navbar background in dark mode
- [x] Ensure dark class is applied to document root
- [x] Add navbar background color transition for theme changes
- [x] Add professional animations to navbar elements (links, buttons, icons)
- [x] Add hover effects to navigation links
- [x] Add smooth transitions to mobile menu
- [x] Test theme toggle updates navbar appearance


## Dropdown Menu Animations
- [ ] Create reusable dropdown menu component with animation support
- [ ] Add user profile dropdown menu to navbar
- [ ] Add fade-in and slide-down CSS animations
- [ ] Implement click-outside detection to close dropdowns
- [ ] Add keyboard navigation (Escape to close)
- [ ] Add smooth transitions between menu states
- [ ] Test dropdown animations on desktop and mobile
- [ ] Verify dropdown positioning and overflow handling


## Bug Fix - Dark Mode Compatibility
- [x] Fix Live Map background colors in dark mode
- [x] Fix Live Map text visibility in dark mode
- [x] Fix Analytics Community Insights background in dark mode
- [x] Fix Analytics charts text colors in dark mode
- [x] Ensure all overlays and modals work in dark mode
- [x] Test dark mode on all pages


## Live Map - Resolve Report Feature
- [x] Create resolve report confirmation dialog
- [x] Add resolve button to report information panel
- [x] Implement delete report API call
- [x] Add marker removal animation
- [x] Add panel close animation on resolve
- [x] Add success toast notification
- [x] Test resolve functionality on Live Map
- [x] Verify marker deletion from map


## Resolution Reason Tracking System
- [x] Add resolutionReason field to problems table in schema
- [x] Create migration for resolution reason column
- [x] Add reason selection UI to resolve confirmation dialog
- [x] Update deleteProblem mutation to accept resolution reason
- [x] Store resolution reason in database when resolving
- [x] Display resolution reason on problem details/history
- [ ] Add resolution reason analytics to Analytics page
- [ ] Create pie chart for resolution reason distribution
- [ ] Add filtering by resolution reason on Live Map
- [ ] Write tests for resolution reason tracking


## Critical Bug Fixes - Map & Admin Issues
- [x] Investigate dev server logs for errors
- [x] Check browser console for JavaScript errors
- [x] Debug map component rendering
- [x] Verify API endpoints are working
- [x] Check database queries for problems data
- [x] Fix admin page loading
- [x] Fix marker display on map
- [x] Test all fixes and verify functionality


## State System Refactoring - Two-State User Interface
- [x] Create state mapping utility for user-facing display
- [x] Update CommunityMap to show only in-progress reports
- [x] Update resolve logic to mark as resolved instead of deleting
- [x] Update ProblemHistory to show only in-progress and resolved
- [x] Update UserProfile to show only in-progress and resolved
- [ ] Update AdminDashboard to show all internal states
- [ ] Update Analytics to display two-state metrics
- [ ] Test state display across all pages
- [ ] Verify resolved reports persist in database


## Online Status Fixes
- [x] Investigate online/offline status system
- [x] Fix map online status display
- [x] Fix user online status display
- [x] Ensure WebSocket connections show online
- [x] Test online status across all pages


## Real-Time Notification Badges
- [x] Create notification context for badge state management
- [x] Create badge component for navigation items
- [x] Integrate badges into navbar
- [x] Connect WebSocket to update badge counts
- [x] Add badge animations
- [x] Test badges across all pages
- [x] Verify real-time updates work correctly


## Community Map UI Cleanup
- [x] Remove status filters (Submitted, In Progress, Resolved, Rejected) from community map
- [x] Remove offline/live indicator from community map
- [x] Ensure only in-progress problems display on community map


## Geofencing Feature - Problems by Radius
- [x] Create distance calculation utility (haversine formula)
- [x] Add radius slider/input to community map header
- [x] Implement radius-based filtering logic
- [x] Draw visual radius circle on map
- [ ] Show distance to each problem marker
- [x] Add radius presets (1km, 5km, 10km, custom)
- [x] Test geofencing with various locations


## Bug Fixes - WebSocket Connection Errors
- [x] Fix WebSocket error handling in useWebSocket hook
- [x] Fix max reconnection attempts error in useNotificationWebSocket
- [x] Improve error logging and recovery
- [x] Test WebSocket stability across multiple connections


## Manual Reconnect Button - Settings Menu
- [x] Create WebSocket context for global connection state
- [x] Add reconnect button to settings menu
- [x] Show connection status in settings
- [x] Add loading state during reconnection
- [x] Display success/error messages
- [x] Test reconnect functionality
