# Yugioh Card Exchange

This is a very small prototype web application that demonstrates how to exchange Yu-Gi-Oh cards using Appwrite for authentication, storage and database. It lets you:

- Register and login with email/password
- Upload a profile picture and phone number in **My Account**
- Post cards for sale with one or more images
- Close your own postings
- Browse open postings sorted by date, low price or high price
- Contact sellers via a WhatsApp link with a predefined message
- Ionic UI components included via the `@ionic/core` package

All data is stored in Appwrite Authentication, Databases and Storage.
Copy `.env.example` to `.env` and fill in your Appwrite credentials.
When `npm start` runs, a small script uses these values to generate
`env.js` which the application imports at runtime.
The UI now uses Ionic locally from `node_modules`, so no Internet connection is required to load the framework.

## Local Development

Install dependencies and start a local server with npm:

```bash
npm install
npm start
```

This serves the project at [http://localhost:8000](http://localhost:8000).
