# Campus Maintenance System - Overview Documentation

Generated: 2026-05-02 14:28:11.811020

## backend/src/main/java/com/smartcampus/maintenance/

### SmartCampusMaintenanceApplication.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/config/

### DataSeeder.java
- Core application file contributing to system functionality

### EmailConfigurationValidator.java
- Defines application configuration and setup logic

### ProductionDeploymentValidator.java
- Core application file contributing to system functionality

### RedisRateLimitConfiguration.java
- Defines application configuration and setup logic

### SecurityConfig.java
- Configures application security, authentication, and CORS policies

## backend/src/main/java/com/smartcampus/maintenance/controller/

### AdminConfigurationController.java
- Exposes API endpoints and handles HTTP requests

### AnalyticsController.java
- Exposes API endpoints and handles HTTP requests

### AnnouncementController.java
- Exposes API endpoints and handles HTTP requests

### AuthController.java
- Handles authentication, login, and authorization logic

### BuildingController.java
- Exposes API endpoints and handles HTTP requests

### CatalogController.java
- Exposes API endpoints and handles HTTP requests

### ChatController.java
- Exposes API endpoints and handles HTTP requests

### NotificationController.java
- Exposes API endpoints and handles HTTP requests

### PublicSupportController.java
- Exposes API endpoints and handles HTTP requests

### TicketController.java
- Exposes API endpoints and handles HTTP requests

### UserController.java
- Exposes API endpoints and handles HTTP requests

## backend/src/main/java/com/smartcampus/maintenance/dto/analytics/

### AnalyticsSummaryResponse.java
- Core application file contributing to system functionality

### CategoryResolutionTimeResponse.java
- Core application file contributing to system functionality

### CrewPerformanceResponse.java
- Core application file contributing to system functionality

### DailyResolvedPointResponse.java
- Core application file contributing to system functionality

### PublicLandingConfigResponse.java
- Defines application configuration and setup logic

### PublicLandingStatsResponse.java
- Core application file contributing to system functionality

### ResolutionTimeResponse.java
- Core application file contributing to system functionality

### SlaComplianceResponse.java
- Core application file contributing to system functionality

### TopBuildingResponse.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/announcement/

### AnnouncementCreateRequest.java
- Core application file contributing to system functionality

### AnnouncementResponse.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/auth/

### AcceptStaffInviteRequest.java
- Core application file contributing to system functionality

### AuthResponse.java
- Handles authentication, login, and authorization logic

### CurrentUserResponse.java
- Core application file contributing to system functionality

### ForgotPasswordRequest.java
- Core application file contributing to system functionality

### LoginRequest.java
- Core application file contributing to system functionality

### RegisterRequest.java
- Core application file contributing to system functionality

### ResendMfaRequest.java
- Core application file contributing to system functionality

### ResendVerificationRequest.java
- Core application file contributing to system functionality

### ResetPasswordRequest.java
- Core application file contributing to system functionality

### UsernameSuggestionsResponse.java
- Core application file contributing to system functionality

### VerifyEmailRequest.java
- Core application file contributing to system functionality

### VerifyMfaRequest.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/building/

### BuildingCreateRequest.java
- Core application file contributing to system functionality

### BuildingResponse.java
- Core application file contributing to system functionality

### BuildingUpdateRequest.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/catalog/

### CatalogStreamEvent.java
- Core application file contributing to system functionality

### RequestTypeCreateRequest.java
- Core application file contributing to system functionality

### RequestTypeResponse.java
- Core application file contributing to system functionality

### RequestTypeUpdateRequest.java
- Core application file contributing to system functionality

### ServiceDomainResponse.java
- Contains core business logic and application rules

### SupportCategoryCreateRequest.java
- Core application file contributing to system functionality

### SupportCategoryResponse.java
- Core application file contributing to system functionality

### SupportCategoryUpdateRequest.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/chat/

### ChatMessageResponse.java
- Core application file contributing to system functionality

### ChatSendRequest.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/notification/

### NotificationResponse.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/support/

### SupportContactRequest.java
- Core application file contributing to system functionality

### SupportContactResponse.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/ticket/

### CommentCreateRequest.java
- Core application file contributing to system functionality

### CommentResponse.java
- Core application file contributing to system functionality

### DuplicateCheckResponse.java
- Core application file contributing to system functionality

### TicketAssignmentRecommendationResponse.java
- Core application file contributing to system functionality

### TicketAssignmentResponseRequest.java
- Core application file contributing to system functionality

### TicketAssignRequest.java
- Core application file contributing to system functionality

