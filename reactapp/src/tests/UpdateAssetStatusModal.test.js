import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateAssetStatusModal from '../components/UpdateAssetStatusModal';
import axios from 'axios';

jest.mock('axios');

const asset = {
  id: 11,
  name: 'Asset X',
  type: 'HARDWARE',
  serialNumber: 'SN-X',
  purchaseDate: '2023-10-10',
  assignedTo: '',
  status: 'AVAILABLE',
};

describe('UpdateAssetStatusModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders current asset info and allows status change', async () => {
    render(<UpdateAssetStatusModal asset={asset} onClose={jest.fn()} />);
    expect(screen.getByText('Asset X')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'ASSIGNED' } });
    fireEvent.change(screen.getByLabelText('Assigned To'), { target: { value: 'Jane Doe' } });
    axios.patch.mockResolvedValueOnce({ data: { ...asset, status: 'ASSIGNED', assignedTo: 'Jane Doe' } });
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText(/Status updated/);
  });

  it('validates assignedTo required when status is ASSIGNED', async () => {
    render(<UpdateAssetStatusModal asset={asset} onClose={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'ASSIGNED' } });
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText(/Assigned To is required/);
  });
  it('handles server error', async () => {
    axios.patch.mockRejectedValueOnce({ response: { data: { message: 'Not found' }, status: 404 } });
    render(<UpdateAssetStatusModal asset={asset} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText(/Not found/);
  });
});
