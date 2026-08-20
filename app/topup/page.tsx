'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gift, History, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast, Toaster } from 'sonner';

export default function TopupPage() {
  const [voucherUrl, setVoucherUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const supabase = createClient();

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setTransactions(data);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherUrl) {
      toast.error('กรุณากรอกลิงก์ซองของขวัญ');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/topup/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'การเติมเงินล้มเหลว');

      toast.success(data.message);
      setVoucherUrl('');
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between">
      <Toaster position="top-right" richColors theme="dark" />
      <div>
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <Gift className="w-8 h-8 text-sky-400" />
              เติมเงินด้วยซองอั่งเปา TrueMoney
            </h1>
            <p className="text-sm text-slate-400 mt-2">ยอดเงินเข้าบัญชีทันทีแบบ Realtime ตลอด 24 ชั่วโมง</p>
          </div>

          {/* Steps Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { step: '1', title: 'สร้างซองของขวัญ', desc: 'เปิดแอป TrueMoney เลือก "ส่งของขวัญ"' },
              { step: '2', title: 'ตั้งค่าจำนวนคน', desc: 'เลือกประเภทการสุ่ม และใส่จำนวนคน "1 คน"' },
              { step: '3', title: 'คัดลอกลิงก์มาวาง', desc: 'นำลิงก์ที่ได้มาวางในช่องด้านล่างเพื่อเติมเงิน' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0e1738] border border-blue-500/20">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs leading-6 text-center mb-2">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="p-8 rounded-2xl bg-[#0e1738] border border-blue-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-12">
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  ลิงก์ซองอั่งเปา TrueMoney
                </label>
                <input
                  type="text"
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ยืนยันการเติมเงิน'}
              </button>
            </form>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-sky-400" />
              ประวัติการเติมเงินล่าสุด
            </h3>

            <div className="rounded-xl border border-blue-500/20 overflow-hidden bg-[#0e1738]/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#050814] text-slate-400 border-b border-blue-500/20">
                  <tr>
                    <th className="p-4">วันที่ / เวลา</th>
                    <th className="p-4">จำนวนเงิน</th>
                    <th className="p-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10 text-slate-300">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">
                        ยังไม่มีประวัติการเติมเงิน
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-blue-500/5">
                        <td className="p-4">{new Date(tx.created_at).toLocaleString('th-TH')}</td>
                        <td className="p-4 font-bold text-sky-400">฿{Number(tx.amount).toFixed(2)}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
