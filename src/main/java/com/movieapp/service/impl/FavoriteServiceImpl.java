package com.movieapp.service.impl;

import com.movieapp.entity.Favorite;
import com.movieapp.repository.FavoriteRepository;
import com.movieapp.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Favorite> findByUserId(Long userId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public Favorite addFavorite(Long userId, Long movieId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long movieId) {
        // TODO: implement
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long movieId) {
        // TODO: implement
        return false;
    }
}
