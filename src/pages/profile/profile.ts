import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ActionSheetController, Platform, normalizeURL } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { Camera } from '@ionic-native/camera';
import { ConfigProvider } from '../../providers/config/config';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  //For pic upload
  @ViewChild('picture') picture;
  @ViewChild('profilePic') profilePic;
  imageExists: boolean = false;
  inEditMode: boolean = false;
  hideLoader: boolean = true;
  previousContact: any;
  loading: any;
  prevImage: any;
  currentImage: any;
  profileForm: FormGroup;


  user:any ={};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private fb: FormBuilder,
    public auth: AuthProvider,
    private config: ConfigProvider,
    public loadCtrl: LoadingController,
    private toastCtrl: ToastController,

    private cd: ChangeDetectorRef,
    private camera: Camera, 
    private actionSheetCtrl: ActionSheetController,
    private plt: Platform
  ) {
    let params = this.navParams.data;
    this.buildForm();
    this.auth.loadUserData(true).then((user:any) => {
      console.log("loadUserData", user, params);
      this.getProfile(user, params);
    });
  }
 
 
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

      this.updatePicture(imageData);
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
          this.updatePicture(fileToUpload);
        }
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }
  
  updatePicture(fileToUpload) {
    if(fileToUpload){
      this.hideLoader=false;
      this.auth.saveProfilePicture(fileToUpload)
      .finally(() => {
        this.hideLoader=true;
        console.log("Save photo complete");
      })
      .subscribe( (data: any) => {
          let response: any ={};
          if(this.plt.is('cordova')){
            if(data.response) response = JSON.parse(data.response);
          } else {
            response = data;
          }
          if(response.success){
            this.showToastWithCloseButton("Photo saved to profile",);
            if(response.secure_url) {
              this.currentImage = response.secure_url;
              this.auth.resetUserThumbnail(response.thumbnail);
              if(!this.user.pic) this.user.pic = {};
              this.user.pic.thumbnail= response.thumbnail;
              this.user.pic.img_store= response.img_store;
            }
          } else {
            console.log(response);
            if(this.prevImage) this.currentImage = this.prevImage;
            this.showToastWithCloseButton("Unable to save photo. Please try again", 5000);
          }
        },
        err =>  {
          console.log(JSON.stringify(err));
          if(this.prevImage) this.currentImage = this.prevImage;
          this.showToastWithCloseButton("Unable to save photo. Please try again", 5000);

        }
      );
    }
    // if(this.profileForm.valid){
    //   let fileBrowser = this.picture.nativeElement;
    //   if (fileBrowser.files && fileBrowser.files[0]) {
    //     let fileToUpload=fileBrowser.files[0];
    //     console.log("Saving profile Picture", fileBrowser.files[0]);
    //   }
    //   // this.auth.uploadImage(this.profileForm.controls.picture,token, 
    //   //   {
    //   //   person: this.profileForm.controls.person.value,
    //   //   note: this.profileForm.controls.note.value
    //   // });
      
    // }
  } 
  buildForm(): void {
    this.profileForm = this.fb.group({
      picture: [null, Validators.required]
    });
  }
  editIntro() {
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.intro.survey, 
      surveyResponse: this.user.intro.surveyResponse,
      callback: this.updateIntro
    });
  }
  updateIntro = data => {
    this.user.intro = data
  };
  editPersonalProfile = () => {
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.personal_profile.survey, 
      surveyResponse: this.user.personal_profile.surveyResponse,
      callback: this.updatePersonalProfile
    });
  };
  updatePersonalProfile = data => {
    this.user.personal_profile = data;
  };
  editProfessionalProfile = () => {
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.professional_profile.survey, 
      surveyResponse: this.user.professional_profile.surveyResponse,
      callback: this.updateProfessionalProfile
    });
  };
  updateProfessionalProfile = data => {
    this.user.professional_profile = data
  };
  addPosition = () => {
    console.log(this.user);
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.addPosition.survey, 
      surveyResponse: this.user.addPosition.surveyResponse,
      callback: this.pushPosition
    });
  };
  pushPosition = data => {
    this.user.positions.survey.questions.push(data.survey.questions[0]);
    this.user.positions.surveyResponse.answers.push(data.surveyResponse.answers[0]);
  };
  editPositions = () => {
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.positions.survey, 
      surveyResponse: this.user.positions.surveyResponse,
      add: true,
      callback: this.updatePositions
    });
  };
  updatePositions = data => {
    this.user.positions = data;
  };
  addEducation = () => {
    console.log(this.user);
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.addEducation.survey, 
      surveyResponse: this.user.addEducation.surveyResponse,
      add: true,
      callback: this.pushEducation
    });
  };
  pushEducation = data => {
    this.user.education.survey.questions.push(data.survey.questions[0]);
    this.user.education.surveyResponse.answers.push(data.surveyResponse.answers[0]);
  };
  editEducation = () => {
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.education.survey, 
      surveyResponse: this.user.education.surveyResponse,
      callback: this.updateEducation
    });
  };
  updateEducation = data => {
    this.user.education = data;
  };
  editProgram = (program:  any, i: number) => {
    this.navCtrl.push('SurveyEditPage', {
      survey: program.survey, 
      surveyResponse: program.surveyResponse,
      programIndex: i,
      nonProfileEdit: true,
      callback: this.updateProgram
    });
  };
  updateProgram = data => {
    this.user.programs[data.programIndex].survey = data.survey;
    this.user.programs[data.programIndex].surveyResponse = data.surveyResponse;
    this.user.programs[data.programIndex].filteredAnswers =data.filteredAnswers;
    console.log("this.user.programs[data.programIndex]", this.user.programs[data.programIndex]);
  };

  getProfile =(userSignedIn, params) => {
    this.showLoading();
    this.auth.getProfile(params?params._id: undefined, params?params.program: undefined)
    .subscribe( (data: any) => {
      if(data && data.user){
        this.user=data.user;
        console.log("this.user", this.user); 
        if(this.user && this.user.pic) {
          this.currentImage=this.auth.getImageUrl(this.user.pic.img_path, this.user.pic.img_store);
          this.imageExists = true;
        }
        this.updateChoices(this.user.personal_profile.survey);
        this.updateChoices(this.user.professional_profile.survey);
        if(userSignedIn._id == this.user._id){
          this.inEditMode = true;
        }

      }
      this.dismissLoading();
    },
    err =>  {
      console.log(err);
      this.showToastWithCloseButton("Unable to retrieve profile details", 5000);
      this.dismissLoading();
    });
      
  }
  updateChoices = (survey) => {
    if(survey){
      survey.questions.forEach( question => {
        let choices = [];
        if(question.category == "Gender" && (!question.choices || question.choices.length ==0)) {
          choices = this.config.getChoices(question.category, this.auth.getSiteConfig());
          question.other_choice=false;
        }
        if(question.category == "Role" && (!question.choices || question.choices.length ==0)) {
          choices = this.config.getChoices(question.category, this.auth.getSiteConfig());
          question.other_choice=false;
        }
        if(question.category == "Job Level" && (!question.choices || question.choices.length ==0)) {
          choices = this.config.getChoices(question.category, this.auth.getSiteConfig());
          question.other_choice = true;
        }
        if(question.category == "Function" && (!question.choices || question.choices.length ==0)) {
          choices = this.config.getChoices(question.category, this.auth.getSiteConfig());
          question.other_choice = true;
        }
        if(choices.length > 0) question.choices=choices;
      });
    }
  }
  
  editContact = () => {
    this.previousContact = {
      email: this.user.contact.surveyResponse.answers[0].answer.email,
      mobile: this.user.contact.surveyResponse.answers[0].answer.mobile
    };
    this.navCtrl.push('SurveyEditPage', {
      survey: this.user.contact.survey, 
      surveyResponse: this.user.contact.surveyResponse,
      callback: this.updateContact
    });
  };
  updateContact = data => {
    let email: string;
    let mobile: string;
    if(!data.surveyResponse.answers[0].answer.email_verified && data.surveyResponse.answers[0].answer.email != this.previousContact.email) {
      email = data.surveyResponse.answers[0].answer.email;
    }
    if(!data.surveyResponse.answers[0].answer.mobile_verified && data.surveyResponse.answers[0].answer.mobile != this.previousContact.mobile) {
      mobile = data.surveyResponse.answers[0].answer.mobile;
    }
    this.user.contact = data;
    if(email || mobile){
      this.verifyContact(email,mobile, true);
    }
  };

  verifyContact(email: string, mobile: string, onEdit?:boolean){
    this.navCtrl.push("OtpPage", {
      email: email, 
      mobile: mobile, 
      userid: this.user._id,
      popup: true,
      onEdit: onEdit,
      callback: this.updateVerifiedContacts
    });
  }
  updateVerifiedContacts= data => {
    this.user.contact.surveyResponse.answers[0].answer.email_verified = data.email_verified;
    this.user.contact.surveyResponse.answers[0].answer.mobile_verified = data.mobile_verified;
  };
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


}
