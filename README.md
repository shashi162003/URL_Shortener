# URL Shortener

A full-stack URL shortener application built with React, Express.js, and MongoDB. Create short, shareable links with custom URLs and user authentication.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, manageable links
- **Custom URLs**: Create personalized short URLs with custom names
- **User Authentication**: Secure login/signup system with JWT
- **User Dashboard**: View and manage all your created URLs
- **Copy to Clipboard**: Easy one-click copying with visual feedback
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Smooth loading indicators for better UX

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Query (TanStack Query)** - Data fetching and caching
- **Axios** - HTTP client with interceptors
- **React Icons** - Icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
URL Shortener/
├── FRONTEND/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API service functions
│   │   ├── utils/           # Utility functions and axios config
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # App entry point
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── BACKEND/                 # Express backend application
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middleware
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── dao/             # Data access objects
│   ├── app.js               # Express app setup
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd URL\ Shortener
   ```

2. **Install backend dependencies**

   ```bash
   cd BACKEND
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../FRONTEND
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cd ../BACKEND
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/urlshortener
   PORT=3000
   APP_URL=http://localhost:3000/
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd BACKEND
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

2. **Start the frontend development server**

   ```bash
   cd FRONTEND
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### URL Shortening Endpoints

#### Create Short URL

```http
POST /api/shortUrl/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/very/long/url"
}
```

#### Create Custom Short URL

```http
POST /api/shortUrl/custom
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "customUrl": "my-custom-name"
}
```

#### Get User URLs

```http
GET /api/shortUrl/user
Authorization: Bearer <token>
```

#### Redirect Short URL

```http
GET /:shortId
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🎯 Usage

### Creating Short URLs

1. **Sign up or log in** to your account
2. **Enter a long URL** in the input field
3. **Choose creation method**:
   - Click "Shorten URL" for auto-generated short URL
   - Enter custom name and click "Create Custom URL"
4. **Copy the short URL** using the copy button
5. **Share your short URL** - it will redirect to the original URL

### Managing Your URLs

- View all your created URLs in the dashboard
- Copy any URL with one click
- URLs are automatically associated with your account

### URL Redirection

- Visit any short URL (e.g., `http://localhost:3000/abc123`)
- You'll be automatically redirected to the original URL
- Works for both auto-generated and custom URLs

## 🔧 Development

### Available Scripts

#### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (placeholder)
```

#### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Code Structure

#### Frontend Architecture

- **Components**: Reusable UI components with proper error boundaries
- **Pages**: Route-specific page components
- **API Layer**: Centralized API calls with error handling
- **Utils**: Axios configuration with interceptors and retry logic

#### Backend Architecture

- **MVC Pattern**: Models, Views (JSON responses), Controllers
- **Middleware**: Authentication, error handling, logging
- **Services**: Business logic separation
- **DAO Pattern**: Data access abstraction

### Error Handling

The application implements comprehensive error handling:

- **Frontend**: Axios interceptors with retry logic and user-friendly messages
- **Backend**: Global error handler with detailed logging
- **Database**: Connection error handling and graceful shutdowns
- **Authentication**: JWT validation and token refresh

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Error Sanitization**: No sensitive data in error responses

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

- Check if MongoDB is running
- Verify environment variables in `.env`
- Ensure port 3000 is not in use

#### Frontend can't connect to backend

- Verify backend is running on port 3000
- Check CORS configuration
- Ensure axios baseURL is correct

#### Database connection errors

- Check MongoDB connection string
- Verify database permissions
- Ensure network connectivity

#### Authentication issues

- Check JWT_SECRET in environment variables
- Verify token is being sent in requests
- Check token expiration

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

### Logs

- Backend logs are displayed in the console
- Frontend errors appear in browser developer tools
- Check network tab for API request/response details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comprehensive error handling
- Include console logs for debugging
- Test both frontend and backend changes
- Update documentation for new features

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular URL shortening services
- Thanks to the open-source community for the amazing tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the error logs
3. Create an issue in the repository
4. Provide detailed error information and steps to reproduce

---

**Happy URL Shortening! 🎉**
