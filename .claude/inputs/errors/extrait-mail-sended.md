<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Java Tech Watch</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">

  <!-- Domain Header -->
  <div style="background-color: rgba(255, 107, 107, 0.2); border-left: 8px solid #FF6B6B; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
    <h3 style="margin: 0; color: #FF6B6B; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      Java Tech Watch
    </h3>
  </div>


  <!-- Section: TOP 3 Impacts -->
  <h2 style="color: #444; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0;">
    💡 TOP 3 Impacts
  </h2>
  <ul style="font-size: 16px; line-height: 1.8; color: #555; margin: 0 0 25px 0; padding-left: 25px; background-color: #fff; padding: 20px 20px 20px 45px; border-radius: 4px;">
    <li style="margin-bottom: 12px;"><strong>Déploiements Lents / Complexes → Module Import Declarations (JEP 511)</strong> : permet d’écrire `import module java.base;` pour importer tout un module au lieu de gérer manuellement `module-info` et nombreuses dépendances, ce qui réduit les erreurs de packaging et accélère les build/CI en prod[4][7].</li>
    <li style="margin-bottom: 12px;"><strong>Threads et concurrence difficile à corriger → Concurrence structurée (Loom, JEP 505)</strong> : fournit une API pour grouper/contrôler tâches et threads comme une unité (start/stop/join) — simplifie la gestion des interruptions et fuites de threads en production, donc moins de CPU/threads zombies[4][3].</li>
    <li style="margin-bottom: 12px;"><strong>Failles cryptographiques et dérivation de clés → Key Derivation Function API (JEP 510)</strong> : nouvelle API standardisée pour dériver des clés (KDF), remplace bricolages maison et réduit les risques d’implémentations incorrectes en prod, améliorant la sécurité des secrets et la conformité[5][7].</li>
  </ul>

  <!-- Section: JDK Key -->
  <h2 style="color: #444; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0;">
    📌 JDK Key
  </h2>
  <ul style="font-size: 16px; line-height: 1.8; color: #555; margin: 0 0 25px 0; padding-left: 25px; background-color: #fff; padding: 20px 20px 20px 45px; border-radius: 4px;">
    <li style="margin-bottom: 12px;"><strong>JEP 511 — Module Import Declarations : Quoi ?</strong> Autorise l’import d’un module entier via `import module ...`; <strong>Comment ?</strong> le compilateur résout et expose transitivement les packages du module; <strong>Gain</strong> : simplifie le packaging et réduit les erreurs de module, gain opérationnel (moins de build-failures)[7][5].</li>
    <li style="margin-bottom: 12px;"><strong>JEP 505 — Structured Concurrency : Quoi ?</strong> API pour traiter groupes de tâches comme une unité; <strong>Comment ?</strong> scope qui gère lifecycle et exceptions groupées; <strong>Gain</strong> : robustesse et détection plus claire des fuites de threads, meilleure résilience en prod[4][3].</li>
    <li style="margin-bottom: 12px;"><strong>JEP 510 — Key Derivation Functions : Quoi ?</strong> API cryptographique standard KDF; <strong>Comment ?</strong> primitives pour PBKDF/HKDF-style dérivation; <strong>Gain</strong> : sécurité renforcée, évite usages dangereux/maison[5][7].</li>
  </ul>

  <!-- Section: Frameworks -->
  <h2 style="color: #444; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0;">
    🚀 Frameworks
  </h2>
  <ul style="font-size: 16px; line-height: 1.8; color: #555; margin: 0 0 25px 0; padding-left: 25px; background-color: #fff; padding: 20px 20px 20px 45px; border-radius: 4px;">
    <li style="margin-bottom: 12px;"><strong>Spring / Spring Security</strong> : mises à jour récentes corrigent des CVE critiques et ajoutent support d’API versioning (ApiVersionStrategy) — *migration* : appliquer les hotfixes de Spring Security 6.4.x/6.5.x et tester endpoints versionnés en staging[4].</li>
    <li style="margin-bottom: 12px;"><strong>Quarkus / GraalVM</strong> : maintenance releases (Quarkus 3.26.x, GraalVM 25.0.0) pour compatibilité avec JDK 25 — *migration* : rebuild natif avec la nouvelle GraalVM et valider démarrage/AOT si vous utilisez Leyden/AOT[4].</li>
    <li style="margin-bottom: 12px;"><strong>Spring Cloud / Spring Data</strong> : releases 2025.x (Oakwood) et correctifs mineurs — *migration* : suivre les migrations majeures de Spring Cloud, exécuter tests d’intégration sur streaming et config server après upgrade[4].</li>
  </ul>


  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 14px;">
    <p style="margin: 0;">
      Tech Watch · Powered by Perplexity Sonar
    </p>
  </div>

</body>
</html>