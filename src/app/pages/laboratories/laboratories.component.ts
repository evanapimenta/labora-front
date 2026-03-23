import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryController } from '../../core/controllers/laboratory.controller';
import { IconLaboratoryComponent } from '../../icons/icon-laboratory';
import { IconLocationComponent } from '../../icons/icon-location';
import { IconPhoneComponent } from '../../icons/icon-phone';
import { IconEmailComponent } from '../../icons/icon-email';
import { SearchInputComponent } from '../../components/search-input/search-input.component';

interface Laboratory {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  active: boolean;
  cnpj: string;
  super_admin_id?: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  address_number: string;
  address_complement?: string;
  address_country: string;
}

@Component({
  selector: 'app-laboratories',
  standalone: true,
  imports: [
    CommonModule,
    IconLaboratoryComponent,
    IconLocationComponent,
    IconPhoneComponent,
    IconEmailComponent,
    SearchInputComponent
  ],
  templateUrl: './laboratories.component.html',
  styleUrls: ['./laboratories.component.css']
})
export class LaboratoriesComponent implements OnInit {
  laboratories: any[] = [];
  filteredLaboratories: Laboratory[] = [];
  searchTerm: string = '';

  constructor(private laboratoryController: LaboratoryController) {}

  ngOnInit(): void {
    this.loadLaboratories();
  }

