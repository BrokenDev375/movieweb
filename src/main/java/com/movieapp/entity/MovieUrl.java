package com.movieapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movie_urls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieUrl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    private Integer episode;

    @Column(length = 500)
    private String url;
}
