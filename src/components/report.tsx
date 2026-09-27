import { CheckCircle2, Paperclip, RefreshCw, Shield } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ABUSE_TYPES } from "@/data/content";
import { submitReport } from "@/lib/report-submit";
import { cn } from "@/lib/utils";

type Errors = {
  tipo?: string;
  relato?: string;
  captcha?: string;
};

function makeCaptcha() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, answer: a + b };
}

function protocolId(prefix = "HAD") {
  const year = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${n}`;
}

type ReportProps = {
  /** Quando usado na aba Delavy: texto e identidade de denúncia */
  variant?: "default" | "delavy";
};

export function Report({ variant = "default" }: ReportProps) {
  const isDelavy = variant === "delavy";
  const [anon, setAnon] = useState(false);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [servidor, setServidor] = useState("");
  const [acusado, setAcusado] = useState("");
  const [tipo, setTipo] = useState("");
  const [relato, setRelato] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [captcha, setCaptcha] = useState({ a: 3, b: 4, answer: 7 });
  const [captchaValue, setCaptchaValue] = useState("");
  const [honey, setHoney] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCaptcha(makeCaptcha());
  }, []);

  const fileLabel = useMemo(() => {
    if (files.length === 0) return "Nenhum arquivo selecionado";
    return files.map((f) => f.name).join(", ");
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    // Máx. 5 arquivos · 8 MB cada (Telegram + payload do servidor)
    const MAX = 5;
    const MAX_BYTES = 8 * 1024 * 1024;
    const next = Array.from(list)
      .filter((f) => f.size > 0 && f.size <= MAX_BYTES)
      .slice(0, MAX);
    setFiles(next);
    if (list.length > next.length) {
      setSubmitError(
        "Alguns arquivos foram ignorados (máx. 5 · até 8 MB cada · imagens, PDF, vídeo).",
      );
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1]! : result;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    setSubmitError(null);

    if (honey) return;

    if (!tipo) next.tipo = "Selecione o tipo de mensagem.";
    if (relato.trim().length < 10) {
      next.relato = "Descreva o ocorrido com pelo menos 10 caracteres.";
    }
    if (Number(captchaValue) !== captcha.answer) {
      next.captcha = "Resposta incorreta. Tente de novo.";
      setCaptcha(makeCaptcha());
      setCaptchaValue("");
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const id = protocolId(isDelavy ? "DEL" : "HAD");

    setSubmitting(true);
    try {
      const attachments = await Promise.all(
        files.slice(0, 5).map(async (f) => ({
          name: f.name,
          size: f.size,
          type: f.type || "application/octet-stream",
          base64: await fileToBase64(f),
        })),
      );

      const payload = {
        id,
        at: new Date().toISOString(),
        nome: anon ? "Anônimo" : nome.trim() || "Não informado",
        contato: contato.trim() || null,
        servidor: servidor.trim() || null,
        acusado: acusado.trim() || null,
        tipo,
        relato: relato.trim(),
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        attachments,
        anon,
        channel: (isDelavy ? "delavy" : "hadmage") as "delavy" | "hadmage",
      };

      try {
        const key = isDelavy ? "delavy-reports" : "hadmage-reports";
        const prev = JSON.parse(localStorage.getItem(key) || "[]") as unknown[];
        const stored = {
          ...payload,
          attachments: undefined,
        };
        localStorage.setItem(key, JSON.stringify([stored, ...prev].slice(0, 40)));
      } catch {
        /* storage may be blocked */
      }

      const result = await submitReport({ data: payload });
      if (!result.ok) {
        setSubmitError(
          result.error ||
            "Não foi possível enviar ao Telegram. Tente de novo em instantes.",
        );
        return;
      }
      if (result.filesFailed > 0 && result.filesSent === 0 && attachments.length > 0) {
        setSubmitError(
          "Denúncia enviada, mas os anexos falharam no Telegram. Tente arquivos menores.",
        );
      }
      setSent(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha de rede ao enviar a denúncia.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <section className="panel-enter mx-auto w-[min(720px,92%)] py-16 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h2 className="display mt-5 text-[clamp(2rem,4vw,3rem)] text-primary-hot">
          Denúncia registrada
        </h2>
        <p className="mt-4 text-muted">
          {isDelavy
            ? "Sua denúncia chegou ao coletivo Delavy. Guarde o protocolo se quiser acompanhar depois."
            : "Sua mensagem chegou ao grupo HADMAGE. Guarde o protocolo se quiser acompanhar depois."}
        </p>
        <p className="display mt-6 text-2xl tabular-nums tracking-[0.12em] text-fg">{sent}</p>
        <p className="mt-6 text-sm text-muted">
          {isDelavy
            ? "Obrigado. A equipe analisa com discrição e prioriza a proteção das vítimas."
            : "Obrigado pelo contato — respondemos quando fizer sentido para o grupo."}
        </p>
        <Button
          className="mt-8"
          variant="outline"
          onClick={() => {
            setSent(null);
            setNome("");
            setContato("");
            setServidor("");
            setAcusado("");
            setTipo("");
            setRelato("");
            setFiles([]);
            setAnon(false);
            setCaptcha(makeCaptcha());
            setCaptchaValue("");
          }}
        >
          Enviar outra mensagem
        </Button>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "panel-enter mx-auto grid w-[min(1120px,92%)] gap-10 py-12 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:py-16",
        isDelavy && "delavy-report border-t border-[var(--delavy-border,#2a2e36)] pt-14",
      )}
    >
      <div>
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
          {isDelavy ? "Denúncia" : "Contato"}
        </p>
        <h2 className="display mt-2 text-[clamp(2rem,4vw,3.1rem)] font-semibold text-primary-hot">
          {isDelavy ? "Canal de denúncias" : "Fale com a gente"}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          {isDelavy
            ? "Envie relatos de abusos digitais, panelas, chantagem ou exposição de menores. O coletivo Delavy analisa evidências com discrição e prioriza o encaminhamento responsável."
            : "Canal para mensagens ao grupo HADMAGE. Use com respeito — somos um círculo privado de amigos, não um atendimento público."}
        </p>
        <ul className="mt-6 grid gap-3 text-sm text-muted">
          <li className="flex gap-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
            {isDelavy
              ? "Relatos tratados com sigilo e cuidado com as vítimas"
              : "Mensagens tratadas com discrição"}
          </li>
          <li className="flex gap-3">
            <Paperclip className="mt-0.5 size-4 shrink-0 text-primary" />
            Anexos permitidos (prints, arquivos, links)
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            {isDelavy
              ? "Preservação de evidências digitais quando possível"
              : "Retorno só se você deixar um contato"}
          </li>
        </ul>
        <p className="mt-8 rounded-lg border border-border bg-bg-elevated/80 px-4 py-3 text-sm leading-relaxed text-muted">
          {isDelavy
            ? "A Delavy não substitui boletim de ocorrência, Conselho Tutelar ou polícia. Em risco imediato, acione as autoridades. Este canal ajuda a organizar evidências e encaminhamentos."
            : "Hadmage não substitui boletim de ocorrência, Conselho Tutelar ou grupo. Mensagens são lidas com discrição."}
        </p>
      </div>

      <form
        className="grid gap-4 rounded-xl border border-border bg-bg-elevated p-6 md:p-7"
        onSubmit={onSubmit}
        noValidate
      >
        <label className="sr-only">
          Não preencha
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
            className="hidden"
          />
        </label>

        <Field label="Seu nome" hint="opcional">
          <input
            className="field-input"
            id="nome"
            name="nome"
            autoComplete="name"
            disabled={anon}
            placeholder={anon ? "Denúncia anônima" : "Como podemos te chamar?"}
            value={anon ? "" : nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>

        <Field label="E-mail ou contato para retorno" hint="opcional">
          <input
            className="field-input"
            id="contato"
            name="contato"
            placeholder="Discord, Telegram ou e-mail"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Servidor / grupo">
            <input
              className="field-input"
              id="servidor"
              placeholder="Nome ou link do Discord"
              value={servidor}
              onChange={(e) => setServidor(e.target.value)}
            />
          </Field>
          <Field label="Apelido(s) envolvido(s)">
            <input
              className="field-input"
              id="acusado"
              placeholder="@usuario, @outro..."
              value={acusado}
              onChange={(e) => setAcusado(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Tipo de mensagem" required error={errors.tipo}>
          <select
            className="field-input"
            id="tipo"
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Selecione...</option>
            {ABUSE_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descreva o que aconteceu" required error={errors.relato}>
          <textarea
            className="field-input"
            id="relato"
            rows={6}
            required
            placeholder="Detalhes, horários, links, quem estava envolvido..."
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
          />
        </Field>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium">
            Anexos{" "}
            <span className="font-normal text-muted">
              (prints sobem pro Telegram · máx. 5 · 8 MB cada)
            </span>
          </span>
          <label
            className={cn(
              "grid cursor-pointer gap-1 rounded-md border border-dashed border-border bg-bg px-5 py-5 text-center transition-[border-color,background-color] duration-150",
              dragging && "border-primary bg-primary/15",
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              className="sr-only"
              multiple
              accept="image/*,video/*,.pdf,.txt,.zip"
              onChange={(e) => addFiles(e.target.files)}
            />
            <span className="text-sm font-medium">Clique ou arraste arquivos aqui</span>
            <span className="text-xs text-muted">{fileLabel}</span>
          </label>
        </div>

        <label className="flex min-h-11 items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={anon}
            onChange={(e) => setAnon(e.target.checked)}
          />
          Enviar de forma anônima (omitir nome)
        </label>

        <Field label="Verificação anti-robô" required error={errors.captcha}>
          <div className="grid grid-cols-[1fr_minmax(5.5rem,7.5rem)_2.75rem] gap-2.5 max-sm:grid-cols-[1fr_2.75rem]">
            <span className="flex min-h-[46px] items-center rounded-md border border-border bg-bg px-3.5 text-sm font-semibold">
              Quanto é {captcha.a} + {captcha.b}?
            </span>
            <input
              className="field-input max-sm:col-span-2"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Resposta"
              required
              value={captchaValue}
              onChange={(e) => setCaptchaValue(e.target.value)}
            />
            <button
              type="button"
              className="grid h-[46px] place-items-center rounded-md border border-border bg-surface text-fg transition-[border-color,color] duration-150 hover:border-primary hover:text-primary-hot"
              aria-label="Gerar nova pergunta"
              onClick={() => {
                setCaptcha(makeCaptcha());
                setCaptchaValue("");
              }}
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </Field>

        {submitError ? (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" size="block" disabled={submitting}>
          {submitting
            ? "Enviando..."
            : isDelavy
              ? "Enviar denúncia"
              : "Enviar mensagem"}
        </Button>
        <p className="text-center text-xs text-muted">
          {isDelavy
            ? "Ao enviar, a denúncia é encaminhada ao grupo Delavy no Telegram."
            : "Ao enviar, você compartilha estas informações com o Coletivo Hadmage."}
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">
        {label}{" "}
        {required ? <span className="text-primary">*</span> : null}
        {hint ? <span className="font-normal text-muted"> ({hint})</span> : null}
      </span>
      {children}
      <span className="min-h-4 text-xs text-primary">{error ?? ""}</span>
    </label>
  );
}
