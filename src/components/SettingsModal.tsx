import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Key, Save, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Partial<Settings>) => void;
}

export function SettingsModal({ settings, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(settings.apiKeys);
  const [autoSummarization, setAutoSummarization] = useState(settings.autoSummarization);
  const { toast } = useToast();

  const handleSave = () => {
    onSave({ apiKeys, autoSummarization });
    setOpen(false);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="transition-transform hover:rotate-90 hover:scale-110"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your API keys and auto-summarization preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api">
              <Key className="mr-2 h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="auto-summarize">
              <Sparkles className="mr-2 h-4 w-4" />
              Auto-Summarize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6 py-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="openai">OpenAI API Key</Label>
                <Input
                  id="openai"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  For GPT-4, GPT-3.5, and other OpenAI models
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anthropic">Anthropic API Key</Label>
                <Input
                  id="anthropic"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">For Claude models</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google">Google API Key</Label>
                <Input
                  id="google"
                  type="password"
                  placeholder="AIza..."
                  value={apiKeys.google}
                  onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">For Gemini models</p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Your API keys are stored locally
                  in your browser's localStorage. They are never sent to any server except the
                  respective AI provider's API endpoints.
                </p>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="auto-summarize" className="space-y-6 py-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="enable-auto">Enable Automatic Summarization</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically summarize conversations when context usage reaches threshold
                  </p>
                </div>
                <Switch
                  id="enable-auto"
                  checked={autoSummarization.enabled}
                  onCheckedChange={(checked) =>
                    setAutoSummarization({ ...autoSummarization, enabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Trigger Threshold</Label>
                <Select
                  value={(autoSummarization.threshold * 100).toString()}
                  onValueChange={(value) =>
                    setAutoSummarization({
                      ...autoSummarization,
                      threshold: parseInt(value) / 100,
                    })
                  }
                >
                  <SelectTrigger id="threshold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60% - Early (More summaries)</SelectItem>
                    <SelectItem value="70">70% - Balanced (Recommended)</SelectItem>
                    <SelectItem value="80">80% - Late (Fewer summaries)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Auto-summarize when context usage reaches this percentage
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keep-recent">Keep Recent Messages</Label>
                <Select
                  value={autoSummarization.keepRecentCount.toString()}
                  onValueChange={(value) =>
                    setAutoSummarization({
                      ...autoSummarization,
                      keepRecentCount: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="keep-recent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 messages</SelectItem>
                    <SelectItem value="10">10 messages (Recommended)</SelectItem>
                    <SelectItem value="15">15 messages</SelectItem>
                    <SelectItem value="20">20 messages</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Number of recent messages to keep unchanged during summarization
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary-style">Summary Style</Label>
                <Select
                  value={autoSummarization.style}
                  onValueChange={(value: any) =>
                    setAutoSummarization({ ...autoSummarization, style: value })
                  }
                >
                  <SelectTrigger id="summary-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structured">Structured (Recommended)</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="research">Research-oriented</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How the AI should format the summary
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">How it works:</strong> When your conversation
                  reaches the threshold, older messages are automatically summarized and replaced with
                  a compact summary, preserving context while freeing up tokens for new messages.
                </p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gradient-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
