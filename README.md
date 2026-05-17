# 🍔 Foodie. - Modern Secure Food Delivery Platform

Welcome to **Foodie.**, a production-grade, highly secure, and modern food delivery web application. This project features a stunning glassmorphism user interface designed with a minimal, dark/moody aesthetic combined with a robust, hardened architecture to withstand common web vulnerabilities and penetration testing tools.

---

## 🎨 Key Features

### Frontend (UI/UX)
* **Glassmorphism Design:** A premium, high-contrast frosted glass effect built using CSS `backdrop-filter: blur()`, semi-transparent backgrounds, and soft borders.
* **Responsive Layout:** Mobile-first, fully responsive design ensuring compatibility across all screen sizes.
* **Real-time Validation:** Client-side JavaScript validation for email formats, password strength indicator, and username restrictions.
* **Smooth Animations:** Crafted using clean, vanilla JavaScript for seamless scrolling and transitions.

### Security Hardening (Backend & Data)
* **Robust Authentication:** Secure user session management and Role-Based Access Control (RBAC) with predefined system roles (`user`, `moderator`, `admin`).
* **Argon2id Password Hashing:** Advanced password security leveraging the `argon2-cffi` library with high memory cost, time cost, and parallelism factors.
* **SQL Injection & XSS Prevention:** Full protection against injection vulnerabilities via strict parameterized queries and automated Jinja2 template escaping.
* **Brute-Force & Rate Limiting:** Automatic account lockout after 5 consecutive failed login attempts and API endpoints rate-limiting using `Flask-Limiter`.
* **Security Headers & CSRF Protection:** Implementation of robust HTTP headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, etc.) and Flask-WTF CSRF tokens.
* **Hidden Admin Protection:** Non-guessable, randomized administrative routing with detailed event logging.

---

## 🗂️ Project Structure

```text
Foodie/
├── static/                  # Static assets (CSS, JS, Images)
│   ├── css/
│   ├── js/
│   └── assets/
├── templates/               # UI Templates
│   ├── signup.html          # Registration Page (with real-time validation)
│   ├── signin.html          # Secure Login Page
│   └── home.html            # Protected Main Landing Page
├── app.py                   # Main Flask application factory
├── database.py              # SQLite database schemas and secure query controls
├── security.py              # Argon2id hashing configurations & sanitization filters
└── requirements.txt         # Project runtime dependencies
