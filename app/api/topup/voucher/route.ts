import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'ข้อมูลคำขอไม่ถูกต้อง' }, { status: 400 });
    }

    const rawUrl = body.voucherUrl || body.voucher_url || '';
    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ error: 'กรุณากรอกลิงก์ซองอั่งเปา' }, { status: 400 });
    }

    // ดึงรหัส Voucher Code ออกมาจากลิงก์
    let voucherCode = rawUrl.trim();
    if (voucherCode.includes('v=')) {
      voucherCode = voucherCode.split('v=')[1].split('&')[0];
    } else if (voucherCode.includes('/campaign/')) {
      const parts = voucherCode.split('?')[0].split('/');
      voucherCode = parts[parts.length - 1];
    }

    if (!voucherCode || voucherCode.length < 5) {
      return NextResponse.json({ error: 'รูปแบบลิงก์ซองอั่งเปาไม่ถูกต้อง' }, { status: 400 });
    }

    const myPhone = process.env.TRUEMONEY_PHONE;
    if (!myPhone) {
      return NextResponse.json({ error: 'ระบบยังไม่ได้ตั้งค่าเบอร์ TRUEMONEY_PHONE ใน Vercel' }, { status: 500 });
    }

    // ยิงไปเคลมเงินจาก TrueMoney
    const tmRes = await fetch(`https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
      body: JSON.stringify({
        mobile: myPhone.trim(),
        voucher_hash: voucherCode.trim(),
      }),
    });

    const tmData = await tmRes.json().catch(() => null);

    if (!tmData || tmData.status?.code !== 'SUCCESS') {
      const errMsg = tmData?.status?.message || 'ซองอั่งเปาไม่ถูกต้อง ซองหมดอายุ หรือถูกใช้งานไปแล้ว';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    // ยอดเงินที่ได้รับจริง
    const amount = parseFloat(tmData.data?.voucher?.redeemed_amount_baht || '0');
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'ยอดเงินในซองไม่ถูกต้อง' }, { status: 400 });
    }

    // เชื่อมต่อ Supabase เพื่อเพิ่มเครดิต
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase Key ยังไม่ได้ตั้งค่าใน Vercel' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // ดึง User Token จาก Header เพื่อระบุตัวตนคนที่เติมเงิน
    const authHeader = req.headers.get('Authorization') || '';
    let userId = body.userId;

    if (!userId && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (userId) {
      // 1. ดึงยอดคงเหลือเดิม
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      const oldBalance = Number(profile?.balance || 0);
      const newBalance = oldBalance + amount;

      // 2. อัปเดต Balance
      await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      // 3. บันทึก Transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        amount: amount,
        type: 'topup',
        status: 'completed',
        description: `เติมเงิน TrueMoney Voucher ${voucherCode.substring(0, 6)}...`,
      });

      return NextResponse.json({
        success: true,
        amount: amount,
        newBalance: newBalance,
        message: `เติมเงินสำเร็จ +฿${amount.toLocaleString()} บาท`,
      });
    }

    return NextResponse.json({
      success: true,
      amount: amount,
      message: `รับเงินสำเร็จ ฿${amount.toLocaleString()} บาท`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 });
  }
}
