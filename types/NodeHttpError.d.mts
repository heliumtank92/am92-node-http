export default class NodeHttpError extends Error {
    constructor(e: {}, eMap: any);
    _isCustomError: boolean;
    _isNodeHttpError: boolean;
    service: string;
    message: any;
    statusCode: any;
    errorCode: any;
    data: any;
    error: {};
}
