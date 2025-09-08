import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { SubscriptionPlan } from '../../types/api';

const RegistrationView: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    subscriptionPlan: '',
    joiningDate: '',
    address: '',
    adharNumber: '',
    seatNumber: '',
    feePaid: false,
  });
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, seatsResponse] = await Promise.all([
          adminApi.getSubscriptionPlans(),
          adminApi.getAvailableSeats(),
        ]);
        setPlans(plansResponse.data || []);
        setAvailableSeats(seatsResponse.data || ['A-01', 'A-02', 'B-01', 'B-02']);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Mock data
        setPlans([
          { _id: '1', planName: 'Monthly', duration: 30, price: 1000, description: '30 days access', isActive: true },
          { _id: '2', planName: 'Quarterly', duration: 90, price: 2700, description: '3 months access', isActive: true },
          { _id: '3', planName: 'Yearly', duration: 365, price: 9000, description: '12 months access', isActive: true },
        ]);
        setAvailableSeats(['A-01', 'A-02', 'B-01', 'B-02', 'C-01']);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.registerUser(formData);
      alert('Student registered successfully!');
      setFormData({
        fullName: '',
        age: '',
        subscriptionPlan: '',
        joiningDate: '',
        address: '',
        adharNumber: '',
        seatNumber: '',
        feePaid: false,
      });
    } catch (error) {
      console.error('Error registering student:', error);
      alert('Error registering student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register New Student</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <select
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Monthly</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan.planName}>
                      {plan.planName} - ₹{plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="adharNumber"
                  value={formData.adharNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seat Number
                </label>
                <select
                  name="seatNumber"
                  value={formData.seatNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">A-01</option>
                  {availableSeats.map((seat) => (
                    <option key={seat} value={seat}>
                      {seat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="feePaid"
                name="feePaid"
                checked={formData.feePaid}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="feePaid" className="text-sm text-gray-700">
                Fee Paid
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationView;