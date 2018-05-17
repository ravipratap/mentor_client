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
/*
  Generated class for the CompanyProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CompanyProvider {

  labelAttribute = "name";
  // companies = [
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
    return Observable.fromPromise(this.auth.loadSiteConfig()).mergeMap((siteConfig:any) => {
      if(siteConfig && siteConfig.config["companies"] && siteConfig.config["companies"].length > 0) {
        return  new Promise((resolve, reject) => {
          const companies = siteConfig.config["companies"];   
            const filtered=companies.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) );
            resolve(filtered);
          });
      } else {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        let params = new HttpParams().set("keyword", keyword);
        console.log("params", JSON.stringify(params));
        return this.http.get(this.global.state['ENDPOINT']+'/search/company', {headers: headers, params: params});
      }
    }); 

    // return  new Promise((resolve, reject) => {
    //   let siteConfig= this.auth.getSiteConfig();
    //   if(siteConfig && siteConfig.config["companies"] && siteConfig.config["companies"].length > 0) {
    //     this.companies = siteConfig.config["companies"]
    //   }   
    //   const filtered=this.companies.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) );
    //   resolve(filtered);
    // });
    // let headers = new HttpHeaders().set('Content-Type', 'application/json');
    // let params = new HttpParams().set("keyword", keyword);
    // console.log("params", JSON.stringify(params));
    // return this.http.get(this.global.state['ENDPOINT']+'/search/company', {headers: headers, params: params});
  }

}
