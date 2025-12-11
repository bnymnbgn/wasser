"use client";

export default function PrivacyPage() {
  return (
    <main className="p-4 sm:p-6 md:p-8 space-y-4 text-ocean-primary">
      <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>
      <p className="text-sm text-ocean-secondary">
        Diese App verarbeitet deine eingegebenen und gescannten Wasserwerte lokal bzw. auf unseren
        Servern, um dir Auswertungen und Empfehlungen zu liefern. Wir erfassen nur die Daten, die
        du selbst bereitstellst oder durch Scans importierst.
      </p>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Datenarten</h2>
        <ul className="list-disc list-inside text-sm text-ocean-secondary space-y-1">
          <li>Wasseranalysen (Mineralwerte, Profilwahl, Score)</li>
          <li>Optionale Produktinfos (Marke, Produktname, Barcode)</li>
          <li>Geräte- und Nutzungsdaten (App-Version, Fehlerlogs)</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Zwecke</h2>
        <p className="text-sm text-ocean-secondary">
          Auswertung der Wasserqualität, Personalisierung nach Profil, Vergleichsfunktion und
          Verbesserung der App (Fehleranalyse, Performance).
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Speicherdauer</h2>
        <p className="text-sm text-ocean-secondary">
          Daten bleiben so lange gespeichert, wie du ein Konto nutzt oder sie nicht löscht. Lokale
          Daten kannst du jederzeit entfernen.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Rechte</h2>
        <p className="text-sm text-ocean-secondary">
          Du kannst Auskunft, Berichtigung, Löschung und Export deiner Daten verlangen. Kontaktiere
          uns dafür bitte per E-Mail.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Kontakt / Verantwortlich</h2>
        <p className="text-sm text-ocean-secondary">
          Bitte ergänze hier deine vollständigen Anbieterangaben (Name/Firma, Adresse, E-Mail).
        </p>
      </section>
    </main>
  );
}
