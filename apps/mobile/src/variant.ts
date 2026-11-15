import Constants from 'expo-constants';

export type Variant = 'parent' | 'child';

/** Biến thể do app.config.ts ghi vào extra lúc build. */
export const APP_VARIANT: Variant = Constants.expoConfig?.extra?.appVariant === 'child' ? 'child' : 'parent';
export const LAB_ENABLED: boolean = Constants.expoConfig?.extra?.labEnabled === true;
