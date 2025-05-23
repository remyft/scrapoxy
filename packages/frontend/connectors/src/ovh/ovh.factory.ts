import {
    Injectable,
    Type,
} from '@angular/core';
import { CONNECTOR_OVH_TYPE } from '@scrapoxy/common';
import {
    ConnectorprovidersService,
    EConnectorType,
} from '@scrapoxy/frontend-sdk';
import { ConnectorOvhComponent } from './connector/connector.component';
import { CredentialOvhComponent } from './credential/credential.component';
import type {
    IConnectorComponent,
    IConnectorConfig,
    IConnectorFactory,
    ICredentialComponent,
    IInstallComponent,
} from '@scrapoxy/frontend-sdk';


@Injectable()
export class ConnectorOvhFactory implements IConnectorFactory {
    readonly type = CONNECTOR_OVH_TYPE;

   readonly config: IConnectorConfig = {
       name: 'OVH Cloud',
       description: 'OVH Cloud is a french cloud computing service created by OVH. In 2023, OVH Cloud has 34 data centers in 8 regions.',
       coupon: null,
       defaultCredentialName: 'OVH Cloud Credential',
       defaultConnectorName: 'OVH Cloud Connector',
       url: 'https://scrapoxy.io/l/ovh',
       type: EConnectorType.Datacenter,
       canInstall: false,
       canUninstall: false,
       useCertificate: true,
   };

   constructor(connectorproviders: ConnectorprovidersService) {
       connectorproviders.register(this);
   }

   init() {
       // Nothing
   }

   getCredentialComponent(): Type<ICredentialComponent> {
       return CredentialOvhComponent;
   }

   getConnectorComponent(): Type<IConnectorComponent> {
       return ConnectorOvhComponent;
   }

   getInstallComponent(): Type<IInstallComponent> {
       throw new Error('Not implemented');
   }
}
