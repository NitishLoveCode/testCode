import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle2, Download } from "lucide-react";

export default function Settings() {
  const [nsConfig, setNsConfig] = useState({
    accountId: "",
    consumerKey: "",
    consumerSecret: "",
    tokenId: "",
    tokenSecret: "",
    restletUrl: "",
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedNs = localStorage.getItem("nsConfig");
    if (savedNs) setNsConfig(JSON.parse(savedNs));
  }, []);

  const handleSave = () => {
    localStorage.setItem("nsConfig", JSON.stringify(nsConfig));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadSource = () => {
    window.open("/api/download-source", "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Integration Settings
          </h1>
          <p className="text-slate-500">
            Configure Oracle NetSuite connections
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleDownloadSource}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Source Code
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            {saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Configurations"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Oracle NetSuite Integration</CardTitle>
              <CardDescription>
                Configure TBA (Token-Based Authentication) for NetSuite
                RESTlets.
              </CardDescription>
            </div>
            <Badge variant={nsConfig.accountId ? "success" : "secondary"}>
              {nsConfig.accountId ? "Configured" : "Not Configured"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Account ID
              </label>
              <Input
                value={nsConfig.accountId}
                onChange={(e) =>
                  setNsConfig({ ...nsConfig, accountId: e.target.value })
                }
                placeholder="e.g. 1234567_SB1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                RESTlet URL
              </label>
              <Input
                value={nsConfig.restletUrl}
                onChange={(e) =>
                  setNsConfig({ ...nsConfig, restletUrl: e.target.value })
                }
                placeholder="https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=X&deploy=Y"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Consumer Key
              </label>
              <Input
                type="password"
                value={nsConfig.consumerKey}
                onChange={(e) =>
                  setNsConfig({ ...nsConfig, consumerKey: e.target.value })
                }
                placeholder="Enter Consumer Key"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Consumer Secret
              </label>
              <Input
                type="password"
                value={nsConfig.consumerSecret}
                onChange={(e) =>
                  setNsConfig({ ...nsConfig, consumerSecret: e.target.value })
                }
                placeholder="Enter Consumer Secret"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Token ID
              </label>
              <Input
                type="password"
                value={nsConfig.tokenId}
                onChange={(e) =>
                  setNsConfig({ ...nsConfig, tokenId: e.target.value })
                }
                placeholder="Enter Token ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Token Secret
              </label>
              <Input
                type="password"
                value={nsConfig.tokenSecret}
                onChange={(e) =>
                  setNsConfig({ ...nsConfig, tokenSecret: e.target.value })
                }
                placeholder="Enter Token Secret"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
