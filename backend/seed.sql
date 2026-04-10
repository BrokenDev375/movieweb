-- ========================
-- USERS
-- ========================
INSERT INTO users (username, password, email, role) VALUES
('user1', '123456', 'user1@gmail.com', 'USER'),
('user2', '123456', 'user2@gmail.com', 'USER'),
('admin', 'admin123', 'admin@gmail.com', 'ADMIN');

-- ========================
-- MOVIES
-- ========================
INSERT INTO movies (title, description, nation) VALUES
('Avengers: Endgame', 'Superhero movie', 'USA'),
('One Piece Film Red', 'Anime movie', 'Japan'),
('Parasite', 'Oscar winning movie', 'Korea');

-- ========================
-- GENRES
-- ========================
INSERT INTO genres (name) VALUES
('Action'),
('Drama'),
('Anime');

-- ========================
-- MOVIE_GENRES
-- ========================
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 1),
(2, 3),
(3, 2);

-- ========================
-- MOVIE_URLS
-- ========================
INSERT INTO movie_urls (movie_id, episode, url) VALUES
(1, 1, 'http://movie.com/avengers-1'),
(2, 1, 'http://movie.com/onepiece-1'),
(3, 1, 'http://movie.com/parasite-1');

-- ========================
-- RATINGS
-- ========================
INSERT INTO ratings (movie_id, user_id, score) VALUES
(1, 1, 5),
(1, 2, 4),
(2, 1, 5),
(3, 2, 3);

-- ========================
-- COMMENTS
-- ========================
INSERT INTO comments (user_id, movie_id, content) VALUES
(1, 1, 'Phim quá hay!'),
(2, 1, 'Đỉnh cao Marvel'),
(1, 2, 'One Piece không bao giờ làm thất vọng');

-- ========================
-- FAVORITES
-- ========================
INSERT INTO favorites (user_id, movie_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- ========================
-- HISTORIES
-- ========================
INSERT INTO histories (user_id, movie_url_id, watch_time) VALUES
(1, 1, 120),
(1, 2, 60),
(2, 3, 90);
