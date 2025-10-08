import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Key, Save } from "lucide-react";
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
import { Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Partial<Settings>) => void;
}

export function SettingsModal({ settings, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(settings.apiKeys);
  const { toast } = useToast();

  const handleSave = () => {
    onSave({ apiKeys });
    setOpen(false);
    toast({
      title: "Settings saved",
      description: "Your API keys have been updated successfully.",
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
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your API keys for different AI providers. Your keys are stored locally in your
            browser.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
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
