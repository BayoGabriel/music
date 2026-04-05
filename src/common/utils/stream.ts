import https from 'https';
import { URL } from 'url';
import { Response } from 'express';
import { AppError } from '../errors/app-error';

const STREAM_HEADERS = [
  'accept-ranges',
  'cache-control',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified'
] as const;

export const proxyRemoteStream = async (targetUrl: string, range: string | undefined, response: Response) => {
  const requestUrl = new URL(targetUrl);

  const requestStream = (urlToStream: URL, redirectDepth = 0): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = https.request(
        urlToStream,
        {
          method: 'GET',
          headers: range ? { Range: range } : undefined
        },
        (upstream) => {
          const statusCode = upstream.statusCode ?? 502;
          const redirectLocation = upstream.headers.location;

          if ([301, 302, 307, 308].includes(statusCode) && redirectLocation && redirectDepth < 3) {
            upstream.resume();
            const nextUrl = new URL(redirectLocation, urlToStream);
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
              reject(new AppError(statusCode, body || 'Unable to stream audio'));
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
            reject(new AppError(502, 'Streaming upstream error', { details: error.message }));
          });

          upstream.pipe(response);
          upstream.on('end', () => resolve());
        }
      );

      request.on('error', (error) => {
        reject(new AppError(502, 'Unable to reach media upstream', { details: error.message }));
      });

      request.end();
    });
  };

  await requestStream(requestUrl);
};
