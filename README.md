# LiveZen – E-commerce Product Recommender System

This is an advanced **E-commerce Product Recommender System** developed for **LiveZen Technologies (Pvt) Ltd**, featuring sophisticated **CRUD operations**, **hybrid AI/ML recommendations**, **user authentication**, and comprehensive **admin management capabilities**.

---

## 🚀 Features

### Core Features

- **Product Management**: Full CRUD operations with image handling and rich product details
- **Advanced Authentication**: User registration, login, password reset, and two-factor authentication
- **Wishlist System**: Users can save and manage favorite products
- **Shopping Cart**: Complete cart functionality with quantity management
- **Order Management**: Order placement, tracking, and history
- **User Profiles**: Comprehensive user dashboard and profile management
- **Admin Dashboard**: Complete admin interface for managing products, users, and system analytics

### Intelligent Recommendation System

- **Hybrid Approach**: Combines rule-based (70%) and AI/ML-powered (30%) recommendations
- **Rule-based Logic**:
    - Same category products
    - Similar price range matching
    - Shared tags analysis
    - User behavior patterns
- **AI/ML Features**:
    - TF-IDF vectorization
    - Cosine similarity calculations
    - Feature extraction from product attributes
    - Smart caching for performance optimization

### Advanced Features

- **Recently Viewed Products**: Track and display user browsing history
- **Search & Filtering**: Advanced product search with category and tag filters
- **Responsive Design**: Mobile-first responsive interface
- **Performance Optimization**: Multi-layer caching and database optimization
- **Admin ML Management**: Real-time AI system monitoring and control

---

## 🛠 Choice of Technology

### Programming Language & Framework

- **PHP 8.2+ with Laravel 12.32.5**: Chosen for its robust ecosystem, excellent ORM (Eloquent), built-in authentication, and rapid development capabilities. Laravel's convention-over-configuration approach accelerated development while maintaining code quality.

- **JavaScript/TypeScript 5.9.2 with React 19.1.1**: Selected for building dynamic, interactive user interfaces. React's component-based architecture provides excellent reusability and maintainability.

### Key Technologies & Reasons

#### Backend Stack

- **Laravel 12.32.5**: Modern PHP framework with excellent developer experience
- **Inertia.js 2.1.4**: Bridges Laravel and React, providing SPA-like experience without API complexity
- **MySQL**: Reliable relational database with excellent Laravel integration
- **Redis/File Cache**: Multi-layer caching strategy for performance optimization

#### Frontend Stack

- **React 19.1.1**: Component-based UI library for dynamic interfaces
- **TypeScript 5.9.2**: Type safety and better developer experience
- **Tailwind CSS 4.1.12**: Utility-first CSS framework for rapid UI development
- **Lucide React 0.475.0**: Consistent, beautiful icon library
- **Radix UI Components**: Accessible, unstyled UI primitives (shadcn/ui foundation)
- **Sonner 2.0.7**: Beautiful toast notifications

#### Supporting Libraries & Packages

**Backend Dependencies:**

- `laravel/fortify`: Authentication scaffolding
- `inertiajs/inertia-laravel`: Server-side Inertia adapter
- `laravel/tinker`: Interactive REPL for debugging
- `fakerphp/faker`: Test data generation

**Frontend Dependencies:**

- `@inertiajs/react@2.1.4`: Client-side Inertia adapter
- `@headlessui/react@2.2.7`: Accessible UI components
- `@radix-ui/react-*`: Collection of unstyled, accessible components (shadcn/ui foundation)
- `tailwindcss@4.1.12`: Utility-first CSS framework
- `tailwindcss-animate@1.0.7`: Animation utilities for Tailwind
- `lucide-react@0.475.0`: Beautiful icon library
- `clsx@2.1.1`: Conditional CSS class utility
- `class-variance-authority@0.7.1`: Creating component variants
- `sonner@2.0.7`: Beautiful toast notification system
- `@tanstack/react-table@8.21.3`: Powerful table/data grid for React
- `clsx`: Conditional CSS class utility
- `react-hot-toast`: Elegant notification system
- `date-fns`: Modern date utility library

