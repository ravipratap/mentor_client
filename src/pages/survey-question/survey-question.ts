import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { ConfigProvider } from '../../providers/config/config';

/**
 * Generated class for the SurveyQuestionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-question',
  templateUrl: 'survey-question.html',
})
export class SurveyQuestionPage {
  site:any;
  navTitle:string;
  question: any;
  showChoices = false;
  showAddChoice = false;
  submitted = false;
  questionForm: FormGroup;
  surveyCategory: string;
  siteConfig: any; 

  formErrors = {
    'question': '',
    'mentor_question': '',
    'category': ''
  };
  validationMessages = {
    'question': {
      'required' : 'Question is required.'
    },
    'mentor_question': {
      "requiredIfEnabled": "Enter question for mentor"
    },
    'category': {
      'required' : 'Select category of question.',
      'choicePresent' : 'Enter choices for the question.'
    }
  };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private auth: AuthProvider,
    private config: ConfigProvider
  ) {
    this.question = this.navParams.data.question? JSON.parse(JSON.stringify(this.navParams.data.question)) : undefined;
    this.navTitle = this.navParams.data.question? "Edit Question" : "Add Question"; 
    this.surveyCategory = this.navParams.data.category;
    this.site = this.navParams.data.site;
    
    
    if(this.site){
      this.siteConfig = {config: this.site.config};
      this.initForm();
    } else {
      this.auth.loadSiteConfig().then((siteConfig) => {
        this.siteConfig =siteConfig;
        this.initForm();
      });
    }
  }

  initForm() {
    let choices = new FormArray([]); 
    this.questionForm = this.formBuilder.group({
      question: [this.question? this.question.question: "", Validators.required],
      seperate_question: this.question?this.question.seperate_question :false,
      mentor_question: [this.question? this.question.mentor_question: "", [this.requiredIfEnabledValidator("seperate_question")]],
      category: [this.question? this.question.category: "", [Validators.required, this.choicesValidator()]],
      mandatory: [this.question? this.question.mandatory: false],
      other_choice: [this.question && this.question.other_choice? this.question.other_choice: false],
      placeholder: [""],
      choices: choices
    });

    if ( this.question && this.question.choices && this.question.choices.length > 0 ) {
      this.question.choices.forEach( ( choice, choiceIndex ) => {
        this.addChoice(choice.text);
      });
      this.setChoiceControl(true);
    }
    this.questionForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
    console.log("errors", this.formErrors);
  }
  setChoiceControl(existing?: boolean) {
    const category=this.questionForm.controls.category.value;
    if ( !existing && this.question && this.question.choices && this.question.choices.length > 0) {
      this.question.choices.forEach( ( choice, choiceIndex ) => {
        this.removeChoice(this.question.choices.length - choiceIndex - 1);
      });
    this.question.choices=[];
    }
    if((existing && this.question && this.question.choices && this.question.choices.length > 0) || category == "Multiple" || category == "Yes/No" || category == "Radio"){
      this.showChoices = true;
      const numChoices = (<FormArray>this.questionForm.controls.choices).controls.length;
      if(numChoices == 0) {
        this.addChoice();
      }
      if(numChoices < 2) {  
        this.addChoice();
      }
      if(category == "Yes/No"){ 
        if(numChoices >2){ 
          for(let i=0; i<numChoices-1; i++){
            this.removeChoice(numChoices-i);
          }
        }
        this.showAddChoice =  false;
      } else {
        this.showAddChoice =  true;
      }
    } else {
      this.showChoices = false;
    }
  }
  addChoice(choice?: string):void {
    const numChoices = (<FormArray>this.questionForm.controls.choices).controls.length;
    if(numChoices <= 25 ){
      (<FormArray>this.questionForm.controls['choices']).push(
        this.formBuilder.group({
          choice: [choice? choice: '', this.uniquechoicesValidator()]
        })
      );
    }
    if(numChoices >= 25 ) this.showAddChoice = false;
  }
  removeChoice(index: number) {
    (<FormArray>this.questionForm.controls['choices']).removeAt(index);
    if(this.questionForm.controls.category.value == "Yes/No") {
      const numChoices = (<FormArray>this.questionForm.controls.choices).controls.length;
      this.showAddChoice =  false;
      if(numChoices<=1){
        this.addChoice();
      }
    } else {
      this.showAddChoice =  true;
    }

  }
  onValueChanged(data? : any) {
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      let control = this.questionForm.get(field);
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
    // console.log(this.formErrors);
  }

  choicesValidator() {
    let thisControl: FormControl;
    let choiceControls: FormArray;
    return function choicePresentValidate (control: FormControl) {
      if (!control.parent) {
        return null;
      }
      // Initializing the validator.
      if (!thisControl) {
        thisControl = control;
        choiceControls=control.parent.get("choices") as FormArray;
        choiceControls.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }
      if (thisControl.value) {
        let numChoices = 0;
        choiceControls.controls.forEach((formGroup: FormGroup) => {
          if(formGroup.controls.choice.value) {
            ++numChoices;
          }
        });
        const category = thisControl.value;
        if(numChoices<2 && (category == "Multiple"  || category == "Radio" || category == "Yes/No")){ 
          return {
            choicePresent: true
          };
        }
      }
      return null;
    }
  }
  requiredIfEnabledValidator(otherControlName: string) {
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

      if (otherControl.value && !thisControl.value) {
        return {
          requiredIfEnabled: true
        };
      }
      return null;
    }
  }
  uniquechoicesValidator() {
    let thisControl: FormControl;
    let choiceControls: FormArray= this.questionForm.controls.choices as FormArray;
    return function choicePresentValidate (control: FormControl) {
      if (!control.parent) {
        return null;
      }
      thisControl = control;
      if (!thisControl) {
        // choiceControls.valueChanges.subscribe(() => {
        //   thisControl.updateValueAndValidity();
        // });
      }
      if (thisControl.value) {
        let numMatches = 0;
        choiceControls.controls.forEach((formGroup: FormGroup) => {
          if(formGroup.controls.choice.value==thisControl.value) {
            ++numMatches;
          }
        });
        if(numMatches > 1) {
          return {
            notUnique: true
          };
        }
      }
      return null;
    }
  }
  save() {
    this.submitted = true;
    console.log("form Errors after submit: ", this.formErrors);
    console.log("this.questionForm.valid:", this.questionForm);
    if(this.questionForm.valid){
      if(!this.question){
        this.question = {
          profile : {}
        };
      }
      this.question.order = this.navParams.get('questionIndex');
      this.question.question = this.questionForm.controls.question.value;
      this.question.seperate_question = this.questionForm.controls.seperate_question.value;
      this.question.mentor_question = this.questionForm.controls.mentor_question.value;
      this.question.category = this.questionForm.controls.category.value;
      this.question.mandatory = this.questionForm.controls.mandatory.value;
      this.question.other_choice = this.questionForm.controls.other_choice.value;
      if(this.questionForm.controls.placeholder.value) {
        this.question.placeholder = this.questionForm.controls.placeholder.value;
      }
      let choices: any[] =[];
      let choiceIndex = 0;
      (<FormArray>this.questionForm.controls.choices).controls.forEach((formGroup: FormGroup) => {
        if(formGroup.controls.choice.value) {
          choices.push({
            text: formGroup.controls.choice.value,
            order: choiceIndex
          });
          choiceIndex++;
        }
      });
      if(this.question.category == "Gender" && choices.length ==0) {
        choices = this.config.getChoices(this.question.category, this.siteConfig);
        this.question.other_choice=false;
      }
      if(this.question.category == "Role" && choices.length ==0) {
        choices = this.config.getChoices(this.question.category, this.siteConfig);
        this.question.other_choice=false;
      }
      if(this.question.category == "Job Level" && choices.length ==0) {
        choices = this.config.getChoices(this.question.category, this.siteConfig);
        this.question.other_choice = true;
      }
      if(this.question.category == "Function" && choices.length ==0) {
        choices = this.config.getChoices(this.question.category, this.siteConfig);
        this.question.other_choice = true;
      }
      
      this.question.choices=choices;
      console.log(this.question);
      this.navCtrl.pop().then(() => {
        this.navParams.get('callback')({
          question: this.question,
          questionIndex: this.navParams.get('questionIndex')
        });
      });
    } 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveyQuestionPage');
  }

}
