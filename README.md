This project is a dynamic reel-based feed application similar to Instagram Reels, built using React, TypeScript, and Tailwind CSS for the frontend, along with a Node.js/Express backend. The app supports infinite scrolling, video autoplay, liking, and sharing features.

Features

Frontend Features

Reel Feed: Displays a vertical reel feed with autoplay functionality when a reel is in the viewport.

Infinite Scrolling: Automatically loads more reels as the user scrolls.

Like Button: Allows users to like a reel, with immediate UI updates using React Query.

Mute/Unmute Button: Toggles the sound of each video.

Share Options: Provides options to share reels via Facebook, Twitter, WhatsApp, or copy the link.

Error Handling: Displays friendly error messages when data fails to load.

Responsive Design: Fully optimized for mobile, tablet, and desktop.

Backend Features

API Endpoints:

GET /api/feed/reels: Fetches paginated reel data.

PUT /api/feed/reels/:id/like: Updates the like count for a reel.

POST /api/feed/reels/:id/share: Simulates sharing a reel.

Pagination: Efficiently handles large datasets with paginated responses.

Mock Data: Preloaded with dummy reel data for development and testing.

