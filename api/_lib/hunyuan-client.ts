import * as hunyuanSdk from 'tencentcloud-sdk-nodejs-hunyuan';

const { Client } = (hunyuanSdk as any).hunyuan.v20230901;

let client: any = null;

export function getClient() {
  if (!client) {
    const secretId = process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.TENCENT_SECRET_KEY;
    if (!secretId || !secretKey) {
      throw new Error('TENCENT_SECRET_ID or TENCENT_SECRET_KEY not configured');
    }
    client = new Client({
      credential: { secretId, secretKey },
      region: 'ap-guangzhou',
      profile: { httpProfile: { endpoint: 'hunyuan.tencentcloudapi.com' } },
    });
  }
  return client;
}

export function resetClient(): void {
  client = null;
}