---

## 🎯 Design Decisions

### Product & Recommendation System Architecture

#### Database Design

```sql
Products Table:
- id, name, description, price, stock, status
- category_id (foreign key to categories)
- Images stored as JSON array
- Timestamps for created/updated tracking

Categories Table:
- Hierarchical structure with parent-child relationships
- Enables category-based recommendations

Tags System:
- Many-to-many relationship via pivot table
- Enables tag-based similarity matching

Users & Authentication:
- Enhanced Laravel's default user model
- Added wishlist relationship
- Two-factor authentication support
```

#### Recommendation Logic Design

**Rule-based System (Primary - 70%)**:

1. **Category Matching**: Products from the same category get highest priority
2. **Price Range Similarity**: Products within ±20% price range
3. **Tag Overlap**: Products sharing common tags
4. **Stock Availability**: Prioritize in-stock products
5. **Recency Factor**: Newer products get slight boost

**AI/ML System (Supplementary - 30%)**:

1. **Feature Extraction**: Convert products to numerical vectors using:
    - Product name (tokenized, TF-IDF weighted)
    - Description (processed for key terms)
    - Category (one-hot encoded)
    - Tags (multi-hot encoded)
    - Price range (normalized buckets)

2. **TF-IDF Vectorization**:
    - Calculate term frequency for each product
    - Apply inverse document frequency weighting
    - Generate sparse vectors for similarity calculation

3. **Cosine Similarity**:
    - Measure similarity between product vectors
    - Range: 0 (completely different) to 1 (identical)
    - Efficient computation with caching

#### Trade-offs & Simplifications

**Simplifications Made:**

- **Pure PHP ML Implementation**: Avoided external ML libraries to reduce complexity and deployment requirements
- **Limited Vector Dimensions**: Focused on most impactful features to balance accuracy and performance
- **Batch Processing**: Pre-compute embeddings rather than real-time calculation
- **Simple Tokenization**: Basic text processing instead of advanced NLP

**Trade-offs:**

- **Accuracy vs Performance**: Chose lightweight ML over complex models for better response times
- **Storage vs Computation**: Cache embeddings (storage cost) to avoid recalculation (computation cost)
- **Complexity vs Maintainability**: Hybrid approach adds complexity but provides fallback reliability

---

## 🔧 Implementation Details

### Key Modules & Their Purpose

#### Backend Architecture

**1. Services Layer**

```php
app/Services/ProductEmbeddingService.php
```

- **Purpose**: Core AI/ML engine for product vectorization
- **Key Methods**:
    - `generateEmbeddings()`: Create TF-IDF vectors for all products
    - `findSimilarProducts()`: Calculate cosine similarity
    - `extractProductFeatures()`: Convert products to feature arrays
    - `cosineSimilarity()`: Mathematical similarity calculation

```php
app/Services/RecommendationService.php
```

- **Purpose**: Hybrid recommendation orchestration
- **Key Methods**:
    - `getRelatedProducts()`: Main entry point for recommendations
    - `getRuleBasedRecommendations()`: Traditional logic
    - `getMLBasedRelatedProducts()`: AI-powered suggestions
    - Performance monitoring and fallback handling

**2. Controllers**

```php
app/Http/Controllers/ProductController.php
```

- **Purpose**: Product CRUD operations and API endpoints
- **Key Features**: Image handling, validation, search functionality

```php
app/Http/Controllers/RecommendationController.php
```

- **Purpose**: Recommendation API and admin management
- **Key Features**: ML system monitoring, cache management, statistics

**3. Console Commands**

```php
app/Console/Commands/GenerateEmbeddings.php
```

- **Purpose**: CLI management for ML system
- **Features**: Embedding generation, statistics, testing, cache management

