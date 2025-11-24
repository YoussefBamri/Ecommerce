package com.example.ecommerce_api.dao;

import com.example.ecommerce_api.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {

    // Find all approved testimonials
    List<Testimonial> findByIsApprovedTrue();

    // Find all testimonials (for admin)
    List<Testimonial> findAllByOrderByCreatedAtDesc();

    // Find pending testimonials (not approved)
    List<Testimonial> findByIsApprovedFalse();

    // Get approved testimonials ordered by creation date (newest first)
    @Query("SELECT t FROM Testimonial t WHERE t.isApproved = true ORDER BY t.createdAt DESC")
    List<Testimonial> findApprovedTestimonialsOrderByCreatedAtDesc();

    // Count approved testimonials
    Long countByIsApprovedTrue();
}