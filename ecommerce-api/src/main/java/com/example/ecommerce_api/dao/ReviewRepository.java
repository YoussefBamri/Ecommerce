package com.example.ecommerce_api.dao;

import com.example.ecommerce_api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Find all reviews for a specific product
    List<Review> findByIdProdOrderByCreatedAtDesc(Long idProd);

    // Find reviews by rating
    List<Review> findByIdProdAndRating(Long idProd, Integer rating);

    // Get average rating for a product
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.idProd = :idProd")
    Double getAverageRatingByProductId(@Param("idProd") Long idProd);

    // Count reviews for a product
    Long countByIdProd(Long idProd);

    // Get recent reviews across all products (for landing page)
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews();
}