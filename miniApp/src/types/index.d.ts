declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare namespace Taro {
  interface RequestOption<T = any> {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    data?: any;
    dataType?: 'json' | 'text' | 'arraybuffer';
    header?: Record<string, string>;
    timeout?: number;
    success?: (res: RequestSuccessCallbackResult<T>) => void;
    fail?: (err: any) => void;
    complete?: () => void;
  }

  interface RequestSuccessCallbackResult<T = any> {
    data: T;
    statusCode: number;
    header: Record<string, string>;
  }
}
