import { useTranslation } from 'react-i18next'

const POSTS = [
  {
    slug: 'how-to-calculate-ddct',
    titleKey: 'pages.blog.ddct.title',
    defaultTitle: 'How to Calculate DDCt (Livak Method): A Complete Guide',
    descKey: 'pages.blog.ddct.desc',
    defaultDesc:
      'Learn the delta-delta Ct method step by step, including the math, assumptions, common mistakes, and worked examples.',
    date: '2026-03-06',
  },
  {
    slug: 'qpcr-troubleshooting-guide',
    titleKey: 'pages.blog.troubleshooting.title',
    defaultTitle: 'qPCR Troubleshooting Guide: 10 Common Problems and Fixes',
    descKey: 'pages.blog.troubleshooting.desc',
    defaultDesc:
      'A practical checklist for diagnosing and fixing the most common qPCR issues, from NTC amplification to unexpected fold changes.',
    date: '2026-03-06',
  },
  {
    slug: 'best-reference-genes',
    titleKey: 'pages.blog.refGenes.title',
    defaultTitle: 'Choosing the Best Reference Genes for qPCR',
    descKey: 'pages.blog.refGenes.desc',
    defaultDesc:
      'How to pick, validate, and use the right housekeeping genes for accurate normalization in RT-qPCR experiments.',
    date: '2026-03-06',
  },
]

/* ------------------------------------------------------------------
   Post content components
   ------------------------------------------------------------------ */

