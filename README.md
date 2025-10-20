# Ranking System - Next.js TypeScript Application

A modern, full-stack ranking application built with Next.js, TypeScript, and Mantine UI, featuring a comprehensive admin dashboard with database management.

## 🚀 Features

### Public Features
- ⭐ Interactive ranking system (1-10 stars)
- 🎨 Beautiful Mantine UI components  
- 📱 Responsive design
- 🎯 Category-based organization
- 📊 Real-time rating averages

### Admin Features
- 🔐 Secure authentication with NextAuth.js
- 👥 User management and role assignment
- 📝 CRUD operations for ranking items
- 🏷️ Category management
- 📈 Statistics and analytics dashboard
- 🔧 Database administration via Prisma

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Mantine UI
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Docker & Docker Compose
- **Validation**: Zod schemas

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmallTest
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your settings:
   ```env
   # Database
   DATABASE_URL="postgresql://rankinguser:rankingpassword@postgres:5432/rankingdb"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secure-random-string-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth (for admin authentication)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Start with Docker Compose**
   ```bash
   # Development mode
   docker-compose up nextjs-ranking-app-dev
   
   # Production mode
   docker-compose up nextjs-ranking-app
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   docker-compose exec nextjs-ranking-app-dev npx prisma generate
   
   # Run database migrations
   docker-compose exec nextjs-ranking-app-dev npx prisma db push
   
   # (Optional) Seed sample data
   docker-compose exec nextjs-ranking-app-dev npx prisma db seed
   ```

## 🔧 Development

### Local Development (without Docker)
```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name migration-name
```

## 🔐 Admin System Setup

### Creating Admin Users

1. **Sign in via Google OAuth** at `/auth/signin`
2. **Manually promote user to admin** in database:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
   ```
3. **Access admin dashboard** at `/admin`

### Admin Features

- **Dashboard**: Overview statistics and recent activity
- **Items Management**: Create, edit, delete ranking items
- **Categories**: Organize items into themed categories  
- **Users**: Manage user roles and permissions
- **Statistics**: View rating trends and analytics

## 🌐 API Endpoints

### tRPC API Routes

#### Ranking Items
- `rankingItem.getAll` - Get all ranking items
- `rankingItem.getByCategory` - Filter by category
- `rankingItem.create` - Create new item (admin)
- `rankingItem.update` - Update item (admin)
- `rankingItem.delete` - Delete item (admin)

#### Categories
- `category.getAll` - Get all categories
- `category.create` - Create category (admin)
- `category.update` - Update category (admin)
- `category.delete` - Delete category (admin)

#### Users & Ratings
- `user.updateRole` - Change user role (admin)
- `rankingItem.rate` - Submit rating

## 🐳 Docker Configuration

### Services
- **nextjs-ranking-app**: Production build
- **nextjs-ranking-app-dev**: Development with hot reload
- **postgres**: PostgreSQL database with persistent storage

### Ports
- **3000**: Next.js application
- **5432**: PostgreSQL database (internal)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage with ranking UI
├── components/            # Reusable UI components
│   ├── ItemCard.tsx       # Rating item display
│   └── RatingStars.tsx    # Star rating component
├── pages/                 # Pages Router (for API)
│   ├── _app.tsx          # App wrapper with providers
│   └── api/              # API routes
├── server/               # Backend logic
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── api/              # tRPC routers
└── utils/                # Utility functions
    └── api.ts            # tRPC client setup
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ |
| `NEXTAUTH_URL` | App URL for callbacks | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ✅ |

## 🚀 Deployment

### Production Deployment
1. Set production environment variables
2. Build and deploy with Docker:
   ```bash
   docker-compose -f docker-compose.yml up nextjs-ranking-app
   ```

### Security Considerations
- Use strong, unique `NEXTAUTH_SECRET` 
- Restrict Google OAuth to specific domains
- Configure CORS for production domains
- Use HTTPS in production
- Regular database backups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## ⚡ Quick Start Commands

```bash
# Start development environment
docker-compose up nextjs-ranking-app-dev

# Access the application
open http://localhost:3000

# Access admin dashboard  
open http://localhost:3000/admin

# View database
docker-compose exec nextjs-ranking-app-dev npx prisma studio
```
    description: "Description of your new item",
    rating: 0
  },
  // ... existing items
]);
```

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind classes in components for different colors/layouts
- Customize the gradient background in the main container

### Rating Scale
To change from 1-10 to a different scale, update the array in `RatingStars.tsx`:
```typescript
{[1, 2, 3, 4, 5].map((star) => ( // Change to 1-5 scale
```

## Docker Configuration

The project includes comprehensive Docker support with both development and production configurations:

### Files
- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development environment
- `docker-compose.yml` - Orchestration for both environments
- `.dockerignore` - Excludes unnecessary files from Docker context

### Docker Features
- **Multi-stage builds** for optimized production images
- **Development mode** with hot reloading and volume mounting
- **Production mode** with standalone Next.js output
- **Security** with non-root user in production
- **Performance** optimized with proper caching layers

### Environment Variables
You can customize the Docker setup by setting environment variables:
- `NODE_ENV` - Set to 'development' or 'production'
- `PORT` - Change the internal port (default: 3000)
- `HOSTNAME` - Set the hostname (default: "0.0.0.0")

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS