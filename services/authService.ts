
import { authServiceLegacy } from './authServiceLegacy';
import { proxyFirebaseService } from './proxyFirebaseService';

// 默认走代理，Firebase 客户端 SDK 不提前初始化
let _service: any = proxyFirebaseService;

// 检测 Firebase 是否可直连（3秒超时）
const checkFirebaseAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      'https://firestore.googleapis.com/v1/projects/artislife-7384f/databases/(default)/documents/ugc?pageSize=1',
      { signal: controller.signal, method: 'GET' }
    );
    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    return false;
  }
};

// 只有直连可用时才动态导入 firebaseService（避免提前初始化 SDK）
checkFirebaseAvailable().then(async (available) => {
  if (available) {
    console.log('[AuthService] Firebase 直连可用，切换直连模式');
    const { firebaseService } = await import('./firebaseService');
    _service = firebaseService;
  } else {
    console.log('[AuthService] 使用后端代理模式');
  }
});

export const authService = new Proxy({} as any, {
  get(_target, prop) {
    return (_service as any)[prop];
  }
});
