package com.examly.springapp.controller;

import com.examly.springapp.model.Asset;
import com.examly.springapp.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    // 1. Create Asset
    @PostMapping
    public ResponseEntity<?> createAsset(@Valid @RequestBody Asset asset) {
        Asset createdAsset = assetService.createAsset(asset);
        return new ResponseEntity<>(createdAsset, HttpStatus.CREATED);
    }

    // 2. Get All Assets with filtering/search
    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        List<Asset> assets = assetService.getAllAssets(type, status, search);
        return ResponseEntity.ok(assets);
    }

    // 3. Update asset status (PATCH)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAssetStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body // expects { "status": "...", "assignedTo": "..." }
    ) {
        if (!body.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        String status = body.get("status");
        String assignedTo = body.get("assignedTo");
        Asset updated = assetService.updateAssetStatus(id, status, assignedTo);
        return ResponseEntity.ok(updated);
    }
}
