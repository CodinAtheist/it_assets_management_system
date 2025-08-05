package com.examly.springapp.controller;

import com.examly.springapp.model.Asset;
import com.examly.springapp.model.AssetStatus;
import com.examly.springapp.model.AssetType;
import com.examly.springapp.repository.AssetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AssetControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Asset testAsset;

    @BeforeEach
    void init() {
        assetRepository.deleteAll();
        testAsset = new Asset();
        testAsset.setName("Dell Latitude 5420");
        testAsset.setType(AssetType.HARDWARE);
        testAsset.setSerialNumber("DL5420-2023-001");
        testAsset.setPurchaseDate(LocalDate.of(2023, 1, 15));
        testAsset.setStatus(AssetStatus.AVAILABLE);
        testAsset.setAssignedTo(null);
        assetRepository.save(testAsset);
    }

    @Test
    void testCreateAssetSuccess() throws Exception {
        Asset asset = new Asset();
        asset.setName("Microsoft Office 365");
        asset.setType(AssetType.SOFTWARE);
        asset.setSerialNumber("MS365-2023-001");
        asset.setPurchaseDate(LocalDate.of(2023, 2, 10));
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setAssignedTo("John Doe");

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Microsoft Office 365"))
                .andExpect(jsonPath("$.serialNumber").value("MS365-2023-001"))
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedTo").value("John Doe"));
    }

    @Test
    void testCreateAssetValidationFailure() throws Exception {
        Asset asset = new Asset();
        asset.setName("PC");
        asset.setType(AssetType.HARDWARE);
        asset.setSerialNumber(null);
        asset.setPurchaseDate(LocalDate.of(2023, 1, 15));
        asset.setStatus(AssetStatus.AVAILABLE);

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.errors.name").value("Name must be 3 to 100 characters long"))
                .andExpect(jsonPath("$.errors.serialNumber").value("Serial number is required"));
    }

    @Test
    void testCreateAssetSerialConflict() throws Exception {
        Asset asset = new Asset();
        asset.setName("Duplicate SN");
        asset.setType(AssetType.HARDWARE);
        asset.setSerialNumber("DL5420-2023-001");
        asset.setPurchaseDate(LocalDate.of(2024, 1, 2));
        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setAssignedTo(null);

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Asset with the same serial number")));
    }

    @Test
    void testGetAllAssetsWithFiltering() throws Exception {
        Asset asset2 = new Asset();
        asset2.setName("HP Mouse");
        asset2.setType(AssetType.PERIPHERAL);
        asset2.setSerialNumber("HP2023-001");
        asset2.setPurchaseDate(LocalDate.of(2023, 3, 10));
        asset2.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset2);

        Asset asset3 = new Asset();
        asset3.setName("Office 365 E3");
        asset3.setType(AssetType.SOFTWARE);
        asset3.setSerialNumber("MSO365E3-2023-0001");
        asset3.setPurchaseDate(LocalDate.of(2023, 6, 7));
        asset3.setStatus(AssetStatus.ASSIGNED);
        asset3.setAssignedTo("Jane Smith");
        assetRepository.save(asset3);

        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        mockMvc.perform(get("/api/assets?type=PERIPHERAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("HP Mouse"));

        mockMvc.perform(get("/api/assets?status=ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Office 365 E3"));
    }

    @Test
    void testUpdateAssetStatus() throws Exception {
        Long id = testAsset.getId();
        Map<String, Object> payload = Map.of("status", "ASSIGNED", "assignedTo", "Jane Smith");

        mockMvc.perform(patch("/api/assets/" + id + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedTo").value("Jane Smith"));
    }

    @Test
    void testUpdateAssetStatusNotFound() throws Exception {
        Map<String, Object> payload = Map.of("status", "AVAILABLE");

        mockMvc.perform(patch("/api/assets/999999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Asset not found"));
    }

    @Test
    void testGetAssetByIdSuccess() throws Exception {
        mockMvc.perform(get("/api/assets/" + testAsset.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testAsset.getName()));
    }

    @Test
    void testGetAssetByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/assets/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Asset not found"));
    }

    @Test
    void testDeleteAssetByIdSuccess() throws Exception {
        mockMvc.perform(delete("/api/assets/" + testAsset.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void testDeleteAssetByIdNotFound() throws Exception {
        mockMvc.perform(delete("/api/assets/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Asset not found"));
    }

    @Test
    void testCreateAssetWithEmptyName() throws Exception {
        Asset asset = new Asset();
        asset.setName("");
        asset.setType(AssetType.HARDWARE);
        asset.setSerialNumber("TEST-001");
        asset.setPurchaseDate(LocalDate.of(2023, 5, 5));
        asset.setStatus(AssetStatus.AVAILABLE);

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void testSearchAssetByPartialName() throws Exception {
        Asset asset = new Asset();
        asset.setName("HP ProBook");
        asset.setType(AssetType.HARDWARE);
        asset.setSerialNumber("HP-1234");
        asset.setPurchaseDate(LocalDate.of(2022, 5, 5));
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        mockMvc.perform(get("/api/assets?search=probook"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", containsStringIgnoringCase("probook")));
    }

    @Test
    void testCreateAssetWithLongName() throws Exception {
        Asset asset = new Asset();
        asset.setName("A".repeat(101));
        asset.setType(AssetType.SOFTWARE);
        asset.setSerialNumber("LONG-NAME-001");
        asset.setPurchaseDate(LocalDate.of(2023, 5, 5));
        asset.setStatus(AssetStatus.AVAILABLE);

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void testUpdateAssetStatusInvalidEnum() throws Exception {
        Map<String, Object> payload = Map.of("status", "BROKEN");

        mockMvc.perform(patch("/api/assets/" + testAsset.getId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPatchAssetWithInvalidPayload() throws Exception {
        mockMvc.perform(patch("/api/assets/" + testAsset.getId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ invalid json }"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateAssetWithoutAssignedToWhenAssigned() throws Exception {
        Asset asset = new Asset();
        asset.setName("Visual Studio");
        asset.setType(AssetType.SOFTWARE);
        asset.setSerialNumber("VS2023-001");
        asset.setPurchaseDate(LocalDate.of(2023, 3, 1));
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setAssignedTo(null);

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.assignedTo").exists());
    }
}
