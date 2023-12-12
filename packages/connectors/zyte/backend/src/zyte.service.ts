import { Logger } from '@nestjs/common';
import { Agents } from '@scrapoxy/backend-sdk';
import {
    EProxyStatus,
    safeJoin,
} from '@scrapoxy/common';
import { CONNECTOR_ZYTE_TYPE } from '@scrapoxy/connector-zyte-sdk';
import { ZyteApi } from './api';
import type { IConnectorZyteCredential } from './zyte.interface';
import type { IConnectorService } from '@scrapoxy/backend-sdk';
import type {
    IConnectorProxyRefreshed,
    IProxyKeyToRemove,
} from '@scrapoxy/common';


function convertToProxy(session: string): IConnectorProxyRefreshed {
    const proxy: IConnectorProxyRefreshed = {
        type: CONNECTOR_ZYTE_TYPE,
        key: session,
        name: session,
        status: EProxyStatus.STARTED,
        config: {},
    };

    return proxy;
}


export class ConnectorZyteService implements IConnectorService {
    private readonly logger = new Logger(ConnectorZyteService.name);

    private readonly api: ZyteApi;

    constructor(
        credentialConfig: IConnectorZyteCredential,
        agents: Agents
    ) {
        this.api = new ZyteApi(
            credentialConfig.token,
            agents
        );
    }

    async getProxies(keys: string[]): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug('getProxies()');

        const sessions = await this.api.getAllSessions();

        return sessions
            .filter((s) => keys.includes(s))
            .map(convertToProxy);
    }

    async createProxies(count: number): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug(`createProxies(): count=${count}`);

        const sessions: string[] = [];
        for (let i = 0; i < count; ++i) {
            const session = await this.api.createSession();
            sessions.push(session);
        }

        return sessions.map(convertToProxy);
    }

    async startProxies(): Promise<void> {
        // Not used
    }

    async removeProxies(keys: IProxyKeyToRemove[]): Promise<string[]> {
        const proxiesKeys = keys.map((p) => p.key);
        this.logger.debug(`removeProxies(): keys=${safeJoin(proxiesKeys)}`);

        await Promise.all(proxiesKeys.map((key) => this.api.removeSession(key)));

        return [];
    }
}
