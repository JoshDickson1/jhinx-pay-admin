import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Book,
  FileText,
  Video,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Shield,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

const categories = [
  {
    icon: CreditCard,
    title: "Gift Cards",
    description: "Approval process, rates, and troubleshooting",
    articles: 12,
  },
  {
    icon: Shield,
    title: "KYC & Compliance",
    description: "Verification tiers and requirements",
    articles: 8,
  },
  {
    icon: Users,
    title: "User Management",
    description: "Account actions and support",
    articles: 15,
  },
  {
    icon: Settings,
    title: "System Settings",
    description: "Rates, limits, and configurations",
    articles: 10,
  },
];

const popularArticles = [
  { title: "How to approve gift card submissions", category: "Gift Cards", views: 1250 },
  { title: "Understanding risk scores", category: "Gift Cards", views: 980 },
  { title: "KYC tier requirements explained", category: "KYC", views: 875 },
  { title: "Freezing vs banning accounts", category: "Users", views: 720 },
  { title: "Setting transaction limits", category: "Settings", views: 650 },
];

const recentUpdates = [
  { title: "New fraud detection features", date: "Jan 12, 2026", type: "Feature" },
  { title: "Updated gift card rate policy", date: "Jan 10, 2026", type: "Policy" },
  { title: "2FA enforcement for all admins", date: "Jan 5, 2026", type: "Security" },
];

const HelpCenter = () => {
  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-6">
          Find answers, documentation, and resources for the admin panel
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            className="pl-12 py-6 text-lg bg-surface-1 border-border"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface-1 border-border hover:border-orange-500/30 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Book className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Documentation</p>
              <p className="text-xs text-muted-foreground">Full admin guide</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border-border hover:border-orange-500/30 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Video Tutorials</p>
              <p className="text-xs text-muted-foreground">Watch & learn</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border-border hover:border-orange-500/30 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">API Reference</p>
              <p className="text-xs text-muted-foreground">For developers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border-border hover:border-orange-500/30 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Contact Support</p>
              <p className="text-xs text-muted-foreground">Get help</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Browse by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.title}
                    className="p-4 rounded-lg bg-surface-2 hover:bg-surface-2/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <cat.icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-foreground">{cat.title}</h3>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                        <Badge variant="default" className="mt-2 text-[10px]">
                          {cat.articles} articles
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Articles */}
          <Card className="bg-surface-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Popular Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularArticles.map((article, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-2 hover:bg-surface-2/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-orange-500 transition-colors">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{article.views} views</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Updates */}
          <Card className="bg-surface-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Recent Updates</CardTitle>
              <CardDescription>What's new in the admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUpdates.map((update, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        update.type === "Feature" ? "success" :
                        update.type === "Security" ? "error" : "warning"
                      }
                      className="text-[10px]"
                    >
                      {update.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{update.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{update.title}</p>
                </div>
              ))}
              <Button variant="accent-outline" size="sm" className="w-full">
                View All Updates
              </Button>
            </CardContent>
          </Card>

          {/* Need Help? */}
          <Card className="bg-orange-500/5 border-orange-500/15">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Still need help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button variant="accent" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="bg-surface-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Go to Dashboard</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">G</kbd>
                  <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">D</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Go to Users</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">G</kbd>
                  <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">U</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Go to Transactions</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">G</kbd>
                  <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">T</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Focus Search</span>
                <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">/</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Show Shortcuts</span>
                <kbd className="px-2 py-1 rounded bg-surface-2 text-xs font-mono">?</kbd>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
