import {
    Component,
    Inject,
    Input,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    CONNECTOR_CLOUDLOCAL_TYPE,
    ECloudlocalQueryCredential,
} from '@scrapoxy/connector-cloudlocal-sdk';
import {
    CommanderFrontendClientService,
    ToastsService,
} from '@scrapoxy/frontend-sdk';
import type { OnInit } from '@angular/core';
import type { ICommanderFrontendClient } from '@scrapoxy/common';
import type {
    ICloudlocalQueryRegionSizes,
    IRegionCloudlocal,
    IRegionSizeCloudlocal,
} from '@scrapoxy/connector-cloudlocal-sdk';
import type { IConnectorComponent } from '@scrapoxy/frontend-sdk';


@Component({
    selector: `connector-${CONNECTOR_CLOUDLOCAL_TYPE}`,
    templateUrl: 'connector.component.html',
})
export class ConnectorCloudlocalComponent implements IConnectorComponent, OnInit {
    @Input()
        form: FormGroup;

    @Input()
        projectId: string;

    @Input()
        credentialId: string;

    @Input()
    connectorId: string | undefined;

    @Input()
        createMode: boolean;

    regions: IRegionCloudlocal[] = [];

    sizes: IRegionSizeCloudlocal[] = [];

    processingRegions = false;

    processingSizes = false;

    readonly subForm: FormGroup;

    constructor(
        @Inject(CommanderFrontendClientService)
        private readonly commander: ICommanderFrontendClient,
        fb: FormBuilder,
        private readonly toastsService: ToastsService
    ) {
        this.subForm = fb.group({
            region: [
                void 0, Validators.required,
            ],
            size: [
                void 0, Validators.required,
            ],
            imageId: [
                void 0,
            ],
        });
    }

    async ngOnInit(): Promise<void> {
        await Promise.resolve();

        if (this.form.get('config')) {
            this.form.removeControl('config');
        }

        this.form.addControl(
            'config',
            this.subForm
        );

        if (this.createMode) {
            this.subForm.patchValue({
                region: 'europe',
                size: 'small',
                imageId: void 0,
            });
        }

        this.processingRegions = true;

        try {
            this.regions = await this.commander.queryCredential(
                this.projectId,
                this.credentialId,
                {
                    type: ECloudlocalQueryCredential.Regions,
                }
            )
                .then((regions: IRegionCloudlocal[]) => regions.sort((
                    a, b
                ) => a.description.localeCompare(b.description)));

            await this.updateSizes(this.subForm.value.region);
        } catch (err: any) {
            console.error(err);

            this.toastsService.error(
                'Connector Local cloud',
                err.message
            );
        } finally {
            this.processingRegions = false;
        }
    }

    async regionChanged(): Promise<void> {
        const region = this.subForm.value.region;

        if (region) {
            await this.updateSizes(region);
        } else {
            await this.updateSizes();
        }
    }

    private async updateSizes(region?: string): Promise<void> {
        if (region) {
            this.processingSizes = true;

            try {
                const parameters: ICloudlocalQueryRegionSizes = {
                    region,
                };

                this.sizes = await this.commander.queryCredential(
                    this.projectId,
                    this.credentialId,
                    {
                        type: ECloudlocalQueryCredential.RegionSizes,
                        parameters,
                    }
                )
                    .then((sizes: IRegionSizeCloudlocal[]) => sizes.sort((
                        a, b
                    ) => a.description.localeCompare(b.description)));
            } catch (err: any) {
                console.error(err);

                this.toastsService.error(
                    'Connector Local cloud',
                    err.message
                );
            } finally {
                this.processingSizes = false;
            }
        } else {
            this.sizes = [];
        }
    }
}