### TicketBuildingResponse.java
- Core application file contributing to system functionality

### TicketCreateRequest.java
- Core application file contributing to system functionality

### TicketDetailResponse.java
- Core application file contributing to system functionality

### TicketLogResponse.java
- Core application file contributing to system functionality

### TicketRateRequest.java
- Core application file contributing to system functionality

### TicketRatingResponse.java
- Core application file contributing to system functionality

### TicketRequestTypeResponse.java
- Core application file contributing to system functionality

### TicketResponse.java
- Core application file contributing to system functionality

### TicketStatusUpdateRequest.java
- Core application file contributing to system functionality

### TicketUserInfoResponse.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/dto/user/

### BroadcastAudience.java
- Core application file contributing to system functionality

### BroadcastMessageRequest.java
- Core application file contributing to system functionality

### BroadcastMessageResponse.java
- Core application file contributing to system functionality

### CreateStaffRequest.java
- Core application file contributing to system functionality

### ScheduledBroadcastCreateRequest.java
- Core application file contributing to system functionality

### ScheduledBroadcastResponse.java
- Core application file contributing to system functionality

### StaffInviteRequest.java
- Core application file contributing to system functionality

### StaffInviteResponse.java
- Core application file contributing to system functionality

### UserProfileResponse.java
- Core application file contributing to system functionality

### UserProfileUpdateRequest.java
- Core application file contributing to system functionality

### UserSummaryResponse.java
- Core application file contributing to system functionality

### UserWithTicketCountResponse.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/entity/

### Announcement.java
- Core application file contributing to system functionality

### AuditEvent.java
- Core application file contributing to system functionality

### AuthMfaChallenge.java
- Handles authentication, login, and authorization logic

### AuthRefreshToken.java
- Handles authentication, login, and authorization logic

### Building.java
- Core application file contributing to system functionality

### ChatMessage.java
- Core application file contributing to system functionality

### EmailOutbox.java
- Core application file contributing to system functionality

### EmailVerificationToken.java
- Core application file contributing to system functionality

### Notification.java
- Core application file contributing to system functionality

### PasswordResetToken.java
- Core application file contributing to system functionality

### PendingRegistration.java
- Core application file contributing to system functionality

### RequestType.java
- Core application file contributing to system functionality

### ScheduledBroadcast.java
- Core application file contributing to system functionality

### ServiceDomain.java
- Contains core business logic and application rules

### StaffInvite.java
- Core application file contributing to system functionality

### SupportCategory.java
- Core application file contributing to system functionality

### SupportRequest.java
- Core application file contributing to system functionality

### Ticket.java
- Core application file contributing to system functionality

### TicketComment.java
- Core application file contributing to system functionality

### TicketLog.java
- Core application file contributing to system functionality

### TicketRating.java
- Core application file contributing to system functionality

### User.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/entity/enums/

### EmailOutboxStatus.java
- Core application file contributing to system functionality

### NotificationType.java
- Core application file contributing to system functionality

### Role.java
- Core application file contributing to system functionality

### ScheduledBroadcastStatus.java
- Core application file contributing to system functionality

### TicketCategory.java
- Core application file contributing to system functionality

### TicketStatus.java
- Core application file contributing to system functionality

### UrgencyLevel.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/event/

### PendingRegistrationVerificationRequestedEvent.java
- Core application file contributing to system functionality

### PendingRegistrationVerifiedEvent.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/exception/

### ApiException.java
- Core application file contributing to system functionality

### BadRequestException.java
- Core application file contributing to system functionality

### ConflictException.java
- Core application file contributing to system functionality

### ErrorResponse.java
- Core application file contributing to system functionality

### ForbiddenException.java
- Core application file contributing to system functionality

### GlobalExceptionHandler.java
- Core application file contributing to system functionality

### NotFoundException.java
- Core application file contributing to system functionality

### UnauthorizedException.java
- Handles authentication, login, and authorization logic

### UnprocessableEntityException.java
- Defines database entities and object-relational mapping

## backend/src/main/java/com/smartcampus/maintenance/mapper/

### TicketMapper.java
- Core application file contributing to system functionality

### UserMapper.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/optimization/

### AssignmentCandidateMetrics.java
- Core application file contributing to system functionality

### AssignmentScorer.java
- Core application file contributing to system functionality

### JavaImageOptimizer.java
- Core application file contributing to system functionality

## backend/src/main/java/com/smartcampus/maintenance/repository/

### AnnouncementRepository.java
- Handles database access and data persistence

### AuditEventRepository.java
- Handles database access and data persistence

