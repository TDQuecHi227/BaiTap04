import { useEffect, useState } from "react";
import { Header } from "../components/layout/header.jsx";
import { Button, Spinner } from "../components/ui/index.jsx";
import { getMyOrdersApi, cancelOrderApi } from "../util/api.js";
import { useToast } from "../components/context/ToastContext.jsx";

const ORDER_STATUSES = [
  { key: "new", label: "Đơn hàng mới" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "preparing", label: "Đang chuẩn bị" },
  { key: "delivering", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrdersApi();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (error) {
      addToast(error.message || "Không thể lấy danh sách đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const res = await cancelOrderApi(orderId);
      if (res.success) {
        addToast(res.message, "success");
        fetchOrders();
      }
    } catch (error) {
      addToast(error.message || "Không thể hủy đơn hàng", "error");
    }
  };

  const renderTimeline = (order) => {
    if (order.status === "cancelled" || order.status === "cancel_requested") {
      return (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">✕</div>
          <div>
            <p className="font-bold text-red-700">
              {order.status === "cancelled" ? "Đã hủy đơn hàng" : "Yêu cầu hủy đơn đang chờ duyệt"}
            </p>
            <p className="text-sm text-red-500">
              {order.statusTimeline?.[order.statusTimeline.length - 1]?.note}
            </p>
          </div>
        </div>
      );
    }

    const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);
    
    return (
      <div className="relative flex items-center w-full justify-between mt-6 px-2">
        
        {/* Thanh Progress bar nền và fill */}
        <div className="absolute top-[14px] left-[10%] right-[10%] h-1 z-0">
          {/* Đường xám chưa tới */}
          <div className="absolute inset-0 bg-gray-200 rounded-full" />
          {/* Đường xanh đã đi qua */}
          <div 
            className="absolute top-0 left-0 h-full bg-brand-500 transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
          />
        </div>

        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={status.key} className="flex flex-col items-center relative flex-1">
              
              {/* Nút tròn */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all z-10 ${
                isCurrent
                  ? "border-brand-500 bg-brand-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  : isCompleted 
                    ? "border-brand-500 bg-white text-brand-600" 
                    : "border-gray-200 bg-white text-gray-400"
              }`}>
                {isCompleted && !isCurrent ? "✓" : index + 1}
              </div>
              
              {/* Chữ */}
              <p className={`text-xs mt-2 text-center font-medium ${
                isCurrent ? "text-brand-600" : isCompleted ? "text-gray-700" : "text-gray-400"
              }`}>
                {status.label}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const getCancelAction = (order) => {
    if (order.status === "cancelled" || order.status === "cancel_requested") return null;

    if (order.status === "new" || order.status === "confirmed") {
      const orderDate = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const diffMins = (now - orderDate) / (1000 * 60);

      if (diffMins <= 30) {
        return (
          <Button 
            variant="secondary" 
            className="text-red-500 hover:bg-red-50 hover:text-red-600 text-sm py-1 border border-red-100"
            onClick={() => handleCancelOrder(order._id)}
          >
            Hủy đơn hàng
          </Button>
        );
      }
    } else if (order.status === "preparing") {
      return (
        <Button 
          variant="secondary" 
          className="text-orange-500 hover:bg-orange-50 hover:text-orange-600 text-sm py-1 border border-orange-100"
          onClick={() => handleCancelOrder(order._id)}
        >
          Gửi Y/C hủy đơn
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size={40} className="text-brand-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📦
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mt-2">Bạn chưa đặt mua khóa học nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const course = order.courseId;
              if (!course) return null;
              
              return (
                <div key={order._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  {/* Header Đơn hàng */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Mã đơn: <span className="text-gray-900">{order._id.substring(order._id.length - 8).toUpperCase()}</span></p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  </div>

                  {/* Thông tin khóa học */}
                  <div className="flex gap-4 mt-6">
                    <div className="w-32 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{course.title}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm text-gray-500">Thanh toán: <span className="font-bold">{order.paymentMethod}</span></p>
                          <p className="text-sm text-gray-500">Giá trị đơn hàng: <span className="text-brand-600 font-bold">{order.finalPrice.toLocaleString("vi-VN")}đ</span></p>
                        </div>
                        {getCancelAction(order)}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Trạng thái */}
                  <div className="mt-8 pt-6 border-t border-gray-50">
                    {renderTimeline(order)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
