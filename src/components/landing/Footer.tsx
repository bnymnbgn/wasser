"use client";

import { motion } from "framer-motion";
import { Droplet, Github, Twitter, Mail, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "So funktioniert's", href: "#how-it-works" },
      { name: "Profile", href: "#features" },
      { name: "App starten", href: "/dashboard" },
    ],
    resources: [
      { name: "Onboarding", href: "/onboarding" },
      { name: "Scan-Verlauf", href: "/history" },
      { name: "Wissen & Guides", href: "/onboarding" },
      { name: "FAQ", href: "#faq" },
    ],
    legal: [
      { name: "Datenschutz", href: "/privacy" },
      { name: "Impressum", href: "/imprint" },
      { name: "Nutzungsbedingungen", href: "/terms" },
      { name: "Open Source Lizenzen", href: "/licenses" },
    ],
  };

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <Link href="/" className="inline-flex items-center gap-3 group">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Droplet className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-2xl font-bold text-white">
                  Wasserscan
                </span>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 leading-relaxed mb-6 max-w-md"
            >
              Die intelligente App für Wasserqualität. Scanne Etiketten, erhalte
              detaillierte Analysen und triff fundierte Entscheidungen für deine
              Gesundheit.
            </motion.p>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-3"
            >
              {[
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Mail, href: "mailto:contact@example.com", label: "Email" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (categoryIndex + 1) }}
            >
              <h3 className="text-white font-semibold mb-4 capitalize">
                {category === "product"
                  ? "Produkt"
                  : category === "resources"
                  ? "Ressourcen"
                  : "Rechtliches"}
              </h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200 inline-block"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-slate-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-slate-500 text-sm">
              © {currentYear} Wasserscan. Alle Rechte vorbehalten.
            </p>

            {/* Made with love */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </motion.div>
              <span>in Germany</span>
            </div>

            {/* Badges */}
            <div className="flex gap-3">
              {[
                { icon: "🔒", text: "DSGVO" },
                { icon: "🇩🇪", text: "Made in DE" },
                { icon: "✅", text: "Open Source" },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50"
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {badge.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Version info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-slate-600">
            Version 1.0.0 • Built with Next.js, React & Tailwind CSS
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </footer>
  );
}
