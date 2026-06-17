import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { register } from 'swiper/element/bundle';
import { RouterLink } from '@angular/router';
import { IconLaboratoryComponent } from '../../icons/icon-laboratory';
import { IconLocationComponent } from '../../icons/icon-location';
import { IconFileComponent } from '../../icons/icon-file';
import { IconPrinterComponent } from '../../icons/icon-printer';
import { IconDownloadComponent } from '../../icons/icon-download';
import { IconShareComponent } from '../../icons/icon-share';
import { ScheduleController } from '../../core/controllers/schedule.controller';
import { AccessService } from '../../core/services/access.service';

@Component({
  selector: 'app-home',
  standalone: true,
  host: {
    'ngSkipHydration': 'true'
  },
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    RouterLink,
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
export class HomeComponent implements OnInit {
  slides = [
    {
      title: 'Agende seus exames sem enrolação',
      description: 'Marcação de exames de forma prática, rápida e segura.',
      buttonText: 'Agende agora',
      buttonLink: '/schedule',
      image: '/assets/Adventure_Illustrations/Laboratory/Laboratory.png',
      bgColor: 'bg-[#4C2A75]',
      btnClass: 'border-white text-white hover:bg-white hover:text-[#4C2A75]'
    },
    {
      title: 'Seus resultados, na palma da mão',
      description: 'Seus exames reunidos, de forma simples e prática.',
      buttonText: 'Ver meus exames',
      buttonLink: '/schedule',
      image: '/assets/Adventure_Illustrations/Medical Research/Medical Research.png',
      bgColor: 'bg-[#EFBD22]',
      btnClass: 'border-white text-white hover:bg-white hover:text-[#EFBD22]'
    },
    {
      title: 'Suporte fácil ao seu alcance',
      description: 'Tire suas dúvidas de forma rápida e descomplicada',
      buttonText: 'Atendimento online',
      buttonLink: '/',
      image: '/assets/Adventure_Illustrations/Medical Care/Medical Care.png',
      bgColor: 'bg-[#E75169]',
      btnClass: 'border-white text-white hover:bg-white hover:text-[#E75169]'
    }
  ];

  agendamentos: any[] = [];
  resultados: any[] = [];

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

  isPreparoModalOpen = false;
  selectedPreparo: string | null = null;
  selectedTestName: string = '';

  constructor(
    private scheduleController: ScheduleController,
    private accessService: AccessService
  ) {
    register();
  }

  ngOnInit(): void {
    if (this.accessService.access?.accessToken) {
      this.loadSchedules();
    }
  }

  loadSchedules() {
    this.scheduleController.getScheduled().subscribe({
      next: (res: any) => {
        // Sort from closest to furthest (scheduledFor is ISO string)
        this.agendamentos = (res || []).sort((a: any, b: any) => {
          return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
        });
      },
      error: (err: any) => {
        console.error('Erro ao carregar exames agendados:', err);
      }
    });

    this.scheduleController.getCompleted().subscribe({
      next: (res: any) => {
        // Sort from most recent to oldest (scheduledFor is ISO string)
        this.resultados = (res || []).sort((a: any, b: any) => {
          return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
        });
      },
      error: (err: any) => {
        console.error('Erro ao carregar exames concluídos:', err);
      }
    });
  }

  formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = months[d.getMonth()];
    const hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return { dia, mes, hora };
  }

  getFormattedDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} às ${hh}:${min}h`;
  }

  formatAddress(address: any): string {
    if (!address) return '';
    return `${address.street || ''}, ${address.number || ''} - ${address.neighborhood || ''}, ${address.city || ''} - ${address.state || ''}`;
  }

  async printResult(url: string) {
    if (typeof window === 'undefined') return;

    try {
      // Usamos um proxy de CORS apenas para testes, pois o PDF da w3.org bloqueia requisições de localhost
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);

      // Abre uma nova aba vazia
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        // Escreve o HTML na nova aba contendo o PDF em tela cheia e o script de auto-impressão
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir Resultado</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #f3f4f6; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe id="pdfIframe" src="${blobUrl}"></iframe>
              <script>
                const iframe = document.getElementById('pdfIframe');
                iframe.onload = function() {
                  setTimeout(function() {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Se o popup for bloqueado pelo navegador
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error('Erro ao abrir nova aba de impressão:', e);
      window.open(url, '_blank');
    }
  }

  downloadResult(url: string, fileName: string) {
    if (typeof window !== 'undefined') {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        })
        .catch(err => {
          console.error('Erro ao fazer download do arquivo', err);
          // Fallback if fetch fails (e.g. CORS)
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    }
  }

  onBuscar() {
    console.log('Busca rápida', {
      local: this.localSelecionado,
      exame: this.exameSelecionado,
    });
  }

  openPreparoModal(agendamento: any) {
    this.selectedTestName = agendamento.testName;
    this.selectedPreparo = agendamento.preparationInstructions || 'Nenhum preparo específico necessário para este exame.';
    this.isPreparoModalOpen = true;
  }

  closePreparoModal() {
    this.isPreparoModalOpen = false;
    setTimeout(() => {
      this.selectedPreparo = null;
      this.selectedTestName = '';
    }, 300);
  }
}
