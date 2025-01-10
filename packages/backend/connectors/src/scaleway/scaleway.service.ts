import { Logger } from '@nestjs/common';
import {
    Agents,
    TRANSPORT_DATACENTER_TYPE,
} from '@scrapoxy/backend-sdk';
import {
    CONNECTOR_SCALEWAY_TYPE,
    EProxyStatus,
    randomName,
} from '@scrapoxy/common';
import { ScalewayApi } from './api';
import { EScalewayInstanceState } from './scaleway.interface';
import type {
    IConnectorScalewayConfig,
    IConnectorScalewayCredential,
    IScalewayInstance,
} from './scaleway.interface';
import type {
    IConnectorService,
    ITransportProxyRefreshedConfigDatacenter,
} from '@scrapoxy/backend-sdk';
import type {
    IConnectorProxyRefreshed,
    IProxyKeyToRemove,
} from '@scrapoxy/common';


const CREATE_BATCH_SIZE = 10;


function convertStatus(code: EScalewayInstanceState): EProxyStatus {
    switch (code) {
        case EScalewayInstanceState.STARTING:
            return EProxyStatus.STARTING;
        case EScalewayInstanceState.RUNNING:
            return EProxyStatus.STARTED;
        case EScalewayInstanceState.STOPPING:
            return EProxyStatus.STOPPING;
        case EScalewayInstanceState.STOPPED:
        case EScalewayInstanceState.STOPPED_IN_PLACE:
            return EProxyStatus.STOPPED;
        default:
            return EProxyStatus.ERROR;
    }
}


export class ConnectorScalewayService implements IConnectorService {
    private readonly logger = new Logger(ConnectorScalewayService.name);

    private readonly api: ScalewayApi;

    constructor(
        private readonly credentialConfig: IConnectorScalewayCredential,
        private readonly connectorConfig: IConnectorScalewayConfig,
        agents: Agents
    ) {
        this.api = new ScalewayApi(
            credentialConfig.secretAccessKey,
            connectorConfig.region,
            credentialConfig.projectId,
            agents
        );
    }

    public async getProxies(): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug('getProxies()');

        const instances = await this.api.listInstances(this.connectorConfig.tag);

        return instances.map((instance) => {
            const config: ITransportProxyRefreshedConfigDatacenter = {
                address:
                    instance.public_ips && instance.public_ips.length > 0
                        ? {
                            hostname: instance.public_ips[ 0 ].address,
                            port: this.connectorConfig.port,
                        }
                        : void 0,
            };
            const proxy: IConnectorProxyRefreshed = {
                type: CONNECTOR_SCALEWAY_TYPE,
                transportType: TRANSPORT_DATACENTER_TYPE,
                key: instance.id,
                name: instance.name,
                config,
                status: convertStatus(instance.state),
            };

            return proxy;
        });
    }

    public async createProxies(count: number): Promise<IConnectorProxyRefreshed[]> {
        this.logger.debug(`createProxies(): count=${count}`);

        const allInstances: IScalewayInstance[] = [];
        // Create proxies in batch
        let countToCreate = count;
        while (countToCreate > 0) {
            const instancesPromises: Promise<IScalewayInstance>[] = [];
            for (let i = 0; i < Math.min(
                CREATE_BATCH_SIZE,
                countToCreate
            ); i++) {
                instancesPromises.push(this.createProxy());
            }

            const instances = await Promise.all(instancesPromises);
            allInstances.push(...instances);
            countToCreate -= CREATE_BATCH_SIZE;
        }

        const proxiesRefreshed = allInstances.map((instance) => {
            const config: ITransportProxyRefreshedConfigDatacenter = {
                address:
                instance.public_ips && instance.public_ips.length > 0
                    ? {
                        hostname: instance.public_ips[ 0 ].address,
                        port: this.connectorConfig.port,
                    }
                    : undefined,
            };
            const proxy: IConnectorProxyRefreshed = {
                type: CONNECTOR_SCALEWAY_TYPE,
                transportType: TRANSPORT_DATACENTER_TYPE,
                key: instance.id,
                name: instance.name,
                config,
                status: EProxyStatus.STARTING, // Override the status to avoid stopped instance at the beginning
            };

            return proxy;
        });

        return proxiesRefreshed;
    }

    public async startProxies(keys: string[]): Promise<void> {
        this.logger.debug(`startProxies(): keys.length=${keys.length}`);

        await Promise.all(keys.map((key) => this.api.startInstance(key)));
    }

    public async removeProxies(keys: IProxyKeyToRemove[]): Promise<string[]> {
        this.logger.debug(`removeProxies(): keys.length=${keys.length}`);

        const proxiesKeys = keys.map((p) => p.key);
        await Promise.all(proxiesKeys.map((key) => this.removeProxy(key)));

        return [];
    }

    private async createProxy(): Promise<IScalewayInstance> {
        const instance = await this.api.createInstance({
            name: randomName(),
            image: this.connectorConfig.imageId,
            commercial_type: this.connectorConfig.instanceType,
            project: this.credentialConfig.projectId,
            tags: [
                this.connectorConfig.tag,
            ],
        });

        await this.api.attachIP(instance.id);

        await this.api.startInstance(instance.id);

        return instance;
    }

    private async removeProxy(proxyId: string) {
        const instance = await this.api.getInstance(proxyId);

        if (instance.public_ips?.[ 0 ]) {
            await this.api.deleteIP(instance.public_ips[ 0 ].id);
        }

        await this.api.terminateInstance(instance.id);
    }
}
