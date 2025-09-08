import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { SeatManagement, Seat } from '../../types/api';

const SeatsView: React.FC = () => {
  const [seatData, setSeatData] = useState<SeatManagement>({
    totalSeats: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    maintenanceSeats: 0,
    seats: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        const response = await adminApi.getSeatManagement();
        setSeatData(response.data || {});
      } catch (error) {
        console.error('Error fetching seat data:', error);
        // Mock data for demonstration
        setSeatData({
          totalSeats: 120,
          occupiedSeats: 89,
          availableSeats: 31,
          maintenanceSeats: 0,
          seats: [
            {
              seatNumber: '001',
              studentName: 'Rahul Sharma',
              subscriptionPlan: 'Monthly',
              allocatedDate: '2025-01-15',
              expiryDate: '2025-02-15',
              status: 'Occupied',
            },
            {
              seatNumber: '002',
              status: 'Available',
            },
            {
              seatNumber: '003',
              studentName: 'Priya Singh',
              subscriptionPlan: 'Yearly',
              allocatedDate: '2025-03-01',
              expiryDate: '2026-03-01',
              status: 'Occupied',
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeatData();
  }, []);

  const generateSeatGrid = () => {
    const seats = [];
    for (let i = 1; i <= 30; i++) {
      const seatNumber = i.toString().padStart(2, '0');
      const isOccupied = Math.random() > 0.3; // Random occupation for demo
      const isAvailable = !isOccupied && Math.random() > 0.1;
      const isMaintenance = !isOccupied && !isAvailable;
      
      seats.push({
        number: seatNumber,
        status: isOccupied ? 'Occupied' : isAvailable ? 'Available' : 'Maintenance',
      });
    }
    return seats;
  };

  const seatGrid = generateSeatGrid();

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'Occupied': return 'bg-slate-600 text-white';
      case 'Available': return 'bg-blue-500 text-white';
      case 'Maintenance': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Occupied': return 'bg-red-100 text-red-800';
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seat Management</h1>
          <p className="text-gray-600">NaiUdaan Library</p>
        </div>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Allocate Seat</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Seats</p>
              <p className="text-2xl font-bold text-gray-900">{seatData.totalSeats}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <span className="text-2xl">🪑</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{seatData.occupiedSeats}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{seatData.availableSeats}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{seatData.maintenanceSeats}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by seat number or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Floors</option>
            <option>Ground Floor</option>
            <option>First Floor</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Status</option>
            <option>Occupied</option>
            <option>Available</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ground Floor Layout</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-600 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span>Maintenance</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {seatGrid.map((seat) => (
            <button
              key={seat.number}
              className={`w-12 h-12 rounded-lg font-medium text-sm transition-colors hover:opacity-80 ${getSeatColor(seat.status)}`}
            >
              {seat.number}
            </button>
          ))}
        </div>
      </div>

      {/* Seat Allocations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Seat Allocations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seatData.seats.map((seat, index) => (
                <tr key={seat.seatNumber || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {seat.seatNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {seat.studentName ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {seat.studentName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{seat.studentName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seat.subscriptionPlan || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seat.allocatedDate ? new Date(seat.allocatedDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {seat.expiryDate ? new Date(seat.expiryDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(seat.status)}`}>
                      {seat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {seat.status === 'Available' ? (
                        <button className="bg-slate-800 text-white px-3 py-1 rounded text-xs hover:bg-slate-700">
                          Allocate
                        </button>
                      ) : (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to 3 of 120 seats
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-slate-800 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatsView;