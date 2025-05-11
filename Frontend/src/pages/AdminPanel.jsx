import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, Package, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminPanel = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalMembers: 0,
    totalBooks: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({
    genres: null,
    orderStatus: null,
    monthlySales: null,
    userRegistrations: null
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          staffRes,
          memberRes,
          bookRes,
          orderRes,
          genresRes,
          orderStatusRes,
          monthlySalesRes,
          userRegistrationsRes
        ] = await Promise.all([
          axios.get('http://localhost:5176/api/Admin/staffs', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/members', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/books', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/genres', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/order-status', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/monthly-sales', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/user-registrations', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Log the responses to verify data
        console.log('Genres Data:', genresRes.data);
        console.log('Order Status Data:', orderStatusRes.data);
        console.log('Monthly Sales Data:', monthlySalesRes.data);
        console.log('User Registrations Data:', userRegistrationsRes.data);

        setStats({
          totalStaff: staffRes.data.length,
          totalMembers: memberRes.data.length,
          totalBooks: bookRes.data.length,
          totalOrders: orderRes.data.length
        });

        // Process chart data
        const genreData = {
          labels: genresRes.data.map(g => g.genre),
          datasets: [{
            data: genresRes.data.map(g => g.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          }]
        };

        // Log processed chart data
        console.log('Processed Genre Data:', genreData);

        const orderStatusData = {
          labels: orderStatusRes.data.map(s => s.status),
          datasets: [{
            data: orderStatusRes.data.map(s => s.count),
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          }]
        };

        // Log processed order status data
        console.log('Processed Order Status Data:', orderStatusData);

        const monthlySalesData = {
          labels: monthlySalesRes.data.map(s => new Date(s.year, s.month - 1).toLocaleString('default', { month: 'short' })),
          datasets: [{
            label: 'Sales ($)',
            data: monthlySalesRes.data.map(s => s.total),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
        };

        // Log processed monthly sales data
        console.log('Processed Monthly Sales Data:', monthlySalesData);

        const userRegistrationData = {
          labels: userRegistrationsRes.data.Members.map(m => new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' })),
          datasets: [
            {
              label: 'New Members',
              data: userRegistrationsRes.data.Members.map(m => m.count),
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'New Staff',
              data: userRegistrationsRes.data.Staff.map(s => s.count),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              fill: true,
            }
          ]
        };

        // Log processed user registration data
        console.log('Processed User Registration Data:', userRegistrationData);

        setChartData({
          genres: genreData,
          orderStatus: orderStatusData,
          monthlySales: monthlySalesData,
          userRegistrations: userRegistrationData
        });

        setError('');
    } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Welcome to your bookstore management dashboard</p>
            </div>

            {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700 font-medium shadow-sm animate-fade-in">
                {error}
              </div>
            )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalStaff}</div>
            <div className="text-gray-500 font-medium">Total Staff</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-indigo-50 p-3 rounded-full mb-4">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalMembers}</div>
            <div className="text-gray-500 font-medium">Total Members</div>
                  </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-green-50 p-3 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
                      </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBooks}</div>
            <div className="text-gray-500 font-medium">Total Books</div>
                  </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-purple-50 p-3 rounded-full mb-4">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
            <div className="text-gray-500 font-medium">Total Orders</div>
        </div>
      </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Genres Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Book Genres Distribution</h2>
              <div className="bg-indigo-50 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
            <div className="h-80">
              {chartData.genres && <Pie data={chartData.genres} options={chartOptions} />}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order Status Distribution</h2>
              <div className="bg-green-50 p-2 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
            <div className="h-80">
              {chartData.orderStatus && <Doughnut data={chartData.orderStatus} options={chartOptions} />}
            </div>
          </div>

          {/* Monthly Sales */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Monthly Sales</h2>
              <div className="bg-blue-50 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
            <div className="h-80">
              {chartData.monthlySales && <Bar data={chartData.monthlySales} options={chartOptions} />}
            </div>
          </div>

          {/* User Registration Trends */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Registration Trends</h2>
              <div className="bg-purple-50 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
            <div className="h-80">
              {chartData.userRegistrations && <Line data={chartData.userRegistrations} options={lineChartOptions} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;