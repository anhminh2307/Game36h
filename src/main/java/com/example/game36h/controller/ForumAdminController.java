package com.example.game36h.controller;

import com.example.game36h.dto.ForumReportResponse;
import com.example.game36h.service.ForumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/forum")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ForumAdminController {

    @Autowired
    private ForumService forumService;
    
    @PutMapping("/posts/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resolvePostReport(@PathVariable Long id) {
        forumService.resolvePostReport(id);
        return ResponseEntity.noContent().build();
    }   
}
