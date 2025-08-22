import React, { useState } from 'react';
import axios from 'axios';

const AddAssetForm = ({ onAssetAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',          // tests expect required error when empty
    serialNumber: '',
    purchaseDate: '',
    status: '',        // tests expect required error when empty
    assignedTo: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 3 || formData.name.length > 100) {
      newErrors.name = 'Name must be 3 to 100 characters long';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    if (!formData.serialNumber) {
      newErrors.serialNumber = 'Serial number is required';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (formData.status === 'ASSIGNED' && !formData.assignedTo) {
      newErrors.assignedTo = 'Assigned To is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/assets', formData);
      if (onAssetAdded) onAssetAdded(response.data);
      setFormData({
        name: '',
        type: '',
        serialNumber: '',
        purchaseDate: '',
        status: '',
        assignedTo: ''
      });
      setErrors({});
      setSuccessMessage('Asset created successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ submit: 'Duplicate serial number' });
      } else if (error.response?.status === 400) {
        setErrors({ submit: 'Validation failed' });
      } else {
        setErrors({ submit: 'Server error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="add-asset-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          data-testid="name-input"
        />
        {errors.name && <span data-testid="name-error">{errors.name}</span>}
      </div>

      <div>
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          data-testid="type-select"
        >
          <option value="">Select Type</option>
          <option value="HARDWARE">Hardware</option>
          <option value="SOFTWARE">Software</option>
          <option value="PERIPHERAL">Peripheral</option>
        </select>
        {errors.type && <span data-testid="type-error">{errors.type}</span>}
      </div>

      <div>
        <label htmlFor="serialNumber">Serial Number</label>
        <input
          type="text"
          id="serialNumber"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          data-testid="serial-input"
        />
        {errors.serialNumber && <span data-testid="serial-error">{errors.serialNumber}</span>}
      </div>

      <div>
        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          type="date"
          id="purchaseDate"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
          data-testid="date-input"
        />
        {errors.purchaseDate && <span data-testid="date-error">{errors.purchaseDate}</span>}
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          data-testid="status-select"
        >
          <option value="">Select Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        {errors.status && <span data-testid="status-error">{errors.status}</span>}
      </div>

      <div>
        <label htmlFor="assignedTo">Assigned To (optional)</label>
        <input
          type="text"
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          data-testid="assigned-input"
        />
        {errors.assignedTo && <span data-testid="assigned-error">{errors.assignedTo}</span>}
      </div>

      <button type="submit" data-testid="submit-button" disabled={loading}>
        {loading ? 'Adding...' : 'Add Asset'}
      </button>

      {successMessage && <div>Asset created successfully</div>}
      {errors.submit && <div data-testid="submit-error">{errors.submit}</div>}
    </form>
  );
};

export default AddAssetForm;
