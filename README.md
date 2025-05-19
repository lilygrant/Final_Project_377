# Dog Breeds Web App

A fun and interactive web application that helps users find the perfect dog breed based on temperament, size, and more. Users can view breed information, filter by traits and weight range, and leave reviews for each breed — which are stored and displayed persistently.

---

## Overview

**Description**  
This app uses TheDogAPI to pull breed data and allows users to:
- Filter breeds by temperament traits and weight
- View breed-specific details and images
- Submit and read persistent breed reviews via Supabase

**Target Browsers**
- Chrome (latest)
- Firefox (latest)
- Safari 13+
- Microsoft Edge (Chromium-based)

**Tech Stack**
- HTML5 / CSS3 / JavaScript (ES6+)
- Supabase (PostgreSQL + REST API)
- TheDogAPI (https://thedogapi.com)
- noUiSlider (for size filtering)
- Swiper.js (for homepage image carousel)

---

## Developer Manual

This section provides guidance for developers taking over the project.

### Installation & Local Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/lilygrant/Final_Project_377
```

#### 2. Install Dependencies

This app is pure HTML/CSS/JS with no framework dependencies.

However, you must install a local server (e.g. using `lite-server`, `live-server`, or Python HTTP server):

```bash
npm install -g live-server
# or
python3 -m http.server
```

#### 3. Run the App

```bash
live-server .
# or
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Ensure your Supabase project keys are hardcoded in `Grant_final.js` or moved to `.env` with build tooling.

---

### Testing the App

Manual testing instructions:

- Open `Grant_final_dogs.html`
- Try filtering by one or more traits and sizes
- Try selecting a breed from the dropdown or search
- Submit a review and reload to confirm it persists

Planned future improvements:
- Unit tests for Supabase interactions
- Form validation testing
- Mocking dog API for CI/CD integration

---

### APIs Used

#### TheDogAPI (https://api.thedogapi.com/v1/breeds)
- `GET /v1/breeds`: fetches list of all dog breeds with weight, size, temperament, etc.

#### Supabase API
- `GET /reviews`: fetch all reviews for a specific breed
- `POST /reviews`: add a new review `{ breed_id, stars, comment }`

> Reviews are stored in a `reviews` table:
> - `id`: UUID (auto)
> - `breed_id`: integer
> - `breed_name`: string
> - `stars`: integer (1–5)
> - `comment`: text
> - `created_at`: timestamp

---

###  Known Issues

-  Multiple reviews allowed from the same user (no auth check yet)
-  Review submission fails silently if Supabase is unavailable
-  Filtering logic is exclusive to exact matches (no fuzzy search)
-  No offline support / PWA features
-  Issues with filtering
---

### Expected Developer Practices

- Use feature branches (`feature/review-sorting`, etc.)
- Lint JavaScript before merging
- Keep Supabase credentials out of source control
- Use console logging only for debug; clean before production
- Commit using descriptive messages

---

### Handoff Notes

This project was created and maintained by Lily Grant.  
Future developers should:

- Use the structure as-is or modularize with a bundler if growing
- Use Supabase SQL editor to manage the `reviews` table
- Maintain API keys securely if moved to production

---

Enjoy building on top of the Dog Breeds App!
