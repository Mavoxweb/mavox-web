import { expect, test, type Page } from "@playwright/test";

type DataLayerEvent = { event?: string; button_location?: string; form_id?: string };

async function dataLayer(page: Page) {
  return page.evaluate(() => (window.dataLayer ?? []) as DataLayerEvent[]);
}

function eventsNamed(layer: DataLayerEvent[], name: string) {
  return layer.filter((item) => item.event === name);
}

async function blockOutbound(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener("click", (event) => {
      const link = (event.target as HTMLElement | null)?.closest("a");
      const href = link?.getAttribute("href") ?? "";
      if (href.includes("wa.me") || href.startsWith("tel:")) event.preventDefault();
    }, true);
  });
}

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => {
    throw error;
  });
  await blockOutbound(page);
});

test("landing de Google Ads: noindex, prova social e links", async ({ page }) => {
  const pixelLogs: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/painel/pixels/log")) pixelLogs.push(request.url());
  });
  const response = await page.goto("/google-ads", { waitUntil: "networkidle" });
  expect(response?.ok()).toBeTruthy();
  expect(pixelLogs).toEqual([]);
  await page.addStyleTag({ content: "main > section { content-visibility: visible !important; }" });

  const html = await page.content();
  const visible = await page.locator("body").innerText();
  expect(html).not.toContain("aggregateRating");
  expect(html).not.toContain("reviewCount");
  expect(visible).not.toMatch(/4[,.]9/);
  expect(html).not.toContain("googletagmanager.com/gtm.js");
  expect(html).toContain("+164");
  expect(visible).toContain("Experiência do fundador");
  expect(visible).toContain("O fundador da Mavox tem +164 projetos entregues");
  expect(visible).not.toMatch(/gestão/i);
  expect(visible).not.toContain("não são clientes");
  expect(visible).not.toContain("O que dá para mostrar");
  expect(visible).toContain("Black November · até 30/11");
  expect(visible).toContain("Pagamento no PIX");
  expect(visible).toContain("Projetos que a Mavox entregou");
  for (const brand of ["Reserva", "Domino's", "Mercedes", "Stone", "Amazon", "Americanas"]) {
    expect(visible).toContain(brand);
  }
  expect(visible).not.toContain("Dalia");

  const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
  expect(robots).toMatch(/noindex/i);

  const home = await page.request.get("/");
  expect(home.ok()).toBeTruthy();
  expect(await home.text()).not.toMatch(/href="\/google-ads"/);

  for (const path of ["/privacidade", "/termos"]) {
    const res = await page.request.get(path);
    expect(res.ok(), path).toBeTruthy();
  }

  const robotsTxt = await page.request.get("/robots.txt");
  expect(robotsTxt.ok()).toBeTruthy();
  expect(await robotsTxt.text()).not.toContain("Disallow: /google-ads");

  for (const url of [
    "https://www.tgxengenharia.com.br/",
    "https://selenita-smart-e-commerce-ai.vercel.app/",
    "https://scapesaude-institucional.vercel.app/",
    "https://www.poupconsig.com.br/",
    "https://lojasdalia.com.br/",
    "https://www.geriatex.com.br/",
    "https://ocafy.vercel.app/",
  ]) {
    await expect(page.locator(`a[href="${url}"]`)).toHaveCount(1);
  }
  const whatsapp = page.locator("a[href*='wa.me']");
  expect(await whatsapp.count()).toBeGreaterThan(0);
  const hrefs = await whatsapp.evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  for (const href of hrefs) expect(href).toContain("5521992855872");

  const shots = page.locator("main img");
  const shotCount = await shots.count();
  for (let i = 0; i < shotCount; i++) {
    const shot = shots.nth(i);
    await shot.scrollIntoViewIfNeeded();
    await shot.evaluate((img: HTMLImageElement) => {
      if (img.complete && img.naturalWidth > 0) return;
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    });
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/opt/cursor/artifacts/google-ads-390.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: "/opt/cursor/artifacts/google-ads-1280.png", fullPage: true });
});

test("validação do formulário e eventos do dataLayer", async ({ page }) => {
  await page.goto("/google-ads");
  await expect(page.locator("#google-ads-lead")).toBeVisible();

  await page.locator("#google-ads-lead button[type='submit']").click();
  await expect(page.getByText("Informe seu nome")).toBeVisible();
  await expect(page.getByText("Informe um WhatsApp válido com DDD")).toBeVisible();
  await expect(page.getByText("Informe a empresa")).toBeVisible();
  await expect(page.getByText("Informe a cidade")).toBeVisible();
  expect(eventsNamed(await dataLayer(page), "generate_lead")).toHaveLength(0);

  await page.locator("input[name='name']").fill("Ana");
  await page.locator("input[name='phone']").fill("11999");
  await page.locator("input[name='company']").fill("Padaria");
  await page.locator("input[name='city']").fill("Rio");
  await page.locator("#google-ads-lead button[type='submit']").click();
  await expect(page.getByText("Informe um WhatsApp válido com DDD")).toBeVisible();
  expect(eventsNamed(await dataLayer(page), "generate_lead")).toHaveLength(0);

  await page.route("**/api/google-ads/leads", (route) =>
    route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ ok: false, error: "Revise os campos e tente de novo." }) }),
  );
  await page.locator("input[name='phone']").fill("21992855872");
  await page.locator("#google-ads-lead button[type='submit']").click();
  await expect(page.getByText("Revise os campos e tente de novo.")).toBeVisible();
  expect(eventsNamed(await dataLayer(page), "generate_lead")).toHaveLength(0);

  await page.unroute("**/api/google-ads/leads");
  await page.route("**/api/google-ads/leads", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, id: "test-lead" }) }),
  );
  await page.locator("#google-ads-lead button[type='submit']").click();
  await expect(page.getByRole("status")).toContainText("Recebemos seus dados");
  const leads = eventsNamed(await dataLayer(page), "generate_lead");
  expect(leads).toHaveLength(1);
  expect(leads[0]).toMatchObject({ event: "generate_lead", form_id: "google-ads-lead", lead_source: "google-ads", offer: "combo" });

  await page.locator("[data-track-location='sucesso']").click();
  await page.locator("[data-track-location='hero']").click();
  await page.locator("[data-track-location='precos-site']").click();
  await page.locator("[data-track-location='flutuante']").click();
  await page.locator("[data-track-location='rodape']").click();

  const layer = await dataLayer(page);
  const whatsapp = eventsNamed(layer, "whatsapp_click");
  expect(whatsapp.map((item) => item.button_location).sort()).toEqual(["flutuante", "hero", "precos-site", "sucesso"]);
  const phones = eventsNamed(layer, "phone_click");
  expect(phones.map((item) => item.button_location)).toEqual(["rodape"]);
});
