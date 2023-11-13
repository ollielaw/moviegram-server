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

- User login / authentification / account creation
- Media feed comprised of movie reviews shared by other users they follow
- Ability to comment on and like other users' posts
- Post / Review creation and sharing
- Profile customization (avatar, bio, username, favorite movies, etc.)
- Access to movie details pages through search (with filtering options)
- Access to other user profiles through search (with filtering options)
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
- rating (number)
- trailer_url? (YouTube API?) (nice to have)
- created_at (timestamp, default)
- updated_at (timestamp, default)

##### Posts / Reviews

- id (PK) (increments, primary)
- user_id (FK) (integer, unsigned, not-nullable, references)
- movie_id (FK) (integer, unsigned, not-nullable, references)
- poster_url (string/url)
- caption (string, character limit)
- rating (enum, not-nullable)
- where_to_stream (check API documentation?) (nice to have?)
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

- GET /api/users
- POST /api/users
- GET /api/users/:userId
- DELETE /api/users/:userId
- PATCH /api/users/:userId
- GET /api/users/:userId/profile
- GET /api/users/:userId/followers
- GET /api/users/:userId/following
- GET /api/users/:userId/posts
- POST /api/users/:userId/posts
- GET /api/users/:userId/feed
- POST /api/users/:userId/follow
- DELETE /api/users/:userId/follow
- GET /api/movies
- POST /api/movies
- GET /api/movies/:movieId
- PATCH /api/movies/:movieId
- GET /api/movies/:movieId/profile
- GET /api/movies/:movieId/reviews
- GET /api/posts
- GET /api/posts/:postId
- PATCH /api/posts/:postId
- PUT /api/posts/:postId/likes
- POST /api/posts/:postId/comments

### Auth

The application will integrate login and user profile functionality, using authorization.

## Roadmap

1.

## Nice-to-haves / Next Steps

- Movie trailer playback (utilizing the YouTube API)
- Direct messaging for chat and sharing functionality (potentially utilizing socket.io)
- Explore / Recommedations Page (feed of algorithmically recommended movies, based on users past movie ratings / reviews)
