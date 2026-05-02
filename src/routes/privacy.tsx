import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'

export const Route = createFileRoute('/privacy')({
  component: PrivacyComponent,
})

function PrivacyComponent() {
  return (
    <div className="max-w-3xl mx-auto py-20 space-y-8">
      <Helmet>
        <title>Privacy Policy | TVTRACK</title>
        <meta name="description" content="Privacy policy and data handling practices for TVTRACK." />
      </Helmet>
      
      <h1 className="text-4xl font-black tracking-tighter">Privacy Policy</h1>
      <p className="text-muted-foreground italic">Last Updated: May 2026</p>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Data We Collect</h2>
        <p className="text-muted-foreground">
          TVTRACK is designed to be privacy-first. We primarily store your data (watchlist, recently viewed, settings) locally in your browser's LocalStorage. 
          If you choose to create an account, we store your email and basic profile information using Firebase/Supabase.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. How We Use Data</h2>
        <p className="text-muted-foreground">
          Your data is used solely to provide and improve the countdown services. We do not sell your personal data to third parties.
          Anonymous analytics may be used to understand trending shows globally.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. Third-Party Services</h2>
        <p className="text-muted-foreground">
          We use the TVMaze API for show data. Please refer to their privacy policy regarding their data handling.
          Payments (when implemented) will be handled securely via Stripe.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. Cookies</h2>
        <p className="text-muted-foreground">
          We use essential cookies for authentication and to remember your preferences. You can manage these through your browser settings.
        </p>
      </section>
    </div>
  )
}