function PostDDCt({ t }) {
  return (
    <article>
      <Section title={t('pages.blog.ddct.whatIsIt', 'What Is DDCt?')}>
        <P>
          {t(
            'pages.blog.ddct.whatIsItP1',
            'The delta-delta Ct method (also written as DDCt, 2^(-DDCt), or the Livak method) is the most widely used approach for calculating relative gene expression from qPCR data. It was introduced by Livak and Schmittgen in 2001 and remains the standard in most molecular biology labs.'
          )}
        </P>
        <P>
          {t(
            'pages.blog.ddct.whatIsItP2',
            'The method compares the expression of a gene of interest (GOI) to a reference gene (also called a housekeeping gene or internal control), and then compares that ratio between a treated sample and a control sample. The result is a fold change: how many times more (or less) the gene is expressed in the treated condition relative to the control.'
          )}
        </P>
      </Section>

      <Section title={t('pages.blog.ddct.formulaTitle', 'The Formula, Step by Step')}>
        <P>
          {t(
            'pages.blog.ddct.formulaIntro',
            'The calculation has three stages. Here is each one broken down with an example.'
          )}
        </P>

        <SubSection title={t('pages.blog.ddct.step1Title', 'Step 1: Calculate DCt for each sample')}>
          <Formula>{'DCt = Ct(GOI) - Ct(reference gene)'}</Formula>
          <P>
            {t(
              'pages.blog.ddct.step1P1',
              'For each biological sample, subtract the Ct of the reference gene from the Ct of the gene of interest. This normalizes for differences in the amount of cDNA loaded.'
            )}
          </P>
          <P>
            {t(
              'pages.blog.ddct.step1Example',
              'Example: If your gene of interest has a Ct of 25.3 and your reference gene (GAPDH) has a Ct of 18.1, then DCt = 25.3 - 18.1 = 7.2.'
            )}
          </P>
        </SubSection>

        <SubSection title={t('pages.blog.ddct.step2Title', 'Step 2: Calculate DDCt')}>
          <Formula>{'DDCt = DCt(treated) - DCt(control)'}</Formula>
          <P>
            {t(
              'pages.blog.ddct.step2P1',
              'Subtract the mean DCt of your control group from the DCt of each treated sample. The control group is your baseline — untreated cells, wild-type animals, time zero, or whatever your experimental reference is.'
            )}
          </P>
          <P>
            {t(
              'pages.blog.ddct.step2Example',
              'Example: If DCt(treated) = 7.2 and the mean DCt(control) = 9.8, then DDCt = 7.2 - 9.8 = -2.6. A negative DDCt means the gene is upregulated in the treated sample.'
            )}
          </P>
        </SubSection>

        <SubSection title={t('pages.blog.ddct.step3Title', 'Step 3: Calculate fold change')}>
          <Formula>{'Fold Change = 2^(-DDCt)'}</Formula>
          <P>
            {t(
              'pages.blog.ddct.step3P1',
              'Raise 2 to the power of negative DDCt. This converts the logarithmic Ct difference into a linear fold change that is easier to interpret and plot.'
            )}
          </P>
          <P>
            {t(
              'pages.blog.ddct.step3Example',
              'Example: 2^(-(-2.6)) = 2^(2.6) = 6.06. The gene of interest is expressed roughly 6-fold higher in the treated sample compared to the control.'
            )}
          </P>
        </SubSection>
      </Section>

      <Section title={t('pages.blog.ddct.assumptionsTitle', 'Key Assumptions')}>
        <P>
          {t(
            'pages.blog.ddct.assumptionsIntro',
            'The DDCt method is simple and powerful, but it relies on one critical assumption: the amplification efficiencies of both the gene of interest and the reference gene must be approximately equal and close to 100% (meaning the amount of product doubles with each cycle).'
          )}
        </P>
        <P>
          {t(
            'pages.blog.ddct.assumptionsP2',
            'If your primer efficiencies differ by more than 5 percentage points (for example, 95% vs. 85%), the DDCt method will produce inaccurate fold changes. In that case, use the Pfaffl method, which incorporates individual primer efficiencies into the calculation. VoilaPCR supports both methods.'
          )}
        </P>
        <P>
          {t(
            'pages.blog.ddct.assumptionsP3',
            'To verify primer efficiency, run a standard curve with a serial dilution (typically 5 points, 1:5 or 1:10 dilutions). Plot Ct vs. log(concentration) and calculate efficiency as E = 10^(-1/slope) - 1. An efficiency between 90% and 110% is considered acceptable.'
          )}
        </P>
      </Section>

      <Section title={t('pages.blog.ddct.mistakesTitle', 'Common Mistakes')}>
        <NumberedList
          items={[
            t(
              'pages.blog.ddct.mistake1',
              'Subtracting in the wrong order. DCt is always GOI minus reference, and DDCt is always treated minus control. Reversing either one flips your fold change to its reciprocal.'
            ),
            t(
              'pages.blog.ddct.mistake2',
              'Using a single replicate. Technical replicates (2-3 per sample) should be averaged before calculating DCt. Biological replicates (3+) are needed for statistical testing.'
            ),
            t(
              'pages.blog.ddct.mistake3',
              'Ignoring primer efficiency. If you have not validated that your primers amplify with near-equal efficiency, your fold changes may be systematically biased. Always run a standard curve for new primer sets.'
            ),
            t(
              'pages.blog.ddct.mistake4',
              'Averaging fold changes instead of DCt values. Always perform statistics on DCt or DDCt values (which are normally distributed), not on fold changes (which are log-normally distributed). Convert to fold change only at the end for presentation.'
            ),
            t(
              'pages.blog.ddct.mistake5',
              'Forgetting that fold change of 1 means no change. A fold change of 2 means twice as much expression, and 0.5 means half. Values below 1 are downregulated, not negative.'
            ),
          ]}
        />
      </Section>

      <Section title={t('pages.blog.ddct.voilaTitle', 'Automate It with VoilaPCR')}>
        <P>
          {t(
            'pages.blog.ddct.voilaBody',
            'VoilaPCR performs the entire DDCt calculation automatically. Upload your qPCR export file, select your reference gene and control group, and get publication-ready fold-change bar charts in seconds. It also runs QC checks for replicate consistency, NTC contamination, and late Ct values — catching errors before they end up in your paper.'
          )}
        </P>
        <CTALink href="/" label={t('pages.blog.ddct.cta', 'Try VoilaPCR for free')} />
      </Section>
    </article>
  )
}