### AuthMfaChallengeRepository.java
- Handles authentication, login, and authorization logic

### AuthRefreshTokenRepository.java
- Handles authentication, login, and authorization logic

### BuildingRepository.java
- Handles database access and data persistence

### ChatMessageRepository.java
- Handles database access and data persistence

### EmailOutboxRepository.java
- Handles database access and data persistence

### EmailVerificationTokenRepository.java
- Handles database access and data persistence

### NotificationRepository.java
- Handles database access and data persistence

### PasswordResetTokenRepository.java
- Handles database access and data persistence

### PendingRegistrationRepository.java
- Handles database access and data persistence

### RequestTypeRepository.java
- Handles database access and data persistence

### ScheduledBroadcastRepository.java
- Handles database access and data persistence

### ServiceDomainRepository.java
- Contains core business logic and application rules

### StaffInviteRepository.java
- Handles database access and data persistence

### SupportCategoryRepository.java
- Handles database access and data persistence

### SupportRequestRepository.java
- Handles database access and data persistence

### TicketCommentRepository.java
- Handles database access and data persistence

### TicketLogRepository.java
- Handles database access and data persistence

### TicketRatingRepository.java
- Handles database access and data persistence

### TicketRepository.java
- Handles database access and data persistence

### TicketSpecifications.java
- Core application file contributing to system functionality

### UserRepository.java
- Handles database access and data persistence

## backend/src/main/java/com/smartcampus/maintenance/security/

### AuthenticatedUser.java
- Handles authentication, login, and authorization logic

### CustomUserDetailsService.java
- Contains core business logic and application rules

### JwtAuthenticationFilter.java
- Handles authentication, login, and authorization logic

### JwtService.java
- Contains core business logic and application rules

## backend/src/main/java/com/smartcampus/maintenance/service/

### AnalyticsService.java
- Contains core business logic and application rules

### AnnouncementService.java
- Contains core business logic and application rules

### AuditEventService.java
- Contains core business logic and application rules

### AuthRefreshTokenService.java
- Handles authentication, login, and authorization logic

### AuthService.java
- Handles authentication, login, and authorization logic

### AuthTokenCleanupScheduler.java
- Handles authentication, login, and authorization logic

### AutoAssignmentService.java
- Contains core business logic and application rules

### BuildingService.java
- Contains core business logic and application rules

### CaptchaVerificationService.java
- Contains core business logic and application rules

### CatalogEventStreamService.java
- Contains core business logic and application rules

### CatalogService.java
- Contains core business logic and application rules

### ChatService.java
- Contains core business logic and application rules

### CurrentUserService.java
- Contains core business logic and application rules

### EmailDeliveryService.java
- Contains core business logic and application rules

### EmailOutboxScheduler.java
- Core application file contributing to system functionality

### EmailOutboxService.java
- Contains core business logic and application rules

### EmailService.java
- Contains core business logic and application rules

### EscalationScheduler.java
- Core application file contributing to system functionality

### NotificationDispatchService.java
- Contains core business logic and application rules

### NotificationService.java
- Contains core business logic and application rules

### PasswordPolicyService.java
- Contains core business logic and application rules

### PendingRegistrationEmailListener.java
- Core application file contributing to system functionality

### PublicEndpointSecurityService.java
- Configures application security, authentication, and CORS policies

### PublicLandingConfigService.java
- Contains core business logic and application rules

### RateLimitService.java
- Contains core business logic and application rules

### RefreshCookieService.java
- Contains core business logic and application rules

### ReportService.java
- Contains core business logic and application rules

### RequestMetadata.java
- Core application file contributing to system functionality

### RequestMetadataResolver.java
- Core application file contributing to system functionality

### ScheduledBroadcastDispatcher.java
- Core application file contributing to system functionality

### ScheduledBroadcastService.java
- Contains core business logic and application rules

### SlaService.java
- Contains core business logic and application rules

### StaffInviteCleanupScheduler.java
- Core application file contributing to system functionality

### SupportRequestService.java
- Contains core business logic and application rules

### TicketAttachmentAccessService.java
- Contains core business logic and application rules

### TicketService.java
- Contains core business logic and application rules

### TokenHashService.java
- Contains core business logic and application rules

### UsernameSuggestionService.java
- Contains core business logic and application rules

### UserService.java
- Contains core business logic and application rules

## backend/src/main/java/com/smartcampus/maintenance/util/

### FileStorageService.java
- Contains core business logic and application rules

### ServiceDomainCatalog.java
- Contains core business logic and application rules

## backend/src/main/resources/db/migration/

