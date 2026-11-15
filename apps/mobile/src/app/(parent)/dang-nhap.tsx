import { useState } from 'react';
import { View } from 'react-native';

import { OTP_LENGTH, checkEmail, checkOtp } from '@/data/validate';
import { useApp } from '@/state/app';
import { Btn, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-01 Đăng ký / Đăng nhập (D-49): email nhận mã 6 số, không mật khẩu. Người mới và người cũ dùng cùng một luồng.
export default function DangNhap() {
  const { api } = useApp();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [sentNote, setSentNote] = useState<string | null>(null);
  const send = useAction();
  const verify = useAction();

  async function sendCode() {
    const bad = checkEmail(email);
    setFieldError(bad);
    if (bad) return;
    const ok = await send.run(() => api.auth.sendEmailOtp(email));
    if (ok) {
      setToken('');
      setSentNote(`Mình đã gửi mã ${OTP_LENGTH} số tới ${email.trim()}. Nếu chưa thấy, bạn xem cả mục thư rác.`);
      setStep('otp');
    }
  }

  async function checkCode() {
    const bad = checkOtp(token);
    setFieldError(bad);
    if (bad) return;
    // Thành công: phiên đổi, cổng ở _layout tự chuyển màn.
    await verify.run(async () => {
      await api.auth.verifyEmailOtp(email, token);
    });
  }

  return (
    <Screen>
      <H1>Chào bạn</H1>
      {step === 'email' ? (
        <>
          <P>Parent-Pal giúp bố mẹ sắp lịch sinh hoạt cho con. Bạn đăng ký hoặc đăng nhập bằng email, không cần mật khẩu.</P>
          <Field
            label="Email của bạn"
            hint="Mình sẽ gửi một mã số tới email này."
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setFieldError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            error={fieldError}
          />
          {send.error ? <Notice>{send.error}</Notice> : null}
          <Btn label="Gửi mã cho mình" onPress={sendCode} busy={send.busy} />
        </>
      ) : (
        <>
          {sentNote ? <Notice kind="info">{sentNote}</Notice> : null}
          <Field
            label={`Mã ${OTP_LENGTH} số`}
            value={token}
            onChangeText={(t) => {
              setToken(t.replace(/\D/g, '').slice(0, OTP_LENGTH));
              setFieldError(null);
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            error={fieldError}
          />
          {verify.error ? <Notice>{verify.error}</Notice> : null}
          <Btn label="Xác nhận" onPress={checkCode} busy={verify.busy} />
          <View style={{ gap: 10 }}>
            <Btn label="Gửi lại mã" kind="secondary" onPress={sendCode} busy={send.busy} />
            <Btn
              label="Đổi email"
              kind="secondary"
              onPress={() => {
                setStep('email');
                setSentNote(null);
                setFieldError(null);
                verify.setError(null);
              }}
            />
          </View>
          {send.error ? <Notice>{send.error}</Notice> : null}
        </>
      )}
    </Screen>
  );
}
