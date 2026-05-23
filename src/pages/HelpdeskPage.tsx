// Help & Support — WhatsApp + call + email + FAQ.
// Mirrors the mobile app's helpdesk so support feels consistent
// across the two clients.
import { useState } from 'react';
import { TopBar } from '../components/ui';
import StoreList from '../components/StoreList';
import { VIDEO_EMBED } from '../lib/constants';

const PHONE_1 = '0538214744';
const PHONE_2 = '0545989494';
const EMAIL = 'teleportprimegh@gmail.com';
const wa = (phone: string) => `https://wa.me/233${phone.slice(1)}`;

const FAQ = [
  {
    q: 'How do I find a driver?',
    a: "Open the Map tab. Allow location access, then pick your vehicle type or region. Tap any driver to see their profile and request a booking.",
  },
  {
    q: 'How do drivers get paid?',
    a: "Payment is agreed directly between you and the driver. SONKA facilitates the connection. Pay by cash or MoMo as agreed — SONKA takes no commission per trip.",
  },
  {
    q: 'How do I become a driver on SONKA?',
    a: "Go to Profile → Become a driver. Add your vehicle details. To appear on the live map and accept jobs, install the SONKA mobile app and subscribe.",
  },
  {
    q: "Why can't customers find me?",
    a: "You must have an active subscription and be set to Online in the mobile app. If your subscription has expired, renew from your Profile screen.",
  },
  {
    q: 'How do driver levels (Bronze → Platinum) work?',
    a: 'Levels are based on completed trips and your average rating. Bronze starts at signup. Silver requires 50+ trips. Gold requires 200+ trips and a 4.5+ rating.',
  },
  {
    q: 'What vehicles are on SONKA?',
    a: 'SONKA supports Aboboyaa (cargo tricycles), Two Tyres (motorcargo), Kia Truck, Rhino Truck, Light Vehicle, and Trailer.',
  },
  {
    q: 'How do I cancel or change a booking?',
    a: "Go to My Trips. Open the booking and tap Cancel (works while it's still Pending or Accepted). If the trip is in progress, contact the driver directly via chat.",
  },
  {
    q: 'How do I report a driver?',
    a: "On the driver's profile, contact our support team directly via WhatsApp or email below. Include the driver name and trip reference.",
  },
  {
    q: 'Is SONKA available outside Ghana?',
    a: 'SONKA currently operates in Ghana only. Expansion to other West African countries is planned.',
  },
];

export default function HelpdeskPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="screen">
      <TopBar title="Help & Support" back />
      <div className="screen-scroll pad">
        <h1 style={{ fontSize: 22, marginTop: 6 }}>We're here to help</h1>
        <p className="muted" style={{ marginBottom: 14 }}>Reach us anytime — fastest on WhatsApp.</p>

        {/* Video — SONKA in 60 seconds */}
        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: 12,
            marginBottom: 18,
            background: '#000',
          }}
        >
          <iframe
            src={VIDEO_EMBED}
            title="SONKA — how it works"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Contact cards */}
        <div className="section-title" style={{ marginTop: 0 }}>Contact us</div>

        {[PHONE_1, PHONE_2].map((phone) => (
          <div className="card row-between" key={phone}>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>WhatsApp / Call</div>
              <strong style={{ fontSize: 16 }}>{phone}</strong>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <a
                href={wa(phone)}
                target="_blank"
                rel="noopener"
                className="btn btn-sm"
                style={{ width: 'auto', background: '#25D366', color: '#fff' }}
              >
                💬 WhatsApp
              </a>
              <a
                href={`tel:${phone}`}
                className="btn btn-navy btn-sm"
                style={{ width: 'auto' }}
              >
                📞 Call
              </a>
            </div>
          </div>
        ))}

        <div className="card row-between">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Email</div>
            <strong style={{ fontSize: 14 }}>{EMAIL}</strong>
          </div>
          <a
            href={`mailto:${EMAIL}?subject=SONKA Support`}
            className="btn btn-outline btn-sm"
            style={{ width: 'auto' }}
          >
            ✉️ Email
          </a>
        </div>

        {/* Get the app — all stores */}
        <div className="section-title">Get the mobile app</div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
          For live map, push notifications and driver-online mode.
        </p>
        <StoreList />

        {/* FAQ */}
        <div className="section-title">Frequently asked</div>
        <div className="card" style={{ padding: 0 }}>
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            const last = i === FAQ.length - 1;
            return (
              <div
                key={i}
                style={{
                  borderBottom: last ? 'none' : '1px solid var(--off-white)',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    padding: '14px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--navy)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{ color: 'var(--grey)' }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p style={{ padding: '0 16px 14px', fontSize: 14, color: 'var(--dark-grey)' }}>
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
