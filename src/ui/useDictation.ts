// Kể bằng giọng nói. Bản thử dùng nhận dạng giọng nói của trình duyệt (tiếng Việt, vi-VN).
// Trên điện thoại, bản thật sẽ dùng dịch vụ chuyển giọng nói thành chữ qua server.
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

export function useDictation(onText: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);
  const Ctor: any =
    Platform.OS === 'web' && typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

  const start = useCallback(() => {
    if (!Ctor) return;
    try {
      const r = new Ctor();
      r.lang = 'vi-VN';
      r.interimResults = false;
      r.continuous = false;
      r.onresult = (e: any) => {
        const t = Array.from(e.results as ArrayLike<any>)
          .map((x: any) => x[0]?.transcript ?? '')
          .join(' ')
          .trim();
        if (t) onText(t);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      rec.current = r;
      r.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [Ctor, onText]);

  const stop = useCallback(() => {
    rec.current?.stop?.();
    setListening(false);
  }, []);

  return { supported: !!Ctor, listening, start, stop };
}
