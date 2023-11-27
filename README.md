# MovieGram - Server

Welcome to the server side of **Foogle**! This Node.js application serves as the backend for **foogle.foo**, handling various functionalities such as web scraping, user authentication, and interaction with the database.

This is the Node.js server for my full-stack web application **MovieGram**. It is responsible for
handling CRUD interactions with the MySQL database, making external API calls to The Movie DB (which
hosts a large amount of movie related information, images, and relevant links), and user authentication.

## Client - https://github.com/ollielaw/moviegram-client.git

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [External APIs](#external-apis)
- [Getting Started](#getting-started)
- [Endpoints](#endpoints)
- [Database](#database)

## Features

1. **User Authentication:**
   User authentication is handled via jwt. Authentication is handled directly for the register and
   login endpoints, and through middleware for every other endpoint request.

2. **CRUD:**
   Users, once authenticated, are able to retrieve data relating to their profile, the profiles of
   other users, posts, and movies. Users are able to create content, including posts, ratings,
   and comments. Users can subsequently update and delete content that they have created through
   various endpoints, as detailed below.

3. **Data Logic**
   Through the relational database structure, the server handles joins, aggregations, and computations
   efficiently, which offloads complexity on the client-side. Much of this data logic is handled via
   Knex.js, which enables JavaScript friendly SQL querying.

4. **External Data Fetching and Syncing**
   Requests for movie lists (through search) and movie details require external API calls. The server
   handles these tasks via axios. Moreover, the backend handles syncing of TMDB data to the internal
   MySQL database when users post reviews referencing an unseen movie.

## Technologies Used

- Node.js
- Express
- MySQL
- Knex.js
- axios
- JWT
- bcrypt
- cors

## External APIs

- The Movie DB (TMDB): movie posters, movie backdrops, movie search, and movie details (e.g., title,
  genres, director, release date, etc.)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/ollielaw/moviegram-server.git
```

2. Install dependencies:

```bash
npm i
```

3. Set up your (MySQL) database, server, client, and TMDB API configurations in a `.env` file:

- PORT = ???
- DB_HOST = ???
- DB_NAME = ???
- DB_USER = ???
- DB_PASSWORD = ???
- CORS_ORIGIN = ???
- JWT_SECRET_KEY = ??? (choose a password of 32 or more characters)
- TMDB_API_URL = https://api.themoviedb.org/3
- TMDB_BEARER_TOKEN = ??? (register a free account: https://www.themoviedb.org/signup)

4. Create database:

- Create MySQL database with name the same as that specified in `.env` file

5. Run migrations:

```bash
npm run migrate
```

6. Run seeding:

```bash
npm run seed
```

7. Run the server:

```bash
npm start
```

## Endpoints

- **POST /api/register** Register a new account
- **POST /api/login** Login to existing account (returns JWT Bearer token, which must be passed in
  all subsequent request headers)
- **GET /api/user** Fetch information of current (logged in) user
- **GET /api/user/posts** Fetch all movie reviews authored by current user
- **GET /api/user/posts/:movieId** Fetch review of movie for a given TMDB movie ID, if it exists
- **GET /api/user/favorites** Fetch up to 10 movies with the highest ratings by current user
- **GET /api/user/feed?p=???|1** Fetch 5 movie reviews (i.e., 1 page) to populate user's feed (p in
  [1, 2, 3, ...]), also includes whether or not the current user has liked the review
- **GET /api/profiles?p=???|1&s=???** Search for other users (paginated in 20s) (s is an optional
  search query, which matches in name and username)
- **GET /api/profiles/:userId** Fetch profile information for a specified user
- **GET /api/profiles/:userId/favorites** Same as current user route but for other users' favorites
- **GET /api/profiles/:userId/posts** Fetch all movie reviews authored by specified user
- **GET /api/movies?s=???&p=???|1** Search for movies (paginates in 20s) (default query returns most
  popular movies -- according to TMDB): returns basic information, image paths, average rating across
  user ratings, and the current user's rating (if it exists)
- **GET /api/movies/:movieId** Retrieve detailed information a movie specified by TMDB movie ID:
  includes cast and crew information, as well as video paths/links
- **GET /api/movies/:movieId/posts** Fetch all posts referencing the movie specified by TMDB movie ID
- **POST /api/posts** Post a new movie review (is_post=1) to be shared, or quick rating (is_post=0),
  adds movie to movies database if not already there
- **GET /api/posts/:postId** Fetch one movie review by ID
- **DELETE /api/posts/:postId** Deletes post with specified ID, if it was authored by current user
- **PATCH /api/posts/:movieId** Updates a movie review or quick rating for movie specified by TMDB
  ID (and authored by current user)
- **POST /api/posts/:postId/like** Adds a like, by current user, to review specified by ID (if they
  haven't already liked the review)
- **DELETE /api/posts/:postId/like** Removes like, by current user, if like exists
- **GET /api/posts/:postId/comments** Gets comments for specified review, and if the comment was
  authored by the current user
- **POST /api/posts/:postId/comments** Adds a new comment, by current user, to specified post
- **DELETE /api/posts/:postId/comments/:commentId** Removes comment specified by ID, if it was
  authored by the current user

## Database

### MySQL Tables

#### Users

- id (PK)
- name
- username
- email
- password
- bio
- avatar_url
- created_at
- updated_at

#### Movies

- id (PK)
- movie_name
- tmdb_id
- poster_url
- backdrop_url
- release_date
- created_at
- updated_at

#### Posts

- id (PK)
- user_id (FK)
- movie_id (FK)
- caption
- rating
- is_post
- created_at
- updated_at

#### Comments

- id (PK)
- content
- post_id (FK)
- user_id (FK)
- created_at
- updated_at

#### Likes

- id (PK)
- user_id (FK)
- post_id (FK)
- created_at
- updated_at
