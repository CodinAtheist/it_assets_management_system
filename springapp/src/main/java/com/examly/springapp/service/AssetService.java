package com.examly.springapp.service;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.AssetRepository;
import com.examly.springapp.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    public Asset createAsset(Asset asset) {
        // Validate serial uniqueness
        if (assetRepository.findBySerialNumber(asset.getSerialNumber()).isPresent()) {
            throw new DuplicateAssetException("Serial number already exists");
        }
        // Save asset
        return assetRepository.save(asset);
    }

    public List<Asset> getAllAssets(String type, String status, String search) {
        // Filtering
        if (type != null && status != null) {
            try {
                AssetType assetType = AssetType.valueOf(type.toUpperCase());
                AssetStatus assetStatus = AssetStatus.valueOf(status.toUpperCase());
                return assetRepository.findByTypeAndStatus(assetType, assetStatus);
            } catch (IllegalArgumentException e) {
                return new ArrayList<>();
            }
        } else if (type != null) {
            try {
                AssetType assetType = AssetType.valueOf(type.toUpperCase());
                return assetRepository.findByType(assetType);
            } catch (IllegalArgumentException e) {
                return new ArrayList<>();
            }
        } else if (status != null) {
            try {
                AssetStatus assetStatus = AssetStatus.valueOf(status.toUpperCase());
                return assetRepository.findByStatus(assetStatus);
            } catch (IllegalArgumentException e) {
                return new ArrayList<>();
            }
        } else if (search != null && !search.isEmpty()) {
            return assetRepository.findByNameContainingIgnoreCaseOrSerialNumberContainingIgnoreCase(search, search);
        }
        return assetRepository.findAll();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    }

    @Transactional
    public Asset updateAssetStatus(Long id, String statusStr, String assignedTo) {
        Asset asset = getAssetById(id);
        AssetStatus newStatus;
        try {
            newStatus = AssetStatus.valueOf(statusStr.toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid status value");
        }
        if (newStatus == AssetStatus.ASSIGNED && (assignedTo == null || assignedTo.trim().isEmpty())) {
            throw new IllegalArgumentException("assignedTo required when status is ASSIGNED");
        }
        asset.setStatus(newStatus);
        if (newStatus == AssetStatus.ASSIGNED) {
            asset.setAssignedTo(assignedTo);
        } else {
            asset.setAssignedTo(null);
        }
        return assetRepository.save(asset);
    }
}
