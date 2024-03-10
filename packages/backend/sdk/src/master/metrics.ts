import { PassThrough } from 'stream';
import type {
    IProxyMetricsAdd,
    IProxyToConnect,
} from '@scrapoxy/common';
import type {
    ClientRequestArgs,
    IncomingMessage,
} from 'http';


export class ConnectionMetrics {
    private readonly removeReadListener: (() => void) | undefined = void 0;

    private readonly removeWriteListener: (() => void) | undefined = void 0;

    constructor(
        private readonly proxy: IProxyToConnect,
        private readonly proxies: Map<string, IProxyMetricsAdd>,
        sIn: PassThrough,
        sOut: PassThrough
    ) {
        this.getMetrics().requests += 1;

        // Read
        const readListener = (chunk: Buffer) => {
            this.getMetrics().bytesReceived += chunk.length;
        };
        sIn.on(
            'data',
            readListener
        );

        this.removeReadListener = () => {
            sIn.removeListener(
                'data',
                readListener
            );
        };

        // Write
        const writeListener = (chunk: Buffer) => {
            this.getMetrics().bytesSent += chunk.length;
        };

        sOut.on(
            'data',
            writeListener
        );

        this.removeWriteListener = () => {
            sOut.removeListener(
                'data',
                writeListener
            );
        };

    }

    addRequestHeaders(req: ClientRequestArgs) {
        let size = 12 +
            (req.method ? req.method.length : 0) +
            (req.path ? req.path.length : 0);

        if (req.headers) {
            for (const [
                k, v,
            ] of Object.entries(req.headers)) {
                // is number
                if (typeof v === 'number') {
                    size += k.length + v.toString().length + 4;
                } else if (v) {
                    if (Array.isArray(v)) {
                        for (const h of v) {
                            size += k.length + h.length + 4;
                        }
                    } else {
                        size += k.length + v.length + 4;
                    }
                }
            }
        }

        this.getMetrics().bytesSent += size;
    }

    addResponseHeaders(res: IncomingMessage) {
        let size = 12 +
            res.httpVersion.length +
            (res.statusCode ? res.statusCode.toString().length : 0) +
            (res.statusMessage ? res.statusMessage.length : 0);

        for (const [
            k, v,
        ] of Object.entries(res.headers)) {
            if (v) {
                if (Array.isArray(v)) {
                    for (const h of v) {
                        size += k.length + h.length + 4;
                    }
                } else {
                    size += k.length + v.length + 4;
                }
            }
        }

        this.getMetrics().bytesReceived += size;
    }

    unregister() {
        if (this.removeWriteListener) {
            this.removeWriteListener();
        }

        if (this.removeReadListener) {
            this.removeReadListener();
        }
    }

    private getMetrics(): IProxyMetricsAdd {
        let val = this.proxies.get(this.proxy.id);

        if (!val) {
            val = {
                id: this.proxy.id,
                projectId: this.proxy.projectId,
                connectorId: this.proxy.connectorId,
                requests: 0,
                bytesReceived: 0,
                bytesSent: 0,
            };
            this.proxies.set(
                this.proxy.id,
                val
            );
        }

        return val;
    }
}
