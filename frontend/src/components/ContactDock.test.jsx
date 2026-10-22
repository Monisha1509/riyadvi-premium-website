import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactDock from './ContactDock.jsx';

describe('quick contact links', () => {
  it('provides a working WhatsApp link and preserves the configured number when available', () => {
    render(<ContactDock />);
    expect(screen.getByRole('link', { name: /call riyadvi/i })).toHaveAttribute('href', 'tel:+918072487427');
    const number = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
    const whatsapp = screen.getByRole('link', { name: /contact riyadvi on whatsapp/i });
    expect(whatsapp).toHaveAttribute('target', '_blank');
    expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');
    if (number) expect(whatsapp).toHaveAttribute('href', expect.stringMatching(new RegExp(`^https://wa\\.me/${number}\\?`)));
    else expect(whatsapp).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\/\?text=/));
  });
});
