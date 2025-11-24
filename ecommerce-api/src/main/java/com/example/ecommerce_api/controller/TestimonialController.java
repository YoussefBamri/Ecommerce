package com.example.ecommerce_api.controller;

import com.example.ecommerce_api.entity.Testimonial;
import com.example.ecommerce_api.service.TestimonialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/testimonials")
@CrossOrigin(origins = "*")
public class TestimonialController {

    @Autowired
    private TestimonialService testimonialService;

    // Get all approved testimonials (for public display)
    @GetMapping("/approved")
    public ResponseEntity<List<Testimonial>> getApprovedTestimonials() {
        List<Testimonial> testimonials = testimonialService.getApprovedTestimonials();
        return ResponseEntity.ok(testimonials);
    }

    // Get all testimonials (admin only)
    @GetMapping
    public ResponseEntity<List<Testimonial>> getAllTestimonials() {
        List<Testimonial> testimonials = testimonialService.getAllTestimonials();
        return ResponseEntity.ok(testimonials);
    }

    // Get pending testimonials (admin only)
    @GetMapping("/pending")
    public ResponseEntity<List<Testimonial>> getPendingTestimonials() {
        List<Testimonial> testimonials = testimonialService.getPendingTestimonials();
        return ResponseEntity.ok(testimonials);
    }

    // Get a single testimonial by ID
    @GetMapping("/{testimonialId}")
    public ResponseEntity<Testimonial> getTestimonialById(@PathVariable Long testimonialId) {
        Optional<Testimonial> testimonial = testimonialService.getTestimonialById(testimonialId);
        return testimonial.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // Create a new testimonial (user submission - pending approval)
    @PostMapping
    public ResponseEntity<?> createTestimonial(@RequestBody Testimonial testimonial) {
        try {
            Testimonial createdTestimonial = testimonialService.createTestimonial(testimonial);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Votre avis a été soumis et sera publié après validation par notre équipe.");
            response.put("testimonialId", createdTestimonial.getId().toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update testimonial (admin only)
    @PutMapping("/{testimonialId}")
    public ResponseEntity<?> updateTestimonial(@PathVariable Long testimonialId, @RequestBody Testimonial testimonialDetails) {
        try {
            Testimonial updatedTestimonial = testimonialService.updateTestimonial(testimonialId, testimonialDetails);
            return ResponseEntity.ok(updatedTestimonial);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Approve testimonial (admin only)
    @PutMapping("/{testimonialId}/approve")
    public ResponseEntity<?> approveTestimonial(@PathVariable Long testimonialId) {
        try {
            Testimonial approvedTestimonial = testimonialService.approveTestimonial(testimonialId);
            return ResponseEntity.ok(approvedTestimonial);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Delete testimonial
    @DeleteMapping("/{testimonialId}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable Long testimonialId) {
        testimonialService.deleteTestimonial(testimonialId);
        return ResponseEntity.noContent().build();
    }

    // Get testimonial statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTestimonialStats() {
        Long approvedCount = testimonialService.getApprovedTestimonialCount();
        Long pendingCount = (long) testimonialService.getPendingTestimonials().size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("approvedCount", approvedCount);
        stats.put("pendingCount", pendingCount);
        stats.put("totalCount", approvedCount + pendingCount);

        return ResponseEntity.ok(stats);
    }
}