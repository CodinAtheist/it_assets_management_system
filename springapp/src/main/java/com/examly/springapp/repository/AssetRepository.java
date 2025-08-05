package com.examly.springapp.repository;

import com.examly.springapp.model.Asset;
import com.examly.springapp.model.AssetStatus;
import com.examly.springapp.model.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySerialNumber(String serialNumber);

    List<Asset> findByTypeAndStatus(AssetType type, AssetStatus status);

    List<Asset> findByType(AssetType type);

    List<Asset> findByStatus(AssetStatus status);

    List<Asset> findByNameContainingIgnoreCaseOrSerialNumberContainingIgnoreCase(String name, String serialNumber);
}
