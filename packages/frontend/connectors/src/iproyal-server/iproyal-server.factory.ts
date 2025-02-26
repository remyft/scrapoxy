import {
    Injectable,
    Type,
} from '@angular/core';
import { CONNECTOR_IPROYAL_SERVER_TYPE } from '@scrapoxy/common';
import {
    ConnectorprovidersService,
    EConnectorType,
} from '@scrapoxy/frontend-sdk';
import { ConnectorIproyalServerComponent } from './connector/connector.component';
import { CredentialIproyalServerComponent } from './credential/credential.component';
import type {
    IConnectorComponent,
    IConnectorConfig,
    IConnectorFactory,
    ICredentialComponent,
    IInstallComponent,
} from '@scrapoxy/frontend-sdk';


@Injectable()
export class ConnectorIproyalServerFactory implements IConnectorFactory {
    readonly type = CONNECTOR_IPROYAL_SERVER_TYPE;

   readonly config: IConnectorConfig = {
       name: 'IPRoyal Server',
       description: 'IPRoyal is a proxy provider that offers a versatile selection of different proxies. These include top-end residential proxies, datacenter proxies, and even niche-specific sneaker proxies',
       coupon: null,
       defaultCredentialName: 'IPRoyal Server Credential',
       defaultConnectorName: 'IPRoyal Server Connector',
       url: 'https://scrapoxy.io/l/iproyal',
       type: EConnectorType.StaticIp,
       canInstall: false,
       canUninstall: false,
       useCertificate: false,
   };

   constructor(connectorproviders: ConnectorprovidersService) {
       connectorproviders.register(this);
   }

   init() {
       // Nothing
   }

   getCredentialComponent(): Type<ICredentialComponent> {
       return CredentialIproyalServerComponent;
   }

   getConnectorComponent(): Type<IConnectorComponent> {
       return ConnectorIproyalServerComponent;
   }

   getInstallComponent(): Type<IInstallComponent> {
       throw new Error('Not implemented');
   }
}
