# 🏋️ **Gym Management System**

A comprehensive web-based Gym Management System built with Node.js, Express.js, and MongoDB. This system enables users to register, join gyms, track memberships, manage gym operations, and handle various administrative tasks.

## 🎯 **Key Features**

### 👤 **User Management**

- ✅ User registration with email verification
- ✅ Secure JWT-based authentication
- ✅ User roles (Member, Owner)
- ✅ Profile management (username, email, password)
- ✅ QR code generation for each user
- ✅ Account deletion functionality

### 🏋️ **Gym Operations**

- ✅ Gym creation and management
- ✅ Gym search and discovery
- ✅ Location-based gym mapping with coordinates
- ✅ Membership request system
- ✅ Member approval/decline workflow
- ✅ Member kick functionality for gym owners
- ✅ Gym statistics and analytics

### 📊 **Analytics & Statistics**

- ✅ Daily check-ins tracking
- ✅ Member count monitoring
- ✅ Revenue tracking
- ✅ New sign-ups analytics
- ✅ Class attendance statistics

### 💬 **Communication & Reviews**

- ✅ Gym reviews and rating system
- ✅ Announcements system
- ✅ Real-time notifications

### **Additional Features**

- ✅ Calendar system for gym event management
- ✅ Advanced analytics with interactive charts
- ✅ Export/Import functionality for event data
- ✅ Real-time statistics dashboard
- ✅ Automated daily and monthly data resets
- ✅ Comprehensive error logging system

### 📱 **Check-in System**

- ✅ QR code-based check-ins
- ✅ Check-in history tracking
- ✅ Location verification

## 🛠 **Tech Stack**

### **Backend**

- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, Rate Limiting
- **File Upload:** Multer with Cloudinary
- **Email Service:** Nodemailer
- **QR Code Generation:** qrcode
- **Logging:** Winston
- **Task Scheduling:** node-cron

### **Frontend**

- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Custom CSS with responsive design
- **Template Engine:** EJS
- **Icons:** Font Awesome

### **External Services**

- **Image Storage:** Cloudinary
- **Email Verification:** Custom email service
- **Maps & Geolocation:** Custom geocoding service

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- PayPal developer account (for payments)

### **Installation**

1. **Clone the repository**

```bash
git clone https://github.com/issam-aloui/Gym_Management_System.git
cd Gym_Management_System
```

2. **Install dependencies**

```bash
cd back_end
npm install
```

3. **Environment Configuration**
   Create a `.env` file in the `back_end` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/gym_management
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/gym_management

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (for verification)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=gmail

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
```

4. **Start the application**

```bash
npm start
```

The application will be available at `http://localhost:5000`

## 🗂️ **Environment Setup**

### **Development Mode**

```bash
# Install nodemon for development (if not already installed)
npm install -g nodemon

# Run in development mode with auto-restart
npx nodemon server.js
```

### **Production Deployment**

```bash
# Set environment to production
NODE_ENV=production

# Ensure all dependencies are installed
npm ci --only=production

# Start the server
npm start
```

## 📱 **API Endpoints**

### **Authentication**

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### **User Management**

- `GET /user/username` - Get current user info
- `PUT /user/changename` - Update username
- `PUT /user/changeemail` - Update email
- `PUT /user/changepassword` - Change password
- `DELETE /user/accountdeletion` - Delete account

### **Gym Management**

- `POST /gym/creategym` - Create new gym
- `GET /gym/getgyms` - Get all gyms
- `GET /gym/:gymId/details` - Get gym details
- `GET /gym/:gymId/leave` - Leave gym
- `PUT /gym/:gymId/name` - Update gym name
- `PUT /gym/:gymId/price` - Update pricing

### **Membership**

- `POST /joingym/memreq` - Send membership request
- `POST /joingym/memreqA` - Accept membership request
- `POST /joingym/memreqD` - Decline membership request

### **Reviews**

- `POST /reviews` - Add review
- `GET /reviews/:gymId` - Get gym reviews
- `DELETE /reviews/:reviewId` - Delete review

