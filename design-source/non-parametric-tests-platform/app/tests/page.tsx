"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  
import { KruskalWallisTest } from "@/components/tests/kruskal-wallis-test"
import { SpearmanTest } from "@/components/tests/spearman-test"
import { KolmogorovSmirnovTest } from "@/components/tests/kolmogorov-smirnov-test"
import { FriedmanTest } from "@/components/tests/friedman-test"
import { FlaskConical } from "lucide-react"

export default function TestsPage() {
  const [activeTest, setActiveTest] = useState("spearman")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tests statistiques non paramétriques</h1>
          <p className="text-muted-foreground">
            Sélectionnez un test et entrez vos données pour obtenir des résultats instantanés.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <CardTitle>Choisissez votre test</CardTitle>
            </div>
            <CardDescription>
              Chaque test est adapté à des situations spécifiques. Consultez la description pour choisir le bon test.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTest} onValueChange={setActiveTest} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
                
                <TabsTrigger value="kruskal" className="text-xs sm:text-sm">
                  Kruskal-Wallis
                </TabsTrigger>
                <TabsTrigger value="spearman" className="text-xs sm:text-sm">
                  Spearman
                </TabsTrigger>
                <TabsTrigger value="kolmogorov" className="text-xs sm:text-sm">
                  Kolmogorov-Smirnov
                </TabsTrigger>
                <TabsTrigger value="friedman" className="text-xs sm:text-sm">
                  Friedman
                </TabsTrigger>
              </TabsList>

              

              <TabsContent value="kruskal" className="mt-6">
                <KruskalWallisTest />
              </TabsContent>

              <TabsContent value="spearman" className="mt-6">
                <SpearmanTest />
              </TabsContent>

              <TabsContent value="kolmogorov" className="mt-6">
                <KolmogorovSmirnovTest />
              </TabsContent>

              <TabsContent value="friedman" className="mt-6">
                <FriedmanTest />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
