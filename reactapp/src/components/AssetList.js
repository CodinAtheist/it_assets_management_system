import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UpdateAssetStatusModal from './UpdateAssetStatusModal';
import './AssetList.css';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/assets?${params}`);
      setAssets(response.data);
      setError('');
    } catch (err) {
      setError('Could not load assets');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleUpdateStatus = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleStatusUpdate = async (assetId, status, assignedTo) => {
    try {
      const response = await axios.patch(`/api/assets/${assetId}/status`, {
        status,
        assignedTo
      });
      
      // Update the asset in the local state
      setAssets(prev => prev.map(asset => 
        asset.id === assetId ? response.data : asset
      ));
      
      setShowModal(false);
      setSelectedAsset(null);
    } catch (err) {
      console.error('Error updating asset status:', err);
      alert('Failed to update asset status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'status-available';
      case 'ASSIGNED': return 'status-assigned';
      case 'UNDER_MAINTENANCE': return 'status-maintenance';
      case 'RETIRED': return 'status-retired';
      default: return '';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'HARDWARE': return 'type-hardware';
      case 'SOFTWARE': return 'type-software';
      case 'PERIPHERAL': return 'type-peripheral';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="alert alert-info">Loading assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchAssets}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="actions">
        <Link to="/add" className="btn btn-success">
          Add New Asset
        </Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            data-testid="type-filter"
          >
            <option value="">All Types</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="PERIPHERAL">Peripheral</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name or serial number"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            data-testid="search-input"
          />
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="alert alert-info">No assets found</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <th>Purchase Date</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} data-testid={`asset-row-${asset.id}`}>
                <td>{asset.name}</td>
                <td>
                  <span className={`type-badge ${getTypeBadgeClass(asset.type)}`}>
                    {asset.type}
                  </span>
                </td>
                <td>{asset.serialNumber}</td>
                <td>{formatDate(asset.purchaseDate)}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.assignedTo || '-'}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleUpdateStatus(asset)}
                    data-testid={`update-button-${asset.id}`}
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedAsset && (
        <UpdateAssetStatusModal
          asset={selectedAsset}
          onClose={() => {
            setShowModal(false);
            setSelectedAsset(null);
          }}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default AssetList;
