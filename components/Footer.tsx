'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Footer() {
  const [siteName, setSiteName] = useState('BYTEZEY');
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach((s) => {
          if (s.key === 'site_name') setSiteName(s.value);
        });
      }
    };
    fetchSettings();
  }, [supabase]);

  return (
    <footer className="w-full bg-[#03060f] border-t border-blue-500/20 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">บริการของเรา</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-sky-400 transition-colors">สินค้าทั้งหมด</Link></li>
              <li><Link href="/topup" className="hover:text-sky-400 transition-colors">เติมเงินอั่งเปา</Link></li>
              <li><Link href="/history" className="hover:text-sky-400 transition-colors">ประวัติคำสั่งซื้อ</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">ช่องทางติดต่อ</h4>
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-[#0e1738] border border-blue-500/20 text-sky-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-xl bg-[#0e1738] border border-blue-500/20 text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-blue-500/10 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>© 2026 {siteName} Store. All rights reserved.</p>
          <p>ระบบจัดส่งสินค้าอัตโนมัติ 24 ชม.</p>
        </div>
      </div>
    </footer>
  );
}
