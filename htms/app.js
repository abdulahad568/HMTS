// ==========================================
// DATA MANAGEMENT (In-Memory Storage)
// ==========================================

// Initialize data arrays with sample data
let patients = [
  {
    id: 1,
    name: 'abdul',
    age: 34,
    gender: 'Male',
    contact: '1234567890',
    history: 'Diabetes'
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 28,
    gender: 'Female',
    contact: '2345678901',
    history: 'Asthma'
  }
];

let doctors = [
  {
    id: 1,
    name: 'Dr. Alice Brown',
    specialty: 'Cardiology',
    contact: '3456789012'
  },
  {
    id: 2,
    name: 'Dr. Robert Green',
    specialty: 'Orthopedics',
    contact: '4567890123'
  }
];

let appointments = [
  {
    id: 1,
    patient: 'John Doe',
    doctor: 'Dr. Alice Brown',
    date: '2025-10-30',
    time: '10:00',
    reason: 'Heart Checkup'
  },
  {
    id: 2,
    patient: 'Jane Smith',
    doctor: 'Dr. Robert Green',
    date: '2025-10-31',
    time: '11:30',
    reason: 'Knee Pain'
  }
];

// ID counters for new records
let nextPatientId = 3;
let nextDoctorId = 3;
let nextAppointmentId = 3;

// Current editing record ID
let editingPatientId = null;
let editingDoctorId = null;
let editingAppointmentId = null;

// ==========================================
// NAVIGATION
// ==========================================

function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const viewName = button.getAttribute('data-view');
      switchView(viewName);
      
      // Update active state
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Show selected view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  // Refresh data based on view
  switch(viewName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'patients':
      renderPatientsTable();
      break;
    case 'doctors':
      renderDoctorsTable();
      break;
    case 'appointments':
      renderAppointmentsTable();
      break;
  }
}

// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {
  // Update statistics
  document.getElementById('total-patients').textContent = patients.length;
  document.getElementById('total-doctors').textContent = doctors.length;
  document.getElementById('total-appointments').textContent = appointments.length;
  
  // Calculate upcoming appointments (today and future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today;
  }).sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA - dateB;
  });
  
  document.getElementById('upcoming-count').textContent = upcomingAppointments.length;
  
  // Render upcoming appointments list
  const listContainer = document.getElementById('upcoming-appointments-list');
  
  if (upcomingAppointments.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No upcoming appointments</div>';
    return;
  }
  
  listContainer.innerHTML = upcomingAppointments.slice(0, 5).map(apt => `
    <div class="appointment-item">
      <div class="appointment-header">
        <div class="appointment-title">${apt.patient} → ${apt.doctor}</div>
        <div class="appointment-time">${formatDate(apt.date)} at ${apt.time}</div>
      </div>
      <div class="appointment-details">${apt.reason}</div>
    </div>
  `).join('');
}

// ==========================================
// PATIENTS MANAGEMENT
// ==========================================