function PostTroubleshooting({ t }) {
  const problems = [
    {
      key: 'ntc',
      defaultTitle: '1. NTC Amplification',
      defaultBody:
        'Your no-template controls are showing amplification, typically with Ct values in the 30-38 range. This usually indicates primer-dimer formation or contamination of your reagents. First, check your melt curve: a single sharp peak at the expected Tm suggests contamination, while a broad or low-temperature peak suggests primer dimers. Replace your water and make fresh master mix. If the problem persists, redesign your primers to reduce self-complementarity.',
    },
    {
      key: 'replicates',
      defaultTitle: '2. Poor Replicate Consistency',
      defaultBody:
        'Technical replicates should agree within 0.5 Ct. If you see spreads greater than 1 Ct among triplicates, the issue is almost always pipetting. Ensure you are using calibrated pipettes, mixing the master mix thoroughly before aliquoting, and loading the plate quickly to avoid evaporation. Switching from manual to electronic pipettes or using a repeat dispenser can dramatically improve consistency.',
    },
    {
      key: 'efficiency',
      defaultTitle: '3. Low Amplification Efficiency',
      defaultBody:
        'Standard curve slopes outside the -3.1 to -3.6 range (corresponding to 90-110% efficiency) indicate a problem with your primers or assay conditions. Common causes include suboptimal annealing temperature, too much or too little template, secondary structure in the amplicon, and inhibitors carried over from RNA extraction. Run a temperature gradient to optimize annealing, and test a fresh RNA extraction.',
    },
    {
      key: 'lateCt',
      defaultTitle: '4. Late Ct Values (Ct > 35)',
      defaultBody:
        'Ct values above 35 are unreliable because they fall near the detection limit of the instrument. The signal-to-noise ratio is poor, and small stochastic differences are amplified exponentially. If your gene of interest consistently shows Ct > 35, consider increasing your cDNA input, using a pre-amplification step, or switching to a more sensitive detection chemistry (such as TaqMan probes).',
    },
    {
      key: 'meltCurve',
      defaultTitle: '5. Multiple Melt Curve Peaks',
      defaultBody:
        'A single sharp melt curve peak confirms amplification of a single specific product. Multiple peaks indicate non-specific amplification, primer dimers, or genomic DNA contamination. Increase your annealing temperature by 2-3 degrees, add a DNase treatment step to your RNA prep, and verify your primers span an exon-exon junction if possible. Running your product on an agarose gel can help identify the source of the extra band.',
    },
    {
      key: 'refInstability',
      defaultTitle: '6. Reference Gene Instability',
      defaultBody:
        'If your reference gene Ct values vary by more than 1 Ct across experimental conditions, your normalization will introduce systematic error into every fold change you calculate. No single reference gene is universally stable — GAPDH is notoriously affected by hypoxia, serum starvation, and cell density. Validate reference gene stability using geNorm, NormFinder, or BestKeeper, and consider using the geometric mean of 2-3 stable reference genes.',
    },
    {
      key: 'highBg',
      defaultTitle: '7. High Background Fluorescence',
      defaultBody:
        'Elevated baseline fluorescence can shift your Ct values and produce inaccurate results. This can be caused by too much fluorescent dye (reduce SYBR Green concentration), contamination of the optical surfaces (clean the instrument block and lid), or auto-fluorescent plate materials. Ensure you are using optical-grade plates and seal films rated for your instrument.',
    },
    {
      key: 'noAmp',
      defaultTitle: '8. No Amplification',
      defaultBody:
        'If you see no amplification curves at all — not even in positive controls — the issue is likely reagent failure or a thermocycler malfunction. Verify that you added reverse transcriptase during the cDNA synthesis step (a surprisingly common omission). Check that the master mix has not been through excessive freeze-thaw cycles. Run a known positive control template to rule out instrument problems.',
    },
    {
      key: 'unexpectedFC',
      defaultTitle: '9. Unexpected Fold Changes',
      defaultBody:
        'If your fold changes do not match your expectations from Western blots or other assays, first confirm that you are comparing the correct samples and that your control group is assigned correctly. Check whether your primer efficiency assumption holds (DDCt assumes equal efficiency for GOI and reference). Consider biological explanations as well: mRNA levels do not always correlate with protein levels due to post-transcriptional regulation.',
    },
    {
      key: 'plateLayout',
      defaultTitle: '10. Plate Layout Errors',
      defaultBody:
        'Mislabeled wells are one of the most common sources of irreproducible qPCR data, and they are invisible in the raw numbers. Always print your plate layout before pipetting and double-check sample assignments in your instrument software. Edge wells (row A, row H, column 1, column 12) tend to show higher evaporation and edge effects — avoid them for critical samples when possible.',
    },
  ]

  return (
    <article>
      <Section
        title={t(
          'pages.blog.troubleshooting.introTitle',
          'A Practical Guide to Fixing qPCR Problems'
        )}
      >
        <P>
          {t(
            'pages.blog.troubleshooting.introBody',
            'qPCR is one of the most widely used techniques in molecular biology, but it is also one of the most sensitive to small technical errors. A contaminated NTC, a pipetting inconsistency, or an unstable reference gene can silently distort your results. This guide covers the ten most common problems researchers encounter and how to fix them.'
          )}
        </P>
      </Section>

      {problems.map((problem) => (
        <Section
          key={problem.key}
          title={t(
            `pages.blog.troubleshooting.${problem.key}Title`,
            problem.defaultTitle
          )}
        >
          <P>
            {t(
              `pages.blog.troubleshooting.${problem.key}Body`,
              problem.defaultBody
            )}
          </P>
        </Section>
      ))}

      <Section
        title={t(
          'pages.blog.troubleshooting.drQpcrTitle',
          'Let Dr. qPCR Help'
        )}
      >
        <P>
          {t(
            'pages.blog.troubleshooting.drQpcrBody',
            'Still stuck? VoilaPCR includes Dr. qPCR, an AI-powered troubleshooting assistant that can analyze your QC report and suggest specific fixes for your experiment. Describe your problem or share a screenshot of your amplification curves, and Dr. qPCR will walk you through the diagnosis step by step.'
          )}
        </P>
        <CTALink href="/" label={t('pages.blog.troubleshooting.cta', 'Try Dr. qPCR for free')} />
      </Section>
    </article>
  )
}

