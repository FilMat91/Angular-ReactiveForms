import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { Customer } from './customer';
import {FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray} from "@angular/forms";
import {debounceTime} from "rxjs/operators";

function ratingRange(min: number, max: number): ValidatorFn { //funziona che restituisce una funzione di validazione (non è la funzione di validazione)
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { range: true };//all values at false ar erros
    }
    return null; //nell = no errors
  };
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  if (emailControl?.pristine || confirmControl?.pristine) {
    return null;
  }

  if (emailControl?.value === confirmControl?.value) {
    return null;
  }
  return { match: true };
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerComponent implements OnInit {

  customerForm: FormGroup | null = null;
  customer = new Customer();
  emailMessage: string = "";

  private validationMessages: any = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };

  get addresses(): FormArray{
    return <FormArray>this.customerForm?.get("addresses");
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {

/*    this.customerForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      sendCatalog: new FormControl(true)
    });*/
    this.customerForm = this.fb.group({
      firstName: ["",[Validators.required, Validators.minLength(3)]],
      //lastName: {value: "n/a", disabled: true},
      lastName: ["",[Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ["",[Validators.required, Validators.email]],
        confirmEmail: ["", Validators.required]
      }, {validator: emailMatcher}),
      phone: "",
      notification: "email",
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addresses: this.fb.array([this.buildAddress()])
    });

    this.customerForm.get("notification")?.valueChanges.subscribe(value => {
      this.setNotification(value);
    });

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl?.valueChanges.pipe(
        debounceTime(1000)
    ).subscribe(
        value => this.setMessage(emailControl)
    );
  }

  populateTestData(): void {
/*    this.customerForm?.setValue({ //CHANGE ALL VALUE
      firstName: "Matteo",
      lastName: "Filopanti",
      email: "x@x.x",
      sendCatalog: false
    });*/

    this.customerForm?.patchValue({ //CHANGE ONLY CONFIG VALUE
      firstName: "Matteo",
      lastName: "Filopanti",
      sendCatalog: false
    });
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
          key => this.validationMessages[key]).join(' ');
    }
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm?.value));
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm?.get("phone");
    if(notifyVia === "text") {
      phoneControl?.setValidators(Validators.required);
    }
    else {
      phoneControl?.clearValidators();
    }
    phoneControl?.updateValueAndValidity();
  }

  private buildAddress(): FormGroup {
    return this.fb.group({
      addressType: "home",
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: ""
    })
  }

  addAddress(): void {
    this.addresses.push(this.buildAddress());
  }
}
