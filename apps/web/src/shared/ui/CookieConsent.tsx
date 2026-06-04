"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@open-cinema/ui";
import { routes } from "@/shared/lib/routes";
import {
  getCookieConsentStatus,
  setCookieConsentAccepted
} from "@/shared/legal/cookieConsent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsentStatus() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    setCookieConsentAccepted();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-lg border border-border bg-card p-4 shadow-lg sm:p-5">
        <p id="cookie-consent-title" className="text-sm font-medium text-foreground">
          Мы используем файлы cookie
        </p>
        <p
          id="cookie-consent-description"
          className="mt-2 text-sm text-muted-foreground leading-relaxed"
        >
          Сайт использует cookie для входа в аккаунт, сохранения настроек и
          аналитики работы сервиса. Продолжая пользоваться сайтом, вы соглашаетесь
          с их использованием. Подробнее — в{" "}
          <Link
            href={routes.legalCookies}
            className="text-primary font-medium hover:underline"
          >
            политике cookie
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" className="sm:min-w-32" onClick={accept}>
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
