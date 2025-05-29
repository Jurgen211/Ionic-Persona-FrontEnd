import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonSearchbar,
  IonAlert,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonToast,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  eyeOutline, 
  createOutline, 
  trashOutline, 
  add, 
  addOutline, 
  peopleOutline,
  searchOutline,
  refreshOutline,
  closeOutline,
  saveOutline,
  personOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';


// URL base de la API 
const BASE_URL = 'http://localhost:5056/api/Personas'; 

// Componentes necesarios de Ionic
// para la página de Home
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonSearchbar,
    IonAlert,
    IonModal,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonToast,
    IonSegment,
    IonSegmentButton
  ],
})
export class HomePage {
  personas: any[] = [];
  personasOriginales: any[] = []; // Para mantener la lista completa
  selectedPersona: any = null;
  showForm = false;
  showList = true;
  showDetails = false;
  isLoading = false;
  searchTerm = '';
  errorMessage = '';
  successMessage = '';
  
  isFormModalOpen = false;
  isSearchModalOpen = false;
  isToastOpen = false;
  toastMessage = '';
  toastColor = 'danger';
  
  // Tipo de búsqueda
  searchType = 'general'; // 'general' o 'id'
  
  // Datos del formulario
  formData = {
    nombre: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    telefono: '',
    direccion: ''
  };
  
  // Fecha máxima permitida (hoy)
  maxDate: string;
  
  isEditing = false;
  
  constructor() {
    addIcons({
      eyeOutline,
      createOutline,
      trashOutline,
      add,
      addOutline,
      peopleOutline,
      searchOutline,
      refreshOutline,
      closeOutline,
      saveOutline,
      personOutline,
      alertCircleOutline,
      checkmarkCircleOutline
    });
    
    // Establecer fecha máxima como hoy
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.getPersonas();
  }

  // Getter para obtener los mensajes de error
  get errorMessages(): string[] {
    if (!this.errorMessage) return [];
    if (this.errorMessage.includes('Errores de validación:')) {
      return this.errorMessage.replace('Errores de validación:\n• ', '').split('\n• ');
    }
    return [this.errorMessage];
  }

  // Método para mostrar un mensaje de toast
  showToast(message: string, color: string = 'danger') {
    this.toastMessage = message;
    this.toastColor = color;
    this.isToastOpen = true;
  }

