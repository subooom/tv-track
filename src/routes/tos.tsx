import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'

export const Route = createFileRoute('/tos')({
  component: TOSComponent,
})

function TOSComponent() {
  return (
    <div className="max-w-3xl mx-auto py-20 space-y-8">
      <Helmet>
        <title>Terms of Service | TVTRACK</title>
        <meta name="description" content="Terms of service and usage guidelines for TVTRACK." />
      </Helmet>
      
      <h1 className="text-4xl font-black tracking-tighter">Terms of Service</h1>
      <p className="text-muted-foreground italic">Last Updated: May 2026</p>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using TVTRACK, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use this application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. Use of Service</h2>
        <p className="text-muted-foreground">
          TVTRACK provides TV show tracking and countdown information. This information is provided "as is" and is sourced from third-party APIs (TVMaze). We do not guarantee the accuracy of network schedules or premiere dates.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. User Conduct</h2>
        <p className="text-muted-foreground">
          You agree not to use the service for any unlawful purpose or to conduct any activity that would harm the service or its users. Scraping our site or our data sources in an abusive manner is prohibited.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. Intellectual Property</h2>
        <p className="text-muted-foreground">
          The TVTRACK brand, logo, and custom code are property of TVTRACK. TV show posters, titles, and descriptions are properties of their respective copyright holders and are used under the TVMaze API's data license.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          TVTRACK shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
        </p>
      </section>
    </div>
  )
}