  loadLaboratories(): void {
    // Dados mock para desenvolvimento - remover quando a API estiver funcionando
    // const mockLaboratories: Laboratory[] = [
    //   {
    //     id: '1',
    //     name: 'Laboratório Central de Análises',
    //     phone_number: '(11) 3456-7890',
    //     email: 'contato@labcentral.com.br',
    //     active: true,
    //     cnpj: '12.345.678/0001-90',
    //     super_admin_id: 'admin1',
    //     address_street: 'Rua das Flores',
    //     address_neighborhood: 'Centro',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01310-100',
    //     address_number: '123',
    //     address_complement: 'Sala 45',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '2',
    //     name: 'Lab Diagnósticos Avançados',
    //     phone_number: '(11) 2345-6789',
    //     email: 'info@labdiagnosticos.com.br',
    //     active: true,
    //     cnpj: '23.456.789/0001-01',
    //     super_admin_id: 'admin2',
    //     address_street: 'Avenida Paulista',
    //     address_neighborhood: 'Bela Vista',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01310-200',
    //     address_number: '456',
    //     address_complement: 'Conjunto 78',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '3',
    //     name: 'Exames Médicos Especializados',
    //     phone_number: '(11) 1234-5678',
    //     email: 'contato@examesmedicos.com.br',
    //     active: false,
    //     cnpj: '34.567.890/0001-12',
    //     super_admin_id: 'admin3',
    //     address_street: 'Rua Augusta',
    //     address_neighborhood: 'Consolação',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01305-000',
    //     address_number: '789',
    //     address_complement: '',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '4',
    //     name: 'Laboratório de Patologia Clínica',
    //     phone_number: '(11) 9876-5432',
    //     email: 'patologia@labpatologia.com.br',
    //     active: true,
    //     cnpj: '45.678.901/0001-23',
    //     super_admin_id: 'admin4',
    //     address_street: 'Rua Oscar Freire',
    //     address_neighborhood: 'Jardins',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01426-000',
    //     address_number: '321',
    //     address_complement: 'Térreo',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '5',
    //     name: 'Centro de Análises Laboratoriais',
    //     phone_number: '(11) 8765-4321',
    //     email: 'centro@analiseslab.com.br',
    //     active: true,
    //     cnpj: '56.789.012/0001-34',
    //     super_admin_id: 'admin5',
    //     address_street: 'Rua da Consolação',
    //     address_neighborhood: 'Consolação',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01302-000',
    //     address_number: '654',
    //     address_complement: '2º andar',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '6',
    //     name: 'Lab Saúde Integral',
    //     phone_number: '(11) 7654-3210',
    //     email: 'saude@labsaudeintegral.com.br',
    //     active: true,
    //     cnpj: '67.890.123/0001-45',
    //     super_admin_id: 'admin6',
    //     address_street: 'Avenida Faria Lima',
    //     address_neighborhood: 'Itaim Bibi',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '04538-132',
    //     address_number: '987',
    //     address_complement: 'Conjunto 201',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '7',
    //     name: 'Laboratório de Microbiologia',
    //     phone_number: '(11) 6543-2109',
    //     email: 'micro@labmicrobiologia.com.br',
    //     active: false,
    //     cnpj: '78.901.234/0001-56',
    //     super_admin_id: 'admin7',
    //     address_street: 'Rua Haddock Lobo',
    //     address_neighborhood: 'Cerqueira César',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01414-000',
    //     address_number: '147',
    //     address_complement: '',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '8',
    //     name: 'Exames Clínicos Modernos',
    //     phone_number: '(11) 5432-1098',
    //     email: 'modernos@examesclinicos.com.br',
    //     active: true,
    //     cnpj: '89.012.345/0001-67',
    //     super_admin_id: 'admin8',
    //     address_street: 'Rua Bela Cintra',
    //     address_neighborhood: 'Consolação',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01308-000',
    //     address_number: '258',
    //     address_complement: 'Sala 12',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '9',
    //     name: 'Laboratório de Hematologia',
    //     phone_number: '(11) 4321-0987',
    //     email: 'hemato@labhematologia.com.br',
    //     active: true,
    //     cnpj: '90.123.456/0001-78',
    //     super_admin_id: 'admin9',
    //     address_street: 'Avenida Rebouças',
    //     address_neighborhood: 'Pinheiros',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '05402-000',
    //     address_number: '369',
    //     address_complement: '3º andar',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '10',
    //     name: 'Centro de Diagnósticos Especializados',
    //     phone_number: '(11) 3210-9876',
    //     email: 'diagnosticos@centrodiagnosticos.com.br',
    //     active: true,
    //     cnpj: '01.234.567/0001-89',
    //     super_admin_id: 'admin10',
    //     address_street: 'Rua Teodoro Sampaio',
    //     address_neighborhood: 'Pinheiros',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '05405-000',
    //     address_number: '741',
    //     address_complement: 'Conjunto 45',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '11',
    //     name: 'Lab Análises Clínicas Premium',
    //     phone_number: '(11) 2109-8765',
    //     email: 'premium@labpremium.com.br',
    //     active: false,
    //     cnpj: '12.345.678/0001-90',
    //     super_admin_id: 'admin11',
    //     address_street: 'Rua Estados Unidos',
    //     address_neighborhood: 'Jardim América',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01427-000',
    //     address_number: '852',
    //     address_complement: '',
    //     address_country: 'Brasil'
    //   },
    //   {
    //     id: '12',
    //     name: 'Laboratório de Bioquímica Avançada',
    //     phone_number: '(11) 1098-7654',
    //     email: 'bioquimica@labbioquimica.com.br',
    //     active: true,
    //     cnpj: '23.456.789/0001-01',
    //     super_admin_id: 'admin12',
    //     address_street: 'Avenida Sumaré',
    //     address_neighborhood: 'Perdizes',
    //     address_city: 'São Paulo',
    //     address_state: 'SP',
    //     address_postal_code: '01258-000',
    //     address_number: '963',
    //     address_complement: 'Térreo e 1º andar',
    //     address_country: 'Brasil'
    //   }
    // ];

    // Usar dados mock por enquanto
    // this.laboratories = mockLaboratories;
    // this.filteredLaboratories = [...this.laboratories];

    // Código original da API (comentado temporariamente)
    
    this.laboratoryController.getAll().subscribe({
      next: (laboratories: any) => {
        this.laboratories = laboratories.content;
        this.filteredLaboratories = [...this.laboratories];
      },
      error: (error) => {
        console.error('Erro ao carregar laboratórios:', error);
      }
    });
    
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterLaboratories();
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterLaboratories();
  }

  filterLaboratories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredLaboratories = [...this.laboratories];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredLaboratories = this.laboratories.filter(lab =>
      lab.name.toLowerCase().includes(term) ||
      lab.cnpj.includes(term) ||
      lab.email.toLowerCase().includes(term) ||
      lab.phone_number.includes(term) ||
      lab.address_city.toLowerCase().includes(term) ||
      lab.address_state.toLowerCase().includes(term) ||
      lab.address_neighborhood.toLowerCase().includes(term)
    );
  }

  getStatusText(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  getStatusColor(active: boolean): string {
    return active ? 'text-success' : 'text-danger';
  }

  getStatusBadgeColor(active: boolean): string {
    return active ? 'bg-success-light text-success' : 'bg-danger-light text-danger';
  }

  getFullAddress(laboratory: Laboratory): string {
    const parts = [
      laboratory.address_street,
      laboratory.address_number,
      laboratory.address_complement,
      laboratory.address_neighborhood,
      laboratory.address_city,
      laboratory.address_state,
      laboratory.address_postal_code
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }

  agendarExame(laboratory: Laboratory): void {
    console.log('Agendar exame para:', laboratory.name);
    // Implementar lógica de agendamento
  }
}