import { Logger } from '@nestjs/common';
import { Agents } from '@scrapoxy/backend-sdk';
import {
    EProxyStatus,
    safeJoin,
} from '@scrapoxy/common';
import { CONNECTOR_IPROYAL_TYPE } from '@scrapoxy/connector-iproyal-sdk';
import { IproyalApi } from './api';
import type {
    IConnectorIproyalConfig,
    IConnectorIproyalCredential,
    IIproyalProxy,
} from './iproyal.interface';
import type { IConnectorService } from '@scrapoxy/backend-sdk';
import type{
    IConnectorProxyRefreshed,
    IProxyKeyToRemove,
    IProxyTransport,
} from '@scrapoxy/common';


function convertToProxy(session: IIproyalProxy): IConnectorProxyRefreshed | undefined {
    if (!session) {
        return;
    }

    const arr = session.credentials.split(':');

    if (arr.length !== 4) {
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
    const key = session.id.toString();
    const p: IConnectorProxyRefreshed = {
        type: CONNECTOR_IPROYAL_TYPE,
        key,
        name: key,
        status: EProxyStatus.STARTED,
        config,
    };

    return p;
}


export class ConnectorIproyalService implements IConnectorService {
    private readonly logger = new Logger(ConnectorIproyalService.name);

    private readonly api: IproyalApi;

    constructor(
        credentialConfig: IConnectorIproyalCredential,
        private readonly connectorConfig: IConnectorIproyalConfig,
        agents: Agents
    ) {
        this.api = new IproyalApi(
            credentialConfig.token,
            agents
        );
    }

    async getProxies(keys: string[]): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug(`getProxies(): keys=${safeJoin(keys)}`);

        const proxies = await this.api.getAllProxies(
            this.connectorConfig.product,
            this.connectorConfig.country
        );
        const proxiesFiltered = proxies
            .map(convertToProxy)
            .filter((p) => p && keys.includes(p.key));

        return proxiesFiltered as IConnectorProxyRefreshed[];
    }

    async createProxies(
        count: number, excludeKeys: string[]
    ): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug(`createProxies(): count=${count} / excludeKeys=${safeJoin(excludeKeys)}`);

        const proxies = await this.api.getAllProxies(
            this.connectorConfig.product,
            this.connectorConfig.country
        );
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

        return proxiesKeys;
    }
}
