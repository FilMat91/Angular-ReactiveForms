import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { Customer } from './customer';
import {FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerComponent implements OnInit {

  customerForm: FormGroup | null = null;
  customer = new Customer();

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
      email: ["",[Validators.required, Validators.email]],
      phone: "",
      notification: "email",
      sendCatalog: true
    });


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
}
