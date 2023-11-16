# MovieGram

## Overview

MovieGram is a social media / networking web application, in which the primary media form is movie reviews. Users, once registered, will
have access to a feed comprised of movie reviews (poster, rating, review, comments section) from users they follow. Ultimately, the
application will enable efficient sharing and recommendations for movies, so that users are able to make better movie-watching decisions.

### Problem

Given the vast array of available movies and numerous streaming options, I've found that choosing a movie to watch can be a difficult
and time-consuming endevour. Moreover, while there are social media platforms that currently enable people to share movie recommendations
and reviews (e.g., Instagram, TikTok, etc.), I've yet to find one that specializes in that functionality. My web application offers a
solution to this problem through specialization: restricting media to only movie-related content.

### User Profile

The user profile of this application is very broad: anyone who watches movies. The use case is to enable users to share their opinions
about movies, interact with others' opinions, make recommendations, and find inspiration for new movies to watch.

### Features

- User login / authentication / account creation
- Media feed comprised of movie reviews
- Ability to comment on and like other users' posts
- Post / Review creation and sharing
- Access to movie details pages through search
- Access to other user profiles through search
- Ability to give a movie a rating without creating a post
- Ability to recommend a movie to another user directly (messaging functionality) (nice to have)

## Implementation

### Tech Stack

- React (axios, react-router-dom, jsx, sass)
- Node (express, cors, dotenv, knex, mysql)
- MySQL

### APIs

- The Movie Database API
- YouTube API (nice to have)

### Sitemap

- Login Page
- Registration Page
- User Profile Page
- Movie Profile Page
- Search Page
- Media Feed Page
- Contacts / Followers / Following Page
- Post Creation Page
- Explore / Recommendations Page (nice to have)
- Chat / Messenger Page (nice to have)

### Mockups

![IMG_1281](https://github.com/ollielaw/moviegram-server/assets/66389067/27b5d3bb-1d05-49d7-90dd-3da923c60cf5)

![IMG_1282](https://github.com/ollielaw/moviegram-server/assets/66389067/033c6776-2e30-4dc1-8219-f1faebb752b5)

![IMG_1283](https://github.com/ollielaw/moviegram-server/assets/66389067/ad2f36e9-fd78-4cc0-9b1b-cd217dadf23c)

![IMG_1284](https://github.com/ollielaw/moviegram-server/assets/66389067/03835c8b-819b-41b1-8e9d-57fd0bfa0885)

![IMG_1285](https://github.com/ollielaw/moviegram-server/assets/66389067/751e3d79-79ee-489d-8ad9-3a989a3bf59b)

![IMG_1286](https://github.com/ollielaw/moviegram-server/assets/66389067/05a71108-1b84-43b9-8a40-5cfc4cb2b057)

![IMG_1287](https://github.com/ollielaw/moviegram-server/assets/66389067/a6793f41-75ae-456a-a118-031926deec14)

### Data

#### MySQL Database Tables:

##### Users

- id (PK) (increments, primary)
- username / handle (string, not-nullable, unique?)
- display_name (string, not-nullable)
- email (string, not-nullable)
- password (string, not-nullable, encrypted?)
- profile_pic / avatar (string/url)
- bio (string, character limit)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Movies

- id (PK) (increments, primary)
- movie_name (string, not-nullable)
- tmdb_id (integer, unsigned, not-nullable)
- poster_url (string, url)
- release_date (string, not-nullable)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Posts / Reviews

- id (PK) (increments, primary)
- user_id (FK) (integer, unsigned, not-nullable, references)
- movie_id (FK) (integer, unsigned, not-nullable, references)
- caption (string, character limit)
- rating (enum, not-nullable)
- is_post (enum, not-nullable)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Comments

- id (PK) (increments, primary)
- content (string, character limit)
- post_id (FK) (integer, unsigned, not-nullable, references)
- user_id (FK) (integer, unsigned, not-nullable, references)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Likes

- id (PK) (increments, primary)
- user_id (FK) (integer, unsigned, not-nullable, references)
- post_id (FK) (integer, unsigned, not-nullable, references)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Follows

- id (PK) (increments, primary)
- follower_id (FK) (integer, unsigned, not-nullable, references)
- followee_id (FK) (integer, unsigned, not-nullable, references)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Conversations (nice to have)

- id (PK) (increments, primary)
- name (string, character limit?)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Messages (nice to have)

- id (PK) (increments, primary)
- conversation_id (FK) (integer, unsigned, not-nullable, references)
- sender_id (FK) (integer, unsigned, not-nullable, references)
- text_content (string, character limit?)
- movie_id (FK) (integer, unsigned, not-nullable, references)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Conversation_members (nice to have)

- id (PK) (increments, primary)
- conversation_id (FK) (integer, unsigned, not-nullable, references)
- user_id (FK) (integer, unsigned, not-nullable, references)
- created_at (timestamp, default)
- updated_at (timestamp, default)

### Endpoints

- POST /api/login
- POST /api/register
- GET /api/user
- GET /api/user/posts
- GET /api/user/feed
- GET /api/user/followers
- GET /api/user/following
- POST /api/user/following
- DELETE /api/user/following/:followId
- POST /api/user/logout
- GET /api/profiles
- GET /api/profiles/:userId
- GET /api/profiles/:userId/posts
- GET /api/profiles/:userId/followers
- GET /api/profiles/:userId/following
- GET /api/movies
- GET /api/movies/:movieId
- GET /api/movies/:movieId/posts
- POST /api/posts
- GET /api/posts/:postId
- PATCH /api/posts/:movieId
- POST /api/posts/:postId/like
- DELETE /api/posts/:postId/like
- GET /api/posts/:postId/comments
- POST /api/posts/:postId/comments
- DELETE /api/posts/:postId/comments/:commentId

### Auth

The application will integrate login and user profile functionality, using auth.

## Roadmap

1. Design and build out API paths and responses utilizing separate routing files
2. Use static mock data to test the endpoint responses
3. Build migration and seeding files to initialize database, and controller files to handle querying
4. Implement services to handle syncing external API data responses with database data
5. Test API endpoints in Postman
6. Mockup the JSX for each page and break code down into reusable components
7. Build out data flow and state architecture for the front end
8. Implement handlers and hooks to connect the front end to the back end via the defined API endpoints
9. Implement full styling of the web application pages
10. Integrate authentification on the front and back end and refactor code as necessary
11. Perform thorough testing and optimize code efficiency
12. Consider implementing nice-to-haves or deploying the application

## Nice-to-haves / Next Steps

- Movie trailer playback (utilizing the YouTube API)
- Direct messaging for chat and sharing functionality (potentially utilizing socket.io)
- Explore / Recommedations Page (feed of algorithmically recommended movies, based on users past movie ratings / reviews)
