package com.movieapp.service;

import com.movieapp.dto.FavoriteDto;
import com.movieapp.entity.Favorite;

import java.util.List;

public interface FavoriteService {

    List<FavoriteDto> findByUserId(Long userId);

    FavoriteDto addFavorite(Long userId, Long movieId);

    void removeFavorite(Long userId, Long movieId);

    boolean isFavorite(Long userId, Long movieId);
}
