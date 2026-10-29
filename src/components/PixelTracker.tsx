"use client";

import Script from "next/script";

interface PixelTrackerProps {
  metaPixelId?: string;
  googleTagId?: string;
  gtmId?: string;
  metaCapiAccessToken?: string;
  metaCapiPixelId?: string;
}

export function PixelTracker({ metaPixelId, googleTagId, gtmId, metaCapiAccessToken, metaCapiPixelId }: PixelTrackerProps) {
  return (
    <>
      {/* Google Tag Manager (GTM) — Container */}
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

      {/* Meta Pixel Script (cliente) */}
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

      {/* Meta CAPI — server-side event (dedup com event_id) */}
      {metaCapiAccessToken && metaCapiPixelId && (
        <Script id="meta-capi-server" strategy="afterInteractive">
          {`
            (function(){
              var event_id = '${Date.now()}-' + Math.random().toString(36).slice(2);
              fetch('https://graph.facebook.com/v18.0/${metaCapiPixelId}/events?access_token=${metaCapiAccessToken}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  data: [{ event_name: 'PageView', event_time: Math.floor(Date.now()/1000), event_id: event_id, user_data: { client_ip_address: '', client_user_agent: navigator.userAgent }, action_source: 'website' }],
                  test_event_code: ''
                })
              }).catch(function(){});
            })();
          `}
        </Script>
      )}

      {/* Google Tag (gtag.js) */}
      {googleTagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag-dynamic" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTagId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

