import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddAssetForm.css';

const AddAssetForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'HARDWARE',
    serialNumber: '',
    purchaseDate: '',
    status: 'AVAILABLE',
    assignedTo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

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
    setSubmitMessage('');

    try {
      const response = await axios.post('/api/assets', formData);
      
      if (response.status === 201) {
        setSubmitMessage('Asset created successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ serialNumber: 'Serial number already exists' });
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setSubmitMessage('Error creating asset. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <h2>Add New Asset</h2>
      
      {submitMessage && (
        <div className={`alert ${submitMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Asset Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter asset name"
          />
          {errors.name && <div className="alert alert-danger">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Asset Type *</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="PERIPHERAL">Peripheral</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number *</label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            className={`form-control ${errors.serialNumber ? 'is-invalid' : ''}`}
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="Enter serial number"
          />
          {errors.serialNumber && <div className="alert alert-danger">{errors.serialNumber}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="purchaseDate">Purchase Date *</label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            className={`form-control ${errors.purchaseDate ? 'is-invalid' : ''}`}
            value={formData.purchaseDate}
            onChange={handleChange}
          />
          {errors.purchaseDate && <div className="alert alert-danger">{errors.purchaseDate}</div>}
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
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetForm;
