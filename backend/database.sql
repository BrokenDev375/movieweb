    CREATE DATABASE IF NOT EXISTS movie_web;
    USE movie_web;

    -- ========================
    -- USERS
    -- ========================
    CREATE TABLE users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone_number VARCHAR(20),
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ========================
    -- MOVIES
    -- ========================
    CREATE TABLE movies (
        id BIGINT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        release_date DATE,
        trailer_url VARCHAR(500),
        poster_url VARCHAR(500),
        description TEXT,
        nation VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- ========================
    -- MOVIE URL (detail/watch)
    -- ========================
    CREATE TABLE movie_urls (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        movie_id BIGINT NOT NULL,
        episode INT NOT NULL,
        url VARCHAR(500) NOT NULL,

        CONSTRAINT fk_movie_url_movie
            FOREIGN KEY (movie_id)
            REFERENCES movies(id)
            ON DELETE CASCADE
    );

    -- ========================
    -- GENRES
    -- ========================
    CREATE TABLE genres (
        id BIGINT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    );

    -- ========================
    -- MOVIE GENRES (many-to-many)
    -- ========================
    CREATE TABLE movie_genres (
        movie_id BIGINT NOT NULL,
        genre_id BIGINT NOT NULL,

        PRIMARY KEY (movie_id, genre_id),

        CONSTRAINT fk_movie_genre_movie
            FOREIGN KEY (movie_id)
            REFERENCES movies(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_movie_genre_genre
            FOREIGN KEY (genre_id)
            REFERENCES genres(id)
            ON DELETE CASCADE
    );

    -- ========================
    -- RATINGS
    -- ========================
    CREATE TABLE ratings (
        movie_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (movie_id, user_id),

        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================
    -- COMMENTS
    -- ========================
    CREATE TABLE comments (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        movie_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_comment_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_comment_movie
            FOREIGN KEY (movie_id)
            REFERENCES movies(id)
            ON DELETE CASCADE
    );

    -- ========================
    -- FAVORITES
    -- ========================
    CREATE TABLE favorites (
        user_id BIGINT NOT NULL,
        movie_id BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (user_id, movie_id),

        CONSTRAINT fk_favorite_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_favorite_movie
            FOREIGN KEY (movie_id)
            REFERENCES movies(id)
            ON DELETE CASCADE
    );

    -- ========================
    -- HISTORY
    -- ========================
    CREATE TABLE histories (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        movie_id BIGINT NOT NULL,
        watch_time INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_history_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_history_movie
            FOREIGN KEY (movie_id)
            REFERENCES movies(id)
            ON DELETE CASCADE
    );
