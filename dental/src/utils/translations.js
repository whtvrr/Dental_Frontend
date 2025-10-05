// Translation utility for Russian language

export const translations = {
  // Common
  edit: 'Редактировать',
  delete: 'Удалить',
  cancel: 'Отмена',
  save: 'Сохранить',
  close: 'Закрыть',
  yes: 'Да',
  no: 'Нет',
  search: 'Поиск',
  actions: 'Действия',
  loading: 'Загрузка',
  error: 'Ошибка',
  success: 'Успешно',

  // User roles
  admin: 'Администратор',
  doctor: 'Врач',
  receptionist: 'Ресепшионист',
  client: 'Клиент',

  // Gender
  male: 'Мужской',
  female: 'Женский',

  // Appointment statuses
  scheduled: 'Запланирован',
  confirmed: 'Подтвержден',
  canceled: 'Отменен',
  completed: 'Завершен',
  in_progress: 'В процессе',

  // Pages
  contacts: 'Контакты',
  team: 'Команда',
  calendar: 'Календарь',
  dashboard: 'Панель управления',

  // Contacts page
  contactsTitle: 'КОНТАКТЫ',
  contactsSubtitle: 'Список клиентов для дальнейших действий',
  fullName: 'Полное имя',
  phoneNumber: 'Номер телефона',
  address: 'Адрес',
  gender: 'Пол',
  birthDate: 'Дата рождения',

  // Team page
  teamTitle: 'КОМАНДА',
  teamSubtitle: 'Управление членами команды',
  email: 'Email',
  accessLevel: 'Уровень доступа',
  role: 'Роль',

  // Calendar page
  calendarTitle: 'КАЛЕНДАРЬ',
  calendarSubtitle: 'Интерактивная страница полного календаря',
  newAppointment: 'Новый визит',
  appointmentDetails: 'Детали визита',
  upcomingAppointments: 'Предстоящие визиты',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  list: 'Список',
  today: 'Сегодня',

  // Client detail page
  clientDetails: 'ДЕТАЛИ КЛИЕНТА',
  clientInfo: 'Информация о клиенте',
  backToClients: 'Назад к клиентам',
  editClient: 'Редактировать клиента',
  overview: 'Обзор',
  appointments: 'Визиты',
  dentalChart: 'Зубная формула',
  appointmentsHistory: 'История визитов',
  noAppointments: 'Визиты не найдены',
  noAppointmentsDesc: 'У этого клиента нет запланированных визитов',

  // Appointment fields
  client: 'Клиент',
  doctor: 'Врач',
  date: 'Дата',
  time: 'Время',
  dateTime: 'Дата и время',
  duration: 'Продолжительность',
  durationMinutes: 'Продолжительность (минуты)',
  status: 'Статус',
  comment: 'Комментарий',
  comments: 'Комментарии',
  anamnesis: 'Анамнез',
  complaint: 'Жалоба',
  diagnosis: 'Диагноз',
  treatment: 'Лечение',

  // Dialogs
  editAppointment: 'Редактировать визит',
  deleteAppointment: 'Удалить визит',
  deleteAppointmentConfirm: 'Вы уверены, что хотите удалить этот визит? Это действие нельзя отменить.',
  editClientTitle: 'Редактировать клиента',
  deleteClientTitle: 'Удалить клиента',
  deleteClientConfirm: 'Вы уверены, что хотите удалить клиента',
  editStaffTitle: 'Редактировать сотрудника',
  deleteStaffTitle: 'Удалить сотрудника',
  deleteStaffConfirm: 'Вы уверены, что хотите удалить сотрудника',
  thisActionCannotBeUndone: 'Это действие нельзя отменить.',

  // Buttons
  saveChanges: 'Сохранить изменения',
  createAppointment: 'Создать визит',
  completeAppointment: 'Завершить визит',
  cancelAppointment: 'Отменить визит',
  addNewClient: 'Добавить нового клиента',

  // Messages
  notSpecified: 'Не указано',
  noDataFound: 'Данные не найдены',
  age: 'Возраст',
  minutes: 'минут',
  chooseClient: 'Выберите клиента',
  chooseDoctor: 'Выберите врача',
  loadingClientsAndDoctors: 'Загрузка клиентов и врачей...',
  appointmentInformation: 'Информация о визите',
  noAppointmentDetails: 'Нет деталей визита.',

  // Select placeholders
  selectClient: 'Выберите клиента',
  selectDoctor: 'Выберите врача',

  // Dental chart
  noDentalChart: 'Нет данных зубной формулы',
  noDentalChartDesc: 'Зубная формула для этого клиента не найдена',

  // Loading states
  loadingAppointments: 'Загрузка визитов...',
  loadingClientDetails: 'Загрузка деталей клиента...',
  loadingDentalChart: 'Загрузка зубной формулы...',

  // Error messages
  failedToUpdate: 'Не удалось обновить',
  failedToDelete: 'Не удалось удалить',
  failedToCreate: 'Не удалось создать',

  // Actions in progress
  deleting: 'Удаление...',
  canceling: 'Отмена...',
  saving: 'Сохранение...',
};

// Helper function to translate status
export const translateStatus = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'scheduled':
      return 'Запланирован';
    case 'confirmed':
      return 'Подтвержден';
    case 'canceled':
    case 'cancelled':
      return 'Отменен';
    case 'completed':
      return 'Завершен';
    case 'in_progress':
      return 'В процессе';
    case 'pending':
      return 'Ожидание';
    default:
      return status || 'Неизвестно';
  }
};

// Helper function to translate role
export const translateRole = (role) => {
  const roleLower = role?.toLowerCase();
  switch (roleLower) {
    case 'admin':
      return 'Администратор';
    case 'doctor':
      return 'Врач';
    case 'receptionist':
      return 'Ресепшионист';
    case 'client':
      return 'Клиент';
    default:
      return role || 'Неизвестно';
  }
};

// Helper function to translate gender
export const translateGender = (gender) => {
  const genderLower = gender?.toLowerCase();
  switch (genderLower) {
    case 'male':
      return 'Мужской';
    case 'female':
      return 'Женский';
    default:
      return gender || 'Не указано';
  }
};

export default translations;
