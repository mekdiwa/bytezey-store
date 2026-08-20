import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }, { status: 401 });
    }

    const { voucherUrl } = await req.json();
    if (!voucherUrl || typeof voucherUrl !== 'string') {
      return NextResponse.json({ error: 'กรุณากรอกลิงก์ซองอั่งเปา' }, { status: 400 });
    }

    // สกัด Voucher Code จาก URL
    const voucherMatch = voucherUrl.match(/v=([a-zA-Z0-9]+)/);
    const voucherCode = voucherMatch ? voucherMatch[1] : voucherUrl.trim();

    if (!voucherCode || voucherCode.length < 10) {
      return NextResponse.json({ error: 'รูปแบบลิงก์ซองอั่งเปาไม่ถูกต้อง' }, { status: 400 });
    }

    const phone = process.env.MERCHANT_PHONE;
    if (!phone) {
      return NextResponse.json({ error: 'ระบบยังไม่ได้ตั้งค่าเบอร์ร้านค้า' }, { status: 500 });
    }

    // เรียก API ของ TrueMoney เพื่อดึงยอดเงิน
    const tmResponse = await fetch(
      `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: phone,
          voucher_hash: voucherCode,
        }),
      }
    );

    const tmData = await tmResponse.json();

    if (tmData.status?.code !== 'SUCCESS') {
      const errorMap: Record<string, string> = {
        VOUCHER_OUT_OF_STOCK: 'ซองอั่งเปานี้ถูกใช้งานจนหมดแล้ว',
        VOUCHER_NOT_FOUND: 'ไม่พบซองอั่งเปานี้ในระบบ',
        VOUCHER_EXPIRED: 'ซองอั่งเปาหมดอายุแล้ว',
        CANNOT_GET_OWN_VOUCHER: 'ไม่สามารถรับซองของตนเองได้',
      };
      const errorMessage = errorMap[tmData.status?.code] || tmData.status?.message || 'การเติมเงินล้มเหลว';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const receivedAmount = parseFloat(tmData.data.voucher.redeemed_amount_baht);

    // บันทึกประวัติและเพิ่มเงินให้ผู้ใช้
    const { error: txError } = await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      amount: receivedAmount,
      voucher_hash: voucherCode,
      status: 'SUCCESS',
    });

    if (txError) {
      return NextResponse.json({ error: 'ซองอั่งเปานี้ถูกใช้งานไปแล้ว' }, { status: 400 });
    }

    // ดึงยอดเงินปัจจุบันและบวกเพิ่ม
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    await supabaseAdmin
      .from('profiles')
      .update({ balance: (profile?.balance || 0) + receivedAmount })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: `เติมเงินสำเร็จ ${receivedAmount.toLocaleString()} บาท`,
      amount: receivedAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
