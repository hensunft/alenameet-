import { useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { AlertCircle, Loader2, MapPin, Send } from "lucide-react";
import { ADDRESS_MAX_LENGTH, invitationConfig, texts } from "../config/invitation";
import { sendRsvp } from "../lib/api";
import { formatDayMonth, formatWeekday } from "../lib/date";
import { easeOut, tapSpring } from "../lib/motion";
import { FloralSprig } from "./Florals";
import { Hearted } from "./Hearted";

interface InvitationScreenProps {
  /** Письмо полностью развернулось — можно показывать содержимое */
  revealed: boolean;
  onSuccess: () => void;
}

type Status = "idle" | "sending" | "error" | "sent";

const container: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const t = texts.invitation;
const COUNTER_FROM = ADDRESS_MAX_LENGTH - 60;

export function InvitationScreen({ revealed, onSuccess }: InvitationScreenProps) {
  const inputId = useId();
  const noteId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const length = Array.from(address).length;
  const busy = status === "sending" || status === "sent";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || busy) return;

    const value = address.trim();
    if (!value) {
      setStatus("error");
      setError(t.errors.empty);
      inputRef.current?.focus();
      return;
    }
    if (Array.from(value).length > ADDRESS_MAX_LENGTH) {
      setStatus("error");
      setError(t.errors.tooLong);
      return;
    }

    inFlight.current = true;
    setStatus("sending");
    setError(null);

    const result = await sendRsvp(value);
    inFlight.current = false;

    if (result.ok) {
      setStatus("sent");
      inputRef.current?.blur(); // закрываем клавиатуру перед финальным экраном
      onSuccess();
    } else {
      setStatus("error");
      setError(result.message);
    }
  };

  const buttonLabel =
    status === "sending" ? t.submitting : status === "error" && error !== t.errors.empty ? t.retry : t.submit;

  return (
    <motion.div
      className="relative px-6 pt-10 pb-8 sm:px-9 sm:pt-11 sm:pb-9"
      variants={container}
      initial="hidden"
      animate={revealed ? "shown" : "hidden"}
      aria-hidden={!revealed}
    >
      {/* Веточка с пионом, ранункулюсом и бутонами роз, «заложенная» в уголок открытки */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -left-4 w-[92px] min-[360px]:-left-3 min-[360px]:w-[104px] sm:-top-1 sm:-left-2 sm:w-[118px]"
        style={{ rotate: -16 }}
        variants={{
          hidden: { opacity: 0, scale: 0.85, rotate: -26 },
          shown: { opacity: 1, scale: 1, rotate: -16, transition: { duration: 0.9, ease: easeOut } },
        }}
      >
        <FloralSprig className="h-auto w-full" />
      </motion.div>

      <motion.p
        variants={item}
        className="text-center text-[11px] font-semibold tracking-[0.3em] text-rose-deep uppercase"
      >
        <Hearted text={t.eyebrow} />
      </motion.p>

      <motion.h1
        variants={item}
        className="mx-auto mt-4 max-w-[300px] text-center font-serif text-[38px] leading-[1.02] font-semibold text-balance text-ink sm:text-[42px]"
      >
        {invitationConfig.title}
      </motion.h1>

      <motion.p variants={item} className="mt-3 text-center text-[15px] leading-relaxed text-ink-soft">
        <Hearted text={invitationConfig.subtitle} />
      </motion.p>

      {/* Дата и время — в виде маленького «билета» */}
      <motion.div
        variants={item}
        className="relative mx-auto mt-7 overflow-hidden rounded-[20px] px-5 py-5 text-center"
        style={{
          background: "linear-gradient(180deg, #FDEEF3 0%, #FCE7EF 100%)",
          boxShadow: "inset 0 0 0 1px rgb(239 165 190 / 0.35)",
        }}
      >
        <span aria-hidden="true" className="absolute top-1/2 -left-2.5 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-[inset_-1px_0_0_rgb(239_165_190/0.35)]" />
        <span aria-hidden="true" className="absolute top-1/2 -right-2.5 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-[inset_1px_0_0_rgb(239_165_190/0.35)]" />
        <p className="font-serif text-[30px] leading-none font-semibold whitespace-nowrap text-ink sm:text-[32px]">
          {formatDayMonth(invitationConfig.date)}
          <span className="mx-2 text-rose">·</span>
          {invitationConfig.time}
        </p>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.24em] text-ink-soft uppercase">
          {formatWeekday(invitationConfig.date)}
        </p>
      </motion.div>

      <motion.form variants={item} className="mt-8" onSubmit={submit} noValidate>
        <label htmlFor={inputId} className="block text-center font-serif text-[24px] leading-tight font-semibold text-ink">
          {t.pickupTitle}
        </label>

        <div className="relative mt-4">
          <MapPin
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-rose-deep/70"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="text"
            autoComplete="street-address"
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            maxLength={ADDRESS_MAX_LENGTH}
            placeholder={t.placeholder}
            value={address}
            disabled={busy}
            aria-invalid={status === "error" && error !== null}
            aria-describedby={`${noteId}${error ? ` ${errorId}` : ""}`}
            onChange={(event) => {
              setAddress(event.target.value);
              if (status === "error" && error === t.errors.empty) {
                setStatus("idle");
                setError(null);
              }
            }}
            className="h-[54px] w-full rounded-2xl border border-line bg-canvas pr-4 pl-11 text-[16px] text-ink transition-[border-color,box-shadow,background-color] duration-200 outline-none placeholder:text-ink-soft/60 focus:border-rose focus:bg-white focus:shadow-[0_0_0_4px_rgb(239_165_190/0.22)] disabled:opacity-70"
          />
        </div>

        <div className="mt-2 flex min-h-[20px] items-start justify-between gap-3 px-1">
          <p id={noteId} className="text-[12.5px] leading-snug text-ink-soft/90">
            {t.privacyNote}
          </p>
          {length >= COUNTER_FROM && (
            <span className="shrink-0 text-[12px] text-ink-soft/80 tabular-nums">
              {length}/{ADDRESS_MAX_LENGTH}
            </span>
          )}
        </div>

        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              key={error}
              id={errorId}
              role="alert"
              className="mt-2 flex items-start gap-2 px-1 text-[13px] leading-snug font-medium text-rose-deep"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AlertCircle aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          className="btn btn-primary mt-4 w-full"
          whileTap={busy ? undefined : { scale: 0.97 }}
          transition={tapSpring}
          disabled={busy}
          aria-busy={status === "sending"}
        >
          {status === "sending" ? (
            <Loader2 aria-hidden="true" className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Send aria-hidden="true" className="h-[17px] w-[17px]" />
          )}
          {buttonLabel}
        </motion.button>
      </motion.form>

      <motion.p
        variants={item}
        className="mt-8 text-right font-serif text-[24px] leading-none font-medium text-ink italic"
      >
        <Hearted text={t.signature} size="0.62em" className="ml-0.5" />
      </motion.p>
    </motion.div>
  );
}
