"use client";

import { MessageSquare, Send, X } from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from "react";

type TrailChatProps = {
  open: boolean;
  onClose: () => void;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ChatApiResponse = {
  answer?: string;
  error?: string;
};

const openingMessage: ChatMessage = {
  id: "opening",
  role: "assistant",
  content:
    "Trail chat is hitched. Ask about Dennis's background, developer education work, leadership style, or shipped artifacts."
};

function createMessageId() {
  return crypto.randomUUID();
}

function renderChatContent(content: string) {
  const lines = normalizeChatMarkup(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;

  function flushList() {
    if (listItems.length === 0 || !listType) {
      return;
    }

    const items = listItems;
    const currentListType = listType;
    const listClassName =
      "trail-chat-list my-2 space-y-2 pl-7 marker:text-trail-ink";

    blocks.push(
      currentListType === "ol" ? (
        <ol key={`list-${blocks.length}`} className={`${listClassName} list-decimal`}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      ) : (
        <ul key={`list-${blocks.length}`} className={`${listClassName} list-square`}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
    );

    listItems = [];
    listType = null;
  }

  lines.forEach((line) => {
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);

    if (bulletMatch) {
      if (listType && listType !== "ul") {
        flushList();
      }

      listType = "ul";
      listItems.push(bulletMatch[1]);
      return;
    }

    if (numberedMatch) {
      if (listType && listType !== "ol") {
        flushList();
      }

      listType = "ol";
      listItems.push(numberedMatch[1]);
      return;
    }

    flushList();
    blocks.push(
      <p key={`paragraph-${blocks.length}`} className="my-2 first:mt-0 last:mb-0">
        {renderInlineMarkdown(line)}
      </p>
    );
  });

  flushList();

  return <div className="trail-chat-message space-y-2">{blocks}</div>;
}

function normalizeChatMarkup(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\s+-\s+(?=(?:\*\*)?[A-Z0-9])/g, "\n- ")
    .replace(/\s+(\d+[.)])\s+(?=(?:\*\*)?[A-Z0-9])/g, "\n$1 ");
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

export function TrailChat({ open, onClose }: TrailChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([openingMessage]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      messageEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, open]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || pending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent
          }))
        })
      });
      const data = (await response.json().catch(() => ({}))) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "The chat guide could not answer.");
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            data.answer ||
            "The trail guide checked the manifest but returned an empty note."
        }
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The chat guide could not answer.";

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: `${message} Please try another question from the wagon manifest.`
        }
      ]);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 p-3 sm:p-6" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trail-chat-title"
        className="pixel-border ml-auto flex h-full max-w-2xl flex-col bg-trail-panel text-left text-trail-ink shadow-crt"
      >
        <header className="flex items-center justify-between gap-3 border-b-4 border-black p-4">
          <div className="flex min-w-0 items-center gap-3">
            <MessageSquare aria-hidden="true" className="h-7 w-7 shrink-0" />
            <h2 id="trail-chat-title" className="truncate text-3xl uppercase">
              Trail Chat
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pixel-border bg-trail-panel p-2 transition hover:bg-white"
            aria-label="Close trail chat"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[88%] border-4 border-black p-3 text-2xl leading-tight ${
                message.role === "user"
                  ? "ml-auto bg-black text-trail-green"
                  : "bg-trail-paper"
              }`}
            >
              <p className="mb-1 text-xl uppercase">
                {message.role === "user" ? "You" : "Guide"}
              </p>
              {renderChatContent(message.content)}
            </article>
          ))}
          {pending ? (
            <div className="trail-chat-loading text-2xl uppercase" role="status">
              Checking Manifest
            </div>
          ) : null}
          <div ref={messageEndRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t-4 border-black p-4">
          <label htmlFor="trail-chat-input" className="sr-only">
            Ask the trail guide
          </label>
          <div className="flex gap-2">
            <textarea
              id="trail-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={800}
              rows={2}
              disabled={pending}
              placeholder="Ask from the wagon manifest..."
              className="pixel-border min-h-20 flex-1 resize-none bg-white px-3 py-2 text-2xl leading-tight outline-none disabled:cursor-wait disabled:opacity-70"
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              className="pixel-border grid min-h-20 w-20 place-items-center bg-trail-panel transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
              aria-label="Send trail chat message"
            >
              <Send aria-hidden="true" className="h-7 w-7" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
