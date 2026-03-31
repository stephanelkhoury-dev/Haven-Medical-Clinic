"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, User, Phone, ArrowRight, MessageCircle, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { services } from "@/data/services";
import { getBookingWhatsAppUrl } from "@/lib/whatsapp";

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = getBookingWhatsAppUrl(
      formData.service,
      formData.date,
      formData.time,
      formData.name
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">Book an Appointment</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            Request Your Appointment
          </h1>
          <p className="text-dark-light max-w-2xl mx-auto text-lg leading-relaxed">
            Choose your preferred treatment, date, and time. Your submission will be sent directly to our team via WhatsApp for quick confirmation.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <ScrollReveal>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-6">
                  Appointment Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
                      <User className="w-4 h-4 inline mr-1" /> Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-dark placeholder:text-dark-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-dark mb-2">
                      <Phone className="w-4 h-4 inline mr-1" /> Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+961 XX XXX XXX"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-dark placeholder:text-dark-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-dark mb-2">
                      Treatment Selection
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    >
                      <option value="">Select a treatment</option>
                      {services.map((s) => (
                        <option key={s.slug} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                      <option value="General Consultation">General Consultation</option>
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-dark mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" /> Preferred Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-dark mb-2">
                        <Clock className="w-4 h-4 inline mr-1" /> Preferred Time
                      </label>
                      <select
                        id="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      >
                        <option value="">Select time</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-medium hover:bg-primary-dark transition-colors mt-4"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send via WhatsApp
                  </button>

                  <p className="text-xs text-dark-light text-center">
                    Your request will be sent to our team via WhatsApp. We will confirm your appointment within 24 hours.
                  </p>
                </form>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={200}>
                <div className="bg-muted rounded-xl border border-border-light p-6 mb-6">
                  <h3 className="font-semibold text-dark mb-4">How It Works</h3>
                  <div className="space-y-4">
                    {[
                      "Fill in the appointment form with your details",
                      "Click 'Send via WhatsApp' to submit your request",
                      "Our team will confirm availability within 24 hours",
                      "Receive your appointment confirmation",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-dark-light">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted rounded-xl border border-border-light p-6">
                  <h3 className="font-semibold text-dark mb-4">Important Information</h3>
                  <ul className="space-y-3">
                    {[
                      "Appointments are subject to availability",
                      "Please arrive 10 minutes before your appointment",
                      "Cancellations should be made at least 24 hours in advance",
                      "Bring any relevant medical records to your first visit",
                    ].map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-light">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
