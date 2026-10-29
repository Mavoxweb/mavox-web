export const SITE = {
  name: "Mavox",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mavox.com.br",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5521992855872",
  phone: "(21) 9 9285-5872",
  phoneHref: "tel:+5521992855872",
  emails: ["comercial@mavox.com.br", "suporte@mavox.com.br"],
  address: "Av. Princesa Isabel, 7, sala 731 - Copacabana, Rio de Janeiro - RJ",
socials: [
    { label: "Instagram", href: "https://www.instagram.com/mavox.ag/" },
    { label: "Facebook", href: "https://www.facebook.com/mavoxdigital/" },
  ],
};

export function whatsappLink(message = "Olá! Vim pelo site da Mavox e quero um orçamento.") {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
