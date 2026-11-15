import { Redirect } from 'expo-router';

// URL <scheme>://auth-callback?code=... do link trong thư mở ra. AppProvider đã bắt URL và hoàn tất phiên;
// route này chỉ để router không báo "không tìm thấy màn" rồi đưa về màn gốc (cổng sẽ chuyển tiếp theo phiên).
export default function AuthCallback() {
  return <Redirect href="/" />;
}
