const phone = (import.meta.env.VITE_WHATSAPP_NUMBER || '254794071233').replace(/\D/g, '');

export default function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent('Hello LynMarie Boutique, I have an enquiry.')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with LynMarie Boutique on WhatsApp"
      title="Chat with LynMarie Boutique on WhatsApp"
      className="fixed bottom-5 right-5 z-[70] grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#1fb956] focus:outline-none focus:ring-4 focus:ring-green-200"
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor">
        <path d="M16.04 3C9.01 3 3.29 8.7 3.29 15.72c0 2.24.59 4.42 1.71 6.35L3 29l7.1-1.86a12.75 12.75 0 0 0 5.93 1.47h.01c7.02 0 12.74-5.71 12.75-12.73A12.67 12.67 0 0 0 25.06 6.8 12.66 12.66 0 0 0 16.04 3Zm0 23.46h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.21 1.1 1.12-4.1-.25-.42a10.58 10.58 0 0 1-1.63-5.61c0-5.84 4.75-10.59 10.6-10.59 2.83 0 5.49 1.1 7.49 3.11a10.52 10.52 0 0 1 3.1 7.5c0 5.84-4.75 10.59-10.42 10.72Zm5.82-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.36.23-.68.08-.32-.16-1.34-.5-2.55-1.58-.94-.83-1.58-1.86-1.76-2.18-.19-.31-.02-.48.14-.64.14-.14.32-.37.47-.55.16-.18.21-.31.32-.53.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.65.76.24 1.45.2 1.99.12.61-.09 1.88-.77 2.15-1.5.26-.74.26-1.37.18-1.5-.08-.14-.29-.22-.61-.38Z" />
      </svg>
    </a>
  );
}