function renderPatientsTable() {
  const tbody = document.getElementById('patients-table-body');
  
  if (patients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No patients found</td></tr>';
    return;
  }
  
  tbody.innerHTML = patients.map(patient => `
    <tr>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.contact}</td>
      <td>${patient.history || 'N/A'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn--small btn--secondary" onclick="editPatient(${patient.id})">
            Edit
          </button>
          <button class="btn btn--small btn--danger" onclick="deletePatient(${patient.id})">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openPatientModal(patientId = null) {
  const modal = document.getElementById('patient-modal');
  const form = document.getElementById('patient-form');
  const title = document.getElementById('patient-modal-title');
  
  form.reset();
  editingPatientId = patientId;
  
  if (patientId) {
    // Edit mode
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      title.textContent = 'Edit Patient';
      document.getElementById('patient-name').value = patient.name;
      document.getElementById('patient-age').value = patient.age;
      document.getElementById('patient-gender').value = patient.gender;
      document.getElementById('patient-contact').value = patient.contact;
      document.getElementById('patient-history').value = patient.history || '';
    }
  } else {
    // Add mode
    title.textContent = 'Add Patient';
  }
  
  modal.classList.add('active');
}

function closePatientModal() {
  document.getElementById('patient-modal').classList.remove('active');
  editingPatientId = null;
}

function savePatient(event) {
  event.preventDefault();
  
  const patientData = {
    name: document.getElementById('patient-name').value,
    age: parseInt(document.getElementById('patient-age').value),
    gender: document.getElementById('patient-gender').value,
    contact: document.getElementById('patient-contact').value,
    history: document.getElementById('patient-history').value
  };
  
  if (editingPatientId) {
    // Update existing patient
    const index = patients.findIndex(p => p.id === editingPatientId);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...patientData };
    }
  } else {
    // Add new patient
    patients.push({
      id: nextPatientId++,
      ...patientData
    });
  }
  
  closePatientModal();
  renderPatientsTable();
  renderDashboard();
}

function editPatient(id) {
  openPatientModal(id);
}

function deletePatient(id) {
  if (confirm('Are you sure you want to delete this patient?')) {
    patients = patients.filter(p => p.id !== id);
    renderPatientsTable();
    renderDashboard();
  }
}

// ==========================================
// DOCTORS MANAGEMENT
// ==========================================

function renderDoctorsTable() {
  const tbody = document.getElementById('doctors-table-body');
  
  if (doctors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No doctors found</td></tr>';
    return;
  }
  
  tbody.innerHTML = doctors.map(doctor => `
    <tr>
      <td>${doctor.name}</td>
      <td>${doctor.specialty}</td>
      <td>${doctor.contact}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn--small btn--secondary" onclick="editDoctor(${doctor.id})">
            Edit
          </button>
          <button class="btn btn--small btn--danger" onclick="deleteDoctor(${doctor.id})">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openDoctorModal(doctorId = null) {
  const modal = document.getElementById('doctor-modal');
  const form = document.getElementById('doctor-form');
  const title = document.getElementById('doctor-modal-title');
  
  form.reset();
  editingDoctorId = doctorId;
  
  if (doctorId) {
    // Edit mode
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      title.textContent = 'Edit Doctor';
      document.getElementById('doctor-name').value = doctor.name;
      document.getElementById('doctor-specialty').value = doctor.specialty;
      document.getElementById('doctor-contact').value = doctor.contact;
    }
  } else {
    // Add mode
    title.textContent = 'Add Doctor';
  }
  
  modal.classList.add('active');
}

function closeDoctorModal() {
  document.getElementById('doctor-modal').classList.remove('active');
  editingDoctorId = null;
}

function saveDoctor(event) {
  event.preventDefault();
  
  const doctorData = {
    name: document.getElementById('doctor-name').value,
    specialty: document.getElementById('doctor-specialty').value,
    contact: document.getElementById('doctor-contact').value
  };
  
  if (editingDoctorId) {
    // Update existing doctor
    const index = doctors.findIndex(d => d.id === editingDoctorId);
    if (index !== -1) {
      doctors[index] = { ...doctors[index], ...doctorData };
    }
  } else {
    // Add new doctor
    doctors.push({
      id: nextDoctorId++,
      ...doctorData
    });
  }
  
  closeDoctorModal();
  renderDoctorsTable();
  renderDashboard();
}

function editDoctor(id) {
  openDoctorModal(id);
}

function deleteDoctor(id) {
  if (confirm('Are you sure you want to delete this doctor?')) {
    doctors = doctors.filter(d => d.id !== id);
    renderDoctorsTable();
    renderDashboard();
  }
}

// ==========================================
// APPOINTMENTS MANAGEMENT
// ==========================================

function renderAppointmentsTable() {
  const tbody = document.getElementById('appointments-table-body');
  
  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No appointments found</td></tr>';
    return;
  }
  
  tbody.innerHTML = appointments.map(apt => `
    <tr>
      <td>${apt.patient}</td>
      <td>${apt.doctor}</td>
      <td>${formatDate(apt.date)}</td>
      <td>${apt.time}</td>
      <td>${apt.reason}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn--small btn--secondary" onclick="editAppointment(${apt.id})">
            Edit
          </button>
          <button class="btn btn--small btn--danger" onclick="deleteAppointment(${apt.id})">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAppointmentModal(appointmentId = null) {
  const modal = document.getElementById('appointment-modal');
  const form = document.getElementById('appointment-form');
  const title = document.getElementById('appointment-modal-title');
  
  form.reset();
  editingAppointmentId = appointmentId;
  
  // Populate patient dropdown
  const patientSelect = document.getElementById('appointment-patient');
  patientSelect.innerHTML = '<option value="">Select Patient</option>' + 
    patients.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
  
  // Populate doctor dropdown
  const doctorSelect = document.getElementById('appointment-doctor');
  doctorSelect.innerHTML = '<option value="">Select Doctor</option>' + 
    doctors.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  
  if (appointmentId) {
    // Edit mode
    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
      title.textContent = 'Edit Appointment';
      document.getElementById('appointment-patient').value = apt.patient;
      document.getElementById('appointment-doctor').value = apt.doctor;
      document.getElementById('appointment-date').value = apt.date;
      document.getElementById('appointment-time').value = apt.time;
      document.getElementById('appointment-reason').value = apt.reason;
    }
  } else {
    // Add mode
    title.textContent = 'Schedule Appointment';
  }
  
  modal.classList.add('active');
}

function closeAppointmentModal() {
  document.getElementById('appointment-modal').classList.remove('active');
  editingAppointmentId = null;
}

function saveAppointment(event) {
  event.preventDefault();
  
  const appointmentData = {
    patient: document.getElementById('appointment-patient').value,
    doctor: document.getElementById('appointment-doctor').value,
    date: document.getElementById('appointment-date').value,
    time: document.getElementById('appointment-time').value,
    reason: document.getElementById('appointment-reason').value
  };
  
  if (editingAppointmentId) {
    // Update existing appointment
    const index = appointments.findIndex(a => a.id === editingAppointmentId);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointmentData };
    }
  } else {
    // Add new appointment
    appointments.push({
      id: nextAppointmentId++,
      ...appointmentData
    });
  }
  
  closeAppointmentModal();
  renderAppointmentsTable();
  renderDashboard();
}

function editAppointment(id) {
  openAppointmentModal(id);
}

function deleteAppointment(id) {
  if (confirm('Are you sure you want to delete this appointment?')) {
    appointments = appointments.filter(a => a.id !== id);
    renderAppointmentsTable();
    renderDashboard();
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
});

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
  initNavigation();
  renderDashboard();
  renderPatientsTable();
  renderDoctorsTable();
  renderAppointmentsTable();
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}