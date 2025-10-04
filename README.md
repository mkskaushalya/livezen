# LiveZen – Product Recommender System

This is the internship assignment project for **LiveZen Technologies (Pvt) Ltd**, implementing a simple **E-commerce Product Recommender** system with **CRUD operations, rule-based recommendations, and a wishlist feature**.

---

## 🚀 Features
- Product CRUD (Create, Read, Update, Delete)
- Rule-based recommendations:
    - Same category
    - Similar price range
    - Shared tags
- Wishlist system (Novel feature)
- Built with Laravel + Inertia.js + React + TailwindCSS

---

## 🛠 Tech Stack
- **Backend**: Laravel 12
- **Frontend**: React (via Inertia.js)
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Auth**: Laravel Built-in Authentication

---

## 📂 Project Structure
- `app/Models/Product.php` – Product model
- `app/Http/Controllers/` – Controllers for Products & Wishlist
- `database/migrations/` – Product table migration
- `resources/js/Pages/` – React pages for CRUD & details
- `resources/js/Components/` – React reusable components
- `routes/web.php` – Web routes
- `README.md` – Documentation

---

## ⚙️ Setup Instructions


### Clone 
```bash
git clone https://github.com/mkskaushalya/livezen.git
cd livezen
```

### Install dependencies
```bash
composer install
npm install
```

### Setup environment
```bash
cp .env.example .env
php artisan key:generate
```

### Configure database in .env file
```bash
# DB_CONNECTION=mysql
# DB_HOST=
# DB_PORT=3306
# DB_DATABASE=
# DB_USERNAME=
# DB_PASSWORD=
# (Fill in your database credentials)
```
### Run migrations & seed
```bash
php artisan migrate --seed
```
### Build assets
```bash
npm run build
```
### Start server
```bash
php artisan serve
```
