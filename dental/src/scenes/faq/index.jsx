import { Box, useTheme, useMediaQuery } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      <Header title="Часто задаваемые вопросы" subtitle="Инструкции по использованию системы" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как работать с зубной формулой?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Раздел "Зубная формула" находится на главной странице. Кликните на любую часть зуба, чтобы изменить её состояние.
            Можно отметить состояние коронки, корней, каналов и сегментов каждого зуба. Для экспорта формулы в PDF:
            введите заголовок в поле "Заголовок для PDF" и нажмите кнопку "Экспорт в PDF". Формула сохранится в виде
            двухстраничного документа (верхняя и нижняя челюсть). Внимание: изменения на главной странице не сохраняются
            автоматически - это демонстрационная версия.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как создать запись на приём в календаре?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Откройте раздел "Календарь" в боковом меню. Нажмите кнопку "Новая запись" в правом верхнем углу.
            В открывшейся форме выберите клиента из списка или добавьте нового клиента, нажав на значок "+".
            Затем выберите врача, укажите дату и время приёма, длительность в минутах (по умолчанию 30 минут).
            Можно добавить комментарий и выбрать статус (запланирована, подтверждена, отменена, завершена).
            После заполнения всех полей нажмите "Создать запись". Запись появится в календаре и в списке предстоящих приёмов.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как завершить приём и заполнить медицинскую карту?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            В календаре кликните на запись, чтобы открыть детали. Нажмите кнопку "Завершить".
            В открывшейся форме заполните анамнез, выберите жалобу из списка или введите свою.
            Выберите диагноз и лечение из справочников статусов. Добавьте комментарии при необходимости.
            Для редактирования зубной формулы нажмите "Редактировать формулу" - откроется интерактивная зубная карта пациента.
            После заполнения всех данных нажмите "Завершить запись". Статус записи изменится на "Завершена",
            а все данные сохранятся в карте пациента.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как редактировать или удалить запись в календаре?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Кликните на запись в календаре, чтобы открыть детали приёма. Для редактирования нажмите кнопку "Редактировать" -
            откроется форма, где можно изменить клиента, врача, дату, время, длительность и комментарий.
            Для отмены приёма нажмите "Отменить" - статус изменится на "Отменена".
            Для полного удаления записи нажмите "Удалить" и подтвердите действие.
            Внимание: удаление записи безвозвратно! Кнопки редактирования и отмены доступны только для
            записей со статусом "Запланирована" или "Подтверждена".
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как управлять списком клиентов?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Перейдите в раздел "Клиенты" в боковом меню. Здесь отображается таблица всех клиентов с информацией:
            ФИО, телефон, адрес, пол, дата рождения. Для редактирования данных клиента нажмите значок карандаша в
            столбце "Действия". Можно изменить ФИО, телефон, адрес, пол и дату рождения. Для удаления клиента
            нажмите значок корзины - появится окно подтверждения. Кликнув на строку клиента, вы перейдёте к его
            детальной карточке с полной информацией и историей посещений.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как добавить нового клиента?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Новых клиентов можно добавить двумя способами: 1) В разделе "Календарь" при создании записи нажмите
            значок "+" рядом с полем выбора клиента. 2) В разделе "Регистрация пользователей" в боковом меню.
            Заполните обязательные поля: Полное имя, Номер телефона, Адрес, Дата рождения (формат ДД.ММ.ГГГГ,
            например 24.06.2003), Пол (мужской/женский). После заполнения нажмите "Создать клиента".
            Новый клиент автоматически появится в списке и станет доступен для записи на приём.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как управлять командой (персоналом)?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Раздел "Управление командой" в боковом меню показывает всех сотрудников клиники: администраторов, врачей
            и регистраторов. В таблице отображается ФИО, email, телефон и роль каждого сотрудника. Для редактирования
            данных сотрудника нажмите значок карандаша - можно изменить имя, email, телефон и роль.
            Доступные роли: Администратор, Врач, Регистратор. Для удаления сотрудника нажмите значок корзины
            и подтвердите действие. Добавление новых сотрудников выполняется через раздел "Регистрация пользователей".
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как работать с жалобами пациентов?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Раздел "Жалобы" содержит справочник типовых жалоб пациентов. Для добавления новой жалобы нажмите
            "Добавить жалобу" в правом верхнем углу. Заполните название, категорию и описание жалобы.
            Для редактирования существующей жалобы нажмите значок карандаша в таблице. Для удаления - значок корзины.
            Жалобы используются при завершении приёма: можно выбрать из справочника или ввести индивидуальную жалобу.
            Это помогает стандартизировать медицинскую документацию и упростить заполнение карт пациентов.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Как настроить статусы диагнозов и лечения?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            В разделе "Статусы" находятся справочники статусов для диагнозов и лечения. Используйте вкладки
            "Все", "Диагноз", "Лечение" для фильтрации. Для добавления нового статуса нажмите "Добавить статус".
            Заполните: название, тип (диагноз/лечение), код, цвет (для визуального обозначения), описание,
            активность (включен/выключен). Для редактирования нажмите значок карандаша, для удаления - корзину.
            Эти статусы используются при завершении приёмов и в зубной формуле для обозначения состояния зубов,
            диагнозов и проведённого лечения.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;