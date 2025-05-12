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
import { LineChart, PieChart, Cell, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    totalBooks: 0,
    totalMembers: 0,
    totalOrders: 0,
    fulfilledOrders: 0,
    cancelledOrders: 0,
    totalSales: 0,
    outOfStock: 0,
    onSale: 0,
    pendingOrders: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [ordersStatusData, setOrdersStatusData] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [newMembersData, setNewMembersData] = useState([]);

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
        // Fetch all data in parallel
        const [
          bookRes,
          orderSummaryRes,
          genresRes,
          orderStatusRes,
          monthlySalesRes,
          newMembersRes,
          topBestsellersRes,
          totalSalesRes
        ] = await Promise.all([
          axios.get('http://localhost:5176/api/books', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/order-summary', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/genres', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/order-status', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/monthly-sales', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/new-members', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/top-bestsellers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/total-sales', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Metrics from books
        const books = bookRes.data || [];
        const onSale = books.filter(b => b.isOnSale).length;
        const outOfStock = books.filter(b => b.stockQuantity <= 5).length;

        // Order summary from new endpoint
        const { totalOrders, fulfilledOrders, cancelledOrders } = orderSummaryRes.data;
        const { totalSales } = totalSalesRes.data;

        // Set all metrics
        setMetrics({
          totalBooks: books.length,
          totalMembers: 0, // TODO: Add member count endpoint
          totalOrders,
          fulfilledOrders,
          cancelledOrders,
          totalSales: totalSales || 0,
          outOfStock,
          onSale,
          pendingOrders: 0 // TODO: Add pending orders endpoint
        });

        // Sales Over Time (Line Chart)
        const salesDataArr = (monthlySalesRes.data || []).map(s => ({
          date: `${s.year}-${String(s.month).padStart(2, '0')}`,
          sales: s.total
        }));
        setSalesData(salesDataArr);

        // Orders by Status (Pie Chart)
        const ordersStatusArr = (orderStatusRes.data || []).map(s => ({
          status: s.status,
          value: s.count
        }));
        setOrdersStatusData(ordersStatusArr);

        // Top 5 Bestselling Books (Bar Chart)
        const bestsellersArr = (topBestsellersRes.data || []).map(b => ({
          title: b.title,
          sales: b.quantitySold
        }));
        setBestsellers(bestsellersArr);

        // Books by Genre (Pie Chart)
        const genreArr = (genresRes.data || [])
          .filter(g => g.genre)
          .map(g => ({
            genre: g.genre.charAt(0).toUpperCase() + g.genre.slice(1),
            value: g.count
          }));
        setGenreData(genreArr);

        // New Members Over Time (Line Chart)
        const newMembersArr = (newMembersRes.data || []).map(m => ({
          date: `${m.year}-${String(m.month).padStart(2, '0')}`,
          members: m.count
        }));
        setNewMembersData(newMembersArr);

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

  const COLORS = ['#6366f1', '#f59e42', '#10b981', '#ef4444', '#fbbf24', '#3b82f6'];

  // DEBUG: Log genreData before rendering
  console.log('genreData', genreData);

  // TEMP: Test with static data if genreData is empty
  const testGenreData = [
    { genre: "Fiction", value: 2 },
    { genre: "Mystery", value: 3 }
  ];
  const chartData = genreData.length > 0 ? genreData : testGenreData;

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

        {/* Metrics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Widget title="Total Books" value={metrics.totalBooks} icon="📚" />
          <Widget title="Total Orders" value={metrics.totalOrders} icon="🛒" />
          <Widget title="Fulfilled Orders" value={metrics.fulfilledOrders} icon="✅" />
          <Widget title="Cancelled Orders" value={metrics.cancelledOrders} icon="❌" />
          <Widget title="Total Sales" value={`$${metrics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="💰" />
          <Widget title="Out of Stock" value={metrics.outOfStock} icon="❗" />
          <Widget title="Books On Sale" value={metrics.onSale} icon="🏷️" />
        </div>

        {/* Only Books by Genre Pie Chart */}
        <div className="bg-white rounded-lg shadow p-4 max-w-xl mx-auto">
          <h3 className="font-semibold mb-2">Books by Genre</h3>
          {genreData.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ genre, value }) => {
                    const total = chartData.reduce((sum, g) => sum + g.value, 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${genre} (${percent}%)`;
                  }}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-genre-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value, name, props) => {
                    const total = chartData.reduce((sum, g) => sum + g.value, 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} books (${percent}%)`, 'Count'];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple widget component
const Widget = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
    <span className="text-3xl mb-2">{icon}</span>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-gray-600 text-sm mt-1">{title}</span>
  </div>
);

export default AdminPanel;