### V1__initial_schema.sql
- Defines database schema, tables, or seed data

### V2__service_catalog_normalization.sql
- Contains core business logic and application rules

### V3__security_session_hardening.sql
- Configures application security, authentication, and CORS policies

### V4__expand_email_outbox_body_columns.sql
- Defines database schema, tables, or seed data

### V5__pending_registrations.sql
- Defines database schema, tables, or seed data

### V6__auth_mfa_enablement.sql
- Handles authentication, login, and authorization logic

## backend/src/test/java/com/smartcampus/maintenance/

### ApiFlowIntegrationTest.java
- Core application file contributing to system functionality

### AuthControllerRegistrationIntegrationTest.java
- Handles authentication, login, and authorization logic

### AuthSecurityServiceIntegrationTest.java
- Configures application security, authentication, and CORS policies

### PendingRegistrationMigrationTest.java
- Core application file contributing to system functionality

### RegistrationEmailOutboxIntegrationTest.java
- Core application file contributing to system functionality

### SmartCampusMaintenanceApplicationTests.java
- Core application file contributing to system functionality

## backend/src/test/java/com/smartcampus/maintenance/config/

### ProductionDeploymentValidatorTest.java
- Core application file contributing to system functionality

## backend/src/test/java/com/smartcampus/maintenance/service/

### AutoAssignmentServiceTest.java
- Contains core business logic and application rules

### RequestMetadataResolverTest.java
- Core application file contributing to system functionality

## backend/src/test/java/com/smartcampus/maintenance/util/

### FileStorageServiceTest.java
- Contains core business logic and application rules

## database/

### seed_data.sql
- Defines database schema, tables, or seed data

## database/schemas/

### schema.sql
- Defines database schema, tables, or seed data

## frontend/

### eslint.config.js
- Defines application configuration and setup logic

### playwright.config.js
- Defines application configuration and setup logic

### postcss.config.js
- Defines application configuration and setup logic

### tailwind.config.js
- Defines application configuration and setup logic

### vite.config.js
- Defines application configuration and setup logic

## frontend/src/

### App.jsx
- Core application file contributing to system functionality

### main.jsx
- Core application file contributing to system functionality

## frontend/src/components/Admin/

### AdminConfigurationSection.jsx
- Defines application configuration and setup logic

### AdminStatCards.jsx
- Reusable UI component for the frontend

### AdminToolbar.jsx
- Reusable UI component for the frontend

### AnalyticsCharts.jsx
- Reusable UI component for the frontend

### BroadcastCenter.jsx
- Reusable UI component for the frontend

### BuildingsRanking.jsx
- Reusable UI component for the frontend

### CrewPerformance.jsx
- Reusable UI component for the frontend

### ReportBuilder.jsx
- Reusable UI component for the frontend

### SLAComplianceCard.jsx
- Reusable UI component for the frontend

### StaffOnboarding.jsx
- Reusable UI component for the frontend

### TicketOperationsTable.jsx
- Reusable UI component for the frontend

### UserManagementTable.jsx
- Reusable UI component for the frontend

## frontend/src/components/Auth/

### AuthBrandPanel.jsx
- Handles authentication, login, and authorization logic

### AuthPasswordField.jsx
- Handles authentication, login, and authorization logic

### AuthShell.jsx
- Handles authentication, login, and authorization logic

### OtpCodeField.jsx
- Reusable UI component for the frontend

### PasswordChecklist.jsx
- Reusable UI component for the frontend

### turnstileConfig.js
- Defines application configuration and setup logic

### TurnstileWidget.jsx
- Reusable UI component for the frontend

## frontend/src/components/Common/

### CampusFixLogo.jsx
- Reusable UI component for the frontend

### CatalogSyncBridge.jsx
- Reusable UI component for the frontend

### ConfirmDialog.jsx
- Reusable UI component for the frontend

### DataTable.jsx
- Reusable UI component for the frontend

### DateRangePicker.jsx
- Reusable UI component for the frontend

### EmptyState.jsx
- Reusable UI component for the frontend

### ExportDropdown.jsx
- Reusable UI component for the frontend

### LoadingSpinner.jsx
- Reusable UI component for the frontend

### Modal.jsx
- Reusable UI component for the frontend

### ProtectedRoute.jsx
- Reusable UI component for the frontend

### SkeletonLoader.jsx
- Reusable UI component for the frontend

### StatusBadge.jsx
- Reusable UI component for the frontend

### UrgencyBadge.jsx
- Reusable UI component for the frontend

### UserAvatar.jsx
- Reusable UI component for the frontend

## frontend/src/components/Dashboard/

