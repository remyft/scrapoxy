import { Logger } from '@nestjs/common';
import { Agents } from '@scrapoxy/backend-sdk';
import {
    EProxyStatus,
    safeJoin,
} from '@scrapoxy/common';
import { CONNECTOR_RAYOBYTE_TYPE } from '@scrapoxy/connector-rayobyte-sdk';
import { RayobyteApi } from './api';
import type {
    IConnectorRayobyteConfig,
    IConnectorRayobyteCredential,
} from './rayobyte.interface';
import type { IConnectorService } from '@scrapoxy/backend-sdk';
import type {
    IConnectorProxyRefreshed,
    IProxyKeyToRemove,
    IProxyTransport,
} from '@scrapoxy/common';


function convertToProxy(line: string): IConnectorProxyRefreshed | undefined {
    if (!line) {
        return;
    }

    const arr = line.split(':');

    if (arr.length < 4) {
        return;
    }

    const [
        hostname,
        portRaw,
        username,
        password,
    ] = arr;
    let port: number;
    try {
        port = parseInt(
            portRaw,
            10
        );
    } catch (err: any) {
        return;
    }

    const config: IProxyTransport = {
        address: {
            hostname,
            port,
        },
        auth: {
            username,
            password,
        },
    };
    const name = `${hostname}:${port}`;
    const p: IConnectorProxyRefreshed = {
        type: CONNECTOR_RAYOBYTE_TYPE,
        key: name,
        name: name,
        status: EProxyStatus.STARTED,
        config,
    };

    return p;
}


export class ConnectorRayobyteService implements IConnectorService {
    private readonly logger = new Logger(ConnectorRayobyteService.name);

    private readonly api: RayobyteApi;

    constructor(
        credentialConfig: IConnectorRayobyteCredential,
        private readonly connectorConfig: IConnectorRayobyteConfig,
        agents: Agents
    ) {
        this.api = new RayobyteApi(
            credentialConfig.email,
            credentialConfig.apiKey,
            agents
        );
    }

    async getProxies(keys: string[]): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug(`getProxies(): keys=${safeJoin(keys)}`);

        const filter = (this.connectorConfig.packageFilter ?? 'all').toLowerCase();
        const proxies = await this.api.exportProxies(filter);
        const proxiesFiltered = proxies
            .map(convertToProxy)
            .filter((p) => p && keys.includes(p.key));

        return proxiesFiltered as IConnectorProxyRefreshed[];

    }

    async createProxies(
        count: number, excludeKeys: string[]
    ): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug(`createProxies(): count=${count} / excludeKeys=${safeJoin(excludeKeys)}`);

        const filter = (this.connectorConfig.packageFilter ?? 'all').toLowerCase();
        const proxies = await this.api.exportProxies(filter);
        const proxiesFiltered = proxies
            .map(convertToProxy)
            .filter((p) => p && !excludeKeys.includes(p.key))
            .slice(
                0,
                count
            );

        return proxiesFiltered as IConnectorProxyRefreshed[];
    }

    async startProxies(keys: string[]): Promise<void> {
        this.logger.debug(`startProxies(): keys=${safeJoin(keys)}`);

        // Not used
    }

    async removeProxies(keys: IProxyKeyToRemove[]): Promise<string[]> {
        const proxiesKeys = keys.map((p) => p.key);
        this.logger.debug(`removeProxies(): keys=${safeJoin(proxiesKeys)}`);

        const ips = keys
            .filter((p) => p.force)
            .map((p) => p.key.split(':')[ 0 ]);

        if (ips.length > 0) {
            await this.api.replaceProxies(ips);
        }

        return proxiesKeys;
    }
}
