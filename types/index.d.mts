export default class NodeHttp {
    constructor(CONFIG?: {});
    client: import("axios").AxiosInstance;
    useRequestInterceptor(interceptor?: any[]): number;
    useResponseInterceptor(interceptor?: any[]): number;
    ejectRequestInterceptor(index: any): void;
    ejectResponseInterceptor(index: any): void;
    request(options?: {}): Promise<import("axios").AxiosResponse<any, any>>;
    #private;
}
