import {
    Component,
    Input,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { CONNECTOR_SCALEWAY_TYPE } from '@scrapoxy/common';
import type { OnInit } from '@angular/core';
import type { ICredentialComponent } from '@scrapoxy/frontend-sdk';


@Component({
    selector: `credential-${CONNECTOR_SCALEWAY_TYPE}`,
    templateUrl: 'credential.component.html',
})
export class CredentialScalewayComponent implements ICredentialComponent, OnInit {
    @Input()
    form: FormGroup;

    @Input()
    projectId: string;

    @Input()
    credentialId: string | undefined;

    @Input()
    createMode: boolean;

    secretAccessKeyType = 'password';

    readonly subForm: FormGroup;

    constructor(fb: FormBuilder) {
        this.subForm = fb.group({
            secretAccessKey: [
                void 0, Validators.required,
            ],
            projectId: [
                void 0, Validators.required,
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
    }

    toggleSecretAccessKeyType() {
        if (this.secretAccessKeyType === 'password') {
            this.secretAccessKeyType = 'text';
        } else {
            this.secretAccessKeyType = 'password';
        }
    }
}
