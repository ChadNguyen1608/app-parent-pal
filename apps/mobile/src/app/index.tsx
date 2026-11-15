import { Redirect } from 'expo-router';

import { APP_VARIANT } from '@/variant';

/** Mỗi biến thể chỉ vào nhóm route của mình. */
export default function Index() {
  return <Redirect href={APP_VARIANT === 'child' ? '/(child)/(tabs)/hom-nay' : '/(parent)/(tabs)/lich-tuan'} />;
}
