import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useEffect, useState } from 'react';
import { checkoutService } from '../../services/checkout';

const Orders = () => {

  const [orders, setOrders] = useState([]);
  useEffect(() => { checkoutService.getCustomerOrders().then(setOrders).catch(() => setOrders([])); }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link to="/shop">
            <button className="px-6 py-2 bg-[#4c00b0] text-white rounded-lg hover:bg-[#3d008f] transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
              <h3 className="font-medium text-gray-900">Order #{order.orderNumber || order.id}</h3>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                <Link
                  to={`/my-account/orders/${order.id}`}
                  className="text-[#4c00b0] hover:text-purple-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
