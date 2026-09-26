# Firebase setup (one-time mobile steps)

The code and GitHub Pages deployment are updated through the pull request. Firebase rules are the only required manual Firebase Console step.

## 1. Publish the rules

1. Open **Firebase Console** → your project → **Firestore Database** → **Rules**.
2. Replace the entire editor content with the contents of [`firestore.rules`](firestore.rules).
3. Tap **Publish**.

## 2. Keep or create the super-admin record

The rules recognize a super admin only at this exact Firestore location:

* Collection: `admins`
* Document ID: the Firebase Authentication **UID** of your admin account
* Fields: optional; an empty document is enough.

If you already created your admin document in another collection, create this one additional document. Do **not** put an email address in the document ID; use the Authentication UID.

## 3. Authentication

In **Authentication** → **Sign-in method**, enable **Google** for the website's Google login. The admin account can also have Email/Password enabled, but the current website login button uses Google Popup.

## What these rules allow

* Anyone can open only a published invitation through its public link.
* A signed-in owner can create, list, edit, and delete only their own invitations.
* A super admin can read and manage all invitations.
* Nobody can make themselves an admin from the website.
