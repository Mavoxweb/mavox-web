"use client";

import Script from "next/script";

interface PixelTrackerProps {
  metaPixelId?: string;
  gtmId?: string;
  tiktokPixelId?: string;
  metaCapiAccessToken?: string;
  metaCapiPixelId?: string;
}

export function PixelTracker({
  metaPixelId,
  gtmId,
  tiktokPixelId,
  metaCapiAccessToken,
  metaCapiPixelId,
}: PixelTrackerProps) {
  return (
    <>
      {/* Google Tag Manager (GTM) — Container único para GA4 + pixels */}
      {gtmId && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {/* Meta Pixel (cliente) — inicializa fbq e dispara PageView */}
      {metaPixelId && (
        <Script id="meta-pixel-dynamic" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* TikTok Pixel (cliente) */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel-dynamic" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
              ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
              for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
              ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < e.length; n++) ttq.track.apply(ttq, e[n]); ttq._i[t] = [] };
              ttq.load = function (e, n) { var i = d.createElement("script"); i.async = !0; i.src = "https://analytics.tiktok.com/i18n/pixel/events.js"; n = d.getElementsByTagName("script")[0]; n.parentNode.insertBefore(i, n); ttq.instance(e); ttq.load = function () {} };
              ttq.load("${tiktokPixelId}");
              ttq.page();
            }(window, document, "ttq");
          `}
        </Script>
      )}

      {/* Meta CAPI (server-side via fetch no cliente) — deduplicação com event_id compartilhado */}
      {metaPixelId && metaCapiAccessToken && metaCapiPixelId && (
        <Script id="meta-capi-dedup" strategy="afterInteractive">
          {`
            (function() {
              // Gera event_id compartilhado entre cliente (fbq) e servidor (CAPI)
              window._mavoxEventId = window._mavoxEventId || (Date.now().toString(36) + Math.random().toString(36).slice(2));

              // Intercepta fbq para capturar event_id do PageView cliente
              var originalFbq = window.fbq;
              if (originalFbq) {
                window.fbq = function() {
                  if (arguments[0] === 'track' && arguments[1] === 'PageView') {
                    // Adiciona event_id ao PageView cliente para deduplicação
                    arguments[3] = arguments[3] || {};
                    arguments[3].eventID = window._mavoxEventId;
                  }
                  return originalFbq.apply(this, arguments);
                };
              }

              // Dispara CAPI server-side com mesmo event_id
              var event_id = window._mavoxEventId;
              fetch('https://graph.facebook.com/v18.0/${metaCapiPixelId}/events?access_token=${metaCapiAccessToken}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  data: [{
                    event_name: 'PageView',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: event_id,
                    user_data: {
                      client_ip_address: '',
                      client_user_agent: navigator.userAgent,
                      fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || '',
                      fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || '',
                    },
                    action_source: 'website'
                  }],
                  test_event_code: ''
                })
              }).catch(function(err) { console.warn('Meta CAPI PageView failed:', err); });

              // Renova event_id a cada navegação (para SPAs)
              var originalPushState = history.pushState;
              history.pushState = function() {
                window._mavoxEventId = Date.now().toString(36) + Math.random().toString(36).slice(2);
                originalPushState.apply(this, arguments);
              };
              window.addEventListener('popstate', function() {
                window._mavoxEventId = Date.now().toString(36) + Math.random().toString(36).slice(2);
              });
            })();
          `}
        </Script>
      )}

      {/* Hook global para log de eventos (PIX06 - Debug Console) */}
      <Script id="pixel-event-logger" strategy="afterInteractive">
        {`
          (function() {
            window._mavoxPixelLog = window._mavoxPixelLog || function(eventName, pixelType, pixelId, eventData, eventId) {
              fetch('/api/painel/pixels/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  event_name: eventName,
                  pixel_type: pixelType,
                  pixel_id: pixelId,
                  event_data: eventData,
                  event_id: eventId
                })
              }).catch(function() {});
            };

            // Log automático de dataLayer pushes
            var originalPush = Array.prototype.push;
            var dataLayer = window.dataLayer = window.dataLayer || [];
            dataLayer.push = function() {
              for (var i = 0; i < arguments.length; i++) {
                var item = arguments[i];
                if (item && item.event && window.location.pathname.indexOf("/painel") === 0) {
                  window._mavoxPixelLog(item.event, 'gtm', '', item);
                }
              }
              return originalPush.apply(this, arguments);
            };
          })();
        `}
      </Script>
    </>
  );
}