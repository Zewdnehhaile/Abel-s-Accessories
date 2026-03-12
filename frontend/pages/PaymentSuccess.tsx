import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader, XCircle } from 'lucide-react';
import { verifyOrderPayment } from '../services/orderService';

type PaymentSuccessProps = {
  onNavigate: (view: 'home' | 'shop', category?: 'all' | 'phones' | 'accessories') => void;
};

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onNavigate }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('Verifying your payment...');
  const [amount, setAmount] = useState<number | null>(null);

  const txRef = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('tx_ref') ||
      params.get('trx_ref') ||
      params.get('transaction_id') ||
      ''
    );
  }, []);

  const callbackStatus = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('status') || '').toLowerCase();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const runVerification = async () => {
      if (callbackStatus && callbackStatus !== 'success') {
        if (!isMounted) return;
        setIsSuccess(false);
        setMessage('Payment was not completed. Please try again.');
        setIsVerifying(false);
        return;
      }

      if (!txRef) {
        if (!isMounted) return;
        setIsSuccess(true);
        setMessage('Payment callback received. Your order will be confirmed shortly.');
        setIsVerifying(false);
        return;
      }

      try {
        const verifiedOrder = await verifyOrderPayment(txRef);
        if (!isMounted) return;
        setIsSuccess(true);
        setAmount(verifiedOrder.totalPrice);
        setMessage('Payment verified successfully. Your order is confirmed.');
      } catch (err: any) {
        if (!isMounted) return;
        setIsSuccess(false);
        setMessage(err?.message || 'Could not verify this payment. Please contact support.');
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [callbackStatus, txRef]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center bg-[var(--bg-body)] border border-[var(--border)]">
          {isVerifying ? (
            <Loader className="animate-spin text-[var(--primary)]" size={36} />
          ) : isSuccess ? (
            <CheckCircle2 className="text-emerald-500" size={40} />
          ) : (
            <XCircle className="text-red-500" size={40} />
          )}
        </div>

        <h1 className="text-3xl font-black text-[var(--text-main)] mb-3">
          {isVerifying ? 'Verifying Payment' : isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-[var(--text-muted)] text-sm md:text-base">{message}</p>

        {amount !== null && (
          <div className="mt-6 text-[var(--text-main)]">
            <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Amount</span>
            <div className="text-2xl font-black mt-1">{amount.toLocaleString()} ETB</div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => onNavigate('shop', 'all')} className="btn btn-primary px-6">
            Continue Shopping
          </button>
          <button onClick={() => onNavigate('home')} className="btn btn-outline px-6">
            <ArrowLeft size={16} />
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
