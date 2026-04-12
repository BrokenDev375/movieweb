"""Hybrid recommender using user/item interaction with genre-conditioned MLP."""

import os
import random

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset


class RatingDataset(Dataset):
    """PyTorch dataset for user, movie, genre and normalized rating."""

    def __init__(self, ratings, genre_vectors, n_genres=19):
        self.users = torch.tensor([r[0] for r in ratings], dtype=torch.long)
        self.movies = torch.tensor([r[1] for r in ratings], dtype=torch.long)
        self.ratings_raw = torch.tensor([r[2] for r in ratings], dtype=torch.float32)
        self.ratings_norm = torch.clamp((self.ratings_raw - 1.0) / 4.0, 0.0, 1.0)

        zero_genre = np.zeros(n_genres, dtype=np.float32)
        genres = [genre_vectors.get(int(movie_idx), zero_genre) for movie_idx in self.movies.numpy()]
        self.genres = torch.tensor(np.array(genres), dtype=torch.float32)

    def __len__(self):
        return len(self.ratings_raw)

    def __getitem__(self, idx):
        return (
            self.users[idx],
            self.movies[idx],
            self.genres[idx],
            self.ratings_norm[idx],
            self.ratings_raw[idx],
        )


class HybridRecommender(nn.Module):
    """
    Hybrid recommender with GMF + MLP architecture.

    Public API is kept compatible with the project:
      - HybridRecommender(n_users, n_movies, genre_vectors, ...)
      - train_model(train_ratings, val_ratings, ...)
      - predict / predict_batch / save_model / load_model / get_top_n_recommendations
    """

    def __init__(
        self,
        n_users,
        n_movies,
        genre_vectors,
        emb_dim=48,
        gmf_dim=None,
        mlp_dim=None,
        mlp_layers=None,
        genre_dim=32,
        n_genres=19,
        dropout=0.35,
        random_seed=42,
        use_bias=True,
        use_bn=False,
        use_history=False,
        train_ratings=None,
    ):
        super().__init__()

        self.random_seed = random_seed if random_seed is not None else 42
        torch.manual_seed(self.random_seed)
        np.random.seed(self.random_seed)
        random.seed(self.random_seed)

        self.n_users = n_users
        self.n_movies = n_movies
        self.emb_dim = emb_dim
        self.gmf_dim = int(gmf_dim) if gmf_dim is not None else max(int(emb_dim), 8)
        self.mlp_dim = int(mlp_dim) if mlp_dim is not None else max(int(emb_dim), 8)
        self.mlp_layers = tuple(mlp_layers) if mlp_layers is not None else (64, 32)
        self.genre_dim = genre_dim
      
        self.n_genres = n_genres
        self.dropout = dropout
        self.use_bias = use_bias
        self.use_bn = use_bn
        # Kept for backward-compatible checkpoints; no longer used in this design.
        self.use_history = bool(use_history)
        self.genre_vectors = genre_vectors
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.rating_min = 1.0
        self.rating_max = 5.0
        self.rating_span = self.rating_max - self.rating_min

        # --- Bias terms (global + per-user + per-item) ---
        if use_bias:
            self.global_bias = nn.Parameter(torch.tensor(0.0))
            self.user_bias = nn.Embedding(n_users, 1)
            self.item_bias = nn.Embedding(n_movies, 1)
            nn.init.zeros_(self.user_bias.weight)
            nn.init.zeros_(self.item_bias.weight)

        self.user_gmf_emb = nn.Embedding(n_users, self.gmf_dim)
        self.movie_gmf_emb = nn.Embedding(n_movies, self.gmf_dim)
        self.user_mlp_emb = nn.Embedding(n_users, self.mlp_dim)
        self.movie_mlp_emb = nn.Embedding(n_movies, self.mlp_dim)

        self.genre_encoder = nn.Sequential(
            nn.Linear(n_genres, genre_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
        )

        mlp_input_dim = self.mlp_dim * 2 + genre_dim
        mlp_blocks = []
        in_dim = mlp_input_dim
        for hidden_dim in self.mlp_layers:
            mlp_blocks.append(nn.Linear(in_dim, hidden_dim))
            if use_bn:
                mlp_blocks.append(nn.BatchNorm1d(hidden_dim))
            mlp_blocks.append(nn.ReLU())
            mlp_blocks.append(nn.Dropout(dropout))
            in_dim = hidden_dim
        self.mlp_branch = nn.Sequential(*mlp_blocks)

        self.final_head = nn.Linear(self.gmf_dim + in_dim, 1)

        self._initialize_parameters()

        self.training_loss_history = []
        self.val_loss_history = []
        self.to(self.device)

    def _initialize_parameters(self):
        for emb in (
            self.user_gmf_emb,
            self.movie_gmf_emb,
            self.user_mlp_emb,
            self.movie_mlp_emb,
        ):
            nn.init.normal_(emb.weight, std=0.01)

        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    nn.init.zeros_(module.bias)

    def _normalize_rating(self, ratings):
        return torch.clamp((ratings - self.rating_min) / self.rating_span, 0.0, 1.0)

    def _denormalize_rating(self, ratings):
        return ratings * self.rating_span + self.rating_min

    def forward(self, user_ids, movie_ids, genre_vecs):
        """Return prediction on normalized [0, 1] rating scale."""
        # Bias path
        if self.use_bias:
            bias = (
                self.global_bias
                + self.user_bias(user_ids).squeeze(1)
                + self.item_bias(movie_ids).squeeze(1)
            )
        else:
            bias = 0.0

        # GMF path
        gmf_user = self.user_gmf_emb(user_ids)
        gmf_movie = self.movie_gmf_emb(movie_ids)
        gmf_out = gmf_user * gmf_movie

        # MLP path
        mlp_user = self.user_mlp_emb(user_ids)
        mlp_movie = self.movie_mlp_emb(movie_ids)
        genre_dense = self.genre_encoder(genre_vecs)

        mlp_input = torch.cat([mlp_user, mlp_movie, genre_dense], dim=1)
        mlp_out = self.mlp_branch(mlp_input)

        # Fuse GMF + MLP
        fused = torch.cat([gmf_out, mlp_out], dim=1)
        interaction = self.final_head(fused).squeeze(1) 

        # Combine bias + interaction — raw normalized-scale output
        return bias + interaction

    def _evaluate_loader(self, dataloader, criterion):
        self.eval()
        loss_sum = 0.0
        n_samples = 0
        sq_error = 0.0
        abs_error = 0.0

        with torch.no_grad():
            for users, movies, genres, ratings_norm, ratings_raw in dataloader:
                users = users.to(self.device)
                movies = movies.to(self.device)
                genres = genres.to(self.device)
                ratings_norm = ratings_norm.to(self.device)
                ratings_raw = ratings_raw.to(self.device)

                predictions_norm = self.forward(users, movies, genres)
                loss = criterion(predictions_norm, ratings_norm)

                predictions_raw = torch.clamp(
                    self._denormalize_rating(predictions_norm),
                    self.rating_min,
                    self.rating_max,
                )
                diff = predictions_raw - ratings_raw

                batch_size = int(ratings_raw.size(0))
                n_samples += batch_size
                loss_sum += float(loss.item()) * batch_size
                sq_error += float(torch.sum(diff ** 2).item())
                abs_error += float(torch.sum(torch.abs(diff)).item())

        if n_samples == 0:
            return 0.0, 0.0, 0.0

        avg_loss = loss_sum / n_samples
        rmse = float(np.sqrt(sq_error / n_samples))
        mae = abs_error / n_samples
        return avg_loss, rmse, mae

    def predict(self, user_idx, movie_idx):
        self.eval()
        with torch.no_grad():
            user_tensor = torch.tensor([user_idx], dtype=torch.long, device=self.device)
            movie_tensor = torch.tensor([movie_idx], dtype=torch.long, device=self.device)
            zero = np.zeros(self.n_genres, dtype=np.float32)
            genre_tensor = torch.tensor(
                self.genre_vectors.get(movie_idx, zero)[np.newaxis, :],
                dtype=torch.float32,
                device=self.device,
            )
            normalized_prediction = self.forward(user_tensor, movie_tensor, genre_tensor).item()
            prediction = self._denormalize_rating(normalized_prediction)
        return float(np.clip(prediction, self.rating_min, self.rating_max))

    def predict_batch(self, user_indices, movie_indices):
        self.eval()
        zero = np.zeros(self.n_genres, dtype=np.float32)
        with torch.no_grad():
            user_tensor = torch.tensor(user_indices, dtype=torch.long, device=self.device)
            movie_tensor = torch.tensor(movie_indices, dtype=torch.long, device=self.device)
            genre_tensor = torch.tensor(
                np.array(
                    [self.genre_vectors.get(int(movie_idx), zero) for movie_idx in movie_indices],
                    dtype=np.float32,
                ),
                dtype=torch.float32,
                device=self.device,
            )
            normalized_predictions = self.forward(user_tensor, movie_tensor, genre_tensor).cpu().numpy()
            predictions = self._denormalize_rating(normalized_predictions)
        return np.clip(predictions, self.rating_min, self.rating_max)

    def train_model(
        self,
        train_ratings,
        val_ratings=None,
        n_epochs=25,
        batch_size=512,
        learning_rate=1e-3,
        weight_decay=1e-4,
        patience=7,
        warmup_epochs=2,
        verbose=True,
        use_cosine_lr=False,
    ):
        if verbose:
            print("=" * 60)
            print("TRAINING HYBRID RECOMMENDER")
            print("=" * 60)
            print(f"  emb_dim        : {self.emb_dim}")
            print(f"  gmf_dim        : {self.gmf_dim}")
            print(f"  mlp_dim        : {self.mlp_dim}")
            print(f"  genre_dim      : {self.genre_dim}")
            print(f"  mlp_layers     : {list(self.mlp_layers)}")
            print(f"  dropout        : {self.dropout}")
            print(f"  learning_rate  : {learning_rate}")
            print(f"  weight_decay   : {weight_decay}")
            print(f"  warmup_epochs  : {warmup_epochs}")
            print(f"  batch_size     : {batch_size}")
            print(f"  max epochs     : {n_epochs}")
            print(f"  device         : {self.device}")
            print()

        train_ds = RatingDataset(train_ratings, self.genre_vectors, self.n_genres)
        train_dl = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)

        if val_ratings:
            val_ds = RatingDataset(val_ratings, self.genre_vectors, self.n_genres)
            val_dl = DataLoader(val_ds, batch_size=batch_size * 2, shuffle=False, num_workers=0)
        else:
            val_dl = None

        criterion = nn.MSELoss()

        optimizer = optim.Adam(
            self.parameters(), lr=learning_rate, weight_decay=weight_decay
        )

        scheduler = None
        if use_cosine_lr:
            scheduler = optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=n_epochs, eta_min=learning_rate * 0.01
            )

        best_val_rmse = float("inf")
        best_state = None
        patience_counter = 0
        self.training_loss_history = []
        self.val_loss_history = []

        for epoch in range(1, n_epochs + 1):
            if warmup_epochs > 0 and epoch <= warmup_epochs:
                current_lr = learning_rate * (epoch / warmup_epochs)
                for param_group in optimizer.param_groups:
                    param_group["lr"] = current_lr
            elif scheduler is not None:
                current_lr = optimizer.param_groups[0]["lr"]
            else:
                current_lr = learning_rate
                for param_group in optimizer.param_groups:
                    param_group["lr"] = current_lr

            super().train()
            loss_sum = 0.0
            sq_error = 0.0
            abs_error = 0.0
            n_samples = 0

            for users, movies, genres, ratings_norm, ratings_raw in train_dl:
                users = users.to(self.device)
                movies = movies.to(self.device)
                genres = genres.to(self.device)
                ratings_norm = ratings_norm.to(self.device)
                ratings_raw = ratings_raw.to(self.device)

                optimizer.zero_grad()
                predictions_norm = self.forward(users, movies, genres)
                loss = criterion(predictions_norm, ratings_norm)
                loss.backward()
                nn.utils.clip_grad_norm_(self.parameters(), max_norm=1.0)
                optimizer.step()

                predictions_raw = torch.clamp(
                    self._denormalize_rating(predictions_norm.detach()),
                    self.rating_min,
                    self.rating_max,
                )
                diff = predictions_raw - ratings_raw

                batch_size_current = int(ratings_raw.size(0))
                n_samples += batch_size_current
                loss_sum += float(loss.item()) * batch_size_current
                sq_error += float(torch.sum(diff ** 2).item())
                abs_error += float(torch.sum(torch.abs(diff)).item())

            train_loss = loss_sum / max(n_samples, 1)
            train_rmse = float(np.sqrt(sq_error / max(n_samples, 1)))
            train_mae = abs_error / max(n_samples, 1)
            self.training_loss_history.append(train_loss)

            val_loss = None
            val_rmse = None
            if val_dl is not None:
                val_loss, val_rmse, _ = self._evaluate_loader(val_dl, criterion)
                self.val_loss_history.append(val_loss)

                if val_rmse < best_val_rmse:
                    best_val_rmse = val_rmse
                    best_state = {key: value.detach().clone() for key, value in self.state_dict().items()}
                    patience_counter = 0
                else:
                    patience_counter += 1
                    if patience_counter >= patience:
                        if verbose:
                            print(
                                f"Early stopping at epoch {epoch} "
                                f"(best val RMSE: {best_val_rmse:.4f})"
                            )
                        break

            # Step scheduler after warmup
            if scheduler is not None and epoch > warmup_epochs:
                scheduler.step()

            if verbose and (epoch % 5 == 0 or epoch == 1):
                message = (
                    f"Epoch {epoch:3d}/{n_epochs}  "
                    f"Train Loss: {train_loss:.4f}  |  Train RMSE: {train_rmse:.4f}  "
                    f"|  Train MAE: {train_mae:.4f}  |  LR: {current_lr:.2e}"
                )
                if val_rmse is not None:
                    message += f"  |  Val RMSE: {val_rmse:.4f}"
                print(message)

        if best_state is not None:
            self.load_state_dict(best_state)

        if verbose:
            print()
            print("=" * 60)
            print("TRAINING COMPLETE")
            print("=" * 60)
            print()

    def save_model(self, filepath):
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        torch.save(
            {
                "state_dict": self.state_dict(),
                "n_users": self.n_users,
                "n_movies": self.n_movies,
                "emb_dim": self.emb_dim,
                "genre_dim": self.genre_dim,
                "n_genres": self.n_genres,
                "use_history": self.use_history,
                "gmf_dim": self.gmf_dim,
                "mlp_dim": self.mlp_dim,
                "mlp_layers": self.mlp_layers,
                "use_bias": self.use_bias,
                "use_bn": self.use_bn,
            },
            filepath,
        )
        print(f"Model saved -> {filepath}")

    def load_model(self, filepath):
        checkpoint = torch.load(filepath, map_location=self.device)
        state_dict = checkpoint["state_dict"] if "state_dict" in checkpoint else checkpoint
        self.load_state_dict(state_dict, strict=True)
        print(f"Model loaded <- {filepath}")

    def get_top_n_recommendations(self, user_idx, n=10, rated_movies=None):
        self.eval()
        rated_movies = rated_movies or set()
        candidates = [movie_idx for movie_idx in range(self.n_movies) if movie_idx not in rated_movies]
        if not candidates:
            return []

        predictions = self.predict_batch([user_idx] * len(candidates), candidates)
        ranked = sorted(zip(candidates, predictions.tolist()), key=lambda row: row[1], reverse=True)
        return ranked[:n]
