import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { MapPin, Zap, BarChart3, Users, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">LocalFix AI</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => setLocation("/submit")}>
                  Report Problem
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/history")}>
                  My Reports
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/community-map")}>
                  Live Map
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/profile")}>
                  Profile
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/interactive-map")}>
                  Add Problem
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/analytics")}>
                  Analytics
                </Button>
                {user?.role === "admin" && (
                  <Button variant="ghost" onClick={() => setLocation("/admin")}>
                    Admin
                  </Button>
                )}
                <div className="flex items-center gap-2 pl-4 border-l border-border">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </>
            ) : (
              <Button asChild className="btn-primary">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Smart City Problem Reporting
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Report potholes, broken streetlights, trash overflow, graffiti, and unsafe sidewalks. Our AI automatically classifies issues and generates professional reports for city departments.
              </p>

              {isAuthenticated ? (
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="btn-primary"
                    onClick={() => setLocation("/submit")}
                  >
                    Report a Problem
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLocation("/history")}
                  >
                    View My Reports
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="btn-primary" asChild>
                  <a href={getLoginUrl()}>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
              <Card className="card-elegant p-8 relative">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🚗</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Pothole Near School</h3>
                      <p className="text-sm text-muted-foreground">Describe the issue naturally</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Classification: Road Damage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Priority: Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Department: Transportation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Impact Score: 55/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, intelligent, and effective problem reporting
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-elegant p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Describe</h3>
              <p className="text-muted-foreground">
                Write a natural description of the problem you've found in your community. Be as detailed as possible.
              </p>
            </Card>

            <Card className="card-elegant p-8">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI instantly classifies the problem, assigns priority, and routes it to the right department.
              </p>
            </Card>

            <Card className="card-elegant p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Impact Score</h3>
              <p className="text-muted-foreground">
                Get an impact assessment showing risk level, affected area, and suggested urgency timeline.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Types Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Problem Types We Handle</h2>
            <p className="text-xl text-muted-foreground">
              Report any urban infrastructure issue
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: "🕳️", name: "Potholes", desc: "Road damage" },
              { icon: "💡", name: "Streetlights", desc: "Broken lights" },
              { icon: "🗑️", name: "Trash", desc: "Overflow issues" },
              { icon: "🎨", name: "Graffiti", desc: "Vandalism" },
              { icon: "🚶", name: "Sidewalks", desc: "Safety hazards" },
              { icon: "💧", name: "Water Damage", desc: "Flooding" },
              { icon: "🌳", name: "Vegetation", desc: "Overgrowth" },
              { icon: "⚠️", name: "Other", desc: "Miscellaneous" },
            ].map((type) => (
              <Card key={type.name} className="card-elegant p-6 text-center">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="font-semibold mb-1">{type.name}</h3>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">AI-Powered</div>
              <p className="text-lg text-muted-foreground">Instant classification and analysis</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">Professional</div>
              <p className="text-lg text-muted-foreground">Ready-to-submit reports</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-accent mb-2">Transparent</div>
              <p className="text-lg text-muted-foreground">Track your reports in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4">
          <div className="container max-w-2xl text-center">
            <Card className="card-elegant p-12 bg-gradient-to-br from-primary/10 to-secondary/10">
              <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of community members reporting and fixing urban infrastructure problems.
              </p>
              <Button size="lg" className="btn-primary" asChild>
                <a href={getLoginUrl()}>
                  Start Reporting Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">LocalFix AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making cities smarter, one report at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
