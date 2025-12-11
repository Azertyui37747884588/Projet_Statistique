import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Upload, FlaskConical, LineChart, TrendingUp, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
            Plateforme Interactive de Tests Non Paramétriques
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance">
            Analysez, visualisez et interprétez vos données en toute simplicité.
          </p>
          <div className="bg-card border border-border rounded-lg p-6 mt-8">
            <p className="text-foreground leading-relaxed">
              Ce projet vise à concevoir une plateforme web interactive permettant d'effectuer, visualiser et
              interpréter des tests statistiques non paramétriques à partir de données réelles.
            </p>
          </div>
          <blockquote className="text-lg italic text-muted-foreground mt-8 border-l-4 border-primary pl-4">
            "L'intelligence sans méthode égare, la méthode sans intelligence fige ; la statistique donne l'équilibre des
            deux."
          </blockquote>
          <div className="pt-6">
            <Link href="/tests">
              <Button size="lg" className="text-lg px-8 py-6">
                Commencer l'analyse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Fonctionnalités principales</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Téléversement facile</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Importez vos fichiers CSV ou Excel en quelques clics et visualisez vos données instantanément.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Tests statistiques</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Accédez à 4 tests non paramétriques : Kruskal-Wallis, Spearman, Kolmogorov-Smirnov,
                    Friedman.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Visualisation interactive</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Explorez vos résultats avec des graphiques interactifs : boxplots, histogrammes et plus encore.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Interprétation automatique</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Obtenez des explications claires et des recommandations basées sur vos résultats statistiques.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Résultats rapides</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Calculez les statistiques et p-values en temps réel pour une analyse efficace.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Export des données</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Téléchargez vos résultats et graphiques au format CSV ou PDF pour vos rapports.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Prêt à analyser vos données ?</h2>
          <p className="text-lg text-muted-foreground">
            Commencez dès maintenant avec notre plateforme intuitive et puissante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/upload">
              <Button size="lg" variant="outline">
                Téléverser des données
              </Button>
            </Link>
            <Link href="/tests">
              <Button size="lg">Explorer les tests</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