#### Frontend Architecture

**1. Pages (Route Components)**

```typescript
resources/js/pages/products/index.tsx - Product listing with filters
resources/js/pages/products/show.tsx - Product details with recommendations
resources/js/pages/admin/ml-recommendations.tsx - ML system dashboard
```

**2. Components (Reusable UI)**

```typescript
resources/js/components/recommended-products.tsx - Recommendation display
resources/js/components/recently-viewed.tsx - User browsing history
resources/js/components/wishlist-button.tsx - Wishlist functionality
```

### APIs & Endpoints

#### Public APIs

- `GET /api/products` - Product listing with search/filter
- `GET /api/products/{id}` - Product details
- `GET /api/products/{id}/related` - Hybrid recommendations
- `POST /api/wishlist/toggle` - Wishlist management

#### Admin APIs

- `GET /admin/ml-recommendations` - ML system dashboard
- `POST /admin/ml-recommendations/clear-cache` - Cache management
- `GET /admin/ml-recommendations/stats` - System statistics

### Workflow for Adding Products & Getting Recommendations

#### Adding Products Workflow

1. **Admin Access**: Authenticate as admin user
2. **Product Creation**: Fill product form with details, images, category, tags
3. **Validation**: Server-side validation ensures data integrity
4. **Storage**: Product saved to database, images processed
5. **Cache Invalidation**: Clear related caches to ensure fresh recommendations
6. **ML Update**: Background job updates embeddings for new product

#### Getting Recommendations Workflow

1. **User Views Product**: Access product detail page
2. **Hybrid Recommendation Call**:
    - **Rule-based (70%)**: Query products by category, price, tags
    - **ML-based (30%)**: Calculate similarity using cached embeddings
3. **Result Merging**: Combine and deduplicate recommendations
4. **Caching**: Cache final recommendations for 30 minutes
5. **Frontend Display**: Render recommendations with AI indicator

---

## 🔍 Concerns & Challenges Faced

### Technical Difficulties & Solutions

#### 1. **Laravel Herd Port Conflicts**

- **Problem**: Ports 8000-8010 were occupied, preventing local development
- **Solution**: Used alternative ports (8080, 8001) and documented multiple server options
- **Learning**: Always check port availability and provide fallback options in documentation

#### 2. **TypeScript Integration with Inertia.js**

- **Problem**: Complex type definitions for Inertia PageProps with dynamic data
- **Solution**: Extended base PageProps interface with flexible typing:

```typescript
interface PageProps extends InertiaPageProps {
    [key: string]: unknown;
    // ... specific typed properties
}
```

- **Learning**: Balance type safety with flexibility in dynamic frameworks

#### 3. **AI/ML Performance Optimization**

- **Problem**: TF-IDF calculation was slow for large product catalogs
- **Solution**: Implemented multi-layer caching strategy:
    - Embeddings cached for 24 hours
    - Recommendations cached for 30 minutes
    - In-memory caching during calculation batch processing
- **Learning**: Cache aggressively in ML applications, but invalidate intelligently

#### 4. **Memory Management in Large Datasets**

- **Problem**: Vector calculations consuming excessive memory
- **Solution**:
    - Batch processing for embedding generation
    - Sparse vector representation
    - Garbage collection optimization
- **Learning**: Consider memory footprint early in ML implementation

#### 5. **Hybrid System Complexity**

- **Problem**: Balancing rule-based and ML recommendations without conflicts
- **Solution**:
    - Clear percentage split (70/30)
    - Fallback mechanisms
    - Comprehensive logging for debugging
- **Learning**: Hybrid systems need clear orchestration logic

### What Would Be Improved With More Time

#### Performance Enhancements

- **Real-time Embeddings**: Update ML vectors immediately when products change
- **Advanced Caching**: Implement Redis with more sophisticated cache invalidation
- **Database Optimization**: Add database indexes for better query performance
- **CDN Integration**: Implement image CDN for faster loading

