import { Link } from 'react-router-dom'

const COMMITMENTS = [
  ['Exports gratuits sans filigrane', 'Vos documents vous appartiennent et ne portent pas de publicité.'],
  ['Vos mots, votre parcours', 'Folio ne rédige pas de fausses expériences : vous fournissez les faits.'],
  ['Vous gardez le contrôle', 'Vous pouvez supprimer votre compte à tout moment.'],
]

const STEPS = [
  'Choisissez un thème qui correspond à votre activité.',
  'Ajoutez vos expériences, formations, compétences et projets.',
  'Personnalisez les couleurs, la photo et l’ordre des sections.',
  'Vérifiez le résultat puis exportez en PDF, Word ou HTML.',
]

const FAQ = [
  ['Mes exports sont-ils gratuits ?', 'Oui. Les exports sont proposés sans filigrane.'],
  ['Qui écrit le contenu ?', 'Vous. Folio met en forme les informations que vous saisissez.'],
  ['Puis-je supprimer mon compte ?', 'Oui, vous pouvez demander la suppression de votre compte à tout moment.'],
  [
    'Mes données sont-elles publiques ?',
    'Non. La publication est une action distincte ; un portfolio non publié n’est pas présenté comme public.',
  ],
  ['Puis-je utiliser Folio sans photo ?', 'Oui, la photo est facultative.'],
]

export default function About() {
  return (
    <div className="container dashboard">
      <div className="eyebrow">FOLIO</div>
      <h1 className="section-title">À propos de Folio</h1>
      <p style={{ maxWidth: 760 }}>
        Folio aide chacun à présenter clairement son parcours professionnel, ses études, ses
        compétences et ses réalisations. Le but est de vous donner un document soigné que vous
        pouvez modifier et utiliser comme vous le souhaitez.
      </p>

      <h2>Nos engagements</h2>
      <div className="about-grid">
        {COMMITMENTS.map(([title, text]) => (
          <article className="about-card" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <h2>Comment ça marche</h2>
      <ol>
        {STEPS.map((s) => (
          <li key={s} style={{ margin: '10px 0' }}>{s}</li>
        ))}
      </ol>

      <h2>Ce que Folio permet</h2>
      <p>
        Créer un portfolio ou un CV, choisir parmi dix thèmes, organiser vos sections, ajouter des
        liens et des images, puis exporter en PDF, DOCX ou HTML.
      </p>

      <h2>Des profils différents</h2>
      <p>
        Étudiant, infirmière, enseignant, artisan, développeur ou photographe : chaque profil peut
        sélectionner les sections utiles à son activité.
      </p>

      <h2>Vie privée et données</h2>
      <p>
        Les informations saisies servent à composer votre portfolio. Vérifiez les coordonnées et
        liens avant publication. Ne partagez pas de données sensibles dont votre portfolio n’a pas
        besoin.
      </p>

      <h2>FAQ</h2>
      {FAQ.map(([question, answer]) => (
        <details className="faq-item" key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}

      <h2>Contact et version</h2>
      <p>
        Pour une question ou un retour, utilisez le canal de contact communiqué par l’équipe Folio.
      </p>
      <p className="muted small">Folio · Version 1.0</p>
      <Link className="btn btn-primary" to="/">Retour à l’accueil</Link>
    </div>
  )
}