# SocialConnect - Full Project Context

## 📋 Project Overview

**Project Name:** SocialConnect (Social Networking App)  
**Version:** 1.0 MVP  
**Architecture:** Feature-First Clean Architecture with BLoC pattern  

This is a full-stack social networking application with:
- **Backend:** Node.js/Express REST API with Socket.io for real-time features
- **Frontend:** Flutter mobile app (iOS/Android) using BLoC state management

---

## 🏗️ Project Structure

```
flutter test/
├── backend/                    # Node.js Express Backend
│   ├── server.js               # HTTPS server entry point (port 3000)
│   ├── package.json            # Dependencies & scripts
│   ├── .env                    # Environment variables
│   ├── src/
│   │   ├── app.js              # Express app configuration
│   │   ├── config/
│   │   │   └── db.js           # PostgreSQL/Sequelize connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── post.controller.js
│   │   │   └── user.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js   # User Sequelize model
│   │   │   └── post.model.js   # Post Sequelize model
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── post.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   └── auth.service.js # Authentication business logic
│   │   ├── middleware/         # (For auth middleware, etc.)
│   │   ├── sockets/            # (For Socket.io handlers)
│   │   └── utils/              # (Helper functions)
│   └── tests/
│       ├── api.test.js         # Jest API tests
│       └── testSetup.js        # Test configuration
│
├── social_connect_app/         # Flutter Mobile Application
│   ├── lib/
│   │   ├── main.dart           # App entry point
│   │   ├── app.dart            # MaterialApp configuration
│   │   ├── injection.dart      # Dependency injection setup
│   │   ├── injection.config.dart
│   │   ├── core/               # Shared/Common code
│   │   │   ├── constants/
│   │   │   ├── errors/
│   │   │   │   └── failures.dart
│   │   │   ├── network/
│   │   │   │   └── api_client.dart
│   │   │   ├── theme/
│   │   │   │   ├── app_colors.dart
│   │   │   │   └── app_theme.dart
│   │   │   ├── utils/
│   │   │   └── widgets/
│   │   │       ├── app_button.dart
│   │   │       ├── app_text_field.dart
│   │   │       └── user_avatar.dart
│   │   └── features/
│   │       ├── auth/           # Authentication feature
│   │       ├── feed/           # News feed feature
│   │       ├── chat/           # Messaging feature
│   │       └── home/           # Home/navigation feature
│   ├── pubspec.yaml            # Flutter dependencies
│   ├── android/                # Android-specific config
│   ├── ios/                    # iOS-specific config
│   └── ...
│
└── .follow/
    ├── prd.md                  # Product Requirements Document
    └── rules.md
```

---

## 🔧 Backend Details

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Real-time:** Socket.io
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, Rate Limiting, HPP

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/posts` | Get all posts (with user info) |
| POST | `/api/posts` | Create new post |
| POST | `/api/posts/:id/react` | Like/react to a post |
| GET | `/api/users/search?query=` | Search users |

### Database Models

#### User Model
```javascript
{
  id: UUID (Primary Key),
  display_name: String (required),
  email: String (unique, required),
  password: String (hashed with bcrypt),
  avatar_url: String (nullable),
  is_online: Boolean (default: false),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Post Model
```javascript
{
  id: UUID (Primary Key),
  content: Text (required),
  imageUrl: String (nullable),
  likesCount: Integer (default: 0),
  userId: UUID (Foreign Key -> User),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Security Features
- **Helmet:** Secure HTTP headers
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **HPP:** HTTP Parameter Pollution prevention
- **HTTPS:** Self-signed certificates (server.key, server.cert)
- **Password Hashing:** bcrypt with 10 salt rounds

### Environment Variables (.env)
```
DB_NAME=<database_name>
DB_USER=<database_user>
DB_PASS=<database_password>
DB_HOST=<database_host>
JWT_SECRET=<jwt_secret_key>
```

---

## 📱 Flutter App Details

### Technology Stack
- **Framework:** Flutter 3.6+
- **Language:** Dart
- **State Management:** flutter_bloc (BLoC pattern)
- **Dependency Injection:** get_it + injectable
- **HTTP Client:** Dio
- **Functional Programming:** fpdart (Either types)
- **Real-time:** socket_io_client
- **Routing:** go_router
- **Typography:** Google Fonts (Outfit)

### Dependencies (pubspec.yaml)
```yaml
dependencies:
  dio: ^5.9.0
  equatable: ^2.0.8
  flutter_bloc: ^9.1.1
  fpdart: ^1.2.0
  get_it: ^8.3.0
  go_router: ^16.1.0
  google_fonts: ^6.3.0
  injectable: ^2.5.1
  rxdart: ^0.28.0
  socket_io_client: ^3.1.4
```

### Clean Architecture Layers

#### 1. Domain Layer (Business Logic - Pure Dart)
- **Entities:** Core business objects (`User`, `Post`)
- **Repositories:** Abstract interfaces
- **Use Cases:** Single-responsibility business operations

#### 2. Data Layer (Data Management)
- **Models:** JSON serialization (`UserModel`, `PostModel`)
- **Data Sources:** API calls (`AuthRemoteDataSource`)
- **Repository Implementations:** Concrete implementations

#### 3. Presentation Layer (UI & State)
- **BLoC:** State management (`AuthBloc`, `FeedBloc`, `SearchBloc`)
- **Pages/Screens:** UI components
- **Widgets:** Reusable UI elements

### Feature Modules

#### Auth Feature
- **Login Page:** Email/password authentication
- **Register Page:** New user registration
- **User Search:** Search users by name/email
- **BLoC States:** `AuthInitial`, `AuthLoading`, `AuthAuthenticated`, `AuthError`
- **Events:** `LoginRequested`, `RegisterRequested`

#### Feed Feature
- **Feed Page:** Displays posts with infinite scroll
- **Post Card:** Shows author, content, image, likes, actions
- **BLoC States:** `FeedInitial`, `FeedLoading`, `FeedLoaded`, `FeedError`
- **Events:** `FetchPostsRequested`, `ReactToPostRequested`

#### Chat Feature
- **Inbox Page:** List of conversations (mock data)
- **Chat Page:** Individual conversation view
- **Features:** Message bubbles, send messages, video/call buttons

#### Home Feature
- **Bottom Navigation:** Home (Feed), Messages, Profile
- **Navigation Bar:** Material 3 design with teal theme

### Theme & Styling
```dart
Colors:
- Primary Teal: #009688
- Teal Dark: #00796B
- Teal Light: #B2DFDB
- Success Green: #42B72A
- Background: #F0F2F5
- Surface Grey: #CCCDD2
- Text Dark: #050505
- Text Grey: #65676B
```

### API Client Configuration
- **Base URL:** `https://51.21.199.60:3000/api`
- **Timeouts:** 10 seconds (connect/receive)
- **SSL:** Self-signed certificate allowed
- **Logging:** Full request/response logging enabled

---

## 🔄 Data Flow

### Authentication Flow
```
LoginPage → AuthBloc → LoginUseCase → AuthRepository → AuthRemoteDataSource → API
                ↓
        AuthState (Authenticated/Error)
                ↓
        Navigate to HomePage or Show Error
```

### Feed Flow
```
FeedPage → FeedBloc → GetPostsUseCase → FeedRepository → ApiClient → API
                ↓
        FeedState (Loaded with posts)
                ↓
        Display posts in ListView
```

### Search Flow (with debounce)
```
SearchDelegate → SearchBloc → SearchUsersUseCase → AuthRepository → API
                      ↓
        SearchState (Loaded with users)
                      ↓
        Display results in ListView
```

---

## 🗂️ Key Files Reference

### Backend
| File | Purpose |
|------|---------|
| `server.js` | HTTPS server setup, Socket.io config |
| `src/app.js` | Express middleware, routes, model associations |
| `src/config/db.js` | PostgreSQL connection with Sequelize |
| `src/models/user.model.js` | User schema with password hashing |
| `src/models/post.model.js` | Post schema |
| `src/services/auth.service.js` | JWT generation, login/register logic |
| `src/controllers/*.js` | Route handlers |

### Flutter
| File | Purpose |
|------|---------|
| `main.dart` | App entry, DI initialization |
| `app.dart` | MaterialApp with theme |
| `injection.dart` | GetIt/Injectable setup |
| `core/network/api_client.dart` | Dio HTTP client |
| `core/theme/app_theme.dart` | Material 3 theme |
| `core/errors/failures.dart` | Error handling classes |
| `features/auth/presentation/bloc/auth_bloc.dart` | Auth state management |
| `features/feed/presentation/bloc/feed_bloc.dart` | Feed state management |
| `features/*/domain/entities/*.dart` | Business entities |
| `features/*/data/models/*.dart` | JSON models |
| `features/*/data/repositories/*_impl.dart` | Repository implementations |

---

## 🧪 Testing

### Backend Tests
- **Framework:** Jest + Supertest
- **Location:** `backend/tests/`
- **Coverage:** Security headers, rate limiting, auth endpoints
- **Run:** `npm test`

### Flutter Tests
- **Framework:** flutter_test
- **Location:** `social_connect_app/test/`

---

## 🚀 Running the Project

### Backend
```bash
cd backend
npm install
npm start          # Production
npm test           # Run tests
```

### Flutter
```bash
cd social_connect_app
flutter pub get
flutter run
```

---

## 📝 Notes

1. **SSL Certificates:** Backend uses self-signed certificates. Flutter app bypasses certificate validation for development.

2. **Real-time:** Socket.io is configured but chat features are using mock data. Real implementation needed.

3. **User Sessions:** Token-based authentication is implemented but persistent storage (SharedPreferences) needs implementation.

4. **Profile Feature:** Currently a placeholder in navigation.

5. **Comments:** Backend/Frontend support for comments not yet implemented.

6. **Image Upload:** Post imageUrl is stored but actual file upload not implemented.

---

## 🔮 Future Enhancements

- [ ] Implement real Socket.io chat functionality
- [ ] Add profile management feature
- [ ] Implement comments on posts
- [ ] Add image upload capability
- [ ] Implement social login (Google)
- [ ] Add push notifications
- [ ] Implement followers/following system
- [ ] Add typing indicators in chat
- [ ] Implement proper offline support
- [ ] Add comprehensive test coverage

---

*Generated: January 26, 2026*
