import { Injectable } from '@angular/core';
import { AppState } from '../../app/app.global';
import { Observable} from 'rxjs/Rx';

import { AuthProvider } from "../auth/auth";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Platform } from 'ionic-angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { JSONflatten } from '../util/util';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigProvider {
  constructor(
    public http: HttpClient,
    private auth: AuthProvider,
    private global: AppState,
    private plt: Platform,
    private transfer: FileTransfer
  ) {
    console.log('Hello ConfigProvider Provider');
  }
  saveTheme = ( siteId: string, theme: string ) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers=new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.set('Authorization', token);
      console.log("saving theme", theme);
      return this. http.post(this.global.state['ENDPOINT']+'/admin/theme', { siteId: siteId? siteId : "" , theme: theme }, {headers: headers});
    });
  };
  getConfigFromServer = () => {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(this.global.state['ENDPOINT']+'/admin/config');
  };
  saveSite = ( site: any ) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers=new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.set('Authorization', token);
      console.log("saving site", site);
      return this.http.post(this.global.state['ENDPOINT']+'/admin/saveSite', site, {headers: headers});
    });
    
  };

  loadSites = (page: number,  search?: string) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.append('Authorization', token);
      let params = new HttpParams().set("page", page + "");
      if(search) { params = params.append("search", search); } 
      console.log("headers", headers);
      console.log("params", params);
      return this.http.get(this.global.state['ENDPOINT']+'/admin/sites', {headers: headers, params: params});
    });
    
  };

  loadPrograms = (siteId: string, page: number, search?: string) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.append('Authorization', token);
      let params = new HttpParams().set("page", page + "");
      if(search) { params = params.append("search", search); } 
      if(siteId) { params = params.append("siteId", siteId); } 
      console.log("headers", headers);
      console.log("params", JSON.stringify(params));
      return this.http.get(this.global.state['ENDPOINT']+'/admin/programs', {headers: headers, params: params});
    });
  };

  saveProgram = ( program: any, imgToUpload?:any ) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      const flattennedProgram = JSONflatten(program);
      console.log("saving program", program, flattennedProgram);
      if(this.plt.is('cordova') && imgToUpload){
        const options: FileUploadOptions = {
          fileKey: 'picture',
          chunkedMode: false,
          mimeType: "image/jpeg",
          fileName: imgToUpload.substr(imgToUpload.lastIndexOf('/') + 1),
          headers: {'Authorization': token},
          params: flattennedProgram
        };
        console.log("options", JSON.stringify(options));
        const fileTransfer: FileTransferObject = this.transfer.create();
    
        // Use the FileTransfer to upload the image
        return Observable.fromPromise(fileTransfer.upload(imgToUpload, this.global.state['ENDPOINT']+'/admin/saveProgram', options));
      } else {  
        if(imgToUpload){
          let headers = new HttpHeaders().set('Authorization', token);
          let input = new FormData();
          input.append("picture", imgToUpload);
          for(let p in flattennedProgram) {
            // console.log("p, flattennedProgram", p, flattennedProgram[p]);
            input.append(p, flattennedProgram[p]);
          }
          return this.http.post(this.global.state['ENDPOINT']+'/admin/saveProgram',input,{headers: headers});
        } else {
          let headers=new HttpHeaders().set('Content-Type', 'application/json');
          headers = headers.append('Authorization', token);
          return this. http.post(this.global.state['ENDPOINT']+'/admin/saveProgram', flattennedProgram, {headers: headers});
        }
      }
    });
  };

  loadSurvey = (surveyId: string, siteId?: string, programId?: string, category?: string, invite_code?: string) => {

    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.append('Authorization', token);
      let params = new HttpParams().set("surveyId", surveyId? surveyId : "");
      if(siteId) { params = params.append("site", siteId); } 
      if(programId) { params = params.append("program", programId); } 
      if(category) { params = params.append("category", category); } 
      if(invite_code) { params = params.append("invite_code", invite_code); } 
      // console.log("headers", headers);
      console.log("params", params);
      return this.http.get(this.global.state['ENDPOINT']+'/admin/survey', {headers: headers, params: params});
    });
    
    
  };


  saveSurvey = ( survey: any ) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers=new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.set('Authorization', token);
      console.log("saving survey", survey);
      return this. http.post(this.global.state['ENDPOINT']+'/admin/saveSurvey', survey, {headers: headers});
    });
  };


  saveAdmins = ( data: any ) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers=new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.set('Authorization', token);
      console.log("saving Admins", data);
      return this.http.post(this.global.state['ENDPOINT']+'/admin/saveAdmins', data, {headers: headers});
    });
    
  };

  loadAdmins = (siteId: string, programId?: string) => {
    return Observable.fromPromise(this.auth.loadTokenFromStorage()).mergeMap(token => {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.append('Authorization', token);
      let params = new HttpParams().set("site", siteId + "");
      if(programId) { params = params.append("programId", programId); } 
      // console.log("headers", headers);
      console.log("params", params);
      return this.http.get(this.global.state['ENDPOINT']+'/admin/adminList', {headers: headers, params: params});
    });
    
  };

  getChoices = (category: string, siteConfig: any) : any[] => {
    let choices: any[] =[];
    let opts: string[]; 
    switch(category){
      case "Gender": { 
        if(siteConfig && siteConfig.config["genders"]  && siteConfig.config["genders"].length > 0) {
          opts = siteConfig.config["genders"]
        } else {
          opts = ["Male", "Female"];
        }
        break;
      }
      case "Role": { 
        if(siteConfig && siteConfig.config["roles"] && siteConfig.config["roles"].length > 0 ) {
          opts = siteConfig.config["roles"]
        } else {
          opts = ["Mentor", "Mentee"];
        }
        break;
      }
      case "Job Level": { 
        if(siteConfig && siteConfig.config["jobLevels"]  && siteConfig.config["jobLevels"].length > 0) {
          opts = siteConfig.config["jobLevels"]
        } else {
          opts = ["Individual Contributor", "Team Lead", "Manager", "Senior Manager", "Senior Management", "Intern/Student"];
        }
        break;
      }
      case "Function": {     
        if(siteConfig && siteConfig.config["functions"]  && siteConfig.config["functions"].length > 0) {
          opts = siteConfig.config["functions"]
        } else {
          opts = ["Adminstrative", "Customer Service", "Engineering / Tech", "Finance & Accounting", "Human Resources", "Legal", "Marketing / PR", "Product", "Sales"];
        }
        break;
      }
    }
    opts.forEach((option: string, indx: number) => {
      choices.push({ text: option, order: indx });
     });
    return choices;
  };


}