#### ML/AI Improvements

- **User Behavior Tracking**: Implement collaborative filtering based on user actions
- **Advanced NLP**: Use more sophisticated text processing (stemming, stop words, n-grams)
- **Model Evaluation**: Implement A/B testing framework for recommendation accuracy
- **Personalization**: Add user preference learning and personalized recommendations

#### Features & Functionality

- **Search Enhancement**: Implement Elasticsearch for better search capabilities
- **API Rate Limiting**: Add throttling and rate limiting for API endpoints
- **Real-time Notifications**: WebSocket integration for live updates
- **Mobile App**: React Native app for mobile users

#### Code Quality & Testing

- **Comprehensive Testing**: Add more unit, integration, and end-to-end tests
- **Code Documentation**: Improve inline documentation and API documentation
- **Performance Monitoring**: Implement application performance monitoring (APM)
- **Security Audit**: Comprehensive security review and penetration testing

---

## ⚙️ Setup Instructions

### Prerequisites

- **PHP 8.2+** with extensions: `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer** (PHP dependency manager)
- **Node.js 18+** and **npm** (for frontend assets)
- **MySQL 8.0+** or **MariaDB 10.3+**

### Recommended Development Environment

#### Option 1: Laravel Herd (Recommended)

Laravel Herd provides the easiest setup for Laravel development on macOS and Windows.

1. **Install Laravel Herd**:
    - Download from [https://herd.laravel.com/](https://herd.laravel.com/)
    - Follow installation instructions for your OS
    - Herd automatically configures PHP, Nginx, and dnsmasq

2. **Configure Database**:
    - Herd includes MySQL, but you can also use external databases
    - For external MySQL, use XAMPP, MAMP, or standalone MySQL

#### Option 2: XAMPP + Manual Setup

If you prefer traditional setup or need more control:

1. **Install XAMPP**:
    - Download from [https://www.apachefriends.org/](https://www.apachefriends.org/)
    - Start Apache and MySQL services
    - Access phpMyAdmin at `http://localhost/phpmyadmin`

2. **Install PHP Extensions**:
    - Ensure all required PHP extensions are enabled in `php.ini`

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/mkskaushalya/livezen.git
cd livezen
```

#### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

#### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### 4. Database Configuration

Edit `.env` file with your database credentials:

```env
# For Laravel Herd (if using Herd's MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=livezen
DB_USERNAME=root
DB_PASSWORD=

# For XAMPP
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=livezen
DB_USERNAME=root
DB_PASSWORD=

# For external MySQL
DB_CONNECTION=mysql
DB_HOST=your_mysql_host
DB_PORT=3306
DB_DATABASE=livezen
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### 5. Database Setup

```bash
# Create database (if not exists)
php artisan db:create

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed

# Generate ML embeddings for products
php artisan generate:embeddings
```

#### 6. Build Frontend Assets

```bash
# Development build
npm run dev

# Production build
npm run build
```

#### 7. Start Development Server

**Using Laravel Herd:**

- Simply navigate to `livezen.test` in your browser
- Herd automatically serves Laravel projects

**Using Artisan (alternative):**

```bash
# Start development server
php artisan serve

# If port 8000 is occupied, try alternative ports
php artisan serve --port=8080
php artisan serve --port=8001
```

#### 8. Access Application

- **Main Application**: `http://livezen.test` (Herd) or `http://localhost:8000` (Artisan)
- **Admin Dashboard**: Navigate to `/admin` after logging in as admin
- **ML Management**: Visit `/admin/ml-recommendations` for AI system management

### Additional Configuration

#### Storage & File Permissions

```bash
# Create symbolic link for public storage
php artisan storage:link

# Set proper permissions (Linux/macOS)
chmod -R 775 storage bootstrap/cache
```

#### Cache Configuration

