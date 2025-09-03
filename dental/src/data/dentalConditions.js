export const TOOTH_NUMBERS = {
  upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
};

export const DENTAL_CONDITIONS = {
  normal: { label: 'Норма', color: '#ffffff', border: '#e0e0e0' },
  periodontosis: { label: 'Парадонтоз', color: '#ff9800' },
  flux: { label: 'Флюс', color: '#2196f3' },
  gingivitis: { label: 'Воспаление десны', color: '#e91e63' },
  periodontitis: { label: 'Пародонтит', color: '#424242' },
  implant: { label: 'Имплант', color: '#9c9cff' },
  implantCeramic: { label: 'Имплант с керамической коронкой', color: '#b39ddb' },
  implantMetal: { label: 'Имплант с металлической коронкой', color: '#90a4ae' },
  canal: { label: 'Канал', color: '#d0d0ff' },
  canalFilled: { label: 'Канал запломбированный', color: '#9fa8da' },
  cariesDeep: { label: 'Кариес глубокий', color: '#000000' },
  cariesMedium: { label: 'Кариес средний', color: '#424242' },
  cariesSurface: { label: 'Кариес поверхностный', color: '#757575' },
  crown: { label: 'Коронка', color: '#e0e0e0' },
  crownCeramic: { label: 'Коронка керамическая', color: '#f5f5f5' },
  crownMetal: { label: 'Коронка металлическая', color: '#bdbdbd' },
  bridge: { label: 'Мосты', color: '#9c9cff' },
  pulpitis: { label: 'Пульпит', color: '#ffb3ba' },
  pulpitisAcute: { label: 'Пульпит острый', color: '#ff8a95' },
  fracture: { label: 'Скол', color: '#ffd700' },
  fracturePartial: { label: 'Частичный скол', color: '#fff176' },
  missing: { label: 'Удален', color: 'transparent' },
  absent: { label: 'Отсутствует', color: '#87ceeb' },
  filling: { label: 'Пломба', color: '#90caf9' },
  fillingComposite: { label: 'Композитная пломба', color: '#81c784' },
  fillingAmalgam: { label: 'Амальгамная пломба', color: '#a5a5a5' },
  // Channel specific conditions
  channelFilled: { label: 'Канал запломбирован', color: '#4caf50' },
  channelPartial: { label: 'Канал частично обработан', color: '#ff9800' },
  channelEmpty: { label: 'Канал пустой', color: '#f44336' },
  channelNormal: { label: 'Канал в норме', color: '#2196f3' },
  // Jaw condition
  jaw: { label: 'Челюстная кость', color: '#fce4ec' }
};