import { useEffect, useRef } from "react";
import { turnstileEnabled, turnstileSiteKey, turnstileTestToken } from "./turnstileConfig.js";

const SCRIPT_ID = "cloudflare-turnstile-script";

export const TurnstileWidget = ({ onVerify, className = "" }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    if (turnstileTestToken) {
      onVerifyRef.current?.(turnstileTestToken);
      return undefined;
    }

    if (!turnstileEnabled || !containerRef.current) {
      onVerifyRef.current?.("");
      return undefined;
    }

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      if (widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "light",
        callback: (token) => onVerifyRef.current?.(token),
        "expired-callback": () => onVerifyRef.current?.(""),
        "error-callback": () => onVerifyRef.current?.(""),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(SCRIPT_ID);
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
      return () => {
        cancelled = true;
        script?.removeEventListener("load", renderWidget);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (!turnstileEnabled) {
    return null;
  }

  if (turnstileTestToken) {
    return (
      <div
        data-turnstile-test="true"
        className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500 ${className}`.trim()}
      >
        Verification ready.
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
};
