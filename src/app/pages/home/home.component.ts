import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { register } from 'swiper/element/bundle';
import { IconLaboratoryComponent } from '../../icons/icon-laboratory';
import { IconLocationComponent } from '../../icons/icon-location';
import { IconFileComponent } from '../../icons/icon-file';
import { IconPrinterComponent } from '../../icons/icon-printer';
import { IconDownloadComponent } from '../../icons/icon-download';
import { IconShareComponent } from '../../icons/icon-share';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    IconLaboratoryComponent,
    IconLocationComponent,
    IconFileComponent,
    IconPrinterComponent,
    IconDownloadComponent,
    IconShareComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor() {
    register();
  }
  slides = [
    '/assets/Adventure_Illustrations/Medical Care/Medical Care.png',
    '/assets/Adventure_Illustrations/Laboratory/Laboratory.png',
    '/assets/Adventure_Illustrations/Medical Research/Medical Research.png',
  ];

  agendamento = {
    dia: '30',
    mes: 'FEV',
    hora: '00:00',
    exame: 'TESTE DE COMPRIMENTO',
    laboratorio: 'Laboratório Caro',
    unidade: 'Unidade Tabão das Trevas',
    endereco: 'Rua Carlos Suriname Xingu 3157, Barueri - SP',
  };

  resultados = [
    {
      titulo: 'Electro-geneticinoma Tipo A11',
      laboratorio: 'Laboratório Caro',
      unidade: 'Unidade Taboã das Trevas',
      data: '31/02/2026 00:00h',
    },
    {
      titulo: 'Electro-geneticinoma Tipo A11',
      laboratorio: 'Laboratório Caro',
      unidade: 'Unidade Taboã das Trevas',
      data: '31/02/2026 00:00h',
    },
    {
      titulo: 'Electro-geneticinoma Tipo A11',
      laboratorio: 'Laboratório Caro',
      unidade: 'Unidade Taboã das Trevas',
      data: '31/02/2026 00:00h',
    },
  ];

  locais = [
    { id: 1, nome: 'Barueri - SP' },
    { id: 2, nome: 'Carapicuíba - SP' },
    { id: 3, nome: 'Osasco - SP' },
  ];
  exames = [
    { id: 'a', nome: 'Hemograma' },
    { id: 'b', nome: 'Glicemia' },
    { id: 'c', nome: 'Colesterol' },
  ];

  localSelecionado: any = null;
  exameSelecionado: any = null;

  onBuscar() {
    console.log('Busca rápida', {
      local: this.localSelecionado,
      exame: this.exameSelecionado,
    });
  }
}
