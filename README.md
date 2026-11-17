\# Harsh Mishra — Developer Portfolio



A full-stack personal developer portfolio built using React, Vite, Node.js, Express and MySQL. It includes a responsive portfolio website and a protected admin dashboard.



\## Features



\### Public Portfolio

\- Responsive portfolio website

\- Dynamic projects and project details

\- Work experience and certifications

\- Resume viewing and downloading

\- Contact form with email notifications



\### Admin Dashboard

\- JWT-based admin authentication

\- Project management

\- Experience management

\- Certificate management

\- Resume upload and deletion

\- Contact message management



\### Backend and Security

\- REST API using Express

\- MySQL database integration

\- Password hashing with bcrypt

\- JWT authentication

\- API rate limiting

\- Helmet security headers

\- PDF upload validation

\- Cloudinary document storage

\- SMTP email integration



\## Tech Stack



\*\*Frontend:\*\* React 19, Vite, React Router, Tailwind CSS, Motion, Lucide React



\*\*Backend:\*\* Node.js, Express 5, MySQL, JWT, bcryptjs, Multer, Cloudinary, Nodemailer



\## Project Structure



```text

harsh-portfolio/

├── public/

├── src/

│   ├── assets/

│   ├── data/

│   ├── lib/

│   └── pages/

├── server/

│   ├── database/

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── routes/

│   │   └── utils/

│   └── create-admin.js

├── package.json

└── vite.config.js

