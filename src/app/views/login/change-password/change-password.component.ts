import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '@srk/core';
import { Router } from '@angular/router';
import { MessageService } from '@srk/core';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    public changePasswordForm: FormGroup;
    public errorMessage: any;
    public isPasswordChange = false;

    constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router,
        public messageService: MessageService) {
        this.changePasswordForm = this.formBuilder.group({
            userName: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        });
    }

    ngOnInit() { }

    submitChangePasswordForm(value: any) {
        this.errorMessage = '';
        const passwordValidation = this.isPasswordMatched(value);
        if (!passwordValidation) {
            this.errorMessage = 'PASSWORD_NOT_MATCHED';
        } else {
            this.initiateChangePassword(value.userName, value.password);
        }
    }

    initiateChangePassword(username, password) {
        const resetJson = {};
        resetJson['login_name'] = username;
        resetJson['password'] = password;
        this.authService.requestChangePassword(resetJson['login_name'], resetJson['password']).subscribe(res => {
            if (!res.error_status) {
                if (res.code === "AUTH_LOGIN_INVALID_USER_OR_PASS_IS_ALRADY_CHANGED_200") {
                    this.messageService.showErrorGrowlMessage('Username is not matched');
                } if (res.code === "AUTH_PASS_200_1") {
                    this.isPasswordChange = true;
                    this.messageService.showSuccessGrowlMessage('PASSWORD_SUCCESSFULLY_CHANGED');;
                    this.router.navigate(['login']);
                }
            }
        }, error => {
            this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');;
        });
    }

    isPasswordMatched(data) {
        const newPasswordText = data.password;
        const confirmPasswordText = data.confirmPassword;
        let flag = false;
        if (newPasswordText === confirmPasswordText) {
            flag = true;
        }
        return flag;
    }
}