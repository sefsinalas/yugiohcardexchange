# Yugioh Card Exchange

This is a very small prototype web application that demonstrates how to exchange Yu-Gi-Oh cards using Appwrite for authentication, storage and database. It lets you:

- Register and login with email/password
- Upload a profile picture and phone number in **My Account**
- Post cards for sale with one or more images
- Close your own postings
- Browse open postings sorted by date, low price or high price
- Contact sellers via a WhatsApp link with a predefined message
- Ionic UI components loaded from a CDN

All data is stored in Appwrite Authentication, Databases and Storage.
Copy `env.example.js` to `env.js` and fill in your Appwrite credentials.
The application imports these values from `env.js` at runtime.
The UI relies on Ionic's CDN so you need an internet connection when opening `index.html` in a web browser.

## Local Development

Install dependencies and start a local server with npm:

```bash
npm install
npm start
```

This serves the project at [http://localhost:8000](http://localhost:8000).
