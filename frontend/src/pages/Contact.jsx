import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { api } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [failure, setFailure] = useState(false);
  const submitInquiry = async event => {
    event.preventDefault(); setSending(true); setFeedback(''); setFailure(false);
    try { const { data } = await api.post('/inquiries', form); setFeedback(data.message || 'Your message has been sent.'); setForm({ name: '', email: '', message: '' }); }
    catch (err) { setFailure(true); setFeedback(err.response?.data?.message || 'We could not send your message. Please try again.'); }
    finally { setSending(false); }
  };
  return (
    <div className="min-h-screen py-16 bg-[#faf7f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Contact Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans font-light tracking-wide">
            We'd love to hear from you. Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100">
            <h2 className="text-2xl font-serif font-bold mb-6 tracking-wide">Get in Touch</h2>
            <form className="space-y-4" onSubmit={submitInquiry}>
              {feedback && <p role="status" className={`rounded-lg px-4 py-3 text-sm ${failure ? 'bg-rose-50 text-rose-700' : 'bg-green-50 text-green-700'}`}>{feedback}</p>}
              <div>
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Message</label>
                <textarea
                  rows={4}
                  required
                  minLength={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans"
                  placeholder="Your message"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full px-6 py-3 bg-[#4c00b0] text-white rounded-lg font-serif font-medium hover:bg-[#3d008f] transition-colors tracking-wide"
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Phone className="w-6 h-6 text-[#4c00b0]" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-gray-900 mb-1 tracking-wide">Phone</h3>
                <a href="https://wa.me/254794071233" className="text-[#4c00b0] font-sans font-medium underline underline-offset-4">0794 071233 · Message us on WhatsApp</a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Mail className="w-6 h-6 text-[#4c00b0]" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-gray-900 mb-1 tracking-wide">Email</h3>
                  <p className="text-gray-600 font-sans">info@lynmarieboutique.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <MapPin className="w-6 h-6 text-[#4c00b0]" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-gray-900 mb-1 tracking-wide">Location</h3>
                  <p className="text-gray-600 font-sans">Jamia Mall, 1st Floor, Shop F56<br />Tubman Road &amp; Kimathi Street, Nairobi</p>
                  <a href="https://www.google.com/maps/search/?api=1&query=Jamia+Mall%2C+Nairobi" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-[#4c00b0] underline underline-offset-4">Get directions</a>
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-purple-100">
                <iframe
                  title="Map showing Jamia Mall in Nairobi"
                  src="https://www.google.com/maps?q=Jamia+Mall%2C+Nairobi&output=embed"
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
