import { Injectable } from '@angular/core';
import { AutoCompleteProvider } from '../../components/auto-complete/auto-complete-provider';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { AuthProvider } from '../auth/auth';


@Injectable()
export class SkillsProvider  implements AutoCompleteProvider {

  labelAttribute = "name";
  skills = [
    { name: "Accounting" }, { name: "Advertising" }, { name: "Analysis" }, { name: "Applications" }, { name: "Auditing" }, { name: "Budgets" }, { name: "Business" }, 
    { name: "Business" }, { name: "Business Development" }, { name: "Business Services" }, { name: "Business Strategy" }, { name: "Change Management" }, { name: "Commercial Real Estate" }, { name: "Communication" }, 
    { name: "Compliance" }, { name: "Computer Program" }, { name: "Construction" }, { name: "Consulting" }, { name: "Corporate Law" }, { name: "Customer Service" }, { name: "Data" }, 
    { name: "Data" }, { name: "Databases" }, { name: "Designs" }, { name: "Editing" }, { name: "Education" }, { name: "Employees" }, { name: "Engineering" }, 
    { name: "English" }, { name: "Events" }, { name: "Facilities Management" }, { name: "Finance" }, { name: "Healthcare" }, { name: "Heavy Equipment" }, { name: "Human Resources" }, 
    { name: "Human Resources" }, { name: "Information Technology" }, { name: "Innovation" }, { name: "Internal Audit" }, { name: "International" }, { name: "Leadership" }, { name: "Legal" }, 
    { name: "Management" }, { name: "Manufacturing" }, { name: "Marketing" }, { name: "Marketing Strategy" }, { name: "Materials" }, { name: "Mentoring" }, { name: "Microsoft Excel" }, 
    { name: "Microsoft Excel" }, { name: "Microsoft Office" }, { name: "Microsoft Word" }, { name: "Negotation" }, { name: "Networking" }, { name: "New Business Development" }, { name: "Offices" }, 
    { name: "Order Fulfillment" }, { name: "Organization" }, { name: "Performance Tuning" }, { name: "Photoshop" }, { name: "Policy" }, { name: "Powerpoint" }, { name: "Presentations" }, 
    { name: "Presentations" }, { name: "Problem Solving" }, { name: "Process Improvement" }, { name: "Product Development" }, { name: "Program Management" }, { name: "Project Management" }, { name: "Project Planning" }, 
    { name: "Promotions" }, { name: "Public Relations" }, { name: "Public Speaking" }, { name: "Real Estate" }, { name: "Recruiting" }, { name: "Reports" }, { name: "Research" }, 
    { name: "Research" }, { name: "Retail" }, { name: "Revenue" }, { name: "Sales " }, { name: "Sales Management" }, { name: "Social Media" }, { name: "Software" }, 
    { name: "Strategic Planning" }, { name: "Strategy" }, { name: "Teaching" }, { name: "Team Building" }, { name: "Teamwork" }, { name: "Technology" }, { name: "Testing" }, 
    { name: "Testing" }, { name: "Time Management" }, { name: "Training" }, { name: "Vendors" }, { name: "Websites" }, { name: "Windows" }, { name: "Writing" }
  ];
  constructor(private auth: AuthProvider) {

  }
//added for debounce support if ionIput is used instead of searchbar in auto complete
  search(terms: Observable<string>) {
    return terms.debounceTime(250)
     .distinctUntilChanged() // only needed for optimization, can be removed
    // .distinctUntilChanged((p: string, q: string) => p===q && p.length != 1) // compare fuction added for allow firing when empty to one is redone
      .switchMap(term => this.getResults(term));
  }

  getResults(keyword:string) {
    // console.log("keyword", keyword);

    return  new Promise((resolve, reject) => {
      let siteConfig= this.auth.getSiteConfig();
      if(siteConfig && siteConfig.config["Skills"] && siteConfig.config["Skills"].length > 0) {
        this.skills = siteConfig.config["Skills"]
      }  
      const filtered=this.skills.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) );
      resolve(filtered);
    });
  }
}
