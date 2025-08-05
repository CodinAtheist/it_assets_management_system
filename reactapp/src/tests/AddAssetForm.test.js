import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddAssetForm from '../components/AddAssetForm';
import axios from 'axios';

jest.mock('axios');

describe('AddAssetForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders all form fields for Add Asset', () => {
    render(<AddAssetForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Serial Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Purchase Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Assigned To (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });
  it('validates form input and shows error messages', async () => {
    render(<AddAssetForm />);
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(await screen.findByText(/Name must be 3 to 100 characters long/i)).toBeInTheDocument();
    expect(screen.getByText(/Type is required/)).toBeInTheDocument();
    expect(screen.getByText(/Serial number is required/)).toBeInTheDocument();
    expect(screen.getByText(/Purchase date is required/)).toBeInTheDocument();
    expect(screen.getByText(/Status is required/)).toBeInTheDocument();
  });
  it('handles successful asset creation', async () => {
    axios.post.mockResolvedValue({ data: { id: 99 } });
    const onAssetAdded = jest.fn();
    render(<AddAssetForm onAssetAdded={onAssetAdded} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Laptop X' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'HARDWARE' } });
    fireEvent.change(screen.getByLabelText('Serial Number'), { target: { value: 'SNX' } });
    fireEvent.change(screen.getByLabelText('Purchase Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Status'), {target: { value: 'AVAILABLE' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    await screen.findByText(/Asset created successfully/);
    expect(onAssetAdded).toHaveBeenCalled();
  });
  it('shows server validation errors and handles serial number conflict', async () => {
    render(<AddAssetForm />);
    axios.post.mockRejectedValueOnce({ response: { data: { errors: { name: 'Too short' }, message: 'Validation failed' }, status: 400 } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'X' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    await screen.findByText(/Validation failed/);
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Duplicate serial number' }, status: 409 } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Laptop Valid' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    await screen.findByText(/Duplicate serial number/);
  });
});