function PostReferenceGenes({ t }) {
  const genes = [
    {
      name: 'GAPDH',
      fullName: 'Glyceraldehyde-3-phosphate dehydrogenase',
      notes:
        'One of the most commonly used reference genes. Generally stable in many cell lines and tissues, but can be affected by hypoxia, diabetes, and high glucose conditions. Not ideal for metabolic studies.',
    },
    {
      name: 'ACTB',
      fullName: 'Beta-actin',
      notes:
        'Widely used, but expression can change with cell proliferation, mechanical stress, and some drug treatments. Often varies in cancer vs. normal tissue comparisons.',
    },
    {
      name: '18S rRNA',
      fullName: '18S ribosomal RNA',
      notes:
        'Extremely abundant, so Ct values are typically very low (8-12). Useful when other reference genes are too variable, but its high abundance means it may not reflect mRNA population changes accurately. Not suitable for oligo-dT-primed cDNA synthesis.',
    },
    {
      name: 'HPRT1',
      fullName: 'Hypoxanthine phosphoribosyltransferase 1',
      notes:
        'A good alternative reference gene with moderate expression levels. Generally stable across many tissue types, though it can vary in some cancers. Particularly useful in neuroscience and immunology research.',
    },
    {
      name: 'B2M',
      fullName: 'Beta-2-microglobulin',
      notes:
        'Stable in many contexts, but expression is strongly affected by interferon signaling and immune activation. Avoid in studies involving inflammation, viral infection, or immunotherapy.',
    },
  ]

  return (
    <article>
      <Section title={t('pages.blog.refGenes.whyTitle', 'Why Reference Genes Matter')}>
        <P>
          {t(
            'pages.blog.refGenes.whyP1',
            'In RT-qPCR, the Ct value of your gene of interest is meaningless on its own. It depends on how much total RNA you loaded, how efficient the reverse transcription was, and how much cDNA you pipetted into the reaction. Reference genes (also called housekeeping genes or endogenous controls) solve this problem by providing an internal standard: a gene whose expression should be constant across all your experimental conditions.'
          )}
        </P>
        <P>
          {t(
            'pages.blog.refGenes.whyP2',
            'When you calculate DCt (Ct of GOI minus Ct of reference), you cancel out these sample-to-sample loading differences. But this only works if the reference gene truly is stable. If it changes even slightly between conditions, those changes propagate directly into your fold change results — and they do so silently, without any obvious error message.'
          )}
        </P>
      </Section>

      <Section title={t('pages.blog.refGenes.commonTitle', 'Common Reference Genes')}>
        <P>
          {t(
            'pages.blog.refGenes.commonIntro',
            'The following genes are the most frequently used internal controls in RT-qPCR. Each has strengths and limitations depending on your experimental system.'
          )}
        </P>
        <div className="mt-4 space-y-4">
          {genes.map((gene) => (
            <div
              key={gene.name}
              className="p-4 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-accent font-semibold text-sm">
                  {gene.name}
                </span>
                <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  {gene.fullName}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                {t(`pages.blog.refGenes.gene${gene.name}`, gene.notes)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('pages.blog.refGenes.tissueTitle', 'Tissue-Specific Considerations')}>
        <P>
          {t(
            'pages.blog.refGenes.tissueP1',
            'There is no universally stable reference gene. A gene that works perfectly in HeLa cells may be completely unsuitable in primary hepatocytes or adipose tissue. GAPDH, for example, is one of the most commonly cited reference genes in the literature, but it is directly involved in glycolysis and its expression changes significantly under metabolic stress, hypoxic conditions, and in diabetes models.'
          )}
        </P>
        <P>
          {t(
            'pages.blog.refGenes.tissueP2',
            'Before committing to a reference gene for a new experimental system, always perform a pilot validation. Run your candidate reference genes across all your experimental conditions and check whether their Ct values remain constant (within 1 Ct). If they do not, try alternative candidates or use the geometric mean of multiple reference genes to improve stability.'
          )}
        </P>
      </Section>

      <Section
        title={t(
          'pages.blog.refGenes.validationTitle',
          'How to Validate Reference Gene Stability'
        )}
      >
        <P>
          {t(
            'pages.blog.refGenes.validationIntro',
            'Several algorithms have been developed to objectively rank candidate reference genes by stability. The three most widely used are:'
          )}
        </P>

        <SubSection title="geNorm">
          <P>
            {t(
              'pages.blog.refGenes.genorm',
              'Developed by Vandesompele et al. (2002), geNorm calculates a stability measure (M value) based on the average pairwise variation between a candidate gene and all other candidates. Genes with the lowest M value are the most stable. geNorm also determines the optimal number of reference genes to use. An M value below 0.5 is considered stable for homogeneous samples; below 1.0 for heterogeneous tissues.'
            )}
          </P>
        </SubSection>

        <SubSection title="NormFinder">
          <P>
            {t(
              'pages.blog.refGenes.normfinder',
              'NormFinder (Andersen et al., 2004) uses a model-based approach that accounts for both intra-group and inter-group variation. It can identify genes that are stable overall but differ between experimental groups — a situation geNorm can miss. It also suggests optimal gene combinations.'
            )}
          </P>
        </SubSection>

        <SubSection title="BestKeeper">
          <P>
            {t(
              'pages.blog.refGenes.bestkeeper',
              'BestKeeper (Pfaffl et al., 2004) uses raw Ct values (rather than relative quantities) to calculate the standard deviation and coefficient of variation for each candidate. Genes with the lowest SD are ranked most stable. It is simpler to use but less powerful than geNorm or NormFinder for complex experimental designs.'
            )}
          </P>
        </SubSection>
      </Section>

      <Section
        title={t('pages.blog.refGenes.voilaTitle', 'Validate with VoilaPCR')}
      >
        <P>
          {t(
            'pages.blog.refGenes.voilaBody',
            'VoilaPCR Pro includes built-in geNorm analysis. Upload your validation plate with multiple candidate reference genes, and VoilaPCR will calculate M values, rank your candidates by stability, and tell you the optimal number of reference genes to use. No more exporting to Excel or running standalone R scripts.'
          )}
        </P>
        <CTALink href="/" label={t('pages.blog.refGenes.cta', 'Try geNorm analysis in VoilaPCR')} />
      </Section>
    </article>
  )
}

/* ------------------------------------------------------------------
   Shared sub-components for blog post formatting
   ------------------------------------------------------------------ */

function Section({ title, children }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function SubSection({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="font-display text-lg font-bold text-text-primary dark:text-text-primary-dark">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function P({ children }) {
  return (
    <p className="mt-3 first:mt-0 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
      {children}
    </p>
  )
}

function Formula({ children }) {
  return (
    <div className="my-4 px-4 py-3 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark font-mono text-sm text-accent">
      {children}
    </div>
  )
}

function NumberedList({ items }) {
  return (
    <ol className="mt-4 space-y-3 list-none">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-text-secondary dark:text-text-secondary-dark leading-relaxed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-mono font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

function CTALink({ href, label }) {
  return (
    <div className="mt-6">
      <a
        href={href}
        className="inline-block px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg text-sm transition-colors"
      >
        {label}
      </a>
    </div>
  )
}

/* ------------------------------------------------------------------
   Blog index (post list)
   ------------------------------------------------------------------ */

function BlogIndex({ t, navigate }) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        {t('pages.blog.title', 'Blog')}
      </h1>
      <p className="mt-4 text-center text-lg text-text-secondary dark:text-text-secondary-dark">
        {t('pages.blog.subtitle', 'Guides, tutorials, and best practices for qPCR data analysis.')}
      </p>

      <div className="mt-12 space-y-6">
        {POSTS.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            onClick={(e) => {
              e.preventDefault()
              if (navigate) navigate(`/blog/${post.slug}`)
            }}
            className="block p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark hover:border-accent transition-colors group"
          >
            <span className="text-xs font-mono text-accent font-semibold">{post.date}</span>
            <h2 className="mt-1 font-display text-xl font-bold group-hover:text-accent transition-colors">
              {t(post.titleKey, post.defaultTitle)}
            </h2>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
              {t(post.descKey, post.defaultDesc)}
            </p>
          </a>
        ))}
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------
   Main BlogPage component
   ------------------------------------------------------------------ */

const POST_COMPONENTS = {
  'how-to-calculate-ddct': PostDDCt,
  'qpcr-troubleshooting-guide': PostTroubleshooting,
  'best-reference-genes': PostReferenceGenes,
}

export default function BlogPage({ slug, navigate }) {
  const { t } = useTranslation()

  if (!slug) {
    return <BlogIndex t={t} navigate={navigate} />
  }

  const PostComponent = POST_COMPONENTS[slug]

  if (!PostComponent) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-4xl font-bold">
          {t('pages.blog.notFound', 'Post Not Found')}
        </h1>
        <p className="mt-4 text-text-secondary dark:text-text-secondary-dark">
          {t('pages.blog.notFoundDesc', 'The blog post you are looking for does not exist.')}
        </p>
        <a
          href="/blog"
          onClick={(e) => {
            e.preventDefault()
            if (navigate) navigate('/blog')
          }}
          className="inline-block mt-8 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg text-sm transition-colors"
        >
          {t('pages.blog.backToBlog', 'Back to Blog')}
        </a>
      </main>
    )
  }

  const post = POSTS.find((p) => p.slug === slug)

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <a
        href="/blog"
        onClick={(e) => {
          e.preventDefault()
          if (navigate) navigate('/blog')
        }}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {t('pages.blog.backToBlog', 'Back to Blog')}
      </a>

      <div className="mt-6">
        <span className="text-xs font-mono text-accent font-semibold">{post.date}</span>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold leading-tight">
          {t(post.titleKey, post.defaultTitle)}
        </h1>
      </div>

      <div className="mt-10">
        <PostComponent t={t} />
      </div>
    </main>
  )
}
