import {Component, Inject, Input, OnInit, TemplateRef, Type} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';
import {MatDatepicker} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTabsModule} from "@angular/material/tabs";


@Component({
  selector: 'app-reusable-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    ReactiveFormsModule,
    MatDialogActions,
    MatDatepicker,
    MatInputModule,
    MatSelect,
    MatCheckboxModule,
    MatTabsModule
  ],
  templateUrl: './reusable-dialog.component.html',
  styleUrls: ['./reusable-dialog.component.scss']
})
export class ReusableDialogComponent implements OnInit{

  protected readonly ReusableText = ReusableText;
  protected readonly ReusableInput = ReusableInput;
  protected readonly ReusableSelect = ReusableSelect;
  protected readonly ReusableDatepicker = ReusableDatepicker;
  protected readonly ReusableCheckBox = ReusableCheckBox;
  protected readonly ReusableCustomComponent = ReusableCustomComponent;
  protected readonly ReusableTextarea = ReusableTextarea;
  protected readonly ReusableTabs = ReusableTabs;


  formGroup: FormGroup = new FormGroup({});

  constructor(public dialogRef: MatDialogRef<ReusableDialogComponent>, @Inject(MAT_DIALOG_DATA) public config: ReusableDialogConfig,){}

  ngOnInit(){
    this.buildFormGroup();

    this.dialogRef.backdropClick().subscribe(() => {
      this.onCloseDialog();
    })
  }

  onCloseDialog(){
    this.config.onCancel();

    if(this.config.closeOnCancel){
      this.dialogRef.close();
    }
  }

  onSaveDialog(){
    this.collectDataFromContents(this.config.content);
    this.config.onConfirm();

    if (this.config.closeOnConfirm){
      this.dialogRef.close();
    }
  }

  isInstanceOf(type: Type<ReusableDialogContent>, content: ReusableDialogContent){
    return content instanceof type;
  }

  public objectComparisonFunction = function( option, value ) : boolean {
    return option.id === value.id;
  }

  valueIsObject(options: any[]){
    if(options.length == 0){
      return false;
    }
    let option = options[0].value;
    return option instanceof Object;
  }

  getCSSClassforContentWidth(content: ReusableDialogContent): string{
    switch (content.width){
      case ReusableDialogContentWidth.FULLWIDTH:
        return "col-md-12";
      case ReusableDialogContentWidth.HALFWIDTH:
        return "col-md-6";
      case ReusableDialogContentWidth.QUARTERWIDTH:
        return "col-md-3";
    }
  }

  getCSSClassforDialogWidth(width: ReusableDialogWidth){
    switch (width){
      case ReusableDialogWidth.BIG:
        return "big-width";
      case ReusableDialogWidth.MEDIUM:
        return "medium-width";
      case ReusableDialogWidth.SMALL:
        return "small-width";
   }
  }

  private collectDataFromContents(contents: ReusableDialogContent[]) {
    for (const content of contents) {
      if (content instanceof ReusableInput || content instanceof ReusableCheckBox || content instanceof ReusableDatepicker || content instanceof ReusableSelect || content instanceof ReusableTextarea) {
        const valueString = content.value;
        if (content.disabled) {
          this.config.data[valueString] = this.formGroup.getRawValue()[valueString];
        } else {
          this.config.data[valueString] = this.formGroup.value[valueString];
        }
      } else if (content instanceof ReusableTabs) {
        for (const tab of content.tabs) {
          this.collectDataFromContents(tab.content);
        }
      }
    }
  }

  private addControlsForContents(contents: ReusableDialogContent[]) {
    for (const content of contents) {
      if (content instanceof ReusableInput || content instanceof ReusableCheckBox || content instanceof ReusableDatepicker || content instanceof ReusableSelect || content instanceof ReusableTextarea) {
        let control: AbstractControl = new FormControl(this.config.data[content.value]);
        if (content instanceof ReusableDatepicker) {
          const timestamp = this.config.data[content.value];
          if (timestamp) {
            control = new FormControl(new Date(timestamp));
          }
        }
        if (content.validators) {
          control.addValidators(content.validators);
        }
        if (content.disabled) {
          control.disable();
        }
        this.formGroup.addControl(content.value, control);
      } else if (content instanceof ReusableTabs) {
        for (const tab of content.tabs) {
          this.addControlsForContents(tab.content);
        }
      }
    }
  }

