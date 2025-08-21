import React, { useState, useEffect } from 'react';
import './UpdateAssetStatusModal.css';

const UpdateAssetStatusModal = ({ asset, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: asset.status,
    assignedTo: asset.assignedTo || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      status: asset.status,
      assignedTo: asset.assignedTo || ''
    });
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.status === 'ASSIGNED' && !formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required when status is ASSIGNED';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onUpdate(asset.id, formData.status, formData.assignedTo);
    } catch (error) {
      console.error('Error updating asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="modal" data-testid="modal-container">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Update Asset Status</h3>
          <button 
            type="button" 
            className="close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="assetName">Asset Name</label>
            <input
              type="text"
              id="assetName"
              className="form-control"
              value={asset.name}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="assetType">Asset Type</label>
            <input
              type="text"
              id="assetType"
              className="form-control"
              value={asset.type}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <input
              type="text"
              id="assignedTo"
              name="assignedTo"
              className={`form-control ${errors.assignedTo ? 'is-invalid' : ''}`}
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="Enter assigned person name"
              disabled={formData.status !== 'ASSIGNED'}
            />
            {errors.assignedTo && <div className="alert alert-danger">{errors.assignedTo}</div>}
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssetStatusModal;