  //Metodo para obtener la lista de personas desde la API
  getPersonas() {
    this.isLoading = true;
    this.errorMessage = '';
    
    fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.personas = data;
        this.personasOriginales = [...data]; // Guardar copia original
        this.isLoading = false;
        this.showList = true;
      })
      .catch((error) => {
        console.error('Error al mostrar personas', error);
        this.errorMessage = 'Error al cargar las personas. Verifique la conexión con la API.';
        this.showToast('Error al cargar las personas. Verifique la conexión con la API.');
        this.isLoading = false;
        this.showList = true;
      });
  }

  // Método para manejar la búsqueda con searchbar
  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.searchTerm = query;
    
    if (!query) {
      // Si no hay término de búsqueda, mostrar todas las personas
      this.personas = [...this.personasOriginales];
      return;
    }
    
    if (this.searchType === 'id') {
      // Búsqueda por ID
      this.buscarPorId(query);
    } else {
      // Búsqueda general (nombre, apellido, email)
      this.buscarGeneral(query);
    }
  }

  // Búsqueda general en tiempo real
  buscarGeneral(query: string) {
    this.personas = this.personasOriginales.filter(persona => 
      persona.nombre.toLowerCase().includes(query) ||
      persona.apellido.toLowerCase().includes(query) ||
      persona.email.toLowerCase().includes(query)
    );
  }

  // Búsqueda por ID
  buscarPorId(query: string) {
    const id = parseInt(query);
    if (isNaN(id)) {
      this.personas = [];
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';

    fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Persona no encontrada');
        }
        return response.json().then(errorData => {
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }).catch(() => {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then(data => {
      this.personas = [data]; // Mostrar solo la persona encontrada
      this.isLoading = false;
      this.showToast('Persona encontrada correctamente', 'success');
    })
    .catch(error => {
      console.error('Error al obtener persona:', error);
      this.personas = [];
      this.showToast(error.message);
      this.isLoading = false;
    });
  }

  // Cambiar tipo de búsqueda
  onSearchTypeChange(event: any) {
    this.searchType = event.detail.value;
    this.searchTerm = '';
    this.personas = [...this.personasOriginales];
  }

  // Limpiar búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.personas = [...this.personasOriginales];
  }

  // Métodos para ver detalles
  verDetalles(persona: any) {
    this.selectedPersona = persona;
    this.showDetails = true;
    this.showList = false;
    console.log('Ver detalles de:', persona);
  }

  // Método para editar una persona
  editarPersona(persona: any) {
    this.selectedPersona = persona;
    this.isEditing = true;
    
    let fechaNacimiento = '';
    if (persona.fechaNacimiento) {
      const fecha = new Date(persona.fechaNacimiento);
      fechaNacimiento = fecha.toISOString().split('T')[0];
    }
    
    this.formData = {
      nombre: persona.nombre || '',
      apellido: persona.apellido || '',
      email: persona.email || '',
      fechaNacimiento: fechaNacimiento,
      telefono: persona.telefono || '',
      direccion: persona.direccion || ''
    };
    this.isFormModalOpen = true;
    console.log('Editar persona:', persona);
  }

  // Método para eliminar una persona mediante id
  eliminarPersona(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta persona?')) {
      this.isLoading = true;
      
      fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          this.showToast('Persona eliminada correctamente', 'success');
          this.getPersonas();
          return; 
        } else {
          return response.json().then(errorData => {
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
          }).catch(() => {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          });
        }
      })
      .catch(error => {
        console.error('Error al eliminar persona:', error);
        this.showToast(error.message || 'Error al eliminar persona');
        this.isLoading = false;
      });
    }
  }

  // Método para agregar una nueva persona
  agregarPersona() {
    this.selectedPersona = null;
    this.isEditing = false;
    this.formData = {
      nombre: '',
      apellido: '',
      email: '',
      fechaNacimiento: '',
      telefono: '',
      direccion: ''
    };
    this.isFormModalOpen = true;
    console.log('Agregar nueva persona');
  }

  //Regresar a la lista de personas
  volver() {
    this.showForm = false;
    this.showDetails = false;
    this.showList = true;
    this.selectedPersona = null;
  }

  // Método para guardar una persona (crear o editar)
  guardarPersona() {
    if (!this.formData.nombre || !this.formData.apellido || !this.formData.email || !this.formData.fechaNacimiento) {
      this.errorMessage = 'Los campos nombre, apellido, email y fecha de nacimiento son obligatorios';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'El formato del correo electrónico no es válido';
      return;
    }

    // Validar que la fecha no sea superior al día de hoy
    const fechaSeleccionada = new Date(this.formData.fechaNacimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    if (fechaSeleccionada > hoy) {
      this.errorMessage = 'La fecha de nacimiento no puede ser superior al día de hoy';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const url = this.isEditing ? `${BASE_URL}/${this.selectedPersona.id}` : BASE_URL;
    const method = this.isEditing ? 'PUT' : 'POST';

    const personaData = {
      ...(this.isEditing && { id: this.selectedPersona.id }),
      nombre: this.formData.nombre,
      apellido: this.formData.apellido,
      email: this.formData.email,
      fechaNacimiento: this.formData.fechaNacimiento + 'T00:00:00.000Z',
      telefono: this.formData.telefono || null,
      direccion: this.formData.direccion || null
    };

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personaData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw errorData;
        }).catch(() => {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        });
      }

      if (method === 'PUT') {
        return null;
      }
      return response.json();
    })
    .then(data => {
      console.log('Persona guardada:', data);
      this.isLoading = false;
      this.isFormModalOpen = false;
      this.limpiarFormulario();
      this.getPersonas();
      
      const mensaje = this.isEditing ? 'Persona actualizada correctamente' : 'Persona creada correctamente';
      this.showToast(mensaje, 'success');
    })
    .catch(error => {
      console.error('Error completo al guardar persona:', error);
      this.isLoading = false;

      if (error && error.errors && typeof error.errors === 'object') {
        let mensajesError: string[] = [];

        Object.keys(error.errors).forEach(campo => {
          const erroresCampo = error.errors[campo];
          if (Array.isArray(erroresCampo)) {
            erroresCampo.forEach(mensajeError => {
              mensajesError.push(`${campo}: ${mensajeError}`);
            });
          }
        });

        this.errorMessage = mensajesError.length > 0 
          ? 'Errores de validación:\n• ' + mensajesError.join('\n• ')
          : 'Error de validación desconocido';
          
      } else if (error && error.title) {
        this.errorMessage = `Error: ${error.title}`;
      } else if (error && error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error desconocido al guardar la persona';
      }
      
      this.showToast(this.errorMessage);
    });
  }

  //Metodos necesarios para una mejor experiencia de usuario
  cerrarModalFormulario() {
    this.isFormModalOpen = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.formData = {
      nombre: '',
      apellido: '',
      email: '',
      fechaNacimiento: '',
      telefono: '',
      direccion: ''
    };
    this.errorMessage = '';
  }

  mostrarTodas() {
    this.searchTerm = '';
    this.getPersonas();
  }
}