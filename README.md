# Yugioh Card Exchange

This is a very small prototype web application that demonstrates how to exchange Yu-Gi-Oh cards using Firebase for authentication, storage and database. It lets you:

- Register and login with email/password
- Upload a profile picture and phone number in **My Account**
- Post cards for sale with one or more images
- Close your own postings
- Browse open postings sorted by date, low price or high price
- Contact sellers via a WhatsApp link with a predefined message
- Ionic UI components loaded from a CDN

All data is stored in Firebase Authentication, Firestore and Storage. Replace the Firebase config in `app.js` with your own project details. The UI relies on Ionic's CDN so you need an internet connection when opening `index.html` in a web browser.
