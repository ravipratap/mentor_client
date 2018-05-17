import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the ProgramListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-program-list',
  templateUrl: 'program-list.html',
})
export class ProgramListPage {
  site: any;
  programs: any[] =[];
  page: number= 0;
  searchTerm: string;
  hiddenSearchLoader:boolean=true;
  toBeLoaded: boolean = true;
  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private config: ConfigProvider,
    private auth: AuthProvider,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
      if(this.navParams.data.site) {
        this.site=  this.navParams.data.site;
      }
      this.getPrograms();
    }
    onSearchInput = (ev: any) => {
      this.searchTerm = ev.target.value;
      this.page = 0;
      this.programs =[];
      this.presentLoader();
      this.getPrograms(() => {
        this.hideLoader();
        console.log('search result returned');
      });
    };
    onSearchCancel = (ev: any) => {
      this.page = 0;
      this.searchTerm = undefined;
      this.programs =[];
      this.presentLoader();
      this.getPrograms( () => {
        this.hideLoader();
      });
    };
    presentLoader(){
      this.hiddenSearchLoader=false;
      setTimeout(()=>{
        this.hiddenSearchLoader=true;
      }, 10000);
    }
    hideLoader(){
      this.hiddenSearchLoader=true;
    }
    getPrograms( callback?: Function) {
      this.showLoading();
      this.config.loadPrograms(this.site?this.site._id:"", this.page, this.searchTerm).subscribe((data: any) => {
        this.dismissLoading();
        if(data.programs && data.programs.length > 0 ){
          data.programs.forEach((program,index) => {
            this.preprocessProgramList(program, index);
          });
          this.programs=this.programs.concat(data.programs);
          this.page = this.page + 1;
        } else {
          this.toBeLoaded = false;
        }
        if(callback) { callback(); }
      },
      err => {
        this.dismissLoading();
        console.log(JSON.stringify(err));
        if(err.status && err.status=="401"){
          this.auth.unauthorizedAccess();
        }
      });
    }
    loadMorePrograms() {
  
      console.log('Begin async operation');
  
      return new Promise((resolve) => {
        this.getPrograms(() => {
          console.log('Async operation has ended');
          resolve();
        });
      });
    }
    
  addProgram() {
    this.navCtrl.push("ProgramEditPage", {
      site: this.site,
      callback: this.updateProgramList
    });
  }
  editProgram(program: any, programIndex: number) {
    this.navCtrl.push("ProgramEditPage", {
      site: this.site,
      programIndex: programIndex,
      program: program, 
      callback: this.updateProgramList
    });
  }
  updateProgramList= data => {
    if(data.programIndex!=-1){
      this.preprocessProgramList(data.program, data.programIndex)
      this.programs[data.programIndex]= data.program;
    } else {
      let newPrograms: any[]=[];
      this.preprocessProgramList(data.program,this.programs.length)
      newPrograms.push(data.program);
      this.programs=newPrograms.concat(this.programs);
    }
  };
  preprocessProgramList(program, index){
    switch (index%3) {
      case 0:
        program.stage = "Signup";
        break;
      case 1:
        program.stage = "Progress";
        break;
      case 2:
      program.stage = "Feedback";
    }
  }
  manageAdmins(program: any) {
    this.navCtrl.push("ManageAdminsPage", {
      site: this.site,
      program: program 
    });
  }
  
  manageSignUpProgram(program: any, isPostSignup?: boolean) {
    this.showLoading();
    let surveyCategory: string;
    if(isPostSignup){
      surveyCategory= "PostSignup";
    } else {
      surveyCategory= "Signup";
    }
    this.config.loadSurvey(undefined, this.site? this.site._id: undefined, program? program._id: undefined, surveyCategory, this.navParams.data.invite_code)
    .subscribe((data: any) => {
      console.log("data from loadSurvey", data);
      let survey: any;
      if(data.survey){
        survey= data.survey;
      }
      this.dismissLoading();
      this.navCtrl.push("SurveyEditPage", {
        site: this.site,
        program: program,
        survey: survey,
        inEditMode: true,
        category: surveyCategory 
      });
    },
    err => {
      console.log(err.status);
      if(err.status && err.status=="401"){
        this.auth.unauthorizedAccess();
      }
      this.dismissLoading();
    },
    () => {
      console.log("load Survey complete");
    });
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
    console.log('ionViewDidLoad ProgramListPage');
  }

}
