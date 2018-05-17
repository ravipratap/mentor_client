import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AutoCompleteProvider } from '../../components/auto-complete/auto-complete-provider';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { AuthProvider } from '../auth/auth';
import { AppState } from '../../app/app.global';

@Injectable()
export class DegreeProvider {

  labelAttribute = "name";
  // degrees = [
  //   { name: "12th" }, { name: "Diploma" }, { name: "ITI" }, { name: "B.A" }, { name: "B.Arch" }, { name: "B.B.A" }, { name: "B.Com" }, { name: "B.Ed" }, { name: "B.Pharma" }, { name: "B.Sc" }, { name: "B.Tech/B.E." }, { name: "BBM" }, { name: "BCA" }, { name: "BDS" }, { name: "BHM" }, 
  //   { name: "LLB" }, { name: "MBA" }, { name: "MBBS" }, { name: "MCA" }, { name: "PhD" }
  // ];
  constructor(private http:HttpClient, private auth: AuthProvider, private global: AppState) {
  }

  //added for debounce support if ionIput is used instead of searchbar in auto complete
  search(terms: Observable<string>) {
    return terms.debounceTime(400)
      .distinctUntilChanged() // only needed for optimization, can be removed
      // .distinctUntilChanged((p: string, q: string) => p===q && p.length != 1) // compare fuction added for allow firing when empty to one is redone
      .switchMap(term => this.getResults(term));
  }

  getResults(keyword:string) {
    // console.log("keyword", keyword);

    // return  new Promise((resolve, reject) => {
    //   let siteConfig= this.auth.getSiteConfig();
    //   if(siteConfig && siteConfig.config["degrees"] && siteConfig.config["degrees"].length > 0) {
    //     this.degrees = siteConfig.config["degrees"]
    //   }  
    //   const filtered=this.degrees.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) );
    //   resolve(filtered);
    // });
    
    return Observable.fromPromise(this.auth.loadSiteConfig()).mergeMap((siteConfig:any) => {
      if(siteConfig && siteConfig.config["degrees"] && siteConfig.config["degrees"].length > 0) {
        return  new Promise((resolve, reject) => {
          const degrees = siteConfig.config["degrees"];   
            const filtered=degrees.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) );
            resolve(filtered);
          });
      } else {
        if(keyword){
          let headers = new HttpHeaders().set('Content-Type', 'application/json');
          let params = new HttpParams().set("keyword", keyword);
          console.log("params", JSON.stringify(params));
          return this.http.get(this.global.state['ENDPOINT']+'/search/degrees', {headers: headers, params: params});
        } else {
          return  new Promise((resolve, reject) => {resolve([]);});
        }
      }
    }); 
  }

}