### DashboardPrimitives.jsx
- Reusable UI component for the frontend

### DashboardShell.jsx
- Reusable UI component for the frontend

### MotionCardSurface.jsx
- Reusable UI component for the frontend

### NotificationDropdown.jsx
- Reusable UI component for the frontend

### ProfileSettingsModal.jsx
- Reusable UI component for the frontend

### scrollToDashboardSection.js
- Reusable UI component for the frontend

### Sidebar.jsx
- Reusable UI component for the frontend

### TopBar.jsx
- Reusable UI component for the frontend

## frontend/src/components/Landing/

### CampusFixLogo.jsx
- Reusable UI component for the frontend

### Footer.jsx
- Reusable UI component for the frontend

### Navbar.jsx
- Reusable UI component for the frontend

### useScrollReveal.js
- Reusable UI component for the frontend

## frontend/src/components/hooks/

### use-image-upload.tsx
- Reusable UI component for the frontend

## frontend/src/components/tickets/

### TicketTimeline.jsx
- Reusable UI component for the frontend

## frontend/src/components/ui/

### button.tsx
- Reusable UI component for the frontend

### dock-two.tsx
- Reusable UI component for the frontend

### expandable-tabs.tsx
- Reusable UI component for the frontend

### fullscreen-calendar.tsx
- Reusable UI component for the frontend

### hover-gradient-nav-bar.tsx
- Reusable UI component for the frontend

### input.tsx
- Reusable UI component for the frontend

### separator.tsx
- Reusable UI component for the frontend

### theme-toggle.tsx
- Reusable UI component for the frontend

## frontend/src/context/

### auth-context.js
- Handles authentication, login, and authorization logic

### AuthContext.jsx
- Handles authentication, login, and authorization logic

### theme-context.js
- Core application file contributing to system functionality

### ThemeContext.jsx
- Core application file contributing to system functionality

## frontend/src/hooks/

### use-media-query.js
- Core application file contributing to system functionality

### useAuth.js
- Handles authentication, login, and authorization logic

### useNotifications.js
- Core application file contributing to system functionality

### useReducedMotionPreference.js
- Core application file contributing to system functionality

### useTheme.js
- Core application file contributing to system functionality

### useTickets.js
- Core application file contributing to system functionality

## frontend/src/lib/

### utils.ts
- Utility/helper functions used across the project

## frontend/src/pages/

### AboutPage.jsx
- Represents a frontend page or route

### AcceptInvitePage.jsx
- Represents a frontend page or route

### AdminDashboard.jsx
- Represents a frontend page or route

### ContactSupportPage.jsx
- Represents a frontend page or route

### ForgotPasswordPage.jsx
- Represents a frontend page or route

### LandingPage.jsx
- Represents a frontend page or route

### LoginPage.jsx
- Represents a frontend page or route

### MaintenanceDashboard.jsx
- Represents a frontend page or route

### NotFoundPage.jsx
- Represents a frontend page or route

### PrivacyPage.jsx
- Represents a frontend page or route

### RegisterPage.jsx
- Represents a frontend page or route

### ResetPasswordPage.jsx
- Represents a frontend page or route

### StudentDashboard.jsx
- Represents a frontend page or route

### TermsPage.jsx
- Represents a frontend page or route

### VerifyEmailPage.jsx
- Represents a frontend page or route

## frontend/src/queries/

### catalogQueries.js
- Core application file contributing to system functionality

## frontend/src/services/

### adminConfigService.js
- Contains core business logic and application rules

### analyticsService.js
- Contains core business logic and application rules

### apiClient.js
- Core application file contributing to system functionality

### authService.js
- Handles authentication, login, and authorization logic

### buildingService.js
- Contains core business logic and application rules

### catalogService.js
- Contains core business logic and application rules

### exportService.js
- Contains core business logic and application rules

### notificationService.js
- Contains core business logic and application rules

### supportService.js
- Contains core business logic and application rules

### ticketService.js
- Contains core business logic and application rules

### userService.js
- Contains core business logic and application rules

## frontend/src/utils/

### constants.js
- Core application file contributing to system functionality

### helpers.js
- Utility/helper functions used across the project

### passwordPolicy.js
- Core application file contributing to system functionality

### profilePreferences.js
- Core application file contributing to system functionality

### storage.js
- Core application file contributing to system functionality

### ticketPresentation.js
- Core application file contributing to system functionality

## frontend/tests/e2e/

### dashboard-flows.spec.js
- Core application file contributing to system functionality

### public-auth.spec.js
- Handles authentication, login, and authorization logic
