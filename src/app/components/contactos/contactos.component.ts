import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Contacto } from "../../models/contacto";
import { ContactosService } from "../../services/contactos.service";
import { ModalDialogService } from '../../services/modal-dialog.service';

@Component({
  selector: "app-contactos",
  templateUrl: "./contactos.component.html",
  styleUrls: ["./contactos.component.css"]
})
export class ContactosComponent implements OnInit {
  Titulo = "Contactos";
  TituloAccionABMC = {
    A: "(Agregar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  AccionABMC = "L";
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados..."
  };

  Items: Contacto[] = [];
  RegistrosTotal: number;
  Pagina = 1;

  constructor(
   public formBuilder: FormBuilder,
   private contactosService: ContactosService,
  private modalDialogService: ModalDialogService
  ) {}
  FormBusqueda: FormGroup;
  FormRegistro: FormGroup;

  submitted: boolean = false;

  ngOnInit() { this.FormBusqueda = this.formBuilder.group({
      Nombre: [null],
    });
      this.FormRegistro = this.formBuilder.group({
      IdContacto: [null],
      IdCategoria: [null],
      Nombre: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      Telefono: [null, [Validators.required, Validators.pattern("[0-9]{9}")]  ],
      FechaNacimiento: [null, [Validators.required, Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          )]  ],
      
    });

      }

  Agregar() {
    this.AccionABMC = "A";
    this.FormRegistro.reset({IdContacto: 0 });
    this.submitted = false;
    this.FormRegistro.markAsUntouched();
  }

// Buscar segun los filtros, establecidos en FormRegistro
  Buscar() {
    this.contactosService.get().subscribe((res: any) => {
        this.Items = res;
        this.RegistrosTotal = res.RegistrosTotal;
      });
  }

  // Obtengo un registro especifico según el Id
  BuscarPorId(Dto, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.contactosService.getById(Dto.IdContacto).subscribe((res: any) => {
      this.FormRegistro.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaNacimiento.substr(0, 10).split('-');
      this.FormRegistro.controls.FechaNacimiento.patchValue(
        arrFecha[2] + '/' + arrFecha[1] + '/' + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Consultar(Dto) {
    this.BuscarPorId(Dto, "C");
  }

// grabar altas
  Grabar() {
  this.submitted = true;
     // verificar que los validadores esten OK
     if (this.FormRegistro.invalid) {
      return;
     }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormRegistro.value };
 
    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaNacimiento.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaNacimiento = 
          new Date(
            arrFecha[2],
            arrFecha[1] - 1,
            arrFecha[0]
          ).toISOString();
 
    // agregar post
    if (this.AccionABMC == "A") {
      this.contactosService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    } 
  }

  // Volver desde Agregar
  Volver() {
    this.AccionABMC = "L";
  }
}
