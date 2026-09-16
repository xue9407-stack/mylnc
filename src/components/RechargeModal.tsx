import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRechargeSuccess: (amount: number) => void;
  onShowToast: (msg: string) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  onRechargeSuccess,
  onShowToast,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const amounts = [
    { value: 10, bonus: '送50积分' },
    { value: 30, bonus: '送180积分 + 7天会员', popular: true },
    { value: 68, bonus: '送500积分 + 30天会员' },
    { value: 128, bonus: '送1200积分 + 季度黄金会员' },
  ];

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRechargeSuccess(selectedAmount);
      onShowToast(`充值 ¥${selectedAmount}.00 成功，已到账！`);
      onClose();
    }, 600);
  };

  return (
    <div
      id="wallet-recharge-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-[#10101a] border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-purple-400" />
            <h3 className="text-base font-bold text-white">网巢余额充值</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="text-xs font-medium text-white/60 block">选择充值档位</label>
          <div className="grid grid-cols-2 gap-2.5">
            {amounts.map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedAmount(item.value)}
                className={`p-3 rounded-xl border text-left relative transition ${
                  selectedAmount === item.value
                    ? 'bg-purple-600/20 border-purple-500 shadow-sm shadow-purple-500/20'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                {item.popular && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-500 text-white">
                    HOT
                  </span>
                )}
                <div className="text-lg font-bold text-white">¥ {item.value}</div>
                <div className="text-[10px] text-purple-300/80 mt-0.5">{item.bonus}</div>
              </button>
            ))}
          </div>

          {/* Payment Method */}
          <div className="pt-2">
            <div className="text-xs font-medium text-white/60 mb-2">支付通道</div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💳</span>
                <div>
                  <div className="text-xs font-medium text-white">TP5 线上模拟安全收银台</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>256位端到端模拟加密</span>
                  </div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition"
          >
            取消
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-md shadow-purple-500/30 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? '支付处理中...' : `立即支付 ¥${selectedAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
};
