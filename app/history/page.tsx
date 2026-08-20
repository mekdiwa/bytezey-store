'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { PackageCheck, Copy, Check, Calendar, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('คัดลอกข้อมูลสินค้าแล้ว');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between">
      <Toaster position="top-right" richColors theme="dark" />
      <div>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <PackageCheck className="w-6 h-6 text-sky-400" />
              ประวัติการสั่งซื้อสินค้า
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ตรวจสอบข้อมูลไอดี โค้ด หรือสิทธิ์การใช้งานที่คุณเคยซื้อ
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-[#0e1738]/50 rounded-2xl border border-blue-500/20">
              <p className="text-sm text-slate-400">คุณยังไม่มีรายการสั่งซื้อสินค้า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl bg-[#0e1738] border border-blue-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white">{order.product_name}</h3>
                      <span className="text-xs font-bold text-sky-400">฿{Number(order.price).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.created_at).toLocaleString('th-TH')}</span>
                    </div>

                    {/* Delivered Content Display */}
                    <div className="mt-3 p-3 rounded-xl bg-[#050814] border border-blue-500/30 max-w-xl">
                      <p className="text-xs font-mono text-emerald-400 break-all">
                        {order.delivered_data}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(order.delivered_data, order.id)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-blue-600/20 border border-blue-500/40 text-sky-300 hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                  >
                    {copiedId === order.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        คัดลอกสำเร็จ
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        คัดลอกข้อมูลสินค้า
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
