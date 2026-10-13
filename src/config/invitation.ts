/**
 * Все настройки и тексты сайта в одном месте.
 * Файл используется и во фронтенде, и в серверной функции /api/rsvp,
 * поэтому здесь не должно быть импортов и секретов.
 */

export interface InvitationConfig {
  recipientName: string;
  senderName: string;
  /** Дата встречи в формате YYYY-MM-DD */
  date: string;
  /** Время встречи в формате HH:MM */
  time: string;
  title: string;
  subtitle: string;
}

export const invitationConfig = {
  recipientName: "Алёна",
  senderName: "Рома",
  date: "2026-10-15",
  time: "19:30",
  title: "Приглашение на свидание",
  subtitle: "Буду рад увидеть тебя снова ♡",
} as const satisfies InvitationConfig;

export const texts = {
  pageTitle: "Для Алёны ♡",

  welcome: {
    question: "Алёна, пойдёшь со мной на свидание?",
    yes: "Да",
    no: "Нет",
    /** Ненавязчивая ссылка, которая появляется после нескольких попыток нажать «Нет» */
    softDecline: "Ответить «нет»",
  },

  decline: {
    message: "Хорошо, я понял. Спасибо за честный ответ",
  },

  transition: {
    message: "Тогда у меня для тебя кое-что есть",
    button: "Открыть",
  },

  envelope: {
    addressee: "Алёне",
    hint: "Нажми, чтобы открыть",
    ariaLabel: "Открыть конверт",
  },

  invitation: {
    eyebrow: "Для Алёны ♡",
    pickupTitle: "Откуда тебя забрать?",
    placeholder: "Введи адрес",
    submit: "Отправить",
    submitting: "Отправляю…",
    retry: "Отправить ещё раз",
    signature: "Рома ♡",
    errors: {
      empty: "Напиши, пожалуйста, адрес.",
      tooLong: "Адрес получился слишком длинным — сократи его до 300 символов.",
      rateLimited: "Слишком много попыток. Подожди пару минут и попробуй снова.",
      network: "Не получилось отправить — проверь интернет и попробуй ещё раз.",
      server: "Что-то пошло не так при отправке. Попробуй ещё раз.",
    },
  },

  success: {
    message: "До встречи ♡",
    /** Шутка про первую прогулку */
    joke: "17\u00A0000 шагов в\u00A0этот\u00A0раз не обязательны 😄",
  },
} as const;

/** Ограничение длины адреса — общее для клиента и сервера */
export const ADDRESS_MAX_LENGTH = 300;
