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
  const response = await page.goto("/google-ads");
  expect(response?.ok()).toBeTruthy();

  const html = await page.content();
  const visible = await page.locator("body").innerText();
  expect(html).not.toContain("aggregateRating");
  expect(html).not.toContain("reviewCount");
  expect(visible).not.toMatch(/4[,.]9/);
  expect(html).not.toContain("googletagmanager.com/gtm.js");
  expect(html).toContain("+164");
  expect(html).toContain("Experiência do fundador");
  expect(html).toContain("não são clientes da Mavox");
  for (const brand of ["Reserva", "Domino's", "Mercedes", "Dalia", "Stone", "Amazon", "Americanas"]) {
    expect(html).toContain(brand);
  }

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

  const whatsapp = page.locator("a[href*='wa.me']");
  expect(await whatsapp.count()).toBeGreaterThan(0);
  const hrefs = await whatsapp.evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  for (const href of hrefs) expect(href).toContain("5521992855872");

  await page.addStyleTag({ content: "main > section { content-visibility: visible !important; }" });
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
