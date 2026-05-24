import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/header.jsx";
import { Button, Spinner } from "../components/ui/index.jsx";
import { useToast } from "../components/context/ToastContext.jsx";
import { fetchCart, removeFromCart } from "../store/cartSlice";
import { checkoutApi } from "../util/api.js";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, loading, error } = useSelector((state) => state.cart);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isCheckout, setIsCheckout] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleRemove = async (courseId) => {
    if (window.confirm("Bạn có chắc muốn xóa khóa học này khỏi giỏ hàng?")) {
      const action = await dispatch(removeFromCart(courseId));
      if (removeFromCart.fulfilled.match(action)) {
        addToast("Đã xóa khóa học khỏi giỏ hàng", "success");
      } else {
        addToast(action.payload || "Không thể xóa khóa học", "error");
      }
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = item.courseId?.discountPrice || item.courseId?.price || 0;
      return total + price;
    }, 0);
  };

  const calculateOriginalTotal = () => {
    return items.reduce((total, item) => {
      const price = item.courseId?.price || 0;
      return total + price;
    }, 0);
  }

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckout(true);
    try {
      const res = await checkoutApi(paymentMethod);
      if (res.success) {
        addToast("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.", "success");
        // Reload cart (sẽ thành trống)
        dispatch(fetchCart());
      } else {
        addToast("Thanh toán thất bại.", "error");
      }
    } catch (err) {
      addToast(err.message || "Thanh toán thất bại", "error");
    } finally {
      setIsCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

        {loading && items.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size={40} className="text-brand-600" />
          </div>
        ) : error && items.length === 0 ? (
          <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-500 font-medium">{error}</p>
            <Button variant="primary" className="mt-4" onClick={() => dispatch(fetchCart())}>
              Thử lại
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Giỏ hàng trống</h2>
            <p className="text-gray-500 mt-2">Bạn chưa thêm khóa học nào vào giỏ hàng.</p>
            <Button variant="primary" className="mt-6" onClick={() => navigate("/courses")}>
              Khám phá khóa học
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const course = item.courseId;
                if (!course) return null;
                return (
                  <div key={course._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-40 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Giảng viên: {course.teacherId?.username || "Ẩn danh"}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 sm:mt-0">
                        <button
                          onClick={() => handleRemove(course._id)}
                          className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
                        >
                          Xóa
                        </button>
                        <div className="text-right">
                          {course.discountPrice > 0 ? (
                            <>
                              <div className="text-lg font-bold text-brand-600">
                                {course.discountPrice.toLocaleString("vi-VN")}đ
                              </div>
                              <div className="text-xs text-gray-400 line-through">
                                {course.price.toLocaleString("vi-VN")}đ
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-bold text-brand-600">
                              {course.price > 0 ? `${course.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thông tin thanh toán */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tổng cộng</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Giá gốc:</span>
                    <span>{calculateOriginalTotal().toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá:</span>
                    <span className="text-brand-600">
                      -{ (calculateOriginalTotal() - calculateTotal()).toLocaleString("vi-VN") }đ
                    </span>
                  </div>
                  <div className="h-px bg-gray-100 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-brand-600">
                      {calculateTotal().toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-bold text-gray-900 mb-3">Phương thức thanh toán</p>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-brand-600 accent-brand-600 focus:ring-brand-500" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">Thanh toán tiền mặt (COD)</span>
                      <span className="text-xs text-gray-500">Thanh toán trực tiếp khi nhận mã kích hoạt/chứng từ</span>
                    </div>
                  </label>
                  {/* Có thể thêm các hình thức khác như VNPay, Momo ở đây */}
                  <label className={`flex items-center gap-3 p-3 mt-2 rounded-xl border opacity-50 cursor-not-allowed`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="VNPAY" 
                      disabled
                      className="w-4 h-4 text-gray-400" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-500">Thanh toán VNPay (Đang phát triển)</span>
                    </div>
                  </label>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full mt-6 py-4 font-bold text-lg shadow-lg shadow-brand-100"
                  onClick={handleCheckout}
                  loading={isCheckout}
                  disabled={items.length === 0}
                >
                  {isCheckout ? "Đang xử lý..." : "Thanh toán"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
