import csv
import collections
import os
from datetime import datetime

DATA_DIR = r"d:\Study\ky 2 nam 3\ttcs\movie_recommender\data\ml-100k"
OUTPUT_FILE = r"d:\Study\ky 2 nam 3\ttcs\movie_recommender\db\seed_full.sql"

# Genre list from u.genre
GENRES = [
    'unknown', 'Action', 'Adventure', 'Animation', "Children's", 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror',
    'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
]

def generate_full_seed():
    data_path = os.path.join(DATA_DIR, "u.data")
    item_path = os.path.join(DATA_DIR, "u.item")
    
    print(f"Checking data path: {data_path}")
    if not os.path.exists(data_path):
        print(f"ERROR: {data_path} does not exist")
        return

    print("Parsing ratings...")
    movie_ratings = collections.defaultdict(list)
    unique_users = set()
    ratings_data = []
    
    with open(data_path, 'r', encoding='latin-1') as f:
        reader = csv.reader(f, delimiter='\t')
        for row in reader:
            uid = int(row[0])
            mid = int(row[1])
            rating = float(row[2])
            ts = int(row[3])
            
            unique_users.add(uid)
            movie_ratings[mid].append(rating)
            ratings_data.append((uid, mid, rating, ts))

    print("Parsing movies...")
    movie_data = []
    with open(item_path, 'r', encoding='latin-1') as f:
        reader = csv.reader(f, delimiter='|')
        for row in reader:
            mid = int(row[0])
            title = row[1].replace("'", "''")
            
            # Map genres
            active_genres = []
            for i in range(len(GENRES)):
                # Genres start at index 5
                if row[5 + i] == '1':
                    active_genres.append(GENRES[i])
            
            genre_str = "|".join(active_genres).replace("'", "''")
            
            # Compute average rating
            ratings = movie_ratings.get(mid, [])
            avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
            
            movie_data.append((mid, title, genre_str, round(avg_rating, 2)))

    print(f"Writing SQL to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("-- Full Seed Data for ML-100K\n")
        f.write("-- Generated at: " + str(datetime.now()) + "\n")
        f.write("SET client_encoding = 'UTF8';\n\n")
        
        # 1. Users
        f.write("-- 1. Users\n")
        # Password hash for 'password123'
        pwd_hash = "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
        
        user_vals = []
        for uid in sorted(unique_users):
            username = f"user_{uid}"
            email = f"user_{uid}@example.com"
            user_vals.append(f"({uid}, '{username}', '{email}', '{pwd_hash}', 'USER')")
            
            if len(user_vals) >= 500:
                f.write("INSERT INTO users (id, username, email, password_hash, role) VALUES\n")
                f.write(",\n".join(user_vals))
                f.write("\nON CONFLICT (id) DO NOTHING;\n\n")
                user_vals = []
        
        if user_vals:
            f.write("INSERT INTO users (id, username, email, password_hash, role) VALUES\n")
            f.write(",\n".join(user_vals))
            f.write("\nON CONFLICT (id) DO NOTHING;\n\n")

        # Adjust sequence
        f.write("SELECT setval('users_id_seq', (SELECT max(id) FROM users));\n\n")

        # 2. Movies
        f.write("-- 2. Movies\n")
        movie_vals = []
        for mid, title, genres, avg in movie_data:
            movie_vals.append(f"({mid}, '{title}', '{genres}', {avg})")
            
            if len(movie_vals) >= 500:
                f.write("INSERT INTO movies (id, title, genres, avg_rating) VALUES\n")
                f.write(",\n".join(movie_vals))
                f.write("\nON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, genres=EXCLUDED.genres, avg_rating=EXCLUDED.avg_rating;\n\n")
                movie_vals = []
                
        if movie_vals:
            f.write("INSERT INTO movies (id, title, genres, avg_rating) VALUES\n")
            f.write(",\n".join(movie_vals))
            f.write("\nON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, genres=EXCLUDED.genres, avg_rating=EXCLUDED.avg_rating;\n\n")

        # 3. Ratings (this will be the biggest part)
        f.write("-- 3. Ratings (approx 100k entries)\n")
        # We'll batch these in 1000s
        rating_vals = []
        count = 0
        for uid, mid, rating, ts in ratings_data:
            # Convert timestamp
            dt = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
            rating_vals.append(f"({uid}, {mid}, {rating}, '{dt}')")
            count += 1
            
            if len(rating_vals) >= 1000:
                f.write("INSERT INTO ratings (user_id, movie_id, rating, rated_at) VALUES\n")
                f.write(",\n".join(rating_vals))
                f.write("\nON CONFLICT (user_id, movie_id) DO NOTHING;\n\n")
                rating_vals = []
                print(f"  Processed {count} ratings...")

        if rating_vals:
            f.write("INSERT INTO ratings (user_id, movie_id, rating, rated_at) VALUES\n")
            f.write(",\n".join(rating_vals))
            f.write("\nON CONFLICT (user_id, movie_id) DO NOTHING;\n\n")

    print("Success! Full seed file created.")

if __name__ == "__main__":
    generate_full_seed()
