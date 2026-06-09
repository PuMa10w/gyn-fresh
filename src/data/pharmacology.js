import { enrichMedications } from '../utils/enrichClinicalTools.js';
import { premiumMedicationCatalog } from './premiumMedicationCatalog.js';

const baseMedications = [
  {
    id: "progesterone",
    name: "Прогестерон",
    nameEn: "Progesterone",
    category: "Гормональная терапия",
    forms: ["Капсулы", "Гель", "Инъекции"],
    dosage: {
      capsules: "200-400 мг/день",
      gel: "1-2 аппликатора/день",
      injection: "100-200 мг/день"
    },
    indications: ["Эндометриоз", "СПКЯ", "Угроза выкидыша", "Лютеиновая недостаточность"],
    contraindications: ["Тромбоз", "Опухоли молочной железы", "Тяжелые заболевания печени", "Вагинальные кровотечения"],
    sideEffects: ["Тошнота", "Головная боль", "Перепады настроения", "Усталость", "Набор веса"],
    interactions: [
      { drug: "Эстрогены", effect: "Усиление эффекта", level: "medium" },
      { drug: "Барбитураты", effect: "Снижение эффекта", level: "medium" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Угроза выкидыша", "Лютеиновая недостаточность", "Поддержка лютеиновой фазы при ЭКО"],
      notFirstLineWhen: ["Тромбоз в анамнезе", "Тяжелые заболевания печени"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Безопасность подтверждена при угрозе выкидыша", "Не имеет андрогенных свойств"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в грудное молоко в минимальных количествах"]
    },
    monitoring: {
      beforeStart: ["Печеночные тесты", "УЗИ органов малого таза"],
      duringTreatment: ["Уровень прогестерона", "УЗИ для оценки эндометрия"],
      stopOrReviewIf: ["Тромбоз", "Тяжелая головная боль", "Нарушения зрения"]
    },
    clinicalUseCases: [
      {
        scenario: "Угроза выкидыша до 12 недель",
        whyChosen: "Прогестерон — основной гормон для сохранения беременности, поддерживает эндометрий",
        importantNotes: ["До 12 недель плацента не функционирует", "Эффективен при подтвержденной лютеиновой недостаточности"]
      },
      {
        scenario: "Поддержка лютеиновой фазы при ЭКО",
        whyChosen: "Обеспечивает имплантацию эмбриона",
        importantNotes: ["Начинать после пункции/переноса", "Продолжать до 10-12 недель беременности"]
      }
    ],
    majorPracticePoints: ["Вводить вагинально для лучшей абсорбции", "Принимать вечером для минимизации седации"],
    comparativeRole: {
      preferredOver: "Синтетические прогестины — при планировании беременности",
      lessUsefulThan: "Дидрогестерон — при выраженных перепадах настроения",
      chooseWhen: ["Необходима естественная форма гормона", "Планирование беременности"]
    },
    guidelineBasis: [
      { organization: "ACOG", title: "Progesterone in pregnancy guidance", documentType: "Practice Bulletin", scope: "Угроза выкидыша, поддержка лютеиновой фазы", status: "latest available" }
    ]
  },
  {
    id: "clomiphene",
    name: "Кломифен",
    nameEn: "Clomiphene citrate",
    category: "Стимуляция овуляции",
    forms: ["Таблетки"],
    dosage: {
      standard: "50-150 мг/день, 5 дней"
    },
    indications: ["Ановуляция", "СПКЯ", "Эндокринное бесплодие"],
    contraindications: ["Беременность", "Кисты яичников", "Опухоли гипофиза", "Тромбоэмболия"],
    sideEffects: ["Приливы", "Тошнота", "Головная боль", "Нарушения зрения", "Киста яичника"],
    interactions: [
      { drug: "Тамоксифен", effect: "Антагонизм", level: "low" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["СПКЯ", "Ановуляторное бесплодие"],
      notFirstLineWhen: ["Ожирение с ИМТ > 30", "Кисты яичников"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Противопоказан",
      pregnancyNotes: ["Не использовать при беременности", "Тератогенен при случайном приеме"],
      lactationStatus: "Противопоказан",
      lactationNotes: ["Проникает в грудное молоко"]
    },
    monitoring: {
      beforeStart: ["ФСГ, ЛГ, пролактин", "УЗИ органов малого таза", "Оценка овариального резерва"],
      duringTreatment: ["УЗИ для мониторинга фолликулов", "Уровень эстрогенов"],
      stopOrReviewIf: ["Киста яичника > 4 см", "3-6 неудачных циклов", "Нарушения зрения"]
    },
    clinicalUseCases: [
      {
        scenario: "СПКЯ с ановуляцией",
        whyChosen: "Стимулирует овуляцию через блокаду эстрогенных рецепторов",
        importantNotes: ["50 мг — стартовая доза", "Максимум 6 циклов из-за риска рака яичника"]
      }
    ],
    majorPracticePoints: ["Начинать с 50 мг со 2-5 дня цикла", "УЗИ-мониторинг обязателен", "Не более 6 курсов"],
    guidelineBasis: [
      { organization: "ASRM", title: "Clomiphene for ovulation induction", documentType: "Practice Committee Opinion", scope: "СПКЯ, ановуляция", status: "latest available" }
    ]
  },
  {
    id: "letrozole",
    name: "Летрозол",
    nameEn: "Letrozole",
    category: "Ингибиторы ароматазы",
    forms: ["Таблетки"],
    dosage: {
      standard: "2.5-5 мг/день"
    },
    indications: ["Бесплодие", "Эндометриоз", "ак молочной железы"],
    contraindications: ["Беременность", "Печеночная недостаточность"],
    sideEffects: ["Приливы", "Артралгия", "Усталость", "Остеопороз"],
    interactions: [
      { drug: "Эстрогены", effect: "Снижение эффекта", level: "medium" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["СПКЯ", "Бесплодие при ожирении"],
      notFirstLineWhen: ["Беременность", "Детородный возраст без контрацепции"]
    },
    monitoring: {
      beforeStart: ["Функциональные пробы печени", "УЗИ органов малого таза"],
      duringTreatment: ["УЗИ для мониторинга овуляции"],
      stopOrReviewIf: ["Беременность", "Тяжелая гепатотоксичность"]
    },
    clinicalUseCases: [
      {
        scenario: "СПКЯ с ожирением (ИМТ > 30)",
        whyChosen: "Лучше кломифена при ожирении, не имеет эстроген-блокирующего эффекта",
        importantNotes: ["2.5-5 мг со 2-5 дня цикла", "Мониторинг овуляции обязателен"]
      }
    ],
    majorPracticePoints: ["Лучше переносится при ожирении", "Короткий период полувыведения", "Стимулирует овуляцию через повышение ФСГ"],
    comparativeRole: {
      preferredOver: "Кломифен — при ожирении и резистентности к кломифену",
      lessUsefulThan: "Кломифен — при нормальном ИМТ",
      chooseWhen: ["СПКЯ + ожирение", "езистентность к кломифену"]
    },
    guidelineBasis: [
      { organization: "ASRM", title: "Letrozole for ovulation induction", documentType: "Practice Committee Opinion", scope: "СПКЯ, бесплодие", status: "latest available" }
    ]
  },
  {
    id: "drospirenone",
    name: "Дроспиренон",
    nameEn: "Drospirenone",
    category: "Гормональная контрацепция",
    forms: ["Таблетки"],
    dosage: {
      standard: "3 мг/день"
    },
    indications: ["Контрацепция", "Эндометриоз", "ПМС"],
    contraindications: ["Тромбоз", "Почечная недостаточность", "Опухоли печени"],
    sideEffects: ["Тошнота", "Головная боль", "Перепады настроения", "Снижение либидо"],
    interactions: [
      { drug: "Антибиотики", effect: "Снижение эффективности", level: "medium" },
      { drug: "Противосудорожные", effect: "Снижение эффективности", level: "high" }
    ]
  },
  {
    id: "metformin",
    name: "Метформин",
    nameEn: "Metformin",
    category: "Сахароснижающие",
    forms: ["Таблетки"],
    dosage: {
      standard: "500-2000 мг/день"
    },
    indications: ["СПКЯ", "Сахарный диабет 2 типа"],
    contraindications: ["Почечная недостаточность", "Печеночная недостаточность", "Беременность", "Алкоголизм"],
    sideEffects: ["Тошнота", "Диарея", "Металлический привкус", "Дефицит B12"],
    interactions: [
      { drug: "Алкоголь", effect: "иск лактатацидоза", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["СПКЯ с инсулинорезистентностью"],
      notFirstLineWhen: ["Почечная недостаточность", "Печеночная недостаточность"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Осторожно",
      pregnancyNotes: ["При СПКЯ может использоваться до беременности", "При беременности — инсулин"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко, но безопасен"]
    },
    monitoring: {
      beforeStart: ["Креатинин", "Печеночные ферменты", "HbA1c"],
      duringTreatment: ["HbA1c каждые 3 месяца", "Функция почек"],
      stopOrReviewIf: ["Лактатацидоз", "Снижение функции почек"]
    },
    clinicalUseCases: [
      {
        scenario: "СПКЯ с ожирением и инсулинорезистентностью",
        whyChosen: "Снижает инсулинорезистентность, улучшает овуляцию",
        importantNotes: ["500 мг x 2, титровать по переносимости", "Снижает риск диабета 2 типа"]
      }
    ],
    majorPracticePoints: ["Принимать с едой для снижения GI-побочек", "Титровать с 500 мг", "Улучшает чувствительность к инсулину"],
    comparativeRole: {
      preferredOver: "Кломифен — при ожирении (комбо)",
      lessUsefulThan: "Кломифен — при нормальном весе без инсулинорезистентности",
      chooseWhen: "СПКЯ + ожирение + инсулинорезистентность"
    }
  },
  {
    id: "tranexamic-acid",
    name: "Транексамовая кислота",
    nameEn: "Tranexamic acid",
    category: "Антифибринолитики",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      tablets: "1000-1500 мг 3-4 раза/день",
      injection: "500-1000 мг в/в"
    },
    indications: ["Обильные менструации", "Послеродовое кровотечение", "Травмы"],
    contraindications: ["Тромбоз", "Почечная недостаточность", "Судороги"],
    sideEffects: ["Тошнота", "Диарея", "Головная боль", "Тромбоз"],
    interactions: [
      { drug: "Эстрогены", effect: "иск тромбоза", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Обильные менструации", "Послеродовое кровотечение"],
      notFirstLineWhen: ["Тромбоз", "Почечная недостаточность"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Безопасен при беременности", "Используется при ППК"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко, безопасен"]
    },
    clinicalUseCases: [
      {
        scenario: "Обильные менструации",
        whyChosen: "Ингибитор фибринолизина, снижает кровопотерю",
        importantNotes: ["1000-1500 мг x 3-4 раза в день"]
      },
      {
        scenario: "Послеродовое кровотечение",
        whyChosen: "Снижает фибринолиз, эффективен при коагулопатии",
        importantNotes: ["1 г в/в в первые 3 часа после родов"]
      }
    ],
    majorPracticePoints: ["аннее применение важно", "Максимум 8 г/сутки"],
    guidelineBasis: [
      { organization: "WHO", title: "Tranexamic acid in postpartum hemorrhage", documentType: "Guideline", scope: "ППК", status: "latest available" }
    ]
  },
  {
    id: "azithromycin",
    name: "Азитромицин",
    nameEn: "Azithromycin",
    category: "Антибиотики",
    forms: ["Капсулы", "Суспензия"],
    dosage: {
      standard: "500 мг 1 раз/день, 3 дня"
    },
    indications: ["Хламидиоз", "Микоплазмоз", "Бактериальный вагиноз", "ВЗОМТ"],
    contraindications: ["Печеночная недостаточность", "Аритмии"],
    sideEffects: ["Тошнота", "Диарея", "Боли в животе", "Головная боль"],
    interactions: [],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Хламидиоз", "Микоплазмоз", "ВЗОМТ"],
      notFirstLineWhen: ["Печеночная недостаточность", "Аритмии"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Осторожно",
      pregnancyNotes: ["Категория B, используется при хламидиозе", "Предпочтительнее амоксициллина при хламидиозе"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко, безопасен"]
    },
    clinicalUseCases: [
      {
        scenario: "Хламидиоз (неосложненный)",
        whyChosen: "Однократный прием, высокая эффективность",
        importantNotes: ["1 г однократно или 500 мг x 3 дня", "Лечение партнера обязательно"]
      },
      {
        scenario: "ВЗОМТ",
        whyChosen: "Покрытие хламидии и анаэробов",
        importantNotes: ["В комбинации с цефтриаксоном", "500 мг x 3 дня"]
      }
    ],
    majorPracticePoints: ["Однократный прием при неосложненном хламидиозе", "Лечение партнеров обязательно", "Не использовать при гонорее"],
    guidelineBasis: [
      { organization: "CDC", title: "STI treatment guidelines", documentType: "Guideline", scope: "Хламидиоз, ВЗОМТ", status: "latest available" }
    ]
  },
  {
    id: "doxycycline",
    name: "Доксициклин",
    nameEn: "Doxycycline",
    category: "Антибиотики",
    forms: ["Капсулы"],
    dosage: {
      standard: "100 мг 2 раза/день"
    },
    indications: ["Хламидиоз", "Микоплазмоз", "Уреаплазмоз", "Акне"],
    contraindications: ["Беременность", "Дети до 8 лет", "Печеночная недостаточность"],
    sideEffects: ["Тошнота", "Фотосенсибилизация", "Эзофагит", "Кандидоз"],
    interactions: [],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Хламидиоз", "Микоплазмоз", "Уреаплазмоз"],
      notFirstLineWhen: ["Беременность", "Дети до 8 лет"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Противопоказан",
      pregnancyNotes: ["Проникает через плаценту, риск для плода", "Категория D"],
      lactationStatus: "Противопоказан",
      lactationNotes: ["Проникает в молоко, не использовать"]
    },
    clinicalUseCases: [
      {
        scenario: "Хламидиоз",
        whyChosen: "Высокая эффективность против Chlamydia trachomatis",
        importantNotes: ["100 мг x 2, 7-10 дней", "Лечение партнера обязательно"]
      },
      {
        scenario: "ВЗОМТ",
        whyChosen: "Покрытие хламидии + анаэробы",
        importantNotes: ["100 мг x 2, 14 дней в комбинации"]
      }
    ],
    majorPracticePoints: ["Принимать с едой", "Не ложиться 30 мин после приема", "Избегать солнца"],
    guidelineBasis: [
      { organization: "CDC", title: "STI treatment guidelines", documentType: "Guideline", scope: "Хламидиоз, ВЗОМТ", status: "latest available" }
    ]
  },
  {
    id: "cabergoline",
    name: "Каберголин",
    nameEn: "Cabergoline",
    category: "Дофаминомиметики",
    forms: ["Таблетки"],
    dosage: {
      standard: "0.5-1 мг 2 раза/неделю"
    },
    indications: ["Гиперпролактинемия", "Пролактинома"],
    contraindications: ["Тяжелая почечная недостатоность", "Пороки сердца"],
    sideEffects: ["Тошнота", "Головная боль", "Головокружение", "Ортостатическая гипотензия"],
    interactions: [
      { drug: "Антипсихотики", effect: "Снижение эффективности", level: "medium" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Гиперпролактинемия", "Пролактинома"],
      notFirstLineWhen: ["Тяжелая почечная недостаточность", "Пороки сердца"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Безопасен при гиперпролактинемии", "Можно использовать при планировании беременности"],
      lactationStatus: "Противопоказан",
      lactationNotes: ["Подавляет лактацию"]
    },
    monitoring: {
      beforeStart: ["Уровень пролактина", "МРТ гипофиза при пролактиноме"],
      duringTreatment: ["Пролактин каждые 4-6 недель", "Беременность"],
      stopOrReviewIf: ["Беременность", "Тяжелая гипотензия"]
    },
    clinicalUseCases: [
      {
        scenario: "Гиперпролактинемия с бесплодием",
        whyChosen: "Эффективно снижает пролактин, восстанавливает овуляцию",
        importantNotes: ["0.5 мг x 2 в неделю", "Нормализация пролактина через 2-4 недели"]
      }
    ],
    majorPracticePoints: ["Принимать с едой", "Избегать алкоголя", "Контролировать АД"]
  },
  {
    id: "magnesium-sulfate",
    name: "Магния сульфат",
    nameEn: "Magnesium sulfate",
    category: "Акушерские препараты",
    forms: ["Инъекции"],
    dosage: {
      loading: "4-6 г в/в болюсно",
      maintenance: "1-2 г/час в/в инфузия"
    },
    indications: ["Преэклампсия", "Эклампсия", "Угроза преждевременных родов"],
    contraindications: ["Почечная недостаточность", "Миастения", "АВ-блокада"],
    sideEffects: ["Приливы", "Тошнота", "Головная боль", "Слабость", "Снижение АД"],
    interactions: [
      { drug: "Блокаторы кальциевых каналов", effect: "Усиление гипотензии", level: "high" },
      { drug: "Аминогликозиды", effect: "Нейромышечная блокада", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Преэклампсия", "Эклампсия", "Профилактика судорог"],
      notFirstLineWhen: ["Почечная недостаточность", "Миастения"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Золотой стандарт профилактики эклампсии", "Не влияет на плод при правильном дозировании"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко, безопасен"]
    },
    monitoring: {
      beforeStart: ["Суточный диурез", "Креатинин", "ефлексы"],
      duringTreatment: ["ефлексы (снижение — признак передозировки)", "Частота дыхания", "Диурез"],
      stopOrReviewIf: ["Частота дыхания < 12/мин", "Отсутствие рефлексов", "Диурез < 30 мл/ч"]
    },
    clinicalUseCases: [
      {
        scenario: "Преэклампсия с тяжелыми признаками",
        whyChosen: "Профилактика судорог, нейропротекция",
        importantNotes: ["4 г болюсно, затем 1-2 г/час", "Контролировать рефлексы"]
      },
      {
        scenario: "Эклампсия — лечение судорог",
        whyChosen: "Снижает возбудимость нейронов, противосудорожный эффект",
        importantNotes: ["4-6 г болюсно", "Поддерживать 24 часа после родов"]
      }
    ],
    majorPracticePoints: ["Мониторить рефлексы каждые 4 часа", "При олигурии — снизить дозу", "Антидот — глюконат кальция"],
    routeAndSetting: {
      route: ["внутривенно"],
      setting: ["стационар", "реанимация"],
      prescriberLevel: ["акушер-гинеколог", "реаниматолог"]
    },
    guidelineBasis: [
      { organization: "ACOG", title: "Magnesium sulfate in preeclampsia", documentType: "Practice Bulletin", scope: "Преэклампсия, эклампсия", status: "latest available" }
    ]
  },
  {
    id: "nifedipine",
    name: "Нифедипин",
    nameEn: "Nifedipine",
    category: "Антигипертензивные",
    forms: ["Таблетки", "Капсулы"],
    dosage: {
      short: "10 мг приступообразно",
      prolonged: "20-60 мг 1-2 раза/день",
      tocolysis: "10 мг x 4 раза/день"
    },
    indications: ["Хроническая гипертензия", "Преэклампсия", "Токолиз"],
    contraindications: ["Гипотензия", "Тяжелый аортальный стеноз"],
    sideEffects: ["Головная боль", "Гипотензия", "Тахикардия", "Отёки"],
    interactions: [
      { drug: "Магния сульфат", effect: "Усиление гипотензии", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Хроническая гипертензия", "Преэклампсия", "Токолиз"],
      notFirstLineWhen: ["Гипотензия", "Тяжелый аортальный стеноз"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Безопасен при беременности", "Не оказывает тератогенного эффекта"],
      lactationStatus: "азрешен",
      lactationNotes: ["Минимально проникает в молоко"]
    },
    monitoring: {
      beforeStart: ["АД", "Пульс"],
      duringTreatment: ["Мониторинг АД каждые 15 минут при острой гипертензии"],
      stopOrReviewIf: ["Систолическое АД < 90 мм рт.ст.", "Тахикардия > 120/мин"]
    },
    clinicalUseCases: [
      {
        scenario: "Острая гипертензия при преэклампсии",
        whyChosen: "Быстрое снижение АД",
        importantNotes: ["10 мг сублингвально, повторить через 20 минут при необходимости"]
      },
      {
        scenario: "Токолиз",
        whyChosen: "асслабление матки",
        importantNotes: ["10 мг x 4 раза в день"]
      }
    ],
    majorPracticePoints: ["Не использовать при экстренном родоразрешении", "Комбинировать с магния сульфатом осторожно"],
    routeAndSetting: {
      route: ["per os", "сублингвально"],
      setting: ["амбулаторно", "стационар"],
      prescriberLevel: ["акушер-гинеколог"]
    }
  },
  {
    id: "oxytocin",
    name: "Окситоцин",
    nameEn: "Oxytocin",
    category: "Акушерские препараты",
    forms: ["Инъекции"],
    dosage: {
      induction: "2.5-5 ЕД в/в капельно",
      postpartum: "10 ЕД в/м после рождения плаценты"
    },
    indications: ["Индукция родов", "Стимуляция родовой деятельности", "Послеродовое кровотечение"],
    contraindications: ["Несоответствие таза и плода", "Поперечное предлежание", "Предлежание плаценты"],
    sideEffects: ["Тахикардия", "Гипотензия", "Тошнота", "Гиперстимуляция матки"],
    interactions: [
      { drug: "Простагландины", effect: "Усиление сокращений", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Индукция родов", "Профилактика ППК"],
      notFirstLineWhen: ["Несоответствие таза и плода", "Поперечное предлежание"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Противопоказан",
      pregnancyNotes: ["Не использовать при беременности", "Только в послеродовом периоде"],
      lactationStatus: "азрешен",
      lactationNotes: ["Не влияет на лактацию"]
    },
    monitoring: {
      beforeStart: ["Оценка состояния шейки", "КТГ плода"],
      duringTreatment: ["Мониторинг сокращений", "ЧСС плода", "Динамика раскрытия"],
      stopOrReviewIf: ["Гиперстимуляция (> 5 сокращений/10 мин)", "Дистресс плода", "Отсутствие прогресса > 4 часа"]
    },
    clinicalUseCases: [
      {
        scenario: "Индукция родов",
        whyChosen: "Стимуляция маточных сокращений",
        importantNotes: ["2.5-5 ЕД в/в, титровать по эффекту", "Максимум 20 ЕД/сутки"]
      },
      {
        scenario: "Профилактика ППК",
        whyChosen: "Сокращение матки после рождения плаценты",
        importantNotes: ["10 ЕД в/м после рождения плаценты", "Массаж матки обязателен"]
      }
    ],
    majorPracticePoints: ["Титровать по сокращениям", "Не превышать дозу при гипоксии плода", "Комбинировать с простагландинами осторожно"],
    routeAndSetting: {
      route: ["внутривенно", "внутримышечно"],
      setting: ["роддом", "операционная"],
      prescriberLevel: ["акушер-гинеколог", "акушерка"]
    },
    guidelineBasis: [
      { organization: "WHO", title: "Oxytocin for labor induction", documentType: "Guideline", scope: "Индукция родов, ППК", status: "latest available" }
    ]
  },
  {
    id: "levonorgestrel-iud",
    name: "Мирена (ВМС)",
    nameEn: "Mirena",
    category: "Контрацепция",
    forms: ["Внутриматочная система"],
    dosage: {
      standard: "52 мг, высвобождение 20 мкг/сут"
    },
    indications: ["Контрацепция", "Обильные менструации", "Эндометриоз", "Гиперплазия эндометрия"],
    contraindications: ["Беременность", "ИОМТ", "Опухоли матки"],
    sideEffects: ["Нерегулярные кровотечения", "Головная боль", "Перепады настроения", "Акне"],
    interactions: []
  },
  {
    id: "copper-iud",
    name: "Медная ВМС",
    nameEn: "Copper IUD",
    category: "Контрацепция",
    forms: ["Внутриматочное средство"],
    dosage: {
      standard: "Cu 380 мм², до 10 лет"
    },
    indications: ["Контрацепция", "Экстренная контрацепция", "Послеродовая контрацепция"],
    contraindications: ["Беременность", "ИОМТ", "Опухоли матки"],
    sideEffects: ["Обильные менструации", "Дисменорея", "Боли внизу живота"],
    interactions: []
  },
  {
    id: "drospirenone-ocp",
    name: "Дроспиренон (КОК)",
    nameEn: "Drospirenone OCP",
    category: "Контрацепция",
    forms: ["Таблетки"],
    dosage: {
      standard: "3 мг + 30 мкг, 21+7 или 24+4"
    },
    indications: ["Контрацепция", "ПМС", "Акне", "Эндометриоз"],
    contraindications: ["Тромбоз", "Мигрень с аурой", "Курение > 35 лет", "Гипертония"],
    sideEffects: ["Тошнота", "Головная боль", "Перепады настроения", "Болезненность груди"],
    interactions: [
      { drug: "Антибиотики", effect: "Снижение эффективности", level: "medium" },
      { drug: "Противосудорожные", effect: "Снижение эффективности", level: "high" }
    ]
  },
  {
    id: "desogestrel-pop",
    name: "Чисто гестагенные (mini)",
    nameEn: "Desogestrel POP",
    category: "Контрацепция",
    forms: ["Таблетки"],
    dosage: {
      standard: "75 мкг ежедневно"
    },
    indications: ["Контрацепция", "Лактация", "Противопоказания к эстрогенам"],
    contraindications: ["Тромбоз", "Опухоли печени"],
    sideEffects: ["Нерегулярные кровотечения", "Головная боль", "Перепады настроения"],
    interactions: []
  },
  {
    id: "ulipristal",
    name: "Улипристал",
    nameEn: "Ulipristal",
    category: "Экстренная контрацепция",
    forms: ["Таблетки"],
    dosage: {
      standard: "30 мг однократно"
    },
    indications: ["Экстренная контрацепция", "Миома матки"],
    contraindications: ["Беременность", "Тяжелая астма"],
    sideEffects: ["Тошнота", "Боли внизу живота", "Головная боль", "Усталость"],
    interactions: []
  },
  {
    id: "levonorgestrel-ec",
    name: "Левоноргестрел (экстренная)",
    nameEn: "Levonorgestrel EC",
    category: "Экстренная контрацепция",
    forms: ["Таблетки"],
    dosage: {
      standard: "1.5 мг однократно"
    },
    indications: ["Экстренная контрацепция (до 72 ч)"],
    contraindications: ["Беременность"],
    sideEffects: ["Тошнота", "вота", "Головная боль", "Усталость", "Нарушение цикла"],
    interactions: []
  },
  {
    id: "mifepristone",
    name: "Мифепристон",
    nameEn: "Mifepristone",
    category: "Абортивные средства",
    forms: ["Таблетки"],
    dosage: {
      "medical-abortion": "200-600 мг однократно"
    },
    indications: ["Медикаментозный аборт (до 63 дней)", "Индукция родов"],
    contraindications: ["Хроническая надпочечная недостаточность", "Тяжелая анемия", "Инфекция"],
    sideEffects: ["Кровотечение", "Боли внизу живота", "Тошнота", "вота", "Диарея"],
    interactions: [
      { drug: "НПВС", effect: "Снижение эффективности", level: "high" }
    ]
  },
  {
    id: "misoprostol",
    name: "Мизопростол",
    nameEn: "Misoprostol",
    category: "Акушерские препараты",
    forms: ["Таблетки"],
    dosage: {
      abortion: "800 мкг вагинально/буккально",
      postpartum: "400-600 мкг"
    },
    indications: ["Медикаментозный аборт", "Послеродовое кровотечение", "Индукция родов"],
    contraindications: ["Беременность (кроме индукции)", "Астма"],
    sideEffects: ["Тошнота", "вота", "Диарея", "Лихорадка", "Озноб"],
    interactions: [
      { drug: "Окситоцин", effect: "Усиление сокращений", level: "medium" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Индукция родов", "ППК"],
      notFirstLineWhen: ["Астма", "Беременность (кроме индукции)"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Только по показаниям",
      pregnancyNotes: ["Используется для индукции родов", "Профилактика ППК"],
      lactationStatus: "азрешен",
      lactationNotes: ["Минимально проникает в молоко"]
    },
    clinicalUseCases: [
      {
        scenario: "Профилактика ППК",
        whyChosen: "Сильный утеротоник, стабилизирует матку",
        importantNotes: ["400-600 мкг вагинально/буккально после рождения плаценты"]
      },
      {
        scenario: "Индукция родов",
        whyChosen: "Созревание шейки + сокращения матки",
        importantNotes: ["25 мкг вагинально каждые 4-6 часов"]
      }
    ],
    majorPracticePoints: ["Не использовать при астме", "Комбинировать с окситоцином осторожно"],
    guidelineBasis: [
      { organization: "WHO", title: "Misoprostol for labor induction", documentType: "Guideline", scope: "Индукция родов, ППК", status: "latest available" }
    ]
  },
  {
    id: "estradiol",
    name: "Эстрадиол",
    nameEn: "Estradiol",
    category: "Гормональная терапия",
    forms: ["Таблетки", "Пластырь", "Гель"],
    dosage: {
      tablets: "1-2 мг/день",
      patch: "25-100 мкг/сут",
      gel: "0.5-1 мг/день"
    },
    indications: ["ЗГТ при менопаузе", "Гипоэстрогения", "ПНЯ", "Стимуляция пубертата"],
    contraindications: ["Тромбоз", "Опухоли молочной железы", "Тяжелые заболевания печени"],
    sideEffects: ["Тошнота", "Головная боль", "Болезненность молочных желёз", "Отёки", "Тромбоз"],
    interactions: [
      { drug: "Антикоагулянты", effect: "Усиление эффекта", level: "medium" }
    ]
  },
  {
    id: "dinogest",
    name: "Диеногест",
    nameEn: "Dienogest",
    category: "Гестагены",
    forms: ["Таблетки"],
    dosage: {
      standard: "2 мг/день"
    },
    indications: ["Эндометриоз", "Контрацепция"],
    contraindications: ["Тромбоз", "Опухоли печени", "Тяжелая депрессия"],
    sideEffects: ["Головная боль", "Тошнота", "Перепады настроения", "Снижение либидо"],
    interactions: []
  },
  {
    id: "ceftriaxone",
    name: "Цефтриаксон",
    nameEn: "Ceftriaxone",
    category: "Антибиотики",
    forms: ["Инъекции"],
    dosage: {
      gonorrhea: "500 мг в/м однократно",
      pid: "1 г в/сут"
    },
    indications: ["Гонорея", "ВЗОМТ", "Сальпингит", "Эндометрит"],
    contraindications: ["Аллергия на цефалоспорины"],
    sideEffects: ["Диарея", "Тошнота", "Сыпь", "Флебит", "Кандидоз"],
    interactions: [],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Гонорея", "ВЗОМТ", "Эндометрит"],
      notFirstLineWhen: ["Аллергия на цефалоспорины"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Категория B", "Безопасен при беременности"],
      lactationStatus: "азрешен",
      lactationNotes: ["Минимально проникает в молоко"]
    },
    clinicalUseCases: [
      {
        scenario: "Гонорея",
        whyChosen: "Однократная инъекция, высокая эффективность",
        importantNotes: ["500 мг в/м однократно + азитромицин 1 г"]
      },
      {
        scenario: "ВЗОМТ",
        whyChosen: "Покрытие N. gonorrhoeae + анаэробы",
        importantNotes: ["1 г/сут в/в или в/м + доксициклин + метронидазол"]
      }
    ],
    majorPracticePoints: ["Не смешивать с кальцийсодержащими растворами", "Дозировка 1 г при тяжелом течении"],
    guidelineBasis: [
      { organization: "CDC", title: "STI treatment guidelines", documentType: "Guideline", scope: "Гонорея, ВЗОМТ", status: "latest available" }
    ]
  },
  {
    id: "clindamycin",
    name: "Клиндамицин",
    nameEn: "Clindamycin",
    category: "Антибиотики",
    forms: ["Капсулы", "Инъекции"],
    dosage: {
      oral: "150-450 мг x 4 раза/день",
      iv: "600-900 мг x 3 раза/день"
    },
    indications: ["ВЗОМТ", "Эндометрит", "Бактериальный вагиноз", "Абсцессы"],
    contraindications: ["Аллергия на линкозамиды"],
    sideEffects: ["Диарея", "Тошнота", "Сыпь", "Псевдомембранозный колит"],
    interactions: [
      { drug: "Миорелаксанты", effect: "Усиление блокады", level: "high" }
    ]
  },
  {
    id: "metronidazole",
    name: "Метронидазол",
    nameEn: "Metronidazole",
    category: "Антибиотики",
    forms: ["Таблетки", "Инъекции", "Вагинальный гель"],
    dosage: {
      oral: "500 мг x 2 раза/день"
    },
    indications: ["Бактериальный вагиноз", "Трихомониаз", "ВЗОМТ", "Эндометрит"],
    contraindications: ["Первый триместр беременности", "Почечная недостаточность"],
    sideEffects: ["Тошнота", "Металлический привкус", "Головная боль", "Диарея"],
    interactions: [
      { drug: "Алкоголь", effect: "Дисульфирамоподобная реакция", level: "high" },
      { drug: "Варфарин", effect: "Усиление антикоагуляции", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Бактериальный вагиноз", "Трихомониаз", "ВЗОМТ"],
      notFirstLineWhen: ["Первый триместр беременности"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Осторожно",
      pregnancyNotes: ["Избегать в первом триместре", "Безопасен во 2-3 триместрах"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко — избегать при грудном вскармливании"]
    },
    clinicalUseCases: [
      {
        scenario: "Бактериальный вагиноз",
        whyChosen: "Элиминирует анаэробную флору",
        importantNotes: ["500 мг x 2 раза/день, 7 дней", "Вагинальная форма — приоритет"]
      },
      {
        scenario: "Трихомониаз",
        whyChosen: "Эффективен против Trichomonas vaginalis",
        importantNotes: ["2 г однократно или 500 мг x 2 раза/день, 5 дней", "Лечение партнера"]
      },
      {
        scenario: "ВЗОМТ (в комбинации)",
        whyChosen: "Покрытие анаэробов",
        importantNotes: ["500 мг x 2 раза/день, 14 дней с цефтриаксоном"]
      }
    ],
    majorPracticePoints: ["Не принимать с алкоголем", "Курс не менее 7 дней при БВ"],
    guidelineBasis: [
      { organization: "CDC", title: "STI/BV treatment guidelines", documentType: "Guideline", scope: "Бактериальный вагиноз, трихомониаз", status: "latest available" }
    ]
  },
  {
    id: "folic-acid",
    name: "Фолиевая кислота",
    nameEn: "Folic acid",
    category: "Витамины",
    forms: ["Таблетки"],
    dosage: {
      standard: "400-800 мкг/день",
      highRisk: "4 мг/день"
    },
    indications: ["Профилактика дефектов нервной трубки", "Анемия", "Привычное невынашивание"],
    contraindications: ["Пернициозная анемия (до исключения B12)"],
    sideEffects: ["Тошнота", "Вздутие", "Аллергия"],
    interactions: [
      { drug: "Метотрексат", effect: "Снижение эффекта", level: "high" }
    ]
  },
  {
    id: "vitamin-d",
    name: "Витамин D",
    nameEn: "Vitamin D",
    category: "Витамины",
    forms: ["Капсулы", "Капли"],
    dosage: {
      standard: "800-2000 МЕ/день",
      deficiency: "4000-10000 МЕ/день"
    },
    indications: ["Остеопороз", "Дефицит витамина D", "ПНЯ", "ЗГТ"],
    contraindications: ["Гиперкальциемия", "Саркоидоз"],
    sideEffects: ["Тошнота", "Гиперкальциемия", "Камни в почках"],
    interactions: []
  },
  {
    id: "calcium",
    name: "Кальций",
    nameEn: "Calcium",
    category: "Минералы",
    forms: ["Таблетки", "Порошок"],
    dosage: {
      standard: "1000-1200 мг/день",
      pregnancy: "1000 мг/день"
    },
    indications: ["Остеопороз", "Беременность", "Гипопаратиреоз"],
    contraindications: ["Гиперкальциемия", "Камни в почках"],
    sideEffects: ["Запор", "Вздутие", "Гиперкальциемия"],
    interactions: [
      { drug: "Антибиотики (тетрациклины)", effect: "Снижение всасывания", level: "high" },
      { drug: "Железо", effect: "Снижение всасывания", level: "medium" }
    ]
  },
  {
    id: "spironolactone",
    name: "Спиронолактон",
    nameEn: "Spironolactone",
    category: "Диуретики",
    forms: ["Таблетки"],
    dosage: {
      standard: "25-100 мг/день",
      pcos: "50-100 мг/день"
    },
    indications: ["СПКЯ (гирсутизм)", "ПМС (отёки)", "Первичный альдостеронизм"],
    contraindications: ["Почечная недостаточность", "Гиперкалиемия", "Беременность"],
    sideEffects: ["Гиперкалиемия", "Головная боль", "Нарушение менструального цикла"],
    interactions: [
      { drug: "Ингибиторы АПФ", effect: "Гиперкалиемия", level: "high" },
      { drug: "Калийсберегающие диуретики", effect: "Гиперкалиемия", level: "high" }
    ]
  },
  {
    id: "bromocriptine",
    name: "Бромокриптин",
    nameEn: "Bromocriptine",
    category: "Дофаминомиметики",
    forms: ["Таблетки"],
    dosage: {
      standard: "2.5-15 мг/день"
    },
    indications: ["Гиперпролактинемия", "Пролактинома", "Подавление лактации"],
    contraindications: ["Тяжелая почечная недостаточность", "ИБС"],
    sideEffects: ["Тошнота", "вота", "Головная боль", "Головокружение", "Гипотензия"],
    interactions: [
      { drug: "Антипсихотики", effect: "Снижение эффективности", level: "medium" }
    ]
  },
  {
    id: "medroxyprogesterone",
    name: "Медроксипрогестерон",
    nameEn: "Medroxyprogesterone acetate",
    category: "Гестагены",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      oral: "2.5-10 мг/день",
      depot: "150 мг в/м каждые 12 недель"
    },
    indications: ["Аменорея", "Эндометриоз", "Контрацепция", "Гиперплазия эндометрия"],
    contraindications: ["Тромбоз", "Опухоли молочной железы", "Тяжелые заболевания печени"],
    sideEffects: ["Перепады настроения", "Болезненность молочных желёз", "Набор веса", "Остеопороз"],
    interactions: []
  },
  {
    id: "dydrogesterone",
    name: "Дидрогестерон",
    nameEn: "Dydrogesterone",
    category: "Гестагены",
    forms: ["Таблетки"],
    dosage: {
      standard: "10-20 мг/день"
    },
    indications: ["Угроза выкидыша", "Привычное невынашивание", "Эндометриоз"],
    contraindications: ["Тромбоз", "Опухоли печени"],
    sideEffects: ["Тошнота", "Головная боль", "Перепады настроения"],
    interactions: []
  },
  {
    id: "testosterone",
    name: "Тестостерон",
    nameEn: "Testosterone",
    category: "Андрогены",
    forms: ["Гель", "Инъекции"],
    dosage: {
      gel: "5-10 мг/день",
      patch: "1.5-3 мг/сут"
    },
    indications: ["Снижение либидо", "ПНЯ", "Дефицит андрогенов"],
    contraindications: ["ак молочной железы", "ак простаты", "Беременность"],
    sideEffects: ["Акне", "Гирсутизм", "Снижение голоса", "Агрессия"],
    interactions: []
  },
  {
    id: "goserelin",
    name: "Гозерелин",
    nameEn: "Goserelin",
    category: "Агонисты ГнРГ",
    forms: ["Инъекции (депо)"],
    dosage: {
      implant: "3.6 мг п/к каждые 28 дней или 10.8 мг каждые 12 недель"
    },
    indications: ["Эндометриоз", "Миома матки", "ак молочной железы", "ак простаты"],
    contraindications: ["Беременность", "Лактация"],
    sideEffects: ["Приливы", "Снижение либидо", "Сухость влагалища", "Головная боль", "Перепады настроения"],
    interactions: []
  },
  {
    id: "leuprolide",
    name: "Лейпрорелин",
    nameEn: "Leuprolide",
    category: "Агонисты ГнРГ",
    forms: ["Инъекции"],
    dosage: {
      depot: "3.75 мг в/м ежемесячно или 11.25 мг каждые 3 месяца"
    },
    indications: ["Эндометриоз", "Миома матки", "ак молочной железы", "ак простаты"],
    contraindications: ["Беременность", "Лактация"],
    sideEffects: ["Приливы", "Снижение либидо", "Сухость влагалища", "Головная боль", "Тошнота"],
    interactions: []
  },
  {
    id: "triptorelin",
    name: "Трипторелин",
    nameEn: "Triptorelin",
    category: "Агонисты ГнРГ",
    forms: ["Инъекции"],
    dosage: {
      depot: "3.75 мг в/м ежемесячно"
    },
    indications: ["Эндометриоз", "Миома матки", "ак молочной железы", "Бесплодие (ЭКО)"],
    contraindications: ["Беременность", "Лактация"],
    sideEffects: ["Приливы", "Снижение либидо", "Головная боль", "Перепады настроения"],
    interactions: []
  },
  {
    id: "cetrorelix",
    name: "Цетрореликс",
    nameEn: "Cetrorelix",
    category: "Антагонисты ГнРГ",
    forms: ["Инъекции"],
    dosage: {
      standard: "0.25 мг п/к ежедневно или 3 мг однократно"
    },
    indications: ["Контролируемая стимуляция овуляции (ЭКО)"],
    contraindications: ["Беременность", "Лактация", "Тяжелая почечная недостаточность"],
    sideEffects: ["Тошнота", "Головная боль", "еакции в месте инъекции"],
    interactions: []
  },
  {
    id: "ganirelix",
    name: "Ганиреликс",
    nameEn: "Ganirelix",
    category: "Антагонисты ГнРГ",
    forms: ["Инъекции"],
    dosage: {
      standard: "0.25 мг п/к ежедневно"
    },
    indications: ["Контролируемая стимуляция овуляции (ЭКО)"],
    contraindications: ["Беременность", "Лактация"],
    sideEffects: ["Тошнота", "Головная боль", "Сыпь"],
    interactions: []
  },
  {
    id: "fsh",
    name: "ФСГ (гонадотропины)",
    nameEn: "Follicle Stimulating Hormone",
    category: "Стимуляция овуляции",
    forms: ["Инъекции"],
    dosage: {
      standard: "75-300 МЕ п/к ежедневно"
    },
    indications: ["Стимуляция овуляции", "ЭКО", "Мужское бесплодие"],
    contraindications: ["Беременность", "Опухоли гипофиза", "Поликистоз яичников (риск гиперстимуляции)"],
    sideEffects: ["Синдром гиперстимуляции яичников", "Многоплодие", "Боль в животе", "Тошнота"],
    interactions: []
  },
  {
    id: "hMG",
    name: "ЧМГ (человеческий менопаузальный гонадотропин)",
    nameEn: "Human Menopausal Gonadotropin",
    category: "Стимуляция овуляции",
    forms: ["Инъекции"],
    dosage: {
      standard: "75-225 МЕ п/к ежедневно"
    },
    indications: ["Стимуляция овуляции", "ЭКО", "Гипогонадотропный гипогонадизм"],
    contraindications: ["Беременность", "Опухоли гипофиза"],
    sideEffects: ["СГЯ", "Многоплодие", "Боль в животе"],
    interactions: []
  },
  {
    id: "hCG",
    name: "ХГЧ",
    nameEn: "Human Chorionic Gonadotropin",
    category: "Стимуляция овуляции",
    forms: ["Инъекции"],
    dosage: {
      trigger: "5000-10000 ЕД в/м однократно",
      luteal: "2000-5000 ЕД в/м 2-3 раза в неделю"
    },
    indications: ["Триггер овуляции", "Лютеиновая поддержка", "Лечение крипторхизма"],
    contraindications: ["Беременность", "Опухоли, зависимые от ХГЧ"],
    sideEffects: ["СГЯ", "Головная боль", "Перепады настроения"],
    interactions: []
  },
  {
    id: "aspirin",
    name: "Ацетилсалициловая кислота",
    nameEn: "Aspirin",
    category: "Антиагреганты",
    forms: ["Таблетки"],
    dosage: {
      low: "75-100 мг/день",
      high: "300-500 мг"
    },
    indications: ["Профилактика преэклампсии", "Привычное невынашивание (АФС)", "Профилактика тромбозов"],
    contraindications: ["Язвенная болезнь", "Бронхиальная астма", "Беременность (3 триместр)"],
    sideEffects: ["Тошнота", "Изжога", "иск кровотечения", "Бронхоспазм"],
    interactions: [
      { drug: "Антикоагулянты", effect: "Усиление риска кровотечения", level: "high" },
      { drug: "НПВС", effect: "Усиление риска кровотечения", level: "medium" }
    ]
  },
  {
    id: "enoxaparin",
    name: "Эноксапарин",
    nameEn: "Enoxaparin",
    category: "Антикоагулянты",
    forms: ["Инъекции"],
    dosage: {
      prophylaxis: "40 мг п/к 1 раз/день",
      treatment: "1 мг/кг п/к каждые 12 часов"
    },
    indications: ["Профилактика тромбозов", "Лечение тромбоза", "АФС при беременности"],
    contraindications: ["Тромбоцитопения", "Активное кровотечение", "Тяжелая почечная недостаточность"],
    sideEffects: ["Кровотечение", "Тромбоцитопения", "Гематомы в месте инъекции", "Остеопороз"],
    interactions: [
      { drug: "Аспирин", effect: "Усиление риска кровотечения", level: "high" },
      { drug: "НПВС", effect: "Усиление риска кровотечения", level: "high" }
    ]
  },
  {
    id: "heparin",
    name: "Гепарин",
    nameEn: "Heparin",
    category: "Антикоагулянты",
    forms: ["Инъекции"],
    dosage: {
      prophylaxis: "5000 ЕД п/к каждые 8-12 часов",
      treatment: "5000-10000 ЕД в/в болюсно, затем инфузия"
    },
    indications: ["Профилактика тромбозов", "Лечение тромбоза", "АФС"],
    contraindications: ["Тромбоцитопения", "Активное кровотечение", "Гемофилия"],
    sideEffects: ["Кровотечение", "Тромбоцитопения", "Остеопороз", "Алопеция"],
    interactions: [
      { drug: "Аспирин", effect: "Усиление риска кровотечения", level: "high" }
    ]
  },
  {
    id: "labetalol",
    name: "Лабеталол",
    nameEn: "Labetalol",
    category: "Антигипертензивные",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      oral: "100-600 мг 2 раза/день",
      iv: "20 мг в/в, по необходимости до 80 мг"
    },
    indications: ["Гипертензия при беременности", "Преэклампсия", "Эклампсия"],
    contraindications: ["Бронхиальная астма", "Сердечная недостаточность", "АВ-блокада"],
    sideEffects: ["Гипотензия", "Бронхоспазм", "Усталость", "Головная боль"],
    interactions: [
      { drug: "Магния сульфат", effect: "Усиление гипотензии", level: "high" }
    ],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Гипертензия при беременности", "Преэклампсия"],
      notFirstLineWhen: ["Бронхиальная астма", "Сердечная недостаточность"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Безопасен при беременности", "Не имеет тератогенного эффекта"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко, безопасен"]
    },
    monitoring: {
      beforeStart: ["АД", "ЧСС", "аускультация легких"],
      duringTreatment: ["Мониторинг АД каждые 15 минут при в/в"],
      stopOrReviewIf: ["Систолическое АД < 90", "Бронхоспазм"]
    },
    clinicalUseCases: [
      {
        scenario: "Острая гипертензия при преэклампсии",
        whyChosen: "Быстрый контроль АД при преэклампсии",
        importantNotes: ["20 мг в/в, повторить через 10 минут", "Максимум 80 мг"]
      },
      {
        scenario: "Хроническая гипертензия при беременности",
        whyChosen: "Комбинированный эффект (альфа + бета-блокада)",
        importantNotes: ["100-200 мг x 2"]
      }
    ],
    majorPracticePoints: ["Вводить медленно при в/в", "Не использовать при бронхиальной астме"],
    guidelineBasis: [
      { organization: "ACOG", title: "Hypertensive disorders in pregnancy", documentType: "Practice Bulletin", scope: "Гипертензия при беременности", status: "latest available" }
    ]
  },
  {
    id: "hydralazine",
    name: "Гидралазин",
    nameEn: "Hydralazine",
    category: "Антигипертензивные",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      oral: "25-100 мг 2-4 раза/день",
      iv: "5-10 мг в/в, по необходимости"
    },
    indications: ["Гипертензия при беременности", "Преэклампсия"],
    contraindications: ["Митральный стеноз", "ИБС", "Тахикардия"],
    sideEffects: ["Тахикардия", "Головная боль", "Тошнота", "Волчаночный синдром"],
    interactions: []
  },
  {
    id: "betamethasone",
    name: "Бетаметазон",
    nameEn: "Betamethasone",
    category: "Кортикостероиды",
    forms: ["Инъекции"],
    dosage: {
      fetal: "12 мг в/м, 2 дозы с интервалом 24 часа"
    },
    indications: ["Созревание лёгких плода (преждевременные роды)", "Воспалительные заболевания"],
    contraindications: ["Системные инфекции", "Пептическая язва"],
    sideEffects: ["Гипергликемия", "Задержка жидкости", "Бессонница", "Перепады настроения"],
    interactions: []
  },
  {
    id: "dexamethasone",
    name: "Дексаметазон",
    nameEn: "Dexamethasone",
    category: "Кортикостероиды",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      fetal: "6 мг в/м каждые 12 часов, 4 дозы",
      standard: "0.5-9 мг/день"
    },
    indications: ["Созревание лёгких плода", "Преждевременные роды", "Воспаление", "Тошнота"],
    contraindications: ["Системные инфекции"],
    sideEffects: ["Гипергликемия", "Остеопороз", "Катаракта", "Задержка жидкости"],
    interactions: [],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Созревание лёгких плода", "Преждевременные роды"],
      notFirstLineWhen: ["Системные инфекции", "Сахарный диабет (относительно)"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Ускоряет созревание лёгких плода", "Снижает перинатальную смертность"],
      lactationStatus: "азрешен",
      lactationNotes: ["Минимально проникает в молоко"]
    },
    monitoring: {
      beforeStart: ["Глюкоза крови", "Срок беременности"],
      duringTreatment: ["Глюкоза каждые 6 часов", "Признаки инфекции"],
      stopOrReviewIf: ["Тяжелая гипергликемия", "Признаки инфекции"]
    },
    clinicalUseCases: [
      {
        scenario: "Преждевременные роды < 34 недель",
        whyChosen: "Созревание сурфактанта лёгких плода",
        importantNotes: ["6 мг в/м x 2 с интервалом 24 часа", "Эффект через 24-48 часов"]
      },
      {
        scenario: "HELLP-синдром",
        whyChosen: "Улучшение тромбоцитов и печеночных ферментов",
        importantNotes: ["10 мг в/в x 2", "Улучшение временное"]
      }
    ],
    majorPracticePoints: [" two doses = полный курс", "Повторный курс не рекомендуется", "Эффект развивается 24-48 часов"],
    routeAndSetting: {
      route: ["внутримышечно", "внутривенно"],
      setting: ["роддом", "стационар"],
      prescriberLevel: ["акушер-гинеколог"]
    },
    guidelineBasis: [
      { organization: "ACOG", title: "Antenatal corticosteroids", documentType: "Practice Bulletin", scope: "Созревание лёгких плода", status: "latest available" }
    ]
  },
  {
    id: "carboprost",
    name: "Карбопрост",
    nameEn: "Carboprost",
    category: "Акушерские препараты",
    forms: ["Инъекции"],
    dosage: {
      postpartum: "250 мкг в/м, по необходимости каждые 15-90 минут"
    },
    indications: ["Послеродовое кровотечение", "Атонрия матки"],
    contraindications: ["Беременность (до родов)", "Астма", "Активное заболевание лёгких"],
    sideEffects: ["Тошнота", "вота", "Диарея", "Лихорадка", "Бронхоспазм"],
    interactions: [],
    firstLineStatus: {
      role: "second-line",
      forConditions: ["Послеродовое кровотечение", "Атония матки"],
      notFirstLineWhen: ["Беременность (до родов)", "Астма"]
    },
    pregnancyLactation: {
      pregnancyStatus: "Только послеродовый период",
      pregnancyNotes: ["Используется только при ППК"],
      lactationStatus: "азрешен",
      lactationNotes: ["Минимально проникает в молоко"]
    },
    clinicalUseCases: [
      {
        scenario: "Атония матки при ППК",
        whyChosen: "Сильный утеротоник при неэффективности окситоцина",
        importantNotes: ["250 мкг в/м, повторить каждые 15-90 мин", "Максимум 8 доз"]
      }
    ],
    majorPracticePoints: ["Антидот — немедленная лапаротомия при неэффективности", "Бронхоспазм — остановить"],
    routeAndSetting: {
      route: ["внутримышечно"],
      setting: ["роддом", "операционная"],
      prescriberLevel: ["акушер-гинеколог"]
    }
  },
  {
    id: "atosiban",
    name: "Атозибан",
    nameEn: "Atosiban",
    category: "Токолитики",
    forms: ["Инъекции"],
    dosage: {
      loading: "6.75 мг в/в болюсно",
      maintenance: "300 мкг/ч в/в инфузия до 48 часов"
    },
    indications: ["Угроза преждевременных родов"],
    contraindications: ["Беременность > 33 недель", "Внутриматочная инфекция", "Отслойка плаценты"],
    sideEffects: ["Тошнота", "Головная боль", "Гипотензия", "Тахикардия"],
    interactions: [],
    firstLineStatus: {
      role: "first-line",
      forConditions: ["Угроза преждевременных родов"],
      notFirstLineWhen: ["Беременность > 33 недель", "Внутриматочная инфекция"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["Специфический блокатор окситоцина", "Эффективен до 33 недель"],
      lactationStatus: "азрешен",
      lactationNotes: ["Минимально проникает в молоко"]
    },
    clinicalUseCases: [
      {
        scenario: "Угроза преждевременных родов < 33 недель",
        whyChosen: "Специфический токолитик — блокирует окситоциновые рецепторы",
        importantNotes: ["6.75 мг болюсно + 300 мкг/час до 48 часов", "Эффект сохраняется после отмены"]
      }
    ],
    majorPracticePoints: ["Дороже нифедипина", "Менее побочных эффектов на сердечно-сосудистую систему"],
    guidelineBasis: [
      { organization: "ACOG", title: "Preterm labor guidelines", documentType: "Guideline", scope: "Токолиз", status: "latest available" }
    ]
  },
  {
    id: "terbutaline",
    name: "Тербуталин",
    nameEn: "Terbutaline",
    category: "Токолитики",
    forms: ["Инъекции", "Таблетки"],
    dosage: {
      iv: "0.25 мг п/к каждые 20-30 минут, максимум 4 дозы",
      oral: "0.25 мг каждые 4-6 часов"
    },
    indications: ["Угроза преждевременных родов", "Бронхиальная астма"],
    contraindications: ["Сердечные заболевания", "Диабет", "Тиреотоксикоз"],
    sideEffects: ["Тахикардия", "Тремор", "Гипотензия", "Гипергликемия", "Олоз"],
    interactions: [
      { drug: "Бета-блокаторы", effect: "Антагонизм", level: "medium" }
    ],
    firstLineStatus: {
      role: "second-line",
      forConditions: ["Угроза преждевременных родов"],
      notFirstLineWhen: ["Сердечные заболевания", "Диабет", "Тиреотоксикоз"]
    },
    pregnancyLactation: {
      pregnancyStatus: "азрешен",
      pregnancyNotes: ["екомендован при бронхиальной астме", "Бета-2-агонист"],
      lactationStatus: "азрешен",
      lactationNotes: ["Проникает в молоко"]
    },
    clinicalUseCases: [
      {
        scenario: "Угроза преждевременных родов при бронхиальной астме",
        whyChosen: "Безопасен при бронхиальной астме, эффективный токолитик",
        importantNotes: ["0.25 мг п/к, повторить через 20-30 мин", "Максимум 4 дозы"]
      }
    ],
    majorPracticePoints: ["Приоритет при бронхиальной астме", "Мониторить ЧСС и глюкозу"]
  },
  {
    id: "indomethacin",
    name: "Индометацин",
    nameEn: "Indomethacin",
    category: "НПВС",
    forms: ["Таблетки", "Свечи", "Инъекции"],
    dosage: {
      tocolysis: "50-100 мг ректально, затем 25-50 мг каждые 6 часов"
    },
    indications: ["Угроза преждевременных родов", "Многоводие", "Боль", "Воспаление"],
    contraindications: ["Беременность (> 32 недель — риск для плода)", "Язвенная болезнь", "Почечная недостаточность"],
    sideEffects: ["Тошнота", "Изжога", "Головная боль", "Задержка жидкости", "иск для плода (почки, сердце)"],
    interactions: []
  },
  {
    id: "iron-supplements",
    name: "Препараты железа",
    nameEn: "Iron Supplements",
    category: "Минералы",
    forms: ["Таблетки", "Сироп", "Инъекции"],
    dosage: {
      oral: "100-200 мг элементарного железа/день",
      iv: "100-200 мг в/в капельно 1-2 раза/неделю"
    },
    indications: ["Железодефицитная анемия", "Беременность", "Послеродовой период"],
    contraindications: ["Гемохроматоз", "Гемолитическая анемия", "Пептическая язва (для пероральных)"],
    sideEffects: ["Тошнота", "Запор", "Диарея", "Тёмный стул", "Металлический привкус"],
    interactions: [
      { drug: "Антациды", effect: "Снижение всасывания", level: "medium" },
      { drug: "Тетрациклины", effect: "Снижение всасывания", level: "high" }
    ]
  },
  {
    id: "anti-d-immunoglobulin",
    name: "Анти-D иммуноглобулин (огам)",
    nameEn: "Anti-D Immunoglobulin",
    category: "Иммуноглобулины",
    forms: ["Инъекции"],
    dosage: {
      prophylaxis: "300 мкг (1500 МЕ) в/м однократно",
      treatment: "100-300 мкг/кг в/в"
    },
    indications: ["Профилактика резус-конфликта", "Лечение резус-сенсибилизации"],
    contraindications: ["Rh-положительная женщина", "Аллергия на иммуноглобулины"],
    sideEffects: ["Лихорадка", "Головная боль", "Тошнота", "Анафилаксия (редко)"],
    interactions: []
  },
  {
    id: "dinoprostone",
    name: "Динопростон",
    nameEn: "Dinoprostone",
    category: "Акушерские препараты",
    forms: ["Вагинальный гель", "Вагинальные свечи", "Инфузия"],
    dosage: {
      gel: "1-2 мг вагинально, повторить через 6 часов",
      infusion: "0.5-2 мкг/мин в/в"
    },
    indications: ["Индукция родов", "Созревание шейки матки"],
    contraindications: ["Кесарево сечение в анамнезе", "Поперечное предлежание", "Предлежание плаценты"],
    sideEffects: ["Тошнота", "вота", "Диарея", "Гиперстимуляция матки", "Лихорадка"],
    interactions: []
  },
  {
    id: "oxybutynin",
    name: "Оксибутинин",
    nameEn: "Oxybutynin",
    category: "Урологические",
    forms: ["Таблетки"],
    dosage: {
      standard: "5 мг 2-3 раза/день"
    },
    indications: ["Гиперактивный мочевой пузырь", "Недержание мочи", "Цистит"],
    contraindications: ["Глаукома", "Миастения", "Тяжелые заболевания ЖКТ"],
    sideEffects: ["Сухость во рту", "Запор", "Головокружение", "Задержка мочи"],
    interactions: []
  },
  {
    id: "tolterodine",
    name: "Толтеродин",
    nameEn: "Tolterodine",
    category: "Урологические",
    forms: ["Таблетки"],
    dosage: {
      standard: "2 мг 2 раза/день"
    },
    indications: ["Гиперактивный мочевой пузырь", "Недержание мочи"],
    contraindications: ["Глаукома", "Задержка мочи"],
    sideEffects: ["Сухость во рту", "Головная боль", "Запор", "Головокружение"],
    interactions: []
  },
  {
    id: "mirabegron",
    name: "Мирабегрон",
    nameEn: "Mirabegron",
    category: "Урологические",
    forms: ["Таблетки"],
    dosage: {
      standard: "50 мг 1 раз/день"
    },
    indications: ["Гиперактивный мочевой пузырь", "Недержание мочи"],
    contraindications: ["Неконтролируемая гипертензия", "Тяжелая почечная/печеночная недостаточность"],
    sideEffects: ["Гипертензия", "Головная боль", "Инфекции мочевыводящих путей", "Тахикардия"],
    interactions: [
      { drug: "Антихолинергические", effect: "Усиление эффекта", level: "medium" }
    ]
  },
  {
    id: "vitamin-b6",
    name: "Витамин B6 (пиридоксин)",
    nameEn: "Vitamin B6",
    category: "Витамины",
    forms: ["Таблетки"],
    dosage: {
      standard: "25-100 мг/день",
      pregnancy: "50 мг/день"
    },
    indications: ["Дефицит B6", "Тошнота при беременности", "ПМС", "Синдром запястного канала"],
    contraindications: [],
    sideEffects: ["Нейропатия (при длительном приёме высоких доз)", "Тошнота"],
    interactions: []
  },
  {
    id: "probiotics",
    name: "Пробиотики",
    nameEn: "Probiotics",
    category: "Микробиом",
    forms: ["Капсулы", "Суспензия", "Вагинальные капсулы"],
    dosage: {
      standard: "1-2 капсулы/день"
    },
    indications: ["Восстановление микрофлоры", "Бактериальный вагиноз", "Кандидоз", "После антибиотикотерапии"],
    contraindications: ["Иммунодефицит", "Острые состояния"],
    sideEffects: ["Вздутие", "Диарея (в начале терапии)"],
    interactions: []
  },
  {
    id: "lactulose",
    name: "Лактулоза",
    nameEn: "Lactulose",
    category: "Слабительные",
    forms: ["Сироп"],
    dosage: {
      standard: "15-30 мл 1-2 раза/день"
    },
    indications: ["Запор", "Печёночная энцефалопатия", "Дисбактериоз"],
    contraindications: ["Галактоземия", "Кишечная непроходимость"],
    sideEffects: ["Вздутие", "Метеоризм", "Диарея", "Боль в животе"],
    interactions: []
  },
  {
    id: "esomeprazole",
    name: "Эзомепразол",
    nameEn: "Esomeprazole",
    category: "Ингибиторы протонной помпы",
    forms: ["Таблетки"],
    dosage: {
      standard: "20-40 мг/день"
    },
    indications: ["ГЭРБ", "Эрозивный эзофагит", "Язвенная болезнь", "Профилактика НПВС-гастропатии"],
    contraindications: ["Беременность", "Лактация"],
    sideEffects: ["Головная боль", "Тошнота", "Диарея", "Запор"],
    interactions: [
      { drug: "Клопидогрел", effect: "Снижение эффекта", level: "high" },
      { drug: "Антибиотики", effect: "Снижение всасывания", level: "medium" }
    ]
  },
  {
    id: "omeprazole",
    name: "Омепразол",
    nameEn: "Omeprazole",
    category: "Ингибиторы протонной помпы",
    forms: ["Капсулы", "Таблетки"],
    dosage: {
      standard: "20-40 мг/день"
    },
    indications: ["ГЭРБ", "Язвенная болезнь", "Эрадикация H. pylori", "Профилактика НПВС-гастропатии"],
    contraindications: [],
    sideEffects: ["Головная боль", "Тошнота", "Диарея", "Переломы (при длительном приёме)"],
    interactions: [
      { drug: "Клопидогрел", effect: "Снижение эффекта", level: "high" },
      { drug: "Варфарин", effect: "Усиление эффекта", level: "medium" }
    ]
  },
  {
    id: "ondansetron",
    name: "Ондансетрон",
    nameEn: "Ondansetron",
    category: "Противорвотные",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      standard: "4-8 мг 2-3 раза/день",
      iv: "4-8 мг в/в"
    },
    indications: ["Тошнота и рвота", "Токсикоз беременных", "Послеоперационная тошнота", "Химиотерапия"],
    contraindications: ["Удлинение интервала QT"],
    sideEffects: ["Головная боль", "Запор", "Диарея", "Удлинение интервала QT"],
    interactions: []
  },
  {
    id: "domperidone",
    name: "Домперидон",
    nameEn: "Domperidone",
    category: "Противорвотные",
    forms: ["Таблетки"],
    dosage: {
      standard: "10 мг 3-4 раза/день"
    },
    indications: ["Тошнота", "вота", "Гастропарез", "Лактация (для увеличения)"],
    contraindications: ["Пролактинома", "Удлинение интервала QT"],
    sideEffects: ["Головная боль", "Сухость во рту", "Галакторея", "Аритмии"],
    interactions: [
      { drug: "Антибиотики (макролиды)", effect: "Удлинение QT", level: "high" }
    ]
  },
  {
    id: "methylergometrine",
    name: "Метилэргометрин",
    nameEn: "Methylergometrine",
    category: "Акушерские препараты",
    forms: ["Инъекции", "Таблетки"],
    dosage: {
      postpartum: "0.2 мг в/м после рождения плаценты, повторить через 2-4 часа"
    },
    indications: ["Послеродовое кровотечение", "Атония матки"],
    contraindications: ["Гипертензия", "Сепсис", "Беременность (не в родах)"],
    sideEffects: ["Гипертензия", "Тошнота", "вота", "Головная боль", "Судороги"],
    interactions: [
      { drug: "Сосудосуживающие", effect: "Усиление эффекта", level: "high" }
    ]
  },
  {
    id: "ergometrine",
    name: "Эргометрин",
    nameEn: "Ergometrine",
    category: "Акушерские препараты",
    forms: ["Инъекции"],
    dosage: {
      postpartum: "0.2-0.4 мг в/м/в/в"
    },
    indications: ["Послеродовое кровотечение"],
    contraindications: ["Гипертензия", "Сепсис", "ИБС"],
    sideEffects: ["Тошнота", "вота", "Гипертензия", "Головная боль"],
    interactions: []
  },
  {
    id: "tranexamic-acid-iv",
    name: "Транексамовая кислота (в/в)",
    nameEn: "Tranexamic Acid IV",
    category: "Антифибринолитики",
    forms: ["Инъекции"],
    dosage: {
      bleeding: "1000 мг в/в 3 раза/день"
    },
    indications: ["Тяжёлое кровотечение", "Послеродовое кровотечение", "Травмы"],
    contraindications: ["Тромбоз", "Почечная недостаточность", "Судороги в анамнезе"],
    sideEffects: ["Тошнота", "Диарея", "Головная боль", "Тромбоз"],
    interactions: []
  },
  {
    id: "progesterone-gel",
    name: "Прогестерон (гель)",
    nameEn: "Progesterone Gel",
    category: "Гормональная терапия",
    forms: ["Вагинальный гель"],
    dosage: {
      standard: "90 мг (1 аппликатор)/день"
    },
    indications: ["Лютеиновая поддержка", "Угроза выкидыша", "Заместительная терапия"],
    contraindications: ["Тромбоз", "Опухоли молочной железы", "Тяжёлые заболевания печени"],
    sideEffects: ["Местное раздражение", "Головная боль", "Перепады настроения"],
    interactions: []
  },
  {
    id: "clomiphene-test",
    name: "Кломифен (провокационный тест)",
    nameEn: "Clomiphene Challenge Test",
    category: "Диагностические тесты",
    forms: ["Таблетки"],
    dosage: {
      test: "100 мг/день с 5-9 день цикла"
    },
    indications: ["Оценка овариального резерва"],
    contraindications: ["Беременность", "Кисты яичников"],
    sideEffects: ["Приливы", "Тошнота", "Головная боль"],
    interactions: []
  }
];

export const drugInteractions = {
  categories: {
    high: {
      label: "Высокий риск",
      color: "#e74c3c",
      description: "Комбинация требует особого внимания или противопоказана"
    },
    medium: {
      label: "Средний риск",
      color: "#f39c12",
      description: "Требуется коррекция дозы или мониторинг"
    },
    low: {
      label: "Низкий риск",
      color: "#B9DCC7",
      description: "Взаимодействие возможно, но клинически значимо редко"
    }
  },
  check: (drug1Id, drug2Id) => {
    const drug1 = medications.find(m => m.id === drug1Id);
    const drug2 = medications.find(m => m.id === drug2Id);
    
    if (!drug1 || !drug2) return null;
    
    const interaction = drug1.interactions?.find(i => 
      i.drug.toLowerCase().includes(drug2.name.toLowerCase()) ||
      i.drug.toLowerCase().includes(drug2.nameEn.toLowerCase())
    );
    
    if (interaction) return interaction;
    
    return null;
  }
};

const rawCommonRegimens = [
  {
    id: "pcos-ovulation",
    name: "Стимуляция овуляции при СПКЯ",
    steps: [
      { day: "1-5", drug: "Кломифен", dose: "50-100 мг" },
      { day: "12-14", drug: "УЗИ мониторинг", note: "Контроль фолликулов" },
      { day: "14-16", drug: "ХГЧ", dose: "5000-10000 ЕД", note: "Триггер овуляции" }
    ]
  },
  {
    id: "endometriosis-therapy",
    name: "Лечение эндометриоза",
    steps: [
      { day: "1-28", drug: "Гестагены", note: "Диеногест 2 мг/день" },
      { day: "1-28", drug: "КОК", note: "При необходимости контрацепции" }
    ]
  },
  {
    id: "recurrent-miscarriage",
    name: "Привычное невынашивание",
    steps: [
      { day: "1", drug: "Фолиевая кислота", dose: "400-800 мкг" },
      { day: "1-12", drug: "Прогестерон", note: "Лютеиновая поддержка" },
      { day: "1-28", drug: "Аспирин", dose: "75-100 мг", note: "При АФС" }
    ]
  },
  {
    id: "medical-abortion",
    name: "Медикаментозный аборт",
    steps: [
      { day: "1", drug: "Мифепристон", dose: "200-600 мг", note: "Блокада прогестерона" },
      { day: "1-2", drug: "Мизопростол", dose: "800 мкг", note: "Через 24-48 ч, вагинально" },
      { day: "14", drug: "УЗИ контроль", note: "Подтверждение завершения" }
    ]
  },
  {
    id: "ivf-protocol",
    name: "ЭКО: длинный протокол",
    steps: [
      { day: "21 (предыдущий цикл)", drug: "Агонист ГнРГ", note: "Депо, например, трипторелин 3.75 мг" },
      { day: "1-5 (новый цикл)", drug: "Стимуляция", note: "Гонадотропины (ФСГ)" },
      { day: "10-12", drug: "УЗИ мониторинг", note: "Контроль фолликулов" },
      { day: "12-14", drug: "Триггер", note: "ХГЧ или агонист ГнРГ" },
      { day: "14-16", drug: "Пункция", note: "Забор ооцитов" },
      { day: "17-20", drug: "Перенос", note: "Эмбриона на 3 или 5 день" }
    ]
  },
  {
    id: "hrt-menopause",
    name: "ЗГТ при менопаузе",
    steps: [
      { day: "1-28", drug: "Эстрадиол", note: "1-2 мг/день трансдермально" },
      { day: "12-14", drug: "Прогестаген", note: "14 дней (например, дидрогестерон 10 мг)" },
      { day: "28", drug: "Перерыв", note: "Кровотечение отмены" }
    ]
  },
  {
    id: "nitrofurantoin",
    name: "Нитрофурантоин",
    nameEn: "Nitrofurantoin",
    category: "Антибактериальные",
    forms: ["Таблетки", "Суспензия"],
    dosage: {
      cystitis: "100 мг 2 раза/день, 5-7 дней"
    },
    indications: ["Неосложнённый цистит", "Профилактика ИМП"],
    contraindications: ["Беременность", "Почечная недостаточность", "Анурия"],
    sideEffects: ["Тошнота", "вота", "Головная боль", "Гематурия", "Полинейропатия"],
    interactions: [
      { drug: "Пробенецид", effect: "Снижение экскреции", level: "medium" },
      { drug: "Антациды", effect: "Снижение всасывания", level: "medium" }
    ]
  },
  {
    id: "fosfomycin",
    name: "Фосфомицин",
    nameEn: "Fosfomycin",
    category: "Антибактериальные",
    forms: ["Порошок для приёма внутрь"],
    dosage: {
      cystitis: "3 г однократно"
    },
    indications: ["Неосложнённый цистит", "ИМП"],
    contraindications: ["Тяжелая почечная недостаточность"],
    sideEffects: ["Тошнота", "Диарея", "Головная боль"],
    interactions: [
      { drug: "Метоклопрамид", effect: "Снижение концентрации", level: "low" }
    ]
  },
  {
    id: "ciprofloxacin",
    name: "Ципрофлоксацин",
    nameEn: "Ciprofloxacin",
    category: "Антибактериальные",
    forms: ["Таблетки", "Инъекции"],
    dosage: {
      uti: "250-500 мг 2 раза/день, 7-14 дней"
    },
    indications: ["Осложнённый цистит", "Пиелонефрит", "ИППП"],
    contraindications: ["Беременность", "Лактация", "Тендинит в анамнезе"],
    sideEffects: ["Тошнота", "Диарея", "Головная боль", "Сухожилит", "Фототоксичность"],
    interactions: [
      { drug: "Теофиллин", effect: "Повышение уровня", level: "high" },
      { drug: "Антациды", effect: "Снижение всасывания", level: "high" }
    ]
  },
  {
    id: "azithromycin",
    name: "Азитромицин",
    nameEn: "Azithromycin",
    category: "Антибактериальные",
    forms: ["Таблетки", "Суспензия"],
    dosage: {
      chlamydia: "500 мг 1 раз/день, 3-7 дней",
      gonorrhea: "2 г однократно"
    },
    indications: ["Хламидиоз", "Гонорея", "Микоплазмоз", "Уреаплазмоз"],
    contraindications: ["Тяжелые нарушения функции печени"],
    sideEffects: ["Тошнота", "Боль в животе", "Диарея", "Головная боль"],
    interactions: [
      { drug: "Варфарин", effect: "Усиление эффекта", level: "medium" }
    ]
  },
  {
    id: "miconazole",
    name: "Миконазол",
    nameEn: "Miconazole",
    category: "Антимикотические",
    forms: ["Крем", "Свечи", "аствор"],
    dosage: {
      candidacy: "100 мг вагинальные свечи, 7 дней"
    },
    indications: ["Вульвовагинальный кандидоз"],
    contraindications: ["Беременность (1 триместр)"],
    sideEffects: ["Зуд", "Жжение", "Местное раздражение"],
    interactions: [
      { drug: "Варфарин", effect: "Усиление эффекта", level: "high" }
    ]
  },
  {
    id: "clotrimazole",
    name: "Клотримазол",
    nameEn: "Clotrimazole",
    category: "Антимикотические",
    forms: ["Крем", "Свечи", "аствор"],
    dosage: {
      candidacy: "100 мг вагинальные свечи, 6 дней"
    },
    indications: ["Вульвовагинальный кандидоз"],
    contraindications: [],
    sideEffects: ["Зуд", "Жжение", "Местное раздражение"],
    interactions: []
  },
  {
    id: "metronidazole",
    name: "Метронидазол",
    nameEn: "Metronidazole",
    category: "Антибактериальные",
    forms: ["Таблетки", "Свечи", "Инъекции"],
    dosage: {
      bv: "500 мг 2 раза/день, 7 дней",
      trichomoniasis: "2 г однократно"
    },
    indications: ["Бактериальный вагиноз", "Трихомониаз", "Анаэробная инфекция"],
    contraindications: ["Беременность (1 триместр)", "Грудное вскармливание"],
    sideEffects: ["Тошнота", "Металлический привкус", "Головная боль", "Лейкопения"],
    interactions: [
      { drug: "Алкоголь", effect: "Дисульфирамоподобная реакция", level: "high" },
      { drug: "Варфарин", effect: "Усиление эффекта", level: "high" }
    ]
  },
  {
    id: "nystatin",
    name: "Нистатин",
    nameEn: "Nystatin",
    category: "Антимикотические",
    forms: ["Таблетки", "Свечи", "Крем"],
    dosage: {
      candidacy: "100000-500000 ЕД 2-4 раза/день"
    },
    indications: ["Кандидоз", "Профилактика при антибиотикотерапии"],
    contraindications: ["Тяжёлые нарушения функции печени"],
    sideEffects: ["Тошнота", "Диарея", "Аллергические реакции"],
    interactions: []
  },
  {
    id: "premature-labor-protocol",
    name: "Преждевременные роды: токолиз",
    steps: [
      { day: "1", drug: "Нифедипин", dose: "20 мг", note: "Начальная доза, затем 10-20 мг каждые 4-6 часов" },
      { day: "1", drug: "Бетаметазон", note: "12 мг в/м, 2 дозы с интервалом 24 ч" },
      { day: "1", drug: "Сульфат магния", note: "4-6 г в/в, затем 1-2 г/ч (при < 32 нед.)" },
      { day: "1-48", drug: "Антибиотики", note: "Ампициллин (при ПП ОМ)" }
    ]
  },
  {
    id: "preeclampsia-protocol",
    name: "Преэклампсия: ведение",
    steps: [
      { day: "1", drug: "Магния сульфат", note: "4-6 г в/в нагрузка, затем 1-2 г/ч (эклампсия)" },
      { day: "1", drug: "Лабеталол", note: "20 мг в/в, по необходимости" },
      { day: "1", drug: "Нифедипин", note: "10-20 мг per os" },
      { day: "1", drug: "Дексаметазон", note: "6 мг в/м (при < 34 нед.)" }
    ]
  },
  {
    id: "ivf-antagonist",
    name: "ЭКО: протокол с антагонистами ГнРГ",
    steps: [
      { day: "2-3", drug: "Стимуляция", note: "Гонадотропины (ФСГ)" },
      { day: "5-6", drug: "Антагонист ГнРГ", note: "Цетрореликс 0.25 мг" },
      { day: "8-10", drug: "УЗИ мониторинг", note: "Контроль фолликулов" },
      { day: "10-12", drug: "Триггер", note: "ХГЧ 5000-10000 ЕД" },
      { day: "14-16", drug: "Пункция", note: "Забор ооцитов" },
      { day: "17-20", drug: "Перенос", note: "Эмбриона" }
    ]
  },
  {
    id: "recurrent-candidiasis",
    name: "Рецидивирующий кандидоз",
    steps: [
      { day: "1", drug: "Флуконазол", dose: "150 мг", note: "2 дозы с интервалом 72 ч" },
      { day: "1-180", drug: "Флуконазол", dose: "150 мг 1 раз в неделю", note: "Поддерживающая терапия 6 мес" }
    ]
  },
  {
    id: "recurrent-bv",
    name: "Рецидивирующий бактериальный вагиноз",
    steps: [
      { day: "1-7", drug: "Метронидазол", dose: "500 мг 2 раза/день" },
      { day: "1-28", drug: "Перерыв" },
      { day: "1-7", drug: "Метронидазол", dose: "500 мг 2 раза/день" },
      { day: "1-180", drug: "Метронидазол", dose: "500 мг 2 раза/неделю", note: "Поддерживающая терапия" }
    ]
  },
  {
    id: "ectopic-pregnancy",
    name: "Внематочная беременность: метотрексат",
    steps: [
      { day: "1", drug: "Метотрексат", dose: "1 мг/кг в/м", note: "Максимум 50 мг" },
      { day: "4", drug: "Метотрексат", dose: "1 мг/кг в/м", note: "При ХГЧ > 1000" },
      { day: "7", drug: "ХГЧ контроль", note: "Снижение ≥ 15% — успех" }
    ]
  },
  {
    id: "preeclampsia-prevention",
    name: "Профилактика преэклампсии",
    steps: [
      { day: "12-28", drug: "Аспирин", dose: "75-100 мг/день", note: "Начать до 16 недель" },
      { day: "1-28", drug: "Кальций", note: "1 г/день при дефиците" }
    ]
  },
  {
    id: "gestational-diabetes",
    name: "Гестационный диабет: ведение",
    steps: [
      { day: "1", drug: "Диета", note: "Ограничение углеводов" },
      { day: "1", drug: "Физическая активность", note: "30 мин в день" },
      { day: "1-7", drug: "Самоконтроль глюкозы", note: "4-7 раз в день" },
      { day: "7", drug: "Оценка", note: "При недостижении целевых — инсулин" }
    ]
  },
  {
    id: "thyroid-pregnancy",
    name: "Гипотиреоз при беременности",
    steps: [
      { day: "1", drug: "Левотироксин", note: "Начальная доза 50-100 мкг" },
      { day: "28", drug: "ТТГ контроль", note: "Целевой ТТГ < 2.5 в 1 триместре" },
      { day: "Изменение", drug: "Коррекция дозы", note: "Увеличение на 25-50%" }
    ]
  },
  {
    id: "postpartum-hemorrhage",
    name: "Послеродовое кровотечение: протокол",
    steps: [
      { day: "1", drug: "Окситоцин", dose: "10 ЕД в/м после рождения плаценты" },
      { day: "1", drug: "Мизопростол", dose: "600 мкг сублингвально" },
      { day: "1", drug: "Метилэргометрин", dose: "0.2 мг в/м" },
      { day: "1", drug: "Транексам", dose: "1000 мг в/в" },
      { day: "1", drug: "Массаж матки", note: "Наружный" }
    ]
  },
  {
    id: "ovarian-hyperstimulation",
    name: "Синдром гиперстимуляции яичников (СГЯ)",
    steps: [
      { day: "1", drug: "Ограничение физической активности" },
      { day: "1", drug: "Обильное питьё", note: "2-3 л жидкости" },
      { day: "1", drug: "Парацетамол", note: "По потребности" },
      { day: "При асците", drug: "Паракентез", note: "Удаление жидкости" },
      { day: "При тяжёлой", drug: "Госпитализация", note: "Инфузионная терапия" }
    ]
  },
  {
    id: "preterm-labor-tocolysis",
    name: "Преждевременные роды: токолиз",
    steps: [
      { day: "1", drug: "Нифедипин", note: "10 мг × 4 раза/день" },
      { day: "1", drug: "Бетаметазон", note: "12 мг × 2 дозы" },
      { day: "1", drug: "Магния сульфат", note: "4-6 г в/в, затем 1-2 г/ч (< 32 нед.)" },
      { day: "1-2", drug: "Антибиотики", note: "Ампициллин (при ПП ОМ)" }
    ]
  },
  {
    id: "cervical-priming",
    name: "Созревание шейки матки",
    steps: [
      { day: "1", drug: "Мизопростол", dose: "25 мкг вагинально", note: "Каждые 3-6 часов" },
      { day: "1", drug: "Динапростон", dose: "1 мг вагинально", note: "Гелевый аппликатор" },
      { day: "При готовности", drug: "Окситоцин", note: "Индукция родов" }
    ]
  },
  {
    id: "endometriosis-continuous",
    name: "Эндометриоз: непрерывная терапия",
    steps: [
      { day: "1-84", drug: "Диеногест", dose: "2 мг/день", note: "3 месяца непрерывно" },
      { day: "84", drug: "Перерыв", note: "Оценка эффекта" },
      { day: "Повтор", drug: "Агонист ГнРГ", note: "При рецидиве" }
    ]
  },
  {
    id: "hrt-contraindications",
    name: "ЗГТ: противопоказания",
    steps: [
      { day: "1", drug: "Консультация", note: "Исключить противопоказания" },
      { day: "1", drug: "УЗИ", note: "Оценка эндометрия" },
      { day: "1", drug: "Маммография" },
      { day: "1", drug: "Биохимия", note: "Печёночные пробы, липиды" }
    ]
  },
  {
    id: "breastfeeding-suppression",
    name: "Подавление лактации",
    steps: [
      { day: "1", drug: "Бромокриптин", dose: "2.5 мг 2 раза/день", note: "14 дней" },
      { day: "1", drug: "Бинты", note: "Эластичное бинтование" },
      { day: "1", drug: "Ограничение жидкости", note: "Не более 1.5 л/день" }
    ]
  },
  {
    id: "urinary-incontinence",
    name: "Недержание мочи: консервативное лечение",
    steps: [
      { day: "1-84", drug: "Упражнения Кегеля", note: "3 раза/день, 8-12 сокращений" },
      { day: "1-84", drug: "Тренировка мочевого пузыря", note: "Удлинение интервалов" },
      { day: "1", drug: "Десмопрессин", note: "При ургенции (100-200 мкг)" }
    ]
  },
  {
    id: "miscarriage-medical",
    name: "Медикаментозное ведение выкидыша",
    steps: [
      { day: "1", drug: "Мизопростол", dose: "800 мкг вагинально/буккально", note: "Повторить через 24 ч" },
      { day: "3-7", drug: "УЗИ контроль", note: "Оценка завершённости" },
      { day: "При неполном", drug: "Повтор мизопростол" }
    ]
  }
];

const isRegimenEntry = (entry) => Array.isArray(entry?.steps);

const dedupeById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

export const medications = enrichMedications(dedupeById([
  ...baseMedications,
  ...rawCommonRegimens.filter((entry) => !isRegimenEntry(entry)),
  ...premiumMedicationCatalog,
]));

export const commonRegimens = dedupeById(rawCommonRegimens.filter(isRegimenEntry));