import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { LoginPageComponent } from '../login.enum';
import { LoginService } from '../login.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, AfterViewInit {
  public registerForm: FormGroup;
  public country: any[];
  public state: any[];
  public zip: any[];
  public city: any[];
  public isZipCodeAvailable = true;
  public isReferenceZipCodeAvailable = true;
  public selectedCountryCode: number;
  public selectedStateCode: number;
  public selectedCityCode: number;
  public selectedZipcode: number;
  public errorMessage: any;
  public referenceState: any[];
  public referenceZip: any[];
  public referenceCity: any[];
  public referenceCountryCode: number;
  public referenceStateCode: number;
  public referenceCityCode: number;
  public referenceZipcode: number;
  public fileLength: number;
  public selectedFileName: string;
  public notUniqueCompanyName: boolean;
  public emailExist: boolean;
  public loginNameExist: boolean;
  public validloginName: boolean;
  public regLoginName: string;
  public regCompanyEmail: string;
  public regCompanyName: string;
  public fileExtError: boolean;
  public fileSizeError: boolean;
  public file: File;
  public isRegistered = false;
  public successRegisterMessage: any;
  public thirdPartyEmail: any;
  public registerBtnIcon = 'none';

  constructor(
    private notify: NotifyService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loginService: LoginService
  ) { }

  ngOnInit() {

    this.registerForm = this.buildRegistrationForm();
    this.country = [];
    this.getCountryNames();
    this.state = [];
    this.city = [];
    this.zip = [];
    this.referenceState = [];
    this.referenceZip = [];
    this.referenceCity = [];
  }

  ngAfterViewInit() {
    const height = jQuery(window).height();
    const maxHeight = height - 100;
    jQuery('.main-container').css('max-height', maxHeight);
  }

  buildRegistrationForm(): any {
    return this.formBuilder.group({
      company_name: ['', [Validators.required ,this.noWhitespaceValidator]],
      contact_person: ['', [Validators.required,this.noWhitespaceValidator]],
      email_id: ['', Validators.required],
      login_name: ['', Validators.required],
      street: ['', Validators.required],
      contact_number: ['', [Validators.required, Validators.minLength(10)]],
      zip_code: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      third_party_email_id: [''],
      third_party_country: [''],
      third_party_state: [''],
      third_party_city: [''],
      third_party_zip_code: [''],
      third_party_street: [''],
      third_party_name: [''],
      agree: [false, Validators.pattern('true')],
      recieve_notification: [false]
    });
  }

  isNumber(event: any) {
    event = (event) ? event : window.event;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  noWhitespaceValidator(registerForm: FormGroup) {
    let isWhitespace = (registerForm.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
}

  submitRegisterForm(form: any) {
    this.errorMessage = '';
    if (!this.fileExtError && !this.fileSizeError) {
      this.registerBtnIcon = 'fa fa-spinner fa-pulse';
      this.authService.registerUser(form.value).subscribe(response => {
        if (!response.error_status) {
          const fileFormData: FormData = new FormData();
          fileFormData.append('uploadFile', this.file, this.file.name);
          this.authService.uploadUserDocument(fileFormData).subscribe((res) => {
            this.isRegistered = true;
            this.registerBtnIcon = 'none';
            if (!response.error_status) {
              this.successRegisterMessage = 'successRegister&FileUpload';
            } else {
              this.successRegisterMessage = 'successRegister&FailureFileUpload';
            }
          }, error => {
            this.isRegistered = true;
            this.successRegisterMessage = 'successRegister&FailureFileUpload';
          });
        } else {
          this.registerBtnIcon = 'none';
          this.errorMessage = 'Fields_Missing';
        }
      }, error => {
        this.registerBtnIcon = 'none';
        this.errorMessage = 'Some technical problem occurred. Please try later.';
      });
    }
  }

  getCountryNames() {
    this.loginService.getCountry().subscribe((response) => {
      if (!response.error_status && response.data) {
        this.country = [];
        response.data.forEach((element) => {
          const countryName = new TitleCasePipe().transform(element.country_name);
          this.country.push({ label: countryName, value: element.country_code });
        });
      }
    });
  }

  getStateNames(country_code) {
    this.loginService.getState(country_code).subscribe((response) => {
      if (!response.error_status) {
        this.state = [];
        this.city = [];
        this.zip = [];
        response.data.forEach((element) => {
          const regionName = new TitleCasePipe().transform(element.region_name);
          this.state.push({ label: regionName, value: element.region_code });
        });
      }
    });
  }

  getCityNames(country_code, state_code) {
    this.loginService.getCity(country_code, state_code).subscribe((response) => {
      if (!response.error_status) {
        this.city = [];
        this.zip = [];
        response.data.forEach((element) => {
          const cityName = new TitleCasePipe().transform(element.city_name);
          this.city.push({ label: cityName, value: element.city_code });
        });
      }
    });
  }

  getPinCodes(city_code) {
    this.loginService.getPincode(city_code).subscribe((response) => {
      if (!response.error_status) {
        this.zip = [];
        if (response.data.length > 0) {
          this.isZipCodeAvailable = true;
          response.data.forEach((element) => {
            this.zip.push({ label: element.zip_code, value: element.zip_code });
          });
        } else {
          this.isZipCodeAvailable = false;
        }
      }
    });
  }

  getReferenceStateNames(country_code) {
    this.loginService.getState(country_code).subscribe((response) => {
      if (!response.error_status) {
        this.referenceState = [];
        this.referenceCity = [];
        this.referenceZip = [];
        response.data.forEach((element) => {
          this.referenceState.push({ label: element.region_name, value: element.region_code });
        });
      }
    });
  }

  getReferenceCityNames(country_code, state_code) {
    this.loginService.getCity(country_code, state_code).subscribe((response) => {
      if (!response.error_status) {
        this.referenceCity = [];
        this.referenceZip = [];
        response.data.forEach((element) => {
          this.referenceCity.push({ label: element.city_name, value: element.city_code });
        });
      }
    });
  }

  getReferencePinCodes(city_code) {
    this.loginService.getPincode(city_code).subscribe((response) => {
      if (!response.error_status) {
        this.referenceZip = [];
        if (response.data.length > 0) {
          this.isReferenceZipCodeAvailable = true;
          response.data.forEach((element) => {
            this.referenceZip.push({ label: element.zip_code, value: element.zip_code });
          });
        } else {
          this.isReferenceZipCodeAvailable = false;
        }
      }
    });
  }

  onCountryChange() {
    this.state = [{ label: 'State', value: null }];
    this.city = [{ label: 'City', value: null }];
    this.zip = [{ label: 'Zip', value: null }];
    this.getStateNames(this.selectedCountryCode);
  }

  onStateChange() {
    this.city = [{ label: 'City', value: null }];
    this.zip = [{ label: 'Zip', value: null }];
    this.getCityNames(this.selectedCountryCode, this.selectedStateCode);
  }

  onCityChange() {
    this.zip = [{ label: 'Zip', value: null }];
    this.getPinCodes(this.selectedCityCode);
  }

  onReferenceCountryChanged() {
    this.referenceState = [{ label: 'State', value: null }];
    this.referenceCity = [{ label: 'City', value: null }];
    this.referenceZip = [{ label: 'Zip', value: null }];
    this.getReferenceStateNames(this.referenceCountryCode);
  }

  onReferenceStateChange() {
    this.referenceCity = [{ label: 'City', value: null }];
    this.referenceZip = [{ label: 'Zip', value: null }];
    this.getReferenceCityNames(this.referenceCountryCode, this.referenceStateCode);
  }

  onReferenceCityChange() {
    this.referenceZip = [{ label: 'Zip', value: null }];
    this.getReferencePinCodes(this.referenceCityCode);
  }

  onFileChange(event) {
    const fileList: FileList = event.target.files || event.srcElement.files;
    this.fileLength = fileList.length;
    this.file = fileList[0];
    this.selectedFileName = this.file.name;
    const ext = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1).toLowerCase();
    const extArray = ['pdf', 'jpeg', 'png', 'jpg'];
    this.fileExtError = extArray.indexOf(ext) === -1 ? true : false;
    this.fileSizeError = fileList[0].size > 2000000 ? true : false;
  }

  validateCompanyName(companyName) {
    if (companyName) {
      this.loginService.companyNameValidation(companyName).subscribe((response) => {
        if (response && response.code !== 'AUTH_UNIQ_COMPNAME_200_1') {
          this.notUniqueCompanyName = true;
        } else {
          this.notUniqueCompanyName = false;
        }
      });
    }
  }

  validateEmail(email) {
    if (email) {
      this.loginService.validateEmail(email).subscribe((response) => {
        if (response && response.code !== 'AUTH_UNIQ_EMAIL_200_1') {
          this.emailExist = true;
        } else {
          this.emailExist = false;
        }
      });
    }
  }

  validateLoginName(loginName) {
    if (loginName) {
      this.loginService.validateLoginName(loginName.trim()).subscribe((response) => {
        if (response && response.code !== 'AUTH_UNIQ_LOGINNAME_200_1') {
          this.loginNameExist = true;
        } else {
          this.loginNameExist = false;
          var checkvalue = [":", ";"];
          const isvalidname = this.chkvalidation(loginName, checkvalue);
          if (isvalidname === true) {
            this.validloginName = true;
          } else {
            this.validloginName = false;
          }

        }
      });
    }
  }

  chkvalidation(loginName, checkvalue) {
    return checkvalue.some(function (val) {
      return loginName.includes(val);
    });
  }

  isInvalidEmail(email) {
    const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (email) {
      const isvalid = email.match(regex);
      return isvalid ? false : true;
    }
  }

  redirectTologin() {
    this.notify.notifyScreen({ component: LoginPageComponent.Authentication });
  }
}
