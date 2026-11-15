// Một dự án Expo, hai biến thể chọn bằng APP_VARIANT=parent|child (Tech Spec 13.1 §5, T0.8).
// Không có khóa trong file này. google-services.json (nếu cần FCM) chỉ nạp qua biến môi trường
// GOOGLE_SERVICES_JSON (đường dẫn tới file; trên EAS là biến loại file). Không commit file đó.
import type { ConfigContext, ExpoConfig } from 'expo/config';

export type Variant = 'parent' | 'child';

type VariantInfo = {
  name: string;
  slug: string;
  scheme: string;
  /** Đã chốt (D-51, 16/11/2026). Không đổi sau khi phát cho người thử. */
  applicationId: string;
  iconBackground: string;
  /** Màn đo nhắc giờ (src/lab) chỉ bật ở bản nội bộ. */
  lab: boolean;
};

export const VARIANTS: Record<Variant, VariantInfo> = {
  parent: {
    name: 'Parent-Pal Phụ huynh',
    slug: 'parent-pal-parent',
    scheme: 'parentbestpal-parent',
    applicationId: 'vn.parentbestpal.parent',
    iconBackground: '#E6F4FE',
    lab: true,
  },
  child: {
    name: 'Parent-Pal Con',
    slug: 'parent-pal-child',
    scheme: 'parentbestpal-child',
    applicationId: 'vn.parentbestpal.child',
    iconBackground: '#FFF3D6',
    lab: true,
  },
};

export function resolveVariant(raw: string | undefined): Variant {
  if (raw === undefined || raw === '') return 'parent';
  if (raw === 'parent' || raw === 'child') return raw;
  throw new Error(`APP_VARIANT không hợp lệ: "${raw}". Dùng parent hoặc child.`);
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveVariant(process.env.APP_VARIANT);
  const v = VARIANTS[variant];
  const isProduction = process.env.EAS_BUILD_PROFILE === 'production';

  return {
    ...config,
    name: v.name,
    slug: v.slug,
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png', // icon tạm, dùng chung hai biến thể
    scheme: v.scheme,
    userInterfaceStyle: 'light',
    android: {
      package: v.applicationId,
      adaptiveIcon: {
        backgroundColor: v.iconBackground,
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      // Quyền tối thiểu (D-45): thông báo và báo thức chính xác cho nhắc giờ.
      // Không location, camera, microphone.
      permissions: [
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.SCHEDULE_EXACT_ALARM',
        'android.permission.RECEIVE_BOOT_COMPLETED',
      ],
      // Nạp qua biến môi trường; không đặt thì build không có FCM (nhắc cục bộ vẫn chạy).
      ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {}),
      // Các quyền do plugin/thư viện tự thêm mà nấc 1 không dùng thì chặn lại.
      blockedPermissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
      ],
    },
    plugins: [
      'expo-router',
      'expo-sqlite',
      ['expo-splash-screen', { backgroundColor: '#208AEF', image: './assets/images/splash-icon.png', imageWidth: 76 }],
      ['expo-notifications', { defaultChannel: 'default' }],
      ['expo-build-properties', { android: { usesCleartextTraffic: !isProduction } }],
      'expo-asset',
    ],
    extra: {
      appVariant: variant,
      labEnabled: v.lab,
    },
  };
};
