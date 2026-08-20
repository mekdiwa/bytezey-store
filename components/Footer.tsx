'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, ShieldCheck, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Footer() {
  const [siteName, setSiteName] = useState('BYTEZEY');
  const [footerDesc, setFooterDesc] = useState(
    'แพลตฟอร์มจำหน่ายสินค้าและบริการดิจิทัลแบบอัตโนมัติ สะดวก รวดเร็ว การันตีความปลอดภัยและพร้อมซัพพอร์ตลูกค้าตลอด 24 ชั่วโมง'
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach((s) => {
          if (s.key === 'site_name') setSiteName(s.value);
          if (s.key === 'footer_description') setFooterDesc(s.value);
          if (s.key === 'site_logo_url') setLogoUrl(s.value);
        });
      }
    };
    fetchSettings();
  }, [supabase]);

  return (
    <footer className="w-full bg-[#03060f] border-t border-blue-500/20 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
              ) : (
                <div className="p-2 rounded-xl bg-blue-600/30 text-sky-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-bold tracking-wider text-white">
                {siteName}
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {footerDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">บริการของเรา</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-sky-400 transition-colors">สินค้าทั้งหมด</Link></li>
              <li><Link href="/topup" className="hover:text-sky-400 transition-colors">เติมเงินอั่งเปา</Link></li>
              <li><Link href="/history" className="hover:text-sky-400 transition-colors">ประวัติคำสั่งซื้อ</Link></li>
            </ul>
          </div>

          {/* Contacts / Guarantees */}
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

        <div className="pt-8 border-t border-blue-500/10 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>© 2026 {siteName} Store. All rights reserved.</p>
          <p>Built with ❤️ for Gamers</p>
        </div>
      </div>
    </footer>
  );
}