  buildFormGroup(){
    this.addControlsForContents(this.config.content);
  }
}


export class ReusableDialogConfig{
  dialogTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  onCancelText: string;
  onConfirmText: string;
  closeOnCancel: boolean;
  closeOnConfirm: boolean;
  content: ReusableDialogContent[];
  data: {};
  width: ReusableDialogWidth;


  constructor(content: ReusableDialogContent[], data: {}, width: ReusableDialogWidth = ReusableDialogWidth.SMALL) {
    this.onCancelText = "Abbrechen";
    this.onConfirmText = "Bestätigen";
    this.closeOnCancel = true;
    this.closeOnConfirm = true;
    this.onCancel = () =>{};
    this.onConfirm = () => {};
    this.dialogTitle = "Default Titel";
    this.content = content;
    this.data = data;
    this.width = width;
  }
}

export class ReusableDialogContent {
  disabled: boolean;
  validators: ValidatorFn[];
  width: ReusableDialogContentWidth;

  constructor(disabled: boolean, validators: ValidatorFn[], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    this.disabled = disabled;
    this.validators = validators;
    this.width = width;
  }
}

export class ReusableInput extends ReusableDialogContent{
  value: string ;
  description: string;
  constructor(value: string, description: string, disabled = false, validators: ValidatorFn[] = [], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(disabled, validators, width);
    this.value = value;
    this.description = description;
  }
}
export class ReusableText extends ReusableDialogContent{
  text: string;
  constructor(text: string, disabled = false, validators: ValidatorFn[] = [], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(disabled, validators, width);
    this.text = text;
  }
}
export class ReusableSelect extends ReusableDialogContent{
  value: string;
  description: string;
  options: {value: any, label: string}[];

  constructor(value: string, description: string, options: {value: any, label: string}[], disabled = false,validators: ValidatorFn[] = [], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(disabled, validators, width);
    this.value = value;
    this.description = description;
    this.options = options;
  }
}
export class ReusableDatepicker extends ReusableDialogContent{
  value: string;
  description: string;

  constructor(value: string, description: string, disabled = false, validators: ValidatorFn[] = [], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(disabled, validators, width);
    this.value = value;
    this.description = description;
  }
}
export class ReusableCheckBox extends ReusableDialogContent{
  value: string;
  description: string;

  constructor(value: string, description: string, disabled = false, validators: ValidatorFn[] = [], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(disabled, validators, width);
    this.value = value;
    this.description = description;

  }
}
export class ReusableCustomComponent extends ReusableDialogContent{
  template: TemplateRef<any>;

  constructor(template: TemplateRef<any>, width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(false, [], width);
    this.template = template;
  }
}
export class ReusableTextarea extends ReusableDialogContent{
  value: string ;
  description: string;
  constructor(value: string, description: string, disabled = false, validators: ValidatorFn[] = [], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(disabled, validators, width);
    this.value = value;
    this.description = description;
  }
}

export class ReusableTab {
  label: string;
  content: ReusableDialogContent[];

  constructor(label: string, content: ReusableDialogContent[]) {
    this.label = label;
    this.content = content;
  }
}

export class ReusableTabs extends ReusableDialogContent {
  tabs: ReusableTab[];

  constructor(tabs: ReusableTab[], width: ReusableDialogContentWidth = ReusableDialogContentWidth.FULLWIDTH) {
    super(false, [], width);
    this.tabs = tabs;
  }
}
export enum ReusableDialogWidth{
  BIG,
  MEDIUM,
  SMALL
}
export enum ReusableDialogContentWidth{
  FULLWIDTH,
  HALFWIDTH,
  QUARTERWIDTH
}
