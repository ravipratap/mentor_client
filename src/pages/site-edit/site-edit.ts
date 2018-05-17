import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the SiteEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  defaultHistory: ['SiteListPage']
})
@Component({
  selector: 'page-site-edit',
  templateUrl: 'site-edit.html',
})
export class SiteEditPage {
  @ViewChild('siteEditSlider') siteEditSlider: Slides;
  site: any;
  showPrev: boolean = false;
  showNext: boolean = true;
  submitted = false;
  maxDate: string = new Date(Date.now()+ 31470552000).toISOString();
  maxDateEnd: string = new Date(Date.now()+ 62941252000).toISOString();
  siteForm: FormGroup;
  formErrors = {
    'company': '',
    'domain': '',
    'category': '',
    'plan': '',
    'status': '',
    'users': '',
    'start': '',
    'end': ''
  };
  validationMessages = {
    'company': {
      'required' : 'Company name is required.'
    },
    'domain': {
      'domainRequired' : 'Domain or Email Domain is required'
    },
    'category': {
      'required' : 'Site category needs to be set.'
    },
    'plan': {
      'enterpriseRequired' : 'Plan needs to be set.'
    },
    'status': {
      'required' : 'Status needs to be set.'
    },
    'users': {
      'enterpriseRequired' : 'No of users is required.'
    },
    'start': {
      'required' : 'Start Date is required.'
    },
    'end': {
      'enterpriseRequired' : 'End Date is required.'
    }
  };
  loading: any;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public formBuilder: FormBuilder,
    public loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    private config: ConfigProvider,
    private auth: AuthProvider
  ) {
    if(this.navParams.data.site){
      this.site = this.navParams.data.site;
    }
    this.initForm();
  }
  initForm() {
    let email_domains = new FormArray([]);
    this.siteForm = this.formBuilder.group({
      profile: this.formBuilder.group({
        company: [this.site? this.site.profile.company: "", Validators.required],
        domain: [this.site? (this.site.profile.domain? this.site.profile.domain : "") : "", this.enterpriseDomainValidator()],
        category: [this.site? this.site.profile.category: "", Validators.required]
      }),
      products: this.formBuilder.group({
        mentor: [this.site && this.site.config? this.site.config.mentor: false],
        kudos: [this.site && this.site.config? this.site.config.kudos: false],
        idea: [this.site && this.site.config? this.site.config.idea: false],
        pulse: [this.site && this.site.config? this.site.config.pulse: false],
        peer: [this.site && this.site.config? this.site.config.peer: false],
        performance: [this.site && this.site.config? this.site.config.performance: false],
        advice: [this.site && this.site.config? this.site.config.advice: false]
      }, { validator: this.requiredOneValueValidator()}),
      emailsForm:  this.formBuilder.group({
        email_domains: email_domains
      }),
      license: this.formBuilder.group({
        plan: [this.site? this.site.license.plan: "", this.enterpriseRequiredValidator()],
        status: [this.site? this.site.license.status: "Pending", Validators.required],
        users: [this.site? this.site.license.users: "", this.enterpriseRequiredValidator()],
        start: [this.site? (this.site.license.start? this.site.license.start : new Date().toISOString()) : new Date().toISOString(), Validators.required],
        end: [this.site? (this.site.license.end? this.site.license.end : "") : this.maxDate, this.enterpriseRequiredValidator()]
      })
    });
    if ( this.site && this.site.profile.email_domains ) {
      this.site.profile.email_domains.forEach( ( email_domain, email_domainIndex ) => {
        this.addEmailDomain(email_domain);
      });
    }
    this.addEmailDomain();
    this.siteForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
    console.log("errors", this.formErrors);
  }
  addEmailDomain(email_domain?: string):void {
    (<FormArray>(<FormGroup>this.siteForm.get('emailsForm')).controls['email_domains']).push(
      new FormGroup({
        email_domain: new FormControl(email_domain? email_domain: '')
      })
    );
  }
  removeEmailDomain(index: number) {
    (<FormArray>(<FormGroup>this.siteForm.get('emailsForm')).controls['email_domains']).removeAt(index);
  }
  onValueChanged(data? : any) {
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      let control = (<FormGroup>this.siteForm.get("profile")).get(field);
      if (control) {
        this.formErrors[field] = '';
      } else {
        control = (<FormGroup>this.siteForm.get("license")).get(field);
        if (control) {
          this.formErrors[field] = '';
        }
      }
      if (control && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }
  enterpriseDomainValidator() {
    let thisControl: FormControl;
    let otherControl: FormControl;
    let email_domainControls: FormArray; 
    return function matchOtherValidate (control: FormControl) {
      if (!control.parent) {
        return null;
      }
      // Initializing the validator.
      if (!thisControl) {
        thisControl = control;
        otherControl = control.parent.get("category") as FormControl;
        email_domainControls = <FormArray>(<FormGroup>(control.parent.parent).get('emailsForm')).controls.email_domains;
        if (!otherControl) {
          throw new Error('enterpriseDomainValidator(): other control is not found ');
        }
        otherControl.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
        email_domainControls.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }
      if (!otherControl) {
        return null;
      }
      if (otherControl.value !== 'Platform' && !thisControl.value) {
        let emailDomainExists = false;
        email_domainControls.controls.forEach((formGroup: FormGroup) => {
          if(formGroup.controls.email_domain.value) {
            emailDomainExists = true;
          }
        });
        if(!emailDomainExists){ 
          return {
            domainRequired: true
          };
        }
      }
      return null;
    }
  }

  requiredOneValueValidator() {
    let thisFormGroup: FormGroup;
    return function (formGroup: FormGroup) {
      // // console.log(FormGroup)
      // if (!formGroup.parent) {
      //   return null;
      // }
      if (!thisFormGroup) {
        thisFormGroup = formGroup;
      }
      let hasOneValue= false;
      
      // thisFormGroup.controls.forEach((formControl: formControl) => {
      //   if(formControl.value) {
      //     hasOneValue=true;
      //   }
      // });
      for (let control in thisFormGroup.controls) {
        if(thisFormGroup.get(control).value) {
          hasOneValue=true;
        }
      }
      // console.log("requiredOneValueValidator", category, hasOneValue, thisFormGroup);
      if (!hasOneValue) {
        return { requiredOneValue: true };
      }    
      return null;
    }
  }
  enterpriseRequiredValidator() {
    let thisControl: FormControl;
    let otherControl: FormControl;
    return function matchOtherValidate (control: FormControl) {
      if (!control.parent) {
        return null;
      }
      // Initializing the validator.
      if (!thisControl) {
        thisControl = control;
        otherControl=(<FormGroup>(control.parent.parent).get('profile')).get("category") as FormControl;
        if (!otherControl) {
          throw new Error('enterpriseRequiredValidator(): other control is not found ');
        }
        otherControl.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }
      if (!otherControl) {
        return null;
      }
      if (otherControl.value !== 'Platform' && !thisControl.value) {
        return {
          enterpriseRequired: true
        };
      }
      return null;
    }
  }
  onSlideChangeStart(slider: Slides) {
    this.showNext = !slider.isEnd();
    this.showPrev = !slider.isBeginning();
  }
  prev() {
    this.siteEditSlider.slidePrev();
  }
  next() {
    this.siteEditSlider.slideNext();
  }
  save() {
    this.submitted = true;
    console.log("form Errors after submit: ", this.formErrors);
    console.log("(<FormGroup>this.siteForm.get('profile')).valid:", (<FormGroup>this.siteForm.get('profile')));
    if(!(<FormGroup>this.siteForm.get('profile')).valid){
      this.siteEditSlider.slideTo(0);
    } else if (!(<FormGroup>this.siteForm.get('products')).valid){
      this.siteEditSlider.slideTo(2);
    } else if ( (<FormGroup>this.siteForm.get('license')).valid ) {
      if(!this.site){
        this.site = {
          profile : {},
          license : {},
          config: {} 
        };
      }
      this.site.profile.company = (<FormGroup>this.siteForm.get('profile')).controls.company.value;
      if((<FormGroup>this.siteForm.get('profile')).controls.domain.value) {
        this.site.profile.domain = (<FormGroup>this.siteForm.get('profile')).controls.domain.value;
      }
      this.site.profile.category = (<FormGroup>this.siteForm.get('profile')).controls.category.value;
      let email_domains: string[] =[];
      (<FormArray>(<FormGroup>this.siteForm.get('emailsForm')).controls.email_domains).controls.forEach((formGroup: FormGroup) => {
        if(formGroup.controls.email_domain.value) {
          email_domains.push(formGroup.controls.email_domain.value);
        }
      });
      this.site.profile.email_domains=email_domains;
      if((<FormGroup>this.siteForm.get('license')).controls.plan.value) {
        this.site.license.plan = (<FormGroup>this.siteForm.get('license')).controls.plan.value;
      }
      this.site.license.status = (<FormGroup>this.siteForm.get('license')).controls.status.value;
      if((<FormGroup>this.siteForm.get('license')).controls.users.value) {
        this.site.license.users = (<FormGroup>this.siteForm.get('license')).controls.users.value;
      }
      this.site.license.start = (<FormGroup>this.siteForm.get('license')).controls.start.value;
      if((<FormGroup>this.siteForm.get('license')).controls.end.value) {
        this.site.license.end = (<FormGroup>this.siteForm.get('license')).controls.end.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.mentor.value) {
        this.site.config["mentor"] = (<FormGroup>this.siteForm.get('products')).controls.mentor.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.kudos.value) {
        this.site.config["kudos"] = (<FormGroup>this.siteForm.get('products')).controls.kudos.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.idea.value) {
        this.site.config["idea"] = (<FormGroup>this.siteForm.get('products')).controls.idea.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.pulse.value) {
        this.site.config["pulse"] = (<FormGroup>this.siteForm.get('products')).controls.pulse.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.peer.value) {
        this.site.config["peer"] = (<FormGroup>this.siteForm.get('products')).controls.peer.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.performance.value) {
        this.site.config["performance"] = (<FormGroup>this.siteForm.get('products')).controls.performance.value;
      }
      if((<FormGroup>this.siteForm.get('products')).controls.advice.value) {
        this.site.config["advice"] = (<FormGroup>this.siteForm.get('products')).controls.advice.value;
      }
      this.showLoading();
      this.config.saveSite(this.site)
      .finally(
        () => {
          console.log("Save Site complete");
        })
      .subscribe((data: any) => { 
        this.dismissLoading();
        if(data.success){
          this.showToastWithCloseButton(this.site.profile.company + ' has been updated!');
          this.navCtrl.pop().then(() => {
            let siteIndex: number;
            if(this.site._id) {
              siteIndex=this.navParams.get('siteIndex');
            } else {
              siteIndex=-1;
            }
            this.navParams.get('callback')({
              site: data.site,
              siteIndex: siteIndex
            });
          });
        } else {
          this.showToastWithCloseButton("Unable to save site. Please try later", 5000);
        }
        
      },
      err =>  {
        console.log(err);
        this.dismissLoading();
        if(err.status && err.status=="401"){
          this.auth.unauthorizedAccess();
        }
        this.showToastWithCloseButton("Unable to save site. Please try later", 5000);
      });
    } 
  }
  showToastWithCloseButton(message: string, time?: number) {
    const toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      duration: time? time: 2000,
      closeButtonText: 'Ok',
      position: 'top'
    });
    toast.present();
  }
  showLoading() {
      if(!this.loading){
          this.loading = this.loadCtrl.create({
            content: "Saving...",
            duration: 10000
          });
          this.loading.present();
      }
  }

  dismissLoading(){
      if(this.loading){
          this.loading.dismiss();
          this.loading = null;
      }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SiteEditPage');
  }

}
