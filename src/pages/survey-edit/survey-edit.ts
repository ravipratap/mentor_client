import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, Slides, ActionSheetController, Platform, normalizeURL, Content } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';
import { LocationProvider } from '../../providers/location/location';
import { SkillsProvider } from '../../providers/skills/skills';
import { CompanyProvider } from '../../providers/company/company';
import { DesignationProvider } from '../../providers/designation/designation';
import { SchoolProvider } from '../../providers/school/school';
import { DegreeProvider } from '../../providers/degree/degree';
import { IndustryProvider } from '../../providers/industry/industry';
import { Camera } from '@ionic-native/camera';

/**
 * Generated class for the SurveyEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-edit',
  templateUrl: 'survey-edit.html'
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveyEditPage {

  @ViewChild(Content) content: Content; 
  //For pic upload
  @ViewChild('picture') picture;
  @ViewChild('profilePic') profilePic;
  imageExists: boolean = false;
  hideLoader: boolean = true;
  prevImage: any;
  currentImage: any;
  profileForm: FormGroup;
  imgToUpload:any;

  @ViewChild('surveySlider') surveySlider: Slides;
  navTitle: string = "Edit Survey";
  site: any;
  program: any;
  survey: any;
  questions: any = [];
  siteConfig: any;
  surveyResponse: any;
  keywords: any = [];
  showPrev: boolean = false;
  showNext: boolean = true;
  submitted = false;
  inEditMode = false;
  is_mentor = false;
  role: string;
  surveyForm: FormGroup;
  surveyCategory: string;
  yearArray: number[]; 
  backgroundExists:string;
  formErrors = {
    'title': '',
    'navTitle': ''
  };
  validationMessages = {
    'title': {
      'required' : 'Title is required.'
    },
    'navTitle': {
      'required' : 'Page Title needs to be set.'
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
    public locProvider: LocationProvider,
    public skillsProvider: SkillsProvider,
    public companyProvider: CompanyProvider,
    public designationProvider: DesignationProvider,
    public schoolProvider: SchoolProvider,
    public degreeProvider: DegreeProvider,
    public industryProvider: IndustryProvider,
    private cd: ChangeDetectorRef,
    private camera: Camera, 
    private actionSheetCtrl: ActionSheetController,
    private plt: Platform
  ) {
    let params = this.navParams.data;
    this.auth.loadUserData(true).then((user:any) => {
      console.log("loadUserData", user, params);

      if(!params || (!params.inEditMode && !params.survey)){
        
        if(user && user.survey){
          params = {
            survey: user.survey,
            surveyResponse: user.surveyResponse
          }
        }
      }
      this.initialize(params);
    });
    
    // this.inEditMode= !this.inEditMode; // for dev
  }
  initialize(params){
    if(params){
      this.site = params.site;
      this.program = params.program;
      this.surveyCategory = params.category;
      this.surveyResponse = params.surveyResponse; 
      this.inEditMode= params.inEditMode? true : false; // change to false
      if(this.site){
        this.siteConfig = {config: this.site.config};
      } else {
        this.siteConfig = this.auth.getSiteConfig();
      }
      console.log("this.siteConfig.config[roles][0]", this.siteConfig.config["roles"]  && this.siteConfig.config["roles"].length > 0  ? this.siteConfig.config["roles"][0]: "Mentor");
      if(params.survey){
        this.survey = params.survey;
        this.questions = this.survey.questions;
        this.navTitle = this.survey.profile.navTitle;
        this.surveyCategory = this.survey.profile.category;
      }
      this.is_mentor = params.surveyResponse?params.surveyResponse.is_mentor: false;
      this.role = params.surveyResponse?params.surveyResponse.role: undefined;
    }
    if(!this.survey) this.auth.unauthorizedAccess();
    
    this.yearArray = this.auth.getYearArray();
    this.initForm();
    // setTimeout(()=>{
    //   if(this.surveyCategory && this.surveyCategory == "Profile"){
    //     console.log("locking swipes for :", this.surveyCategory);
    //     this.surveySlider.lockSwipes(true);
    //   }
    // }, 2000);
    
    this.showNext = this.inEditMode? true: (this.questions.length > 1);
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
    let questionArray= new FormArray([]);
    if(this.inEditMode) {
      this.surveyForm = this.formBuilder.group({
        title: [this.survey? this.survey.profile.title: "", Validators.required],
        navTitle: [this.survey? this.survey.profile.navTitle: "", Validators.required],
        details: [this.survey? this.survey.profile.details: ""],
        is_template: [this.survey? this.survey.profile.is_template: false],
        schedule: [this.survey? this.survey.profile.schedule: "Not Scheduled"],
        questionArray: questionArray
      });
    } else {
      this.surveyForm = this.formBuilder.group({
        questionArray: questionArray
      });
    }
    if ( this.questions) {
      this.questions.forEach( ( question, index ) => {
        if(this.surveyResponse && this.surveyResponse.answers && this.surveyResponse.answers[index] && this.surveyResponse.answers[index].answer){
          this.addQuestion(question, this.surveyResponse.answers[index].answer);
        } else {
          this.addQuestion(question);
        }
      });
    }
    if(this.inEditMode) {
      this.updateNavTitle();
    }
    this.surveyForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
    // console.log("errors", this.formErrors);
  }
  onValueChanged(data? : any) {
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      let control = this.surveyForm.get(field);
      if (control) {
        this.formErrors[field] = '';
      } 
      if (control && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }
  onSlideChangeStart(slider: Slides) {
    this.showNext = this.questions.length == 0 || slider.getActiveIndex() < (this.inEditMode?this.questions.length: this.questions.length -1) ;
    this.showPrev = !slider.isBeginning();
    
  }
  prev() {
    this.updateNavTitle(this.surveySlider.getActiveIndex() - 1 );
    this.checkForRole(this.surveySlider.getActiveIndex())
    this.surveySlider.slidePrev();
    this.content.scrollToTop();

  }
  next() {
    if(this.inEditMode && this.questions.length == 0 && this.surveySlider.getActiveIndex() == 0){
      this.editQuestion();
    } else {
      this.checkForRole(this.surveySlider.getActiveIndex())
      this.updateNavTitle(this.surveySlider.getActiveIndex() + 1 );
      this.surveySlider.slideNext();
      this.content.scrollToTop();
    }
  }
  checkForRole(questionIndex: number, questionFormGroup?: FormGroup) {
    if(this.questions.length>0 && !this.inEditMode){
      if(this.questions[questionIndex].category == "Role"){
        let ctrl = questionFormGroup? questionFormGroup:  (<FormGroup>(<FormArray>this.surveyForm.controls['questionArray']).controls[questionIndex]);
        let answr= ctrl.controls.answer.value;
        if(answr){
          this.role = answr;
          console.log(this.siteConfig.config["roles"]);
          if(this.role == (this.siteConfig.config["roles"]  && this.siteConfig.config["roles"].length > 0 ? this.siteConfig.config["roles"][0]: "Mentor")){
            this.is_mentor = true;
          } else {
            this.is_mentor = false;
          }
        }
      }
    }
  }
  addQuestion(question: any, answer?: any, index?: number):void {
    let fbArgs: any  = {};
    let extraValidator: any;
    let answerValidatorList: any[] = [];
    let otherValidatorList: any[] = [];
    let choiceValidatorList: any[] = [];
    let verifiedContacts: any = {};
    if(question.mandatory && !this.inEditMode) {
      if(question.category == "Multiple" || question.category == "Radio" || question.category == 'Function'  || question.category == 'Job Level' || question.category == "Yes/No"|| question.category == 'Gender' || question.category == 'Role'){
        extraValidator = { validator: this.requiredOneValueValidator(question.category, question.choices) }
      } else if (question.category == "Contact") {
        
      if(answer.mobile_verified) verifiedContacts.mobile = answer.mobile;
      if(answer.email_verified) verifiedContacts.email = answer.email;
        extraValidator = { validator: this.onlyOneVerifiedToBeChanged(verifiedContacts) }
      } else {
        answerValidatorList.push(Validators.required);
      }
    }
    
    let emptyValue: any = undefined;
    
    if(question.category=="Multiple" || question.category == 'Function'){
      question.choices.forEach(choice => {
        fbArgs[choice.order]=[(answer && answer.indexOf(choice.text) != -1)? true: false]
      });
    } else  if(question.category == "Radio" || question.category == 'Job Level') {
      fbArgs["answer"]= [answer? (question.choices.map(a => a.text).indexOf(answer) != -1?answer:"other_enabled"): "", answerValidatorList]
    } else if(question.category == "Background") {
      fbArgs["is_student"]= [answer && answer.is_student? true: false];
      fbArgs["aid"]= [answer && answer.aid? answer.aid: undefined];
      fbArgs["company"]= [answer && answer.company? answer.company: emptyValue, (question.mandatory && !this.inEditMode)?[this.requiredIfEnabledValidator('is_student', false)]:[]];
      fbArgs["designation"]= [answer && answer.designation? answer.designation: emptyValue, (question.mandatory && !this.inEditMode)?[this.requiredIfEnabledValidator('is_student', false)]:[]];
      fbArgs["industry"]= [answer && answer.industry? answer.industry: emptyValue, (question.mandatory && !this.inEditMode)?[this.requiredIfEnabledValidator('is_student', false)]:[]];
      fbArgs["school"]= [answer && answer.school? answer.school: emptyValue, (question.mandatory && !this.inEditMode)?[this.requiredIfEnabledValidator('is_student', true)]:[]];
      fbArgs["degree"]= [answer && answer.degree? answer.degree: emptyValue, (question.mandatory && !this.inEditMode)?[this.requiredIfEnabledValidator('is_student', true)]:[]];
      fbArgs["startYear"]= [answer && answer.startYear? answer.startYear: emptyValue, (question.mandatory && !this.inEditMode)?this.requiredIfEnabledValidator('is_student', true):[]];
      if(answer && answer.school) {
        this.backgroundExists = "school";
      } else if(answer && answer.company) {
        this.backgroundExists = "company";
      }
    }  else if(question.category == "Sign") {
      fbArgs["first"]= [answer && answer.first? answer.first: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["last"]= [answer && answer.last? answer.last: emptyValue, []];
      fbArgs["title"]= [answer && answer.title? answer.title: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["intro"]= [answer && answer.intro? answer.intro: emptyValue, []];
    }  else if(question.category == "Contact") {
      fbArgs["mobile"]= [answer && answer.mobile? answer.mobile: emptyValue, (question.mandatory && !this.inEditMode)?[this.modifyVerifiedOnlyIfOtherVerified(verifiedContacts, "email")]:[]];
      fbArgs["email"]= [answer && answer.email? answer.email: emptyValue, (question.mandatory && !this.inEditMode)?[this.modifyVerifiedOnlyIfOtherVerified(verifiedContacts, "mobile")]:[]];
    }  else if(question.category=="Position") {
      fbArgs["is_current"]= [answer && answer.is_current? true: false];
      fbArgs["aid"]= [answer && answer.aid? answer.aid: undefined];
      fbArgs["company"]= [answer && answer.company? answer.company: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["designation"]= [answer && answer.designation? answer.designation: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["industry"]= [answer && answer.industry? answer.industry: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["location"]= [answer && answer.location? answer.location: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["startDate"]= [answer && answer.startDate? answer.startDate: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["endDate"]= [answer && answer.endDate? answer.endDate: emptyValue, []];
    } else if(question.category == "Education") {
      fbArgs["is_student"]= [answer && answer.is_student? true: false];
      fbArgs["aid"]= [answer && answer.aid? answer.aid: undefined];
      fbArgs["school"]= [answer && answer.school? answer.school: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["degree"]= [answer && answer.degree? answer.degree: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      // fbArgs["fieldOfStudy"]= [answer && answer.fieldOfStudy? answer.fieldOfStudy: emptyValue, (question.mandatory && !this.inEditMode)?[Validators.required]:[]];
      fbArgs["startYear"]= [answer && answer.startYear? answer.startYear+"": emptyValue, (question.mandatory && !this.inEditMode)?Validators.required:[]];
      fbArgs["endYear"]= [answer && answer.endYear? answer.endYear+"": emptyValue, []];
    }   else if(question.category == "Photo") {
      if(answer && answer.img_path) {
        this.currentImage=this.auth.getImageUrl(answer.img_path, answer.img_store);
        this.imageExists = true;
      }
      fbArgs["picture"]= [emptyValue, (question.mandatory && !this.inEditMode)?Validators.required:[]];
    } else if(question.category=="Age" && answer) {
      let age=+answer;
      age = age + 2000;
      fbArgs["answer"]= [age+"", answerValidatorList]
    } else {
      fbArgs["answer"]= [answer? answer: emptyValue, answerValidatorList]
    }
    if(question.other_choice) { 
      if (question.category=="Multiple" || question.category == 'Function') {
        otherValidatorList.push(this.requiredIfEnabledValidator('other_enabled', true));
        if(!this.inEditMode) otherValidatorList.push(this.requiredIfEnabledValidator('other_enabled', true));
        const extra = answer? answer.filter(item => question.choices.map(a => a.text).indexOf(item) == -1): undefined;
        fbArgs["other_enabled"] = [extra? true: false];
        fbArgs["other"] = [extra? extra: "", otherValidatorList];
      } else {
        otherValidatorList.push(this.requiredIfEnabledValidator('answer', 'other_enabled'));
        if(!this.inEditMode) otherValidatorList.push(this.requiredIfEnabledValidator('answer', 'other_enabled'));
        const extra = answer && question.choices.map(a => a.text).indexOf(answer) == -1;
        fbArgs["other"] = [extra? answer: "", otherValidatorList];
      }
    } 
    console.log("addQuestion", fbArgs);
    if(index !== undefined && index > -1){
      (<FormArray>this.surveyForm.controls['questionArray']).removeAt(index);
      (<FormArray>this.surveyForm.controls['questionArray']).insert(index, this.formBuilder.group(fbArgs, extraValidator));
    } else {
      (<FormArray>this.surveyForm.controls['questionArray']).push(this.formBuilder.group(fbArgs, extraValidator));
      // console.log((<FormArray>this.surveyForm.controls['questionArray']).length);
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
  modifyVerifiedOnlyIfOtherVerified(verified: any, otherControlName: string) {
    let thisControl: FormControl;
    let otherControl: FormControl;
    // let verified:any = {}
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
      }
      // if(!verified[category] && value){
      //   verified[category] = value;
      // } 
      // return null;
      if(Object.keys(verified).length !== 0) {
        
        if(thisControl.value.indexOf("@")!=-1 && verified.email && thisControl.value!=verified.email && !verified.mobile){
          return { modifyVerifiedOnlyIfOtherVerified: true };
        } else if(thisControl.value.indexOf("@")==-1 && verified.mobile && thisControl.value!=verified.mobile && !verified.email){
          return { modifyVerifiedOnlyIfOtherVerified: true };
        }
      }   
      return null;
    }
  }
  onlyOneVerifiedToBeChanged(verified: any) {
    let thisFormGroup: FormGroup;
    return function matchOtherValidate (formGroup: FormGroup) {
      if (!formGroup.parent) {
        return null;
      }
      if (!thisFormGroup) {
        thisFormGroup = formGroup;
      }
      if(verified.email && verified.mobile && thisFormGroup.get("email").value!=verified.email && thisFormGroup.get("mobile").value!=verified.mobile){
        return { onlyOneVerifiedToBeChanged: true };
      }
      if(!thisFormGroup.get("email").value && !thisFormGroup.get("mobile").value){
        return { requiredOneValue: true };
      }       
      return null;
      // return { timepass: true }
    }
  }
  requiredOneValueValidator(category: string, choices: any[]) {
    let thisFormGroup: FormGroup;
    return function matchOtherValidate (formGroup: FormGroup) {
      if (!formGroup.parent) {
        return null;
      }
      if (!thisFormGroup) {
        thisFormGroup = formGroup;
      }
      let hasOneValue= false;
      if(category){
        if(category=="Multiple" || category=="Function") {
          choices.forEach((choice) => {
            if (thisFormGroup.get(choice.order.toString()).value) {
              hasOneValue=true;
            }
          });
          if(thisFormGroup.controls.other_enabled && thisFormGroup.controls.other_enabled.value) {
            hasOneValue=true;
          }
        } else if(thisFormGroup.controls.answer.value) {
          hasOneValue=true;
        }
      } else {
        choices.forEach((choice) => {
          if (thisFormGroup.get(choice).value) {
            hasOneValue=true;
          }
        });
      }
      // console.log("requiredOneValueValidator", category, hasOneValue, thisFormGroup);
      if (!hasOneValue) {
        return { requiredOneValue: true };
      }    
      return null;
    }
  }
  removeQuestion(index: number) {
    this.questions.splice(index, 1);
    (<FormArray>this.surveyForm.controls['questionArray']).removeAt(index);
    this.surveySlider.slideTo(index);
  }
  editQuestion = (index?: number) => {
    if(index !== undefined){
      this.navCtrl.push("SurveyQuestionPage", {
        site: this.site,
        category: this.surveyCategory,
        questionIndex: index,
        question: this.questions[index], 
        callback: this.updateQuestionList
      });
    } else {
      this.navCtrl.push("SurveyQuestionPage", {
        site: this.site,
        questionIndex: this.questions.length,
        category: this.surveyCategory,
        callback: this.updateQuestionList
      });
    }
  };
  updateQuestionList= data => {
    if(data.questionIndex< this.questions.length){
      this.questions[data.questionIndex]= data.question;
      this.addQuestion(data.question, undefined, data.questionIndex);
    } else {
      const existingPhotoQuestions= this.questions.filter(item => item.category == "Photo");
      if(data.question.category=="Photo" && existingPhotoQuestions.length > 0){
        this.showToastWithCloseButton("Not added as only 1 photo is permitted", 5000);
      } else {
        let newQuestions: any[]=[];
        newQuestions.push(data.question);
        this.questions=this.questions.concat(newQuestions);
        this.addQuestion(data.question);
      }
    }
    this.surveySlider.slideTo(this.inEditMode?data.questionIndex+1: data.questionIndex);
    this.updateNavTitle();
  };
  updateNavTitle(slideNo?: number){
    if(this.inEditMode && ((slideNo=== undefined && (this.surveySlider === undefined || this.surveySlider.getActiveIndex() == 0)) ||  !this.surveyForm.controls.navTitle.value || (slideNo !== undefined && slideNo == 0))){
      if(this.surveySlider) console.log("this.surveySlider.getActiveIndex()", this.surveySlider.getActiveIndex());
      switch (this.surveyCategory) {
        case "Signup":
        this.navTitle = "Questions on sign up";
        break;
        case "PostSignup":
        this.navTitle = "Questions before starting";
        break;

      }
    } else  if(this.inEditMode && this.surveyForm.controls.navTitle.value) {
      this.navTitle = this.surveyForm.controls.navTitle.value;
    } else if(this.survey){
      this.navTitle = this.survey.navTitle;
    }
  }
  storeKeywords(keyword: any, index: number, multi: boolean, property?: string, notOverrides?: boolean){
    let keywordObj: any = this.keywords.find(obj => obj.order == index);
    if(keywordObj){
      keywordObj[property?property:"value"] = keyword;
    } else {
      keywordObj={
        order: index
      }
      if(multi) keywordObj["multi"] = true;
      if(notOverrides) keywordObj["notOverrides"] = true; //keword will not override selected value (useful for diff label and formvalue)
      keywordObj[property?property:"value"] = keyword;
      this.keywords.push(keywordObj);
    }
    // console.log("keyword emitted", keyword);
  }
  addKeywordToAnswer(ans: any, index:number, property: string){  
    let keywordObj: any = this.keywords.find(obj => obj.order == index);
    let keyword: string;
    if(keywordObj){
      keyword= keywordObj[property];
      if(keyword) {
        if(keywordObj["multi"]){
          if(ans && ans.length>0){
            if(!ans.find( str => str == keyword)){
              ans.push(keyword);
            }
          } else {
            ans = [keyword];
          }
        } else {
          if(keywordObj["notOverrides"]){
            if(!ans && keyword){
              ans = keyword;
            }
          } else {
            ans = keyword;
          }
        }
      }
    }
    return ans;
  }
  save() {
    this.submitted = true;
    console.log("form Errors after submit: ", this.formErrors);
    console.log("this.surveyForm.valid:", this.surveyForm.valid, this.surveyForm);
    // console.log("this.surveyForm:", this.surveyForm);
    
    // if(this.inEditMode) { // for dev 
    if(!this.inEditMode) {
      if(!this.surveyForm.valid){
        let errorSlideIndex:number;
        (<FormArray>this.surveyForm.controls.questionArray).controls.forEach((questionFormGroup: FormGroup, questionIndex: number) => {
          if(errorSlideIndex=== undefined && !questionFormGroup.valid) errorSlideIndex = questionIndex;
        });
        this.surveySlider.slideTo(errorSlideIndex);
      } else {
        let newAnswers: any [] = [];
        (<FormArray>this.surveyForm.controls.questionArray).controls.forEach((questionFormGroup: FormGroup, questionIndex: number) => {
          let newAns: any
          if(this.questions[questionIndex].category=="Role") this.checkForRole(questionIndex, questionFormGroup)
          if(this.questions[questionIndex].category=="Multiple" || this.questions[questionIndex].category=="Function") {
            let multipeAnswers: string [] =[];
            this.questions[questionIndex].choices.forEach((choice) => {
              if (questionFormGroup.get(choice.order.toString()).value) {
                multipeAnswers.push(choice.text);
              }
            });
            if(this.questions[questionIndex].other_choice && questionFormGroup.controls.other_enabled.value && questionFormGroup.controls.other.value) {
              multipeAnswers.push(questionFormGroup.controls.other.value);
            }
            newAns = multipeAnswers;
          } else if((this.questions[questionIndex].category=="Radio" || this.questions[questionIndex].category=="Job Level") && this.questions[questionIndex].other_choice && questionFormGroup.controls.answer.value == "other_enabled") {
            newAns = questionFormGroup.controls.other.value;
          } else if(this.questions[questionIndex].category=="Age") {
            let age=+questionFormGroup.controls.answer.value;
            age = age - 2000;
            newAns = age;
          } else if(this.questions[questionIndex].category=="Background") {
            newAns = {
              company: this.addKeywordToAnswer(questionFormGroup.controls.company.value, questionIndex, "company"),
              designation: this.addKeywordToAnswer(questionFormGroup.controls.designation.value, questionIndex, "designation"),
              industry: this.addKeywordToAnswer(questionFormGroup.controls.industry.value, questionIndex, "industry"),
              is_student: this.backgroundExists?(this.backgroundExists == 'school'? true: false):questionFormGroup.controls.is_student.value,
              school: this.addKeywordToAnswer(questionFormGroup.controls.school.value, questionIndex, "school"),
              degree: this.addKeywordToAnswer(questionFormGroup.controls.degree.value, questionIndex, "degree"),
              startYear: questionFormGroup.controls.startYear.value,
              aid: questionFormGroup.controls.aid.value
            };
            if((newAns.is_student && !newAns.school && !newAns.degree && !newAns.startYear) || (!newAns.is_student && !newAns.company && !newAns.designation && !newAns.industry)){
              newAns = undefined;
            }
          } else if(this.questions[questionIndex].category=="Sign") {
            newAns = {
              first: questionFormGroup.controls.first.value,
              last: questionFormGroup.controls.last.value,
              title: questionFormGroup.controls.title.value,
              intro: questionFormGroup.controls.intro.value
            };
            if(newAns.first && !newAns.last && !newAns.title && !newAns.intro){
              newAns = undefined;
            }
          }  else if(this.questions[questionIndex].category=="Contact") {
            let answers: any;
            if(!this.surveyResponse) {
              answers = this.surveyResponse.answers.filter(element => element.answer && element.category == "Contact");
            }
            let answer = answers && answers.length>0? answers[0]: undefined;
            newAns = {
              email: questionFormGroup.controls.email.value,
              mobile: questionFormGroup.controls.mobile.value
            };
            if(!newAns.email && !newAns.mobile){
              newAns = undefined;
            }
            if(newAns && answer){
              if(newAns.email && answer.answer && newAns.email != answer.answer.email){
                newAns.emailOTP = true;
              }
              if(newAns.mobile && answer.answer && newAns.mobile != answer.answer.mobile){
                newAns.mobileOTP = true;
              }
            }
          } else if(this.questions[questionIndex].category=="Position") {
            newAns = {
              company: this.addKeywordToAnswer(questionFormGroup.controls.company.value, questionIndex, "company"),
              designation: this.addKeywordToAnswer(questionFormGroup.controls.designation.value, questionIndex, "designation"),
              industry: this.addKeywordToAnswer(questionFormGroup.controls.industry.value, questionIndex, "industry"),
              is_current: questionFormGroup.controls.is_current.value,
              location: this.addKeywordToAnswer(questionFormGroup.controls.location.value, questionIndex, "location"),
              startDate: questionFormGroup.controls.startDate.value,
              endDate: questionFormGroup.controls.endDate.value,
              aid: questionFormGroup.controls.aid.value
            };
            if(!newAns.location && !newAns.startDate && !newAns.endDate &&  !newAns.company && !newAns.designation && !newAns.industry){
              newAns = undefined;
            }
          }  else if(this.questions[questionIndex].category=="Education") {
            newAns = {
              school: this.addKeywordToAnswer(questionFormGroup.controls.school.value, questionIndex, "school"),
              degree: this.addKeywordToAnswer(questionFormGroup.controls.degree.value, questionIndex, "degree"),
              is_student: questionFormGroup.controls.is_student.value,
              startYear: questionFormGroup.controls.startYear.value,
              endYear: questionFormGroup.controls.endYear.value,
              aid: questionFormGroup.controls.aid.value
            };
            if( !newAns.school && !newAns.degree && !newAns.startYear && !newAns.endYear){
              newAns = undefined;
            }
          } else if(this.questions[questionIndex].category=="Photo") {
            if(this.surveyResponse && this.surveyResponse.answers && this.surveyResponse.answers[questionIndex] && !this.imgToUpload){
              newAns =  this.surveyResponse.answers[questionIndex].answer;
            }
          } else {
            newAns= this.addKeywordToAnswer(questionFormGroup.controls.answer.value, questionIndex, "value");
          }
          newAnswers.push({
            order: questionIndex,
            qid: this.questions[questionIndex]._id,
            category: this.questions[questionIndex].category,
            question: this.is_mentor && this.questions[questionIndex].mentor_question? this.questions[questionIndex].mentor_question: this.questions[questionIndex].question,
            answer: newAns
          }); 
        });
        if(!this.surveyResponse) {
          this.surveyResponse = {
            survey: this.survey._id,
            answers: []
          }
        }
        // this.surveyResponse.answered = true;
        if(this.role){
          this.surveyResponse.role = this.role;
          this.surveyResponse.is_mentor  = this.is_mentor;
        }
        this.surveyResponse.extra ={
          program: this.survey.profile.program,
          category:  this.survey.profile.category,
          is_mentor: this.is_mentor,
          userProgramId: this.survey.userProgramId
        }
        this.surveyResponse.answers= newAnswers;
        this.showLoading();
        console.log("surveyResponse", this.surveyResponse); //, this.keywords );
        if(this.surveyCategory == "Signup" || this.surveyCategory == "PostSignup" || this.surveyCategory == "Profile"){
          this.auth.saveSignupForm(this.surveyResponse, this.imgToUpload)
          .subscribe((data: any) => { 
            this.dismissLoading();
            console.log("response on saving surveyResponse", data);
            if(data.success){
              this.showToastWithCloseButton("Response has been saved!");
              if(this.surveyCategory == "Signup" || this.surveyCategory == "PostSignup"){
                if(data.survey){
                  this.navCtrl.setRoot('SurveyEditPage', data);
                } else {
                  this.navCtrl.setRoot('TabsPage');
                }
              } else {
                this.navCtrl.pop().then(() => {
                  if(this.navParams.get('add')){
                    if(this.questions[0].category=="Position") {
                      this.surveyResponse.answers[0].answer.aid = data.aid;
                    } else {
                      this.surveyResponse.answers[0].answer.aid = data.aid;
                    }
                  }
                  if(this.surveyCategory == "Profile" && this.questions[0].category=="Contact"){
                    this.surveyResponse.answers[0].answer.email_verified = data.email_verified;
                    this.surveyResponse.answers[0].answer.mobile_verified = data.mobile_verified;
                  }
                  this.navParams.get('callback')({
                    survey: this.survey,
                    surveyResponse: this.surveyResponse
                  });
                });
              }

            } else {
              this.showToastWithCloseButton("Unable to save response. Please try later", 5000);
            } 
          },
          err =>  {
            console.log(err);
            if(err.status && err.status=="401"){
              this.auth.unauthorizedAccess();
            }
            this.dismissLoading();
            this.showToastWithCloseButton("Unable to save response. Please try later", 5000);
          });
        }
      }
    } else {
      if(!this.surveyForm.controls.title.valid || !this.surveyForm.controls.navTitle.valid  || this.questions.length == 0){
        this.updateNavTitle(0);
        this.surveySlider.slideTo(0);
      }  else{ 
        if(!this.survey){
          this.survey = {
            profile : {},
            questions: []
          };
          this.survey.profile.category = this.surveyCategory;
          if(this.site){
            this.survey.profile["site"]=this.site._id;
          }
          if(this.program){
            this.survey.profile["program"]=this.program._id;
            if(this.program.profile.is_default)  this.survey.profile["is_default"] = true;
          }
        }

        this.survey.profile.title = this.surveyForm.controls.title.value;
        this.survey.profile.navTitle = this.surveyForm.controls.navTitle.value;
        // this.survey.profile.details = this.surveyForm.controls.details.value;
        this.survey.profile.is_template = this.surveyForm.controls.is_template.value;
        this.survey.profile.schedule = this.surveyForm.controls.schedule.value;
        this.survey.questions = this.questions;

        this.showLoading();
        console.log(this.survey);
        this.config.saveSurvey(this.survey)
        .finally(
          () => {
            this.dismissLoading();
            console.log("Save Survey complete");
          }
        )
        .subscribe((data: any) => { 
          if(data.success){
            this.showToastWithCloseButton(this.survey.profile.title + ' has been updated!');
          } else {
            this.showToastWithCloseButton("Unable to save survey. Please try later", 5000);
          }
          this.navCtrl.pop();
          
        },
        err =>  {
          console.log(err);
          if(err.status && err.status=="401"){
            this.auth.unauthorizedAccess();
          }
          this.showToastWithCloseButton("Unable to save survey. Please try later", 5000);
        });
      }
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
    console.log('ionViewDidLoad SurveyEditPage');
  }
  //https://stackoverflow.com/questions/46101246/expressionchangedafterithasbeencheckederror-when-add-validator-in-ngoninit
  // https://github.com/ng-bootstrap/ng-bootstrap/issues/1159
  ngAfterViewChecked() {
    //explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cd.detectChanges();
    }

}
