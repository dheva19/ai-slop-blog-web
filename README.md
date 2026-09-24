# Platform Blog Modern Fullstack (100% Free Tier Stack)

Platform blog modern berbasis web yang dibangun menggunakan **FastAPI**, **React (TypeScript + Shadcn UI)**, dan **MongoDB Atlas**, dirancang untuk dideploy secara gratis ke **Vercel Serverless**.

---

## 🌟 Fitur Utama
1. **Autentikasi Pengguna**: Register, Login, Token JWT, profil otomatis DiceBear avatar.
2. **Layered Architecture (Backend FastAPI)**:
   - `models` $\rightarrow$ `repositories` $\rightarrow$ `services` $\rightarrow$ `controllers`.
   - Driver async non-blocking MongoDB: **Motor**.
3. **Editor Blog Fleksibel**:
   - Berbasis **TipTap (ProseMirror)**.
   - Mendukung penyisipan gambar (URL & upload Base64), blok kode (code block), serta embed video YouTube.
   - Status draft dan langsung terbit (publish).
4. **Halaman Home & Pencarian**:
   - Pencarian real-time berdasarkan kata kunci judul/isi.
   - Filter tag/kategori.
   - Pagination postingan.
   - Routing ramah SEO dengan **Slug** (misal: `/blog/tutorial-fastapi-react`).
5. **Interaksi Blog**:
   - Like postingan secara interaktif.
   - Komentar 1-level beserta penghapusan komentar milik sendiri.
6. **Dashboard Penulis & Traffic Analytics**:
   - Metrik total postingan, total views, total likes, dan total komentar.
   - Grafik interaktif traffic harian (Area Chart dengan **Recharts**).
   - Manajemen artikel penulis.

---

## 🛠️ Menjalankan Proyek Secara Lokal

### 1. Backend (FastAPI)
Buka terminal dan masuk ke root proyek:
```bash
# Pastikan virtual environment aktif jika diinginkan:
python -m venv venv
venv\Scripts\activate

# Install dependensi
pip install -r api/requirements.txt

# Buat file api/.env (opsional jika ingin mengganti url default)
# MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net
# DATABASE_NAME=blog_db
# JWT_SECRET=your_secret_key

# Jalankan server FastAPI
uvicorn api.index:app --reload --port 8000
```
Swagger UI Dokumentasi API dapat dibuka di: `http://localhost:8000/api/docs`.

### 2. Frontend (React Vite + TypeScript)
Buka terminal baru di folder `client/`:
```bash
cd client
npm install
npm run dev
```
Buka browser di: `http://localhost:3000`. Permintaan `/api` akan otomatis di-proxy ke FastAPI port 8000.

---

## 🚀 Panduan Deployment Gratis ke Vercel

1. **MongoDB Atlas (Free Tier)**:
   - Buat cluster gratis M0 di [cloud.mongodb.com](https://cloud.mongodb.com).
   - Di menu **Network Access**, tambahkan IP `0.0.0.0/0` (Allow Access from Anywhere) agar Vercel Serverless Function dapat terhubung.
   - Salin connection string MongoDB Anda.

2. **Push ke GitHub & Hubungkan ke Vercel**:
   - Push repository ini ke akun GitHub Anda.
   - Buka dashboard [vercel.com](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ Import repository GitHub ini.
   - Di bagian **Environment Variables** Vercel, tambahkan:
     - `MONGODB_URL`: connection string MongoDB Atlas Anda.
     - `DATABASE_NAME`: `blog_db`
     - `JWT_SECRET`: string rahasia acak untuk enkripsi token JWT.
   - Klik **Deploy**. Vercel akan secara otomatis membangun frontend React statis dan mengonfigurasi backend FastAPI sebagai Serverless Functions berdasarkan konfigurasi [vercel.json](file:///D:/ai-slop-ah/blog/vercel.json).
