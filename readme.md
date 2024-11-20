# SnapSite

This is a Pinterest Clone. It was build using MERN (MongoDB, ExpressJS, ReactJS, NodeJS) and Bootstrap5.

## Installation

This takes two terminals. One For Backend and One For Frontend

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### .env File for backend
Put the .env file in backend/
```
DATABASE_URI = "<MongoDB-Database-URI>"
JWT_SECRET = "<Random String>"
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=<Cloudinary-Cloud-Name>
CLOUDINARY_API_KEY=<Cloudinary-API-Key>
CLOUDINARY_API_SECRET=<Cloudinary-API-Secret>
```