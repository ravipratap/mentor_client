import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, LoadingController, ToastController, normalizeURL, ActionSheetController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';
import { Camera } from '@ionic-native/camera';


@IonicPage({
  defaultHistory: ['ProgramListPage']
})
@Component({
  selector: 'page-program-edit',
  templateUrl: 'program-edit.html',
})
export class ProgramEditPage {

  //For pic upload
  @ViewChild('picture') picture;
  @ViewChild('profilePic') profilePic;
  imageExists: boolean = false;
  hideLoader: boolean = true;
  prevImage: any;
  currentImage: any;
  profileForm: FormGroup;
  imgToUpload:any;

  @ViewChild('programEditSlider') programEditSlider: Slides;
  navTitle: string = "Basic Details";
  site: any;
  siteConfig: any;
  program: any;
  showPrev: boolean = false;
  showNext: boolean = true;
  submitted = false;
  maxDate: string = new Date(Date.now()+ 31470552000).toISOString();
  maxDateEnd: string = new Date(Date.now()+ 156941252000).toISOString();
  programForm: FormGroup;
  programProfileForm: FormGroup;
  programDatesForm: FormGroup;
  programLicenseForm: FormGroup;
  formErrors = {
    'name': '',
    'category': '',
    'mentoring_goal': '',
    'mentor_signup': '',
    'mentee_signup': '',
    'matching_start': '',
    'start': '',
    'end': ''
  };
  validationMessages = {
    'name': {
      'required' : 'Program name is required.'
    },
    'category': {
      'required' : 'Category needs to be set.'
    },
    'mentoring_goal': {
      'requiredIfEnabled' : 'Program objective needs to be set.'
    },
    'mentor_signup': {
      'required' : 'Mentor Sign up date is required.'
    },
    'mentee_signup': {
      'required' : 'Mentor Sign up date is required.'
    },
    'matching_start': {
      'required' : 'Matching start date is required.'
    },
    'start': {
      'required' : 'Start date is required.'
    },
    'end': {
      'required' : 'End date is required.'
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
    private auth: AuthProvider,
    private cd: ChangeDetectorRef,
    private camera: Camera, 
    private actionSheetCtrl: ActionSheetController,
    private plt: Platform
  ) {
    if(this.navParams.data){
      this.site = this.navParams.data.site;
      this.program = this.navParams.data.program;
      if(this.program && this.program.profile.img_path) {
        this.currentImage=this.auth.getImageUrl(this.program.profile.img_path, this.program.profile.img_store);
        this.imageExists = true;
      }
    }
    // console.log("Site loaded", this.site); 
    if(this.site){
      this.siteConfig = {config: this.site.config};
      this.initForm();
      // console.log("siteConfig", this.siteConfig); 
    } else {
      this.auth.loadSiteConfig().then((siteConfig) => {
        this.siteConfig =siteConfig;
        // console.log("siteConfig loaded", this.siteConfig); 
        this.initForm();
      });
    }
    
  }

  //For Picture
  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
 
  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      // targetWidth: 900,
      // targetHeight: 600,
      allowEdit: true,
      correctOrientation: true
    };
 
    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {
      console.log("imageData receieved", imageData);
      if(this.currentImage) this.prevImage = this.currentImage;
      this.currentImage= normalizeURL(imageData);

      this.imgToUpload= imageData;
      this.imageExists = true;
    }, (err) => {
      console.log('Error: ', err);
    });
  }

  onFileChange(event) {
    const reader = new FileReader(); 
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      console.log("reader", reader)
      reader.onload = () => {
      let fileBrowser = this.picture.nativeElement;
        if (fileBrowser.files && fileBrowser.files[0]) {
          if(this.currentImage) this.prevImage = this.currentImage;
          this.currentImage=reader.result;
          this.imageExists = true;
          let fileToUpload=fileBrowser.files[0];
          console.log("fileBrowser.files[0]", fileToUpload);
          this.imgToUpload = fileToUpload;
        }
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }
//Img Upload ends



  initForm() {
    this.programForm = this.formBuilder.group({
      profile: this.formBuilder.group({
        name: [this.program? this.program.profile.name: "", Validators.required],
        desc: [this.program? (this.program.profile.desc? this.program.profile.desc : "") : ""],
        category: [this.program? this.program.profile.category: "", Validators.required],
        mentoring_goal: [this.program? this.program.profile.mentoring_goal: "", this.requiredIfEnabledValidator('category', "Mentoring")],
        is_default: [this.program? this.program.profile.is_default: true]

      }),
      dates: this.formBuilder.group({
        mentor_signup: [this.program? (this.program.profile.mentor_signup? this.program.profile.mentor_signup : new Date().toISOString()) : new Date().toISOString(), Validators.required],
        mentee_signup: [this.program? (this.program.profile.mentee_signup? this.program.profile.mentee_signup : new Date().toISOString()) : new Date().toISOString(), Validators.required],
        matching_start: [this.program? (this.program.profile.matching_start? this.program.profile.matching_start : new Date().toISOString()) : new Date().toISOString(), Validators.required],
        start: [this.program? (this.program.profile.start? this.program.profile.start : new Date().toISOString()) : new Date().toISOString(), Validators.required],
        end: [this.program? (this.program.profile.end? this.program.profile.end : "") : this.maxDate, Validators.required]
      }),
      picture: [null]
    });
   
    this.programForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
    console.log("errors", this.formErrors);
  }
  onValueChanged(data? : any) {
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      let control = (<FormGroup>this.programForm.get("profile")).get(field);
      if (control) {
        this.formErrors[field] = '';
      } else {
        control = (<FormGroup>this.programForm.get("dates")).get(field);
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
  requiredIfEnabledValidator(otherControlName: string, otherControlValue: any) {
    let thisControl: FormControl;
    let otherControl: FormControl;
    return function matchOtherValidate (control: FormControl) {
      if (!control.parent) {
        return null;
      }
      if (!thisControl) {
        thisControl = control;
        otherControl = control.parent.get(otherControlName) as FormControl;
        if (!otherControl) {
          throw new Error('other control is not found in parent group');
        }
        otherControl.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }
      if (!otherControl ) {
        return null;
      }

      if (otherControl.value == otherControlValue && !thisControl.value) {
        return { requiredIfEnabled: true };
        // return null;
      }
      return null;
    }
  }
  onSlideChangeStart(slider: Slides) {
    this.showNext = !slider.isEnd();
    this.showPrev = !slider.isBeginning();
  }
  prev() {
    this.updateNavTitle(this.programEditSlider.getActiveIndex() - 1 );
    if(this.programEditSlider.getActiveIndex())
    this.programEditSlider.slidePrev();

  }
  next() {

    this.updateNavTitle(this.programEditSlider.getActiveIndex() + 1 );
    this.programEditSlider.slideNext();
  }
  updateNavTitle(slideNo: number){
    switch (slideNo) {
      case 0:
          this.navTitle = "Basic Details";
          break;
      case 1:
      this.navTitle = "Key Program Dates";
          break;
      case 2:
      this.navTitle = "Matching Criteria";
          break;
      case 3:
      this.navTitle = "Program Picture";
    }
  }
  save() {
    this.submitted = true;
    console.log("form Errors after submit: ", this.formErrors);
    console.log("this.programForm.valid:", this.programForm);
    if(!(<FormGroup>this.programForm.get("profile")).valid){
      this.updateNavTitle(0);
      this.programEditSlider.slideTo(0);
    } else if(!(<FormGroup>this.programForm.get("dates")).valid){
      this.updateNavTitle(1);
      this.programEditSlider.slideTo(1);
    } else  {
      if(!this.program){
        this.program = {
          profile : {}
        };
        if(this.site){
          this.program["site"]=this.site._id;
        }
      }
      let defaultChanged: boolean = false;
      if((this.program.profile.is_default && !(<FormGroup>this.programForm.get("profile")).controls.is_default.value) || (this.program._id && !this.program.profile.is_default && (<FormGroup>this.programForm.get("profile")).controls.is_default.value)) {
        defaultChanged= true;
        console.log("default is changed");
      }
      this.program.profile.name = (<FormGroup>this.programForm.get("profile")).controls.name.value;
      this.program.profile.is_default = (<FormGroup>this.programForm.get("profile")).controls.is_default.value;
      this.program.profile.category = (<FormGroup>this.programForm.get("profile")).controls.category.value;
      if((<FormGroup>this.programForm.get("profile")).controls.mentoring_goal.value) {
        this.program.profile.mentoring_goal = (<FormGroup>this.programForm.get("profile")).controls.mentoring_goal.value;
      }
      if((<FormGroup>this.programForm.get("profile")).controls.desc.value) {
        this.program.profile.desc = (<FormGroup>this.programForm.get("profile")).controls.desc.value;
      }
      this.program.profile.mentor_signup = (<FormGroup>this.programForm.get("dates")).controls.mentor_signup.value;
      this.program.profile.mentee_signup = (<FormGroup>this.programForm.get("dates")).controls.mentee_signup.value;
      this.program.profile.matching_start = (<FormGroup>this.programForm.get("dates")).controls.matching_start.value;
      this.program.profile.start = (<FormGroup>this.programForm.get("dates")).controls.start.value;
      this.program.profile.end = (<FormGroup>this.programForm.get("dates")).controls.end.value;
      this.showLoading();
      if(defaultChanged){
        this.program.defaultChanged = true;
      }
      console.log(this.program);
      this.config.saveProgram(this.program, this.imgToUpload)
      .finally( () => {
        this.dismissLoading();
      })
      .subscribe((data: any) => { 
        if(data.success){
          this.showToastWithCloseButton(this.program.profile.name + ' has been updated!');
          this.navCtrl.pop().then(() => {
            let programIndex: number;
            console.log(this.navParams);
            if(this.program._id) {
              programIndex=this.navParams.get('programIndex');
            } else {
              programIndex=-1;
            }
            this.navParams.get('callback')({
              program: data.program,
              programIndex: programIndex
            });
          });
        } else {
          this.showToastWithCloseButton("Unable to save program. Please try later", 5000);
        }
      },
      err =>  {
        console.log(err);
        if(err.status && err.status=="401"){
          this.auth.unauthorizedAccess();
        }
        this.showToastWithCloseButton("Unable to save program. Please try later", 5000);
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
            content: "Loading...",
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
    console.log('ionViewDidLoad ProgramEditPage');
  }

}
