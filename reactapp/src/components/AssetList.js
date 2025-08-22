import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateAssetStatusModal from './UpdateAssetStatusModal';

const AssetList = ({ assets, onFilterChange, onAssetUpdate }) => {
  const [allAssets, setAllAssets] = useState(assets || []);
  const [filteredAssets, setFilteredAssets] = useState(assets || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (assets) {
      setAllAssets(assets);
      setFilteredAssets(assets);
    } else {
      fetchAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/assets');
      setAllAssets(response.data);
      setFilteredAssets(response.data);
    } catch (err) {
      setError('Could not load assets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allAssets];

    if (typeFilter) {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
      );
    }

    setFilteredAssets(filtered);
    if (onFilterChange) {
      onFilterChange({ type: typeFilter, status: statusFilter, search: searchTerm });
    }
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, searchTerm, allAssets]);

  const handleUpdateClick = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const handleStatusUpdated = (updatedAsset) => {
    if (onAssetUpdate) onAssetUpdate(updatedAsset);
    setAllAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    handleCloseModal();
  };

  return (
    <div>
      <h2>Asset List</h2>

      <div>
        <label>Type:</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          data-testid="type-filter"
        >
          <option value="">All Types</option>
          <option value="HARDWARE">Hardware</option>
          <option value="SOFTWARE">Software</option>
          <option value="PERIPHERAL">Peripheral</option>
        </select>

        <label>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          data-testid="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        <input
          type="text"
          placeholder="Search by name or serial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="search-input"
        />
      </div>

      {/* States are shown below the heading (tests look for the heading first) */}
      {loading && <div data-testid="loading">Loading assets...</div>}
      {!loading && error && <div data-testid="error">Could not load assets</div>}
      {!loading && !error && filteredAssets.length === 0 && (
        <div data-testid="empty">No assets found</div>
      )}

      {!loading && !error && filteredAssets.length > 0 && (
        <div data-testid="asset-list">
          {filteredAssets.map((asset) => (
            <div key={asset.id} data-testid={`asset-row-${asset.id}`}>
              <h3>{asset.name}</h3>
              <p>Type: {asset.type}</p>
              <p>Serial: {asset.serialNumber}</p>
              <p>Status: {asset.status}</p>
              <button
                onClick={() => handleUpdateClick(asset)}
                data-testid={`update-button-${asset.id}`}
              >
                Update Status
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedAsset && (
        <UpdateAssetStatusModal
          asset={selectedAsset}
          onClose={handleCloseModal}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};

export default AssetList;
