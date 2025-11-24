package com.example.ecommerce_api.service;

import com.example.ecommerce_api.dao.TestimonialRepository;
import com.example.ecommerce_api.entity.Testimonial;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestimonialService {

    @Autowired
    private TestimonialRepository testimonialRepository;

    // Get all approved testimonials
    public List<Testimonial> getApprovedTestimonials() {
        return testimonialRepository.findApprovedTestimonialsOrderByCreatedAtDesc();
    }

    // Get all testimonials (for admin)
    public List<Testimonial> getAllTestimonials() {
        return testimonialRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get pending testimonials (for admin approval)
    public List<Testimonial> getPendingTestimonials() {
        return testimonialRepository.findByIsApprovedFalse();
    }

    // Get a single testimonial by ID
    public Optional<Testimonial> getTestimonialById(Long testimonialId) {
        return testimonialRepository.findById(testimonialId);
    }

    // Create a new testimonial (pending approval)
    public Testimonial createTestimonial(Testimonial testimonial) {
        // Validate rating (1-5)
        if (testimonial.getRating() < 1 || testimonial.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Validate comment length
        if (testimonial.getComment() == null || testimonial.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }

        if (testimonial.getComment().length() > 500) {
            throw new IllegalArgumentException("Comment cannot exceed 500 characters");
        }

        // Set default values
        testimonial.setIsApproved(false); // Requires admin approval

        return testimonialRepository.save(testimonial);
    }

    // Update testimonial (admin only)
    public Testimonial updateTestimonial(Long testimonialId, Testimonial testimonialDetails) {
        Optional<Testimonial> optionalTestimonial = testimonialRepository.findById(testimonialId);
        if (optionalTestimonial.isPresent()) {
            Testimonial testimonial = optionalTestimonial.get();

            // Update fields
            if (testimonialDetails.getAuthorName() != null) {
                testimonial.setAuthorName(testimonialDetails.getAuthorName());
            }
            if (testimonialDetails.getRating() != null) {
                if (testimonialDetails.getRating() < 1 || testimonialDetails.getRating() > 5) {
                    throw new IllegalArgumentException("Rating must be between 1 and 5");
                }
                testimonial.setRating(testimonialDetails.getRating());
            }
            if (testimonialDetails.getComment() != null) {
                if (testimonialDetails.getComment().trim().isEmpty()) {
                    throw new IllegalArgumentException("Comment cannot be empty");
                }
                if (testimonialDetails.getComment().length() > 500) {
                    throw new IllegalArgumentException("Comment cannot exceed 500 characters");
                }
                testimonial.setComment(testimonialDetails.getComment());
            }
            if (testimonialDetails.getAuthorRole() != null) {
                testimonial.setAuthorRole(testimonialDetails.getAuthorRole());
            }
            if (testimonialDetails.getIsApproved() != null) {
                testimonial.setIsApproved(testimonialDetails.getIsApproved());
            }

            return testimonialRepository.save(testimonial);
        } else {
            throw new RuntimeException("Testimonial not found with id: " + testimonialId);
        }
    }

    // Approve testimonial (admin only)
    public Testimonial approveTestimonial(Long testimonialId) {
        Optional<Testimonial> optionalTestimonial = testimonialRepository.findById(testimonialId);
        if (optionalTestimonial.isPresent()) {
            Testimonial testimonial = optionalTestimonial.get();
            testimonial.setIsApproved(true);
            return testimonialRepository.save(testimonial);
        } else {
            throw new RuntimeException("Testimonial not found with id: " + testimonialId);
        }
    }

    // Delete testimonial
    public void deleteTestimonial(Long testimonialId) {
        testimonialRepository.deleteById(testimonialId);
    }

    // Get testimonial count
    public Long getApprovedTestimonialCount() {
        return testimonialRepository.countByIsApprovedTrue();
    }
}