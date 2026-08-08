/**
 * Social + community links.
 * ---------------------------------------------------------------
 * Single source of truth for every outbound social/community URL
 * on the site. Components import from here and render an icon
 * only when its URL is non-empty — never hardcode a URL in a
 * component, and never leave a link pointing at "#".
 *
 * `whatsappCommunity` doubles as the secondary CTA in the
 * problem-capture section, not just a footer icon.
 */

export type SocialKey = keyof typeof socials;

export const socials = {
  linkedin: '',
  twitter: '',
  instagram: '',
  youtube: '',
  whatsappCommunity: '',
} satisfies Record<string, string>;

/** Display labels used for aria-labels and alt text. Keep in sync with `socials`. */
export const socialLabels: Record<SocialKey, string> = {
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  whatsappCommunity: 'WhatsApp community',
};
