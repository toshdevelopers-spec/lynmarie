import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const orderNumber = state?.order?.orderNumber || state?.order?.id || '—';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-xl font-bold text-gray-900">#{orderNumber}</p>
          </div>

          <div className="space-y-3">
            <Link to="/my-account/orders">
              <Button size="large" className="w-full">
                <ShoppingBag className="w-5 h-5 mr-2" />
                View My Orders
              </Button>
            </Link>
            <Link to="/">
              <Button size="large" variant="outline" className="w-full">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>A confirmation email has been sent to your email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