```bash
# Clear all caches
php artisan optimize:clear

# For production, optimize application
php artisan optimize
```

#### Testing ML System

```bash
# View ML system statistics
php artisan generate:embeddings --stats

# Test similarity calculations
php artisan generate:embeddings --test

# Regenerate embeddings
php artisan generate:embeddings --fresh
```

### Troubleshooting

#### Common Issues

1. **Port Already in Use**: Try different ports or stop conflicting services
2. **Database Connection Failed**: Verify database credentials and service status
3. **Permission Denied**: Check file permissions for `storage/` and `bootstrap/cache/`
4. **Missing PHP Extensions**: Install required PHP extensions via your package manager

#### Development Tips

- Use `php artisan tinker` for interactive debugging
- Check logs in `storage/logs/laravel.log` for errors
- Use `npm run dev` for hot-reloading during frontend development
- Access database via phpMyAdmin or your preferred MySQL client

---

## 📚 References

### Documentation & Official Resources

- **Laravel Documentation**: [https://laravel.com/docs](https://laravel.com/docs) - Comprehensive framework documentation
- **Inertia.js Guide**: [https://inertiajs.com/](https://inertiajs.com/) - SPA-like experience documentation
- **React Documentation**: [https://react.dev/](https://react.dev/) - Modern React development guide
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs) - Utility-first CSS framework

### Machine Learning & AI References

- **TF-IDF Algorithm**: [Wikipedia - TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) - Mathematical foundation
- **Cosine Similarity**: [Wikipedia - Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity) - Similarity measurement
- **Recommendation Systems**: [Towards Data Science - Recommendation Systems](https://towardsdatascience.com/recommendation-systems-models-and-evaluation-84944a84fb8e) - System design patterns

### Tutorials & Learning Resources

- **Laravel Best Practices**: [Spatie Guidelines](https://spatie.be/guidelines/laravel-php) - Code quality standards
- **React + TypeScript**: [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) - Type-safe React development
- **Inertia.js Tutorial**: [Laravel Daily - Inertia.js Course](https://laraveldaily.com/course/inertia-react) - Full-stack development
- **E-commerce Patterns**: [Martin Fowler - E-commerce Patterns](https://martinfowler.com/eaaCatalog/) - Architectural patterns

### Libraries & Tools Documentation

- **Laravel Fortify**: [https://laravel.com/docs/fortify](https://laravel.com/docs/fortify) - Authentication features
- **Headless UI**: [https://headlessui.com/](https://headlessui.com/) - Accessible React components
- **Lucide Icons**: [https://lucide.dev/](https://lucide.dev/) - Beautiful icon library
- **Radix UI**: [https://www.radix-ui.com/](https://www.radix-ui.com/) - Unstyled, accessible components
- **Sonner**: [https://sonner.emilkowal.ski/](https://sonner.emilkowal.ski/) - Toast notifications

### Performance & Optimization

- **Laravel Performance**: [Laravel News - Performance Tips](https://laravel-news.com/laravel-performance-tips) - Optimization strategies
- **React Performance**: [React Dev - Performance](https://react.dev/learn/render-and-commit) - Rendering optimization
- **MySQL Optimization**: [MySQL Documentation - Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) - Database performance

### Deployment & Production

- **Laravel Deployment**: [Laravel Docs - Deployment](https://laravel.com/docs/deployment) - Production deployment guide
- **Laravel Herd**: [https://herd.laravel.com/docs](https://herd.laravel.com/docs) - Local development environment

---

## 📄 License

This project is developed for **LiveZen Technologies (Pvt) Ltd** as part of an internship assignment. All rights reserved.

---

## 👨‍💻 Developer

**Developed by**: Sahan Kaushalya  
**Company**: LiveZen Technologies (Pvt) Ltd  
**Project**: E-commerce Product Recommender System  
**Date**: 05 October 2025

---

_This project demonstrates advanced full-stack development skills, AI/ML integration, and modern web application architecture._
