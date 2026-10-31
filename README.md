# 🎲 AR Random Reward System

A free WebAR project that uses **one QR Code** to randomly distribute **5 AR images** equally among **20 participants** (4 people per image).

## ✨ Features

- ✅ One QR Code for everyone
- ✅ Random distribution with equal quota
- ✅ 5 different reward images (A–E)
- ✅ 20 total participants (4 per image)
- ✅ Google Sheets as the database
- ✅ Google Apps Script as a free API
- ✅ GitHub Pages for free hosting

## 📁 Project Structure

```
ar-random/
│
├── index.html
├── style.css
├── app.js
├── README.md
│
└── images/
    ├── A.png
    ├── B.png
    ├── C.png
    ├── D.png
    └── E.png
```

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML | Web interface |
| CSS | UI styling |
| JavaScript | Client logic |
| Google Apps Script | Random allocation API |
| Google Sheets | Reward database |
| GitHub Pages | Free website hosting |

## 🚀 Deployment

### 1. Deploy Google Apps Script

- Create a Google Sheet named **AR_POOL**
- Deploy Apps Script as **Web App**
- Set access to **Anyone**
- Copy the `/exec` URL

### 2. Update API

Edit **app.js**

```javascript
const API = "YOUR_APPS_SCRIPT_EXEC_URL";
```

### 3. Deploy GitHub Pages

- Settings → Pages
- Deploy from Branch
- Branch: **main**
- Folder: **/(root)**

Your website will be available at:

```
https://USERNAME.github.io/ar-random/
```

## 📊 Reward Logic

| Image | Quota |
|--------|------:|
| A | 4 |
| B | 4 |
| C | 4 |
| D | 4 |
| E | 4 |
| **Total** | **20** |

The allocation is handled by Google Apps Script, ensuring each image is assigned exactly six times.

## 📄 License

This project is developed for educational and research purposes.
