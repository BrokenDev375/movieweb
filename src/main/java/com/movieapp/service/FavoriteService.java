package com.movieapp.service;

import com.movieapp.entity.Favorite;

import java.util.List;

public interface FavoriteService {

    List<Favorite> findByUserId(Long userId);

    Favorite addFavorite(Long userId, Long movieId);

    void removeFavorite(Long userId, Long movieId);

    boolean isFavorite(Long userId, Long movieId);
}
