import React from 'react';
import { Phone } from 'lucide-react';

const phone = '+918072487427';
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
function WhatsAppMark(){return <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.002-5.45 4.437-9.884 9.89-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 0 5.495 0 12.05c0 2.12.554 4.19 1.61 6.016L0 24.17l6.25-1.64a12.02 12.02 0 0 0 5.78 1.473h.005c6.554 0 12.05-5.495 12.05-12.05 0-3.22-1.255-6.247-3.53-8.518z"/></svg>}
export default function ContactDock(){
  return <aside className="contact-dock" aria-label="Quick contact options">
    <a className="contact-dock-call" href={`tel:${phone}`} aria-label="Call Riyadvi at +91 80724 87427" title="Call +91 80724 87427"><Phone size={20}/><span>Call us</span></a>
    <a className="contact-dock-whatsapp" href={`https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent('Hello Riyadvi, I would like to discuss a project.')}`} target="_blank" rel="noopener noreferrer" aria-label="Contact Riyadvi on WhatsApp" title={whatsappNumber ? 'Chat on WhatsApp' : 'Open WhatsApp and choose a contact'}><WhatsAppMark/><span>WhatsApp</span></a>
  </aside>
}
