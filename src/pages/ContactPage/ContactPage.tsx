import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { useState } from 'react';
import { contactService } from '../../services/contactService';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { SEO } from '../../components/atoms/SEO';

export function ContactPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await contactService.sendMessage({
        name: formData.name,
        email: formData.email,
        title: formData.subject,
        content: formData.message
      });
      
      if (response.status) {
        alert(response.message || t('messageSentSuccess'));
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        alert(response.message || t('messageSentError'));
      }
    } catch (error) {
      alert(t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: '📍',
      title: t('visitUs'),
      details: [settings?.address || '123 Business Street', 'New York, NY 10001', 'United States']
    },
    {
      icon: '📞',
      title: t('callUs'),
      details: [settings?.phone_1 || '+1 (555) 123-4567', settings?.phone_2 || '', 'Mon-Fri: 9AM - 6PM']
    },
    {
      icon: '📧',
      title: t('emailUs'),
      details: [settings?.email || 'support@example.com']
    },
    {
      icon: '💬',
      title: t('liveSupport'),
      details: ['Available 24/7', 'Average response: 2 min', 'Click to start chat']
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <SEO title={t('contactUs')} />
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('contactUs'), path: '/contact' }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mb-16 px-4">
        <div className="text-7xl mb-6 animate-bounce inline-block">📞</div>
        <h1 
          className="text-6xl font-black mb-6"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {t('getInTouch')}
        </h1>
        <p 
          className="text-2xl max-w-2xl mx-auto leading-relaxed"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('contactSubtitle')}
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {contactInfo.map((info, index) => (
          <div
            key={index}
            className="p-8 rounded-[35px] transition-all duration-500 hover:scale-105 hover:shadow-2xl group"
            style={{
              background: tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              boxShadow: mode === 'light' ? '0 10px 30px rgba(0,0,0,0.05)' : '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto transform transition-transform group-hover:rotate-12 duration-500"
              style={{
                background: tokens.gradients.primary,
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
              }}
            >
              <span className="text-4xl">{info.icon}</span>
            </div>
            <h3 
              className="text-2xl font-black mb-4 text-center"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {info.title}
            </h3>
            <div className="space-y-2 text-center">
              {info.details.filter(d => !!d).map((detail, idx) => (
                <p 
                    key={idx}
                    className="text-sm font-bold"
                    style={{ color: tokens.colors[mode].text.secondary }}
                >
                  {detail}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Form & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {/* Contact Form */}
        <div
          className="p-10 rounded-[40px] shadow-2xl overflow-hidden relative"
          style={{
            background: tokens.colors[mode].surface.elevated,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
          }}
        >
          <div className="absolute top-0 left-0 w-2 h-full" style={{ background: tokens.gradients.primary }} />
          
          <h2 
            className="text-4xl font-black mb-8"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('sendUsMessage')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-black uppercase tracking-widest mb-2 px-1"
                    style={{ color: tokens.colors[mode].text.tertiary }}
                  >
                    {t('fullName')} *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-black uppercase tracking-widest mb-2 px-1"
                    style={{ color: tokens.colors[mode].text.tertiary }}
                  >
                    {t('emailAddress')} *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-black uppercase tracking-widest mb-2 px-1"
                    style={{ color: tokens.colors[mode].text.tertiary }}
                  >
                    {t('phoneNumber')}
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-black uppercase tracking-widest mb-2 px-1"
                    style={{ color: tokens.colors[mode].text.tertiary }}
                  >
                    {t('subject')} *
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    required
                  />
                </div>
            </div>

            <div>
              <label 
                className="block text-sm font-black uppercase tracking-widest mb-2 px-1"
                style={{ color: tokens.colors[mode].text.tertiary }}
              >
                {t('message')} *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows={6}
                required
                className="w-full px-6 py-4 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-bold"
                style={{
                  backgroundColor: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                  borderColor: tokens.colors[mode].border.DEFAULT,
                  color: tokens.colors[mode].text.primary
                }}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-black text-xl py-8 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              loading={loading}
              type="submit"
            >
              {loading ? (mode === 'dark' ? '...' : '...') : t('sendMessage')} {loading ? '' : '📤'}
            </Button>
          </form>
        </div>

        {/* Map & Additional Info */}
        <div className="space-y-8">
          {/* Map Placeholder */}
          <div
            className="rounded-[40px] overflow-hidden shadow-2xl relative group"
            style={{
              background: tokens.colors[mode].surface.elevated,
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              height: '450px'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <div 
              className="w-full h-full flex items-center justify-center p-8 text-center"
              style={{
                background: mode === 'light'
                  ? `linear-gradient(135deg, ${tokens.colors.light.background.subtle} 0%, ${tokens.colors.light.border.DEFAULT} 100%)`
                  : `linear-gradient(135deg, ${tokens.colors.dark.surface.elevated} 0%, ${tokens.colors.dark.surface.base} 100%)`
              }}
            >
              <div className="text-center transform transition-transform duration-500 group-hover:scale-110">
                <div className="text-8xl mb-6">🗺️</div>
                <p 
                  className="text-3xl font-black mb-4"
                  style={{ color: tokens.colors[mode].text.primary }}
                >
                  {t('mapLocation')}
                </p>
                <p 
                  className="text-lg font-bold max-w-md mx-auto"
                  style={{ color: tokens.colors[mode].text.secondary }}
                >
                  {settings?.address || '123 Business Street, New York, NY 10001'}
                </p>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div
            className="p-10 rounded-[40px] shadow-2xl"
            style={{
              background: tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
            }}
          >
            <h3 
              className="text-3xl font-black mb-8 flex items-center gap-3"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              <span className="text-4xl">⏰</span> {t('businessHours')}
            </h3>
            <div className="space-y-4">
              {[
                { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
                { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                { day: 'Sunday', hours: 'Closed' }
              ].map((schedule, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-4 border-b last:border-0"
                  style={{
                    borderColor: tokens.colors[mode].border.DEFAULT
                  }}
                >
                  <span 
                    className="font-black text-lg"
                    style={{ color: tokens.colors[mode].text.primary }}
                  >
                    {schedule.day}
                  </span>
                  <span 
                    className="font-bold text-lg"
                    style={{ color: tokens.colors[mode].text.secondary }}
                  >
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 
            className="text-5xl font-black mb-6"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('faqs')}
          </h2>
          <p 
            className="text-2xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('faqsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              question: 'What are your shipping options?',
              answer: 'We offer standard, express, and overnight shipping options. Free shipping on orders over $100.'
            },
            {
              question: 'How can I track my order?',
              answer: 'Once your order ships, you\'ll receive a tracking number via email to monitor your delivery.'
            },
            {
              question: 'What is your return policy?',
              answer: 'We accept returns within 30 days of purchase. Items must be unused and in original packaging.'
            },
            {
              question: 'Do you ship internationally?',
              answer: 'Yes, we ship to over 100 countries worldwide. Shipping costs vary by location.'
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="p-10 rounded-[35px] transition-all duration-300 hover:scale-[1.02] shadow-lg group"
              style={{
                background: tokens.colors[mode].surface.elevated,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
              }}
            >
              <h4 
                className="text-2xl font-black mb-4 group-hover:text-primary transition-colors"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {faq.question}
              </h4>
              <p 
                className="text-lg leading-relaxed font-bold"
                style={{ color: tokens.colors[mode].text.secondary }}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
