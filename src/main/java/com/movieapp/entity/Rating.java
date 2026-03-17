package com.movieapp.entity;

import com.movieapp.entity.key.RatingId;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @EmbeddedId
    private RatingId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("movieId")
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TINYINT")
    private Byte score; // 1-5

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
