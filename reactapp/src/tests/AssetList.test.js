import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetList from '../components/AssetList';
import axios from 'axios';

jest.mock('axios');

const mockAssets = [
  {
    id: 1,
    name: 'Dell Latitude 5420',
    type: 'HARDWARE',
    serialNumber: 'DL5420-2023-001',
    purchaseDate: '2023-01-15',
    assignedTo: null,
    status: 'AVAILABLE',
  },
  {
    id: 2,
    name: 'Microsoft Office 365',
    type: 'SOFTWARE',
    serialNumber: 'MS365-2023-001',
    purchaseDate: '2023-02-10',
    assignedTo: 'John Doe',
    status: 'ASSIGNED',
  },
];

describe('AssetList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Asset List Component and shows assets', async () => {
    axios.get.mockResolvedValueOnce({ data: mockAssets });
    render(<AssetList />);
    expect(screen.getByText(/Asset List/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Dell Latitude 5420')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 365')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('asset-row-1')).toHaveTextContent('AVAILABLE');
    });
    await waitFor(() => {
      expect(screen.getByTestId('asset-row-2')).toHaveTextContent('ASSIGNED');
    });
  });

  it('filters assets by type and status', async () => {
    axios.get.mockResolvedValue({ data: mockAssets });
    render(<AssetList />);
    await waitFor(() => screen.getByText('Dell Latitude 5420'));
    fireEvent.change(screen.getByTestId('type-filter'), { target: { value: 'SOFTWARE' } });
    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 365')).toBeInTheDocument();
    });
  });

  it('filters assets by search (name/serialNumber)', async () => {
    axios.get.mockResolvedValue({ data: mockAssets });
    render(<AssetList />);
    await waitFor(() => screen.getByText('Dell Latitude 5420'));
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'DL5420' } });
    expect(screen.getByText('Dell Latitude 5420')).toBeInTheDocument();
    expect(screen.queryByText('Microsoft Office 365')).not.toBeInTheDocument();
  });

  it('shows loading, error, and empty state', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    render(<AssetList />);
    expect(screen.getByText(/Loading assets/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Could not load assets/i)).toBeInTheDocument();
    });
    // once loaded and no data
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<AssetList />);
    await waitFor(() => {
      expect(screen.getByText(/No assets found/i)).toBeInTheDocument();
    });
  });

  it('can open Update Status modal via button', async () => {
    axios.get.mockResolvedValue({ data: mockAssets });
    render(<AssetList />);
    await waitFor(() => screen.getByText('Dell Latitude 5420'));
    const updateBtn = screen.getByTestId('update-button-1');
    fireEvent.click(updateBtn);
    await waitFor(() => {
      expect(screen.getByTestId('modal-container')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Update Asset Status/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('AVAILABLE')).toBeInTheDocument();
    });
  });
});
