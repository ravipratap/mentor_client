import {Component, Input, Output, EventEmitter, TemplateRef, ViewChild, HostListener} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {noop} from 'rxjs/util/noop';
import {Observable, Subject} from 'rxjs';

// searchbar default options
const defaultOpts = {
    cancelButtonText: 'Cancel',
    showCancelButton: false,
    debounce: 250,
    placeholder: 'Search',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'off',
    type: 'search',
    value: '',
    noItems: '',
    clearOnEdit: false,
    clearInput: false
};

/**
 * Generated class for the AutoCompleteComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'auto-complete',
  templateUrl: 'auto-complete.html',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: AutoCompleteComponent, multi: true}
  ]
})
export class AutoCompleteComponent implements ControlValueAccessor {

  @Input() public dataProvider: any;
  @Input() public options: any;
  @Input() public disabled: any;
  @Input() public keyword: string;
  @Input() public showResultsFirst: boolean;
  @Input() public alwaysShowList: boolean;
  @Input() public hideListOnSelection: boolean = true;
  @Input() public template: TemplateRef<any>;
  @Input() public useIonInput: boolean;
  @Input() public iconIonInput: boolean;
  @Input() public multiInput: boolean;
  @Input() public selectionList: string[] = [];
  @Output() public autoFocus: EventEmitter<any>;
  @Output() public autoBlur: EventEmitter<any>;
  @Output() public itemSelected: EventEmitter<any>;
  @Output() public itemsShown: EventEmitter<any>;
  @Output() public itemsHidden: EventEmitter<any>;
  @Output() public ionAutoInput: EventEmitter<string>;
  @ViewChild('searchbarElem') searchbarElem;
  @ViewChild('inputElem') inputElem;

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  public defaultOpts: any;
  public suggestions: any[];
  public formValue: any;

   // adding for debounce support
  searchTerm$ = new Subject<string>();

  public get showList(): boolean {
      return this._showList;
  }

  public set showList(value: boolean) {
      if (this._showList === value) {
          return;
      }

      this._showList = value;
      this.showListChanged = true;
  }

  private _showList: boolean;

  private selection: any;
  private showListChanged: boolean = false;

  /**
   * create a new instace
   */
  public constructor() {
      this.keyword = '';
      this.suggestions = [];
      this._showList = false;
      this.itemSelected = new EventEmitter<any>();
      this.itemsShown = new EventEmitter<any>();
      this.itemsHidden = new EventEmitter<any>();
      this.ionAutoInput = new EventEmitter<string>();
      this.autoFocus = new EventEmitter<any>();
      this.autoBlur = new EventEmitter<any>();
      this.options = {};

      // set default options
      this.defaultOpts = defaultOpts;
  }
  ngAfterContentInit() {
     // adding for debounce support
     if(this.useIonInput) {
        this.dataProvider.search(this.searchTerm$)
        .subscribe(
            (results: any[]) => {
                this.suggestions = results;
                this.showItemList();
            },
            (error: any) => console.error(error)
        );
    }
  }

  /**
   * handle tap
   * @param event
   */
  public handleTap(event) {
      if (this.showResultsFirst || this.keyword.length > 0) {
          this.getItems();
      }
  }

  public writeValue(value: any) {
      if(this.multiInput){
        if (value !== this.selectionList) {
        this.selectionList = value;
        }
      } else {
        if (value !== this.selection) {
            this.selection = value || null;
            this.formValue = this.getFormValue(this.selection);
            this.keyword = this.getLabel(this.selection);
        }
    }
  }

  public registerOnChange(fn: any) {
      this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: any) {
      this.onTouchedCallback = fn;
  }

  public updateModel() {
      if(this.multiInput){
        this.onChangeCallback(this.selectionList);
      } else {
        this.onChangeCallback(this.formValue);
      }
  }

  ngAfterViewChecked() {
      if (this.showListChanged) {
          this.showListChanged = false;
          this.showList ? this.itemsShown.emit() : this.itemsHidden.emit();
      }
  }

  /**
   * get items for auto-complete
   */
  public getItems(e?: Event) {

      let result;

      if (this.showResultsFirst && this.keyword.trim() === '') {
          this.keyword = '';
      } else if (this.keyword.trim() === '') {
          this.suggestions = [];
          return;
      }

      if (typeof this.dataProvider === 'function') {
          result = this.dataProvider(this.keyword);
      } else {
          if(this.useIonInput){ // adding for debounce support
            this.searchTerm$.next(this.keyword);
          } else {
            result = this.dataProvider.getResults(this.keyword);
          }
          
      }

      // if result is instanceof Subject, use it asObservable
      if (result instanceof Subject) {
          result = result.asObservable();
      }

      if (result instanceof Promise) {
          result = Observable.fromPromise(result);
      }

      // if query is async
      if (result instanceof Observable) {
          result
              .subscribe(
                  (results: any[]) => {
                      this.suggestions = results;
                      this.showItemList();
                  },
                  (error: any) => console.error(error)
              )
          ;
      } else {
          this.suggestions = result;
          this.showItemList();
      }

      // emit event
      this.ionAutoInput.emit(this.keyword);
  }

  /**
   * show item list
   */
  public showItemList(): void {
      this.showList = true;
  }

  /**
   * hide item list
   */
  public hideItemList(): void {
      this.showList = this.alwaysShowList;
  }

  
  
  addToSelectionList(selectionValue) {
    if(!this.selectionList) {
        this.selectionList = [];
    }
    if(this.selectionList.indexOf(selectionValue)==-1){
      this.selectionList.push(selectionValue);
      if(this.selectionList.length == 0) {
        this.selectionList= undefined;
      }
    }
  }
  deleteSelectionList(selectionValue: string) {
    this.selectionList.splice(this.selectionList.indexOf(selectionValue), 1);
    // emit selection event
    this.updateModel();
  }
  /**
   * select item from list
   *
   * @param event
   * @param selection
   **/
  public select(selection: any): void {
      this.keyword = this.getLabel(selection);
      this.formValue = this.getFormValue(selection);
      this.hideItemList();
      this.ionAutoInput.emit(this.keyword);
      
      //Add to chips
      if(this.multiInput) {
        this.addToSelectionList(this.getLabel(selection));
        this.clearValue();
      }
      
      // emit selection event
      this.updateModel();
      
      if (this.hideListOnSelection) {
          this.hideItemList();
      }

      // emit selection event
      this.itemSelected.emit(selection);
      this.selection = selection;
  }

  /**
   * get current selection
   * @returns {any}
   */
  public getSelection(): any {
      return this.selection;
  }

  /**
   * get current input value
   * @returns {string}
   */
  public getValue() {
      if(this.multiInput){
          return this.selectionList;
      } else {
        return this.formValue;
      }
  }

  /**
   * set current input value
   */
  public setValue(selection: any) {
      if(this.multiInput){
          this.selectionList = selection;
          this.clearValue();
      } else {
        this.formValue = this.getFormValue(selection);
        this.keyword = this.getLabel(selection);
      }
      return;
  }

  /**
   /**
   * clear current input value
   */
  public clearValue(hideItemList: boolean = false) {
    this.keyword = '';
    this.selection = null;
    this.formValue = null;
    
    if (hideItemList) {
        this.hideItemList();
    }

    return;
  }

  /**
   * set focus of searchbar
   */
  public setFocus() {
      if (this.searchbarElem) {
          this.searchbarElem.setFocus();
      }
  }

  /**
   * fired when the input focused
   */
  onFocus() {
      this.autoFocus.emit();
  }

  /**
   * fired when the input focused
   */
  onBlur() {
      this.autoBlur.emit();
  }

  /**
   * handle document click
   * @param event
   */
  @HostListener('document:click', ['$event'])
  private documentClickHandler(event) {
      if ((this.searchbarElem
              && !this.searchbarElem._elementRef.nativeElement.contains(event.target))
          ||
          (!this.inputElem && this.inputElem._elementRef.nativeElement.contains(event.target))
      ) {
          this.hideItemList();
      }
  }

  private getFormValue(selection: any): any {
      if (selection == null) {
          return null;
      }
      let attr = this.dataProvider.formValueAttribute == null ? this.dataProvider.labelAttribute : this.dataProvider.formValueAttribute;
      if (typeof selection === 'object' && attr) {
          return selection[attr];
      }
      return selection;
  }

  private getLabel(selection: any): string {
      if (selection == null) {
          return '';
      }
      let attr = this.dataProvider.labelAttribute;
      let value = selection;
      if (this.dataProvider.getItemLabel) {
          value = this.dataProvider.getItemLabel(value);
      }
      if (typeof value === 'object' && attr) {
          return value[attr] || '';
      }
      return value || '';
  }

}
