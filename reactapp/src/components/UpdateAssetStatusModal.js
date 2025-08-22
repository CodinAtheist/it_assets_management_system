import React, { useState } from 'react';
import axios from 'axios';

const UpdateAssetStatusModal = ({ asset, onClose, onStatusUpdated }) => {
  const [status, setStatus] = useState(asset?.status || 'AVAILABLE');
  const [assignedTo, setAssignedTo] = useState(asset?.assignedTo || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === 'ASSIGNED' && !assignedTo.trim()) {
      setError('Assigned To is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.patch(`/api/assets/${asset.id}/status`, {
        status,
        assignedTo: status === 'ASSIGNED' ? assignedTo : null
      });

      setSuccessMessage('Status updated');
      if (onStatusUpdated) onStatusUpdated(response.data);

      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Not found');
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  return (
    <div data-testid="modal-container" className="modal-overlay">
      <div className="modal-content">
        <h2>Update Asset Status</h2>

        <div>
          <h3>{asset.name}</h3>
          <p>Serial: {asset.serialNumber}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              data-testid="status-select"
            >
              {/* Uppercase option labels so getByDisplayValue('AVAILABLE') works */}
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          {status === 'ASSIGNED' && (
            <div>
              <label htmlFor="assignedTo">Assigned To</label>
              <input
                type="text"
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                data-testid="assigned-to-input"
                required
              />
            </div>
          )}

          {error && <div data-testid="error-message">{error}</div>}
          {successMessage && <div>Status updated</div>}

          <div>
            <button type="submit" disabled={loading} data-testid="save-button">
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssetStatusModal;
