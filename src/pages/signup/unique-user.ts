import { FormControl } from '@angular/forms';
 
export class UniqueUserValidator {
 
  static checkUser(control: FormControl): any {
 
    return new Promise(resolve => {
      if(control.errors && (control.errors.has('pattern') || control.errors.has('required'))){
        console.log(control.errors);
        resolve({});
      }  else  {
        
        //Fake a slow response from server
  
        setTimeout(() => {
          if(control.value.toLowerCase() === "greg@gmail.com"){
  
            resolve({
              "usernameTaken": true
            });
  
          } else {
            resolve({});
          }
        }, 2000);
      }
    });
  }
 
}