### **Check-ins**

- `POST /scan/checkin` - Handle QR code check-in

### **Announcements**

- `POST /announcements` - Create new announcement
- `GET /announcements/:gymId` - Get gym announcements
- `DELETE /announcements/:id` - Delete announcement

### **Services**

- Various service endpoints for additional functionality

## 🔒 **Security Features**

- **JWT Authentication** with secure HTTP-only cookies
- **Rate Limiting** for API endpoints
- **Input Validation** with express-validator
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers
- **Password Hashing** with bcrypt
- **Email Verification** for user registration

## 👥 **User Roles**

### **Member**

- Join gyms
- Check-in with QR codes
- Leave reviews
- View gym information
- Manage profile

### **Gym Owner**

- Create and manage gym
- Approve/decline membership requests
- Kick members
- View analytics
- Update gym information
- Create announcements

### **Admin**

- System-wide access
- User management
- Platform analytics

## 🎨 **Features Walkthrough**

### **User Registration & Login**

1. Users register with email verification
2. Secure password requirements enforced
3. QR code automatically generated for each user
4. JWT tokens for session management

### **Gym Discovery & Joining**

1. Users can search for gyms by location
2. View gym details, pricing, and reviews
3. Send membership requests with personal information
4. Gym owners approve/decline requests

### **Check-in System**

1. QR code-based check-ins
2. Location verification
3. Daily check-in tracking
4. Statistics and analytics

### **Payment Integration**

1. PayPal integration for membership payments
2. Revenue tracking for gym owners
3. Pricing management

## 🔧 **Development**

### **Available Scripts**

```bash
npm start          # Start production server
npm run dev        # Start with nodemon (development)
npm test           # Run tests (to be implemented)
```

### **Automated Tasks**

The system includes several automated background processes:

- **Daily Statistics Reset**: Runs at midnight to reset daily check-ins and new sign-ups
- **Monthly Revenue Reset**: Runs on the 1st of each month to reset monthly revenue counters
- **Error Logging**: Comprehensive logging system using Winston for debugging and monitoring

### **Database Models**

- **User**: Authentication, profile, gym memberships
- **Gym**: Gym information, location, pricing
- **Statistics**: Analytics and tracking data
- **Membership**: Join requests and approvals
- **Review**: User reviews and ratings
- **Announcement**: Gym announcements
- **CheckIn**: QR code check-in records
- **GymDescription**: Extended gym information and facilities

### **Logging System**

The application uses Winston for comprehensive logging:

- **Error Logs**: Stored in `back_end/logs/error.log`
- **Combined Logs**: All activities in `back_end/logs/combined.log`
- **Console Output**: Real-time colored console logging for development

## 📈 **Analytics Dashboard**

The system provides comprehensive analytics including:

- Member growth tracking
- Daily check-in statistics
- Revenue analytics
- Popular gym tracking
- User engagement metrics

## 👥 **Project Team**

### **Project Leader**
- **[@issam-aloui](https://github.com/issam-aloui)** - Project Leader & Lead Developer

### **Collaborators**
- **[@Anes-M0](https://github.com/Anes-M0)** - Collaborator
- **[@axx14](https://github.com/axx14)** - Collaborator
- **[@HaiderAmine](https://github.com/HaiderAmine)** - Collaborator
- **[@imeneben-dev](https://github.com/imeneben-dev)** - Collaborator
- **[@manelhouari2005](https://github.com/manelhouari2005)** - Collaborator
- **[@mouna-hm-bit](https://github.com/mouna-hm-bit)** - Collaborator
- **[@nihadbn2727](https://github.com/nihadbn2727)** - Collaborator
- **[@raximm](https://github.com/raximm)** (Dadi Abderrrahim) - Collaborator
- **[@sysy-med](https://github.com/sysy-med)** - Collaborator
- **[imad-randja]** - Collaorator
## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 **License**

This project is open-source under the MIT License.

## 📞 **Support**

For support and questions, please open an issue in the repository.

---

**Built with ❤️ for the fitness community**
