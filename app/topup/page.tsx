'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { Wallet, Gift, ArrowRight, Loader2, History } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function TopupPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [voucherUrl, setVoucherUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      if (profile) setBalance(profile.balance || 0);

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (txData) setHistory(txData);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน');
      return;
    }
    if (!voucherUrl.trim()) {
      toast.error('กรุณากรอกลิงก์ซองอั่งเปา');
      return;
    }

    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';

      const res = await fetch('/api/topup/voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          voucherUrl: voucherUrl.trim(),
          userId: user.id
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'เติมเงินไม่สำเร็จ');
      }

      toast.success(data.message || `เติมเงินสำเร็จ +฿${data.amount} บาท`);
      setVoucherUrl('');
      fetchUserData();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการเติมเงิน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between">
      <Toaster position="top-right" richColors theme="dark" />
      <div>
        <Navbar />

        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="p-8 rounded-3xl bg-[#0e1738] border border-blue-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">เติมเงินผ่านซองอั่งเปา</h1>
              <p className="text-xs text-slate-400 mt-2">TrueMoney Wallet Voucher — เครดิตเข้าบัญชีอัตโนมัติ 24 ชม.</p>
            </div>

            {/* ยอดเงินคงเหลือ */}
            <div className="mb-6 p-4 rounded-2xl bg-[#050814] border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-sky-400" />
                <span className="text-xs text-slate-300 font-semibold">ยอดเงินปัจจุบัน:</span>
              </div>
              <span className="text-lg font-black text-sky-400">
                ฿{Number(balance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ลิงก์ซองอั่งเปา TrueMoney
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !user}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>ยืนยันการเติมเงิน</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* ประวัติการเติมเงิน */}
            <div className="mt-10 pt-6 border-t border-blue-500/20">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" /> ประวัติการเติมเงินล่าสุด
              </h3>
              <div className="rounded-xl bg-[#050814] border border-blue-500/20 overflow-hidden text-xs">
                <div className="grid grid-cols-3 p-3 bg-blue-950/40 text-slate-400 font-semibold border-b border-blue-500/20">
                  <span>วันที่ / เวลา</span>
                  <span className="text-center">จำนวนเงิน</span>
                  <span className="text-right">สถานะ</span>
                </div>
                {history.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">ยังไม่มีประวัติการเติมเงิน</div>
                ) : (
                  history.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-3 p-3 border-b border-blue-500/10 text-slate-300">
                      <span>{new Date(tx.created_at).toLocaleDateString('th-TH')}</span>
                      <span className="text-center text-emerald-400 font-bold">+฿{tx.amount}</span>
                      <span className="text-right text-emerald-400">สำเร็จ</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
