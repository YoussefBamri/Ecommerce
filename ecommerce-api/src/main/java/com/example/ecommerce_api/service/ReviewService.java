package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.ReviewRepository;
import com.example.ecommerce_api.entity.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    // Get all reviews
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // Get all reviews for a product
    public List<Review> getReviewsByProductId(Long productId) {
        return reviewRepository.findByIdProdOrderByCreatedAtDesc(productId);
    }

    // Get a single review by ID
    public Optional<Review> getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId);
    }

    // Create a new review
    public Review createReview(Review review) {
        // Validate rating (1-5)
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Validate comment length
        if (review.getComment() == null || review.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }

        if (review.getComment().length() > 1000) {
            throw new IllegalArgumentException("Comment cannot exceed 1000 characters");
        }

        return reviewRepository.save(review);
    }

    // Update an existing review
    public Review updateReview(Long reviewId, Review reviewDetails) {
        Optional<Review> optionalReview = reviewRepository.findById(reviewId);
        if (optionalReview.isPresent()) {
            Review review = optionalReview.get();

            // Validate rating
            if (reviewDetails.getRating() != null) {
                if (reviewDetails.getRating() < 1 || reviewDetails.getRating() > 5) {
                    throw new IllegalArgumentException("Rating must be between 1 and 5");
                }
                review.setRating(reviewDetails.getRating());
            }

            // Validate and update comment
            if (reviewDetails.getComment() != null) {
                if (reviewDetails.getComment().trim().isEmpty()) {
                    throw new IllegalArgumentException("Comment cannot be empty");
                }
                if (reviewDetails.getComment().length() > 1000) {
                    throw new IllegalArgumentException("Comment cannot exceed 1000 characters");
                }
                review.setComment(reviewDetails.getComment());
            }

            return reviewRepository.save(review);
        } else {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }
    }

    // Delete a review
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    // Get average rating for a product
    public Double getAverageRating(Long productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }

    // Get review count for a product
    public Long getReviewCount(Long productId) {
        return reviewRepository.countByIdProd(productId);
    }

    // Get recent reviews (for landing page)
    public List<Review> getRecentReviews(int limit) {
        List<Review> reviews = reviewRepository.findRecentReviews();
        return reviews.size() > limit ? reviews.subList(0, limit) : reviews;
    }
}