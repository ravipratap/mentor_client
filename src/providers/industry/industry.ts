import { Injectable } from '@angular/core';
import { AutoCompleteProvider } from '../../components/auto-complete/auto-complete-provider';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { AuthProvider } from '../auth/auth';

@Injectable()
export class IndustryProvider {

  labelAttribute = "name";
  industries = [
    { name: "Accounting" }, { name: "Airlines/Aviation" }, { name: "Alternative Dispute Resolution" }, { name: "Alternative Medicine" }, { name: "Animation" }, { name: "Apparel & Fashion" }, { name: "Architecture & Planning" }, { name: "Arts and Crafts" }, { name: "Automotive" }, { name: "Aviation & Aerospace" }, { name: "Banking" }, { name: "Biotechnology" }, { name: "Broadcast Media" }, { name: "Building Materials" }, { name: "Business Supplies and Equipment" }, 
    { name: "Capital Markets" }, { name: "Chemicals" }, { name: "Civic & Social Organization" }, { name: "Civil Engineering" }, { name: "Commercial Real Estate" }, { name: "Computer & Network Security" }, { name: "Computer Games" }, { name: "Computer Hardware" }, { name: "Computer Networking" }, { name: "Computer Software" }, { name: "Construction" }, { name: "Consumer Electronics" }, { name: "Consumer Goods" }, { name: "Consumer Services" }, { name: "Cosmetics" }, 
    { name: "Dairy" }, { name: "Defense & Space" }, { name: "Design" }, { name: "Doctors / Medicine" }, { name: "Education Management" }, { name: "E-Learning" }, { name: "Electrical/Electronic Manufacturing" }, { name: "Entertainment" }, { name: "Environmental Services" }, { name: "Events Services" }, { name: "Executive Office" }, { name: "Facilities Services" }, { name: "Farming" }, { name: "Financial Services" }, { name: "Fine Art" }, 
    { name: "Fishery" }, { name: "Food & Beverages" }, { name: "Food Production" }, { name: "Fund-Raising" }, { name: "Furniture" }, { name: "Gambling & Casinos" }, { name: "Glass, Ceramics & Concrete" }, { name: "Government Administration" }, { name: "Government Relations" }, { name: "Graphic Design" }, { name: "Health, Wellness and Fitness" }, { name: "Higher Education" }, { name: "Hospital & Health Care" }, { name: "Hospitality" }, { name: "Human Resources" }, 
    { name: "Import and Export" }, { name: "Individual & Family Services" }, { name: "Industrial Automation" }, { name: "Information Services" }, { name: "Information Technology and Services" }, { name: "Insurance" }, { name: "International Affairs" }, { name: "International Trade and Development" }, { name: "Internet" }, { name: "Investment Banking" }, { name: "Investment Management" }, { name: "Judiciary" }, { name: "Law Enforcement" }, { name: "Law Practice" }, { name: "Legal Services" }, 
    { name: "Legislative Office" }, { name: "Leisure, Travel & Tourism" }, { name: "Libraries" }, { name: "Logistics and Supply Chain" }, { name: "Luxury Goods & Jewelry" }, { name: "Machinery" }, { name: "Management Consulting" }, { name: "Maritime" }, { name: "Market Research" }, { name: "Marketing and Advertising" }, { name: "Mechanical or Industrial Engineering" }, { name: "Media Production" }, { name: "Medical Devices" }, { name: "Medical Practice" }, { name: "Mental Health Care" }, 
    { name: "Military" }, { name: "Mining & Metals" }, { name: "Motion Pictures and Film" }, { name: "Museums and Institutions" }, { name: "Music" }, { name: "Nanotechnology" }, { name: "Newspapers" }, { name: "Non-Profit Organization Management" }, { name: "Oil & Energy" }, { name: "Online Media" }, { name: "Outsourcing/Offshoring" }, { name: "Package/Freight Delivery" }, { name: "Packaging and Containers" }, { name: "Paper & Forest Products" }, { name: "Performing Arts" }, 
    { name: "Pharmaceuticals" }, { name: "Philanthropy" }, { name: "Photography" }, { name: "Plastics" }, { name: "Political Organization" }, { name: "Primary/Secondary Education" }, { name: "Printing" }, { name: "Professional Training & Coaching" }, { name: "Program Development" }, { name: "Public Policy" }, { name: "Public Relations and Communications" }, { name: "Public Safety" }, { name: "Publishing" }, { name: "Railroad Manufacture" }, { name: "Ranching" }, 
    { name: "Real Estate" }, { name: "Recreational Facilities and Services" }, { name: "Religious Institutions" }, { name: "Renewables & Environment" }, { name: "Research" }, { name: "Restaurants" }, { name: "Retail" }, { name: "Security and Investigations" }, { name: "Semiconductors" }, { name: "Shipbuilding" }, { name: "Sporting Goods" }, { name: "Sports" }, { name: "Staffing and Recruiting" }, { name: "Supermarkets" }, { name: "Telecommunications" }, 
    { name: "Textiles" }, { name: "Think Tanks" }, { name: "Tobacco" }, { name: "Translation and Localization" }, { name: "Transportation/Trucking/Railroad" }, { name: "Utilities" }, { name: "Venture Capital & Private Equity" }, { name: "Veterinary" }, { name: "Warehousing" }, { name: "Wholesale" }, { name: "Wine and Spirits" }, { name: "Wireless" }, { name: "Writing and Editing" }
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
      if(siteConfig && siteConfig.config["industries"] && siteConfig.config["industries"].length > 0) {
        this.industries = siteConfig.config["industries"]
      }  
      const filtered=this.industries.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase()) );
      resolve(filtered);
    });
  }

}
