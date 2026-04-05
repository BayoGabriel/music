"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyRemoteStream = void 0;
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
const app_error_1 = require("../errors/app-error");
const STREAM_HEADERS = [
    'accept-ranges',
    'cache-control',
    'content-length',
    'content-range',
    'content-type',
    'etag',
    'last-modified'
];
const proxyRemoteStream = async (targetUrl, range, response) => {
    const requestUrl = new url_1.URL(targetUrl);
    const requestStream = (urlToStream, redirectDepth = 0) => {
        return new Promise((resolve, reject) => {
            const request = https_1.default.request(urlToStream, {
                method: 'GET',
                headers: range ? { Range: range } : undefined
            }, (upstream) => {
                const statusCode = upstream.statusCode ?? 502;
                const redirectLocation = upstream.headers.location;
                if ([301, 302, 307, 308].includes(statusCode) && redirectLocation && redirectDepth < 3) {
                    upstream.resume();
                    const nextUrl = new url_1.URL(redirectLocation, urlToStream);
                    void requestStream(nextUrl, redirectDepth + 1).then(resolve).catch(reject);
                    return;
                }
                if (statusCode >= 400) {
                    let body = '';
                    upstream.setEncoding('utf8');
                    upstream.on('data', (chunk) => {
                        body += chunk;
                    });
                    upstream.on('end', () => {
                        reject(new app_error_1.AppError(statusCode, body || 'Unable to stream audio'));
                    });
                    return;
                }
                response.status(statusCode);
                for (const header of STREAM_HEADERS) {
                    const value = upstream.headers[header];
                    if (value !== undefined) {
                        response.setHeader(header, value);
                    }
                }
                upstream.on('error', (error) => {
                    reject(new app_error_1.AppError(502, 'Streaming upstream error', { details: error.message }));
                });
                upstream.pipe(response);
                upstream.on('end', () => resolve());
            });
            request.on('error', (error) => {
                reject(new app_error_1.AppError(502, 'Unable to reach media upstream', { details: error.message }));
            });
            request.end();
        });
    };
    await requestStream(requestUrl);
};
exports.proxyRemoteStream = proxyRemoteStream;
//# sourceMappingURL=stream.js.map