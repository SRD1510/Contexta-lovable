import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Key,
  Save,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { validateApiKeyFormat, isOpenRouterKey } from "@/lib/security";
import { sendMessage, MODEL_CONFIGS } from "@/services/api";

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Partial<Settings>) => void;
}

export function SettingsModal({ settings, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(settings.apiKeys);
  const [autoSummarization, setAutoSummarization] = useState(
    settings.autoSummarization || {
      enabled: true,
      threshold: 0.7,
      keepRecentCount: 10,
      style: "structured" as const,
    }
  );
  const [validating, setValidating] = useState<{ [key: string]: boolean }>({});
  const [validationStatus, setValidationStatus] = useState<{
    [key: string]: "valid" | "invalid" | null;
  }>({});
  const { toast } = useToast();

  const validateAndTestKey = async (
    provider: "openai" | "anthropic" | "google",
    key: string
  ) => {
    if (!key.trim()) {
      setValidationStatus({ ...validationStatus, [provider]: null });
      return;
    }

    // Format validation
    const formatCheck = validateApiKeyFormat(key, provider);
    if (!formatCheck.valid) {
      setValidationStatus({ ...validationStatus, [provider]: "invalid" });
      toast({
        title: "Invalid API Key Format",
        description: formatCheck.error,
        variant: "destructive",
      });
      return;
    }

    // Test the key with a minimal API call
    setValidating({ ...validating, [provider]: true });
    setValidationStatus({ ...validationStatus, [provider]: null });

    try {
      // Detect OpenRouter keys and use appropriate model/endpoint
      let modelId: string;
      if (provider === "openai" && isOpenRouterKey(key)) {
        // Use OpenRouter model for OpenRouter keys
        modelId = "openai/gpt-oss-20b:free";
      } else {
        modelId =
          provider === "openai"
            ? "gpt-3.5-turbo"
            : provider === "anthropic"
            ? "claude-3-sonnet"
            : "gemini-2.0-flash";
      }

      await sendMessage(
        [
          {
            id: "test",
            role: "user",
            content: "Hi",
            timestamp: new Date().toISOString(),
          },
        ],
        modelId,
        key,
        0.7,
        10 // Minimal tokens for test
      );

      setValidationStatus({ ...validationStatus, [provider]: "valid" });
      toast({
        title: "API Key Valid",
        description: `${provider} API key is working correctly.`,
      });
    } catch (error: any) {
      setValidationStatus({ ...validationStatus, [provider]: "invalid" });
      const errorMessage = error?.message || "Unknown error";
      toast({
        title: "API Key Test Failed",
        description:
          errorMessage.includes("401") || errorMessage.includes("403")
            ? "Invalid API key. Please check your key."
            : `Test failed: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setValidating({ ...validating, [provider]: false });
    }
  };

  const handleApiKeyChange = (
    provider: "openai" | "anthropic" | "google",
    value: string
  ) => {
    setApiKeys({ ...apiKeys, [provider]: value });
    // Clear validation status when key changes
    setValidationStatus({ ...validationStatus, [provider]: null });
  };

  const handleSave = async () => {
    // Validate all API keys before saving
    const providers: ("openai" | "anthropic" | "google")[] = [
      "openai",
      "anthropic",
      "google",
    ];
    let hasErrors = false;

    for (const provider of providers) {
      if (apiKeys[provider].trim()) {
        const formatCheck = validateApiKeyFormat(apiKeys[provider], provider);
        if (!formatCheck.valid) {
          toast({
            title: "Invalid API Key",
            description: `${provider}: ${formatCheck.error}`,
            variant: "destructive",
          });
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      return;
    }

    await onSave({ apiKeys, autoSummarization });
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai">OpenAI API Key</Label>
                  <div className="flex items-center gap-2">
                    {validationStatus.openai === "valid" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {validationStatus.openai === "invalid" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        validateAndTestKey("openai", apiKeys.openai)
                      }
                      disabled={!apiKeys.openai.trim() || validating.openai}
                    >
                      {validating.openai ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                </div>
                <Input
                  id="openai"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange("openai", e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  For GPT-4, GPT-3.5, and other OpenAI models
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="anthropic">Anthropic API Key</Label>
                  <div className="flex items-center gap-2">
                    {validationStatus.anthropic === "valid" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {validationStatus.anthropic === "invalid" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        validateAndTestKey("anthropic", apiKeys.anthropic)
                      }
                      disabled={
                        !apiKeys.anthropic.trim() || validating.anthropic
                      }
                    >
                      {validating.anthropic ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                </div>
                <Input
                  id="anthropic"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKeys.anthropic}
                  onChange={(e) =>
                    handleApiKeyChange("anthropic", e.target.value)
                  }
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  For Claude models
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="google">Google API Key</Label>
                  <div className="flex items-center gap-2">
                    {validationStatus.google === "valid" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {validationStatus.google === "invalid" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        validateAndTestKey("google", apiKeys.google)
                      }
                      disabled={!apiKeys.google.trim() || validating.google}
                    >
                      {validating.google ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  </div>
                </div>
                <Input
                  id="google"
                  type="password"
                  placeholder="AIza..."
                  value={apiKeys.google}
                  onChange={(e) => handleApiKeyChange("google", e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  For Gemini models
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Security:</strong> Your
                  API keys are encrypted and stored locally in your browser's
                  localStorage. They are never sent to any server except the
                  respective AI provider's API endpoints. Use the "Test" button
                  to verify your keys.
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
                  <Label htmlFor="enable-auto">
                    Enable Automatic Summarization
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically summarize conversations when context usage
                    reaches threshold
                  </p>
                </div>
                <Switch
                  id="enable-auto"
                  checked={autoSummarization.enabled}
                  onCheckedChange={(checked) =>
                    setAutoSummarization({
                      ...autoSummarization,
                      enabled: checked,
                    })
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
                    <SelectItem value="60">
                      60% - Early (More summaries)
                    </SelectItem>
                    <SelectItem value="70">
                      70% - Balanced (Recommended)
                    </SelectItem>
                    <SelectItem value="80">
                      80% - Late (Fewer summaries)
                    </SelectItem>
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
                    <SelectItem value="10">
                      10 messages (Recommended)
                    </SelectItem>
                    <SelectItem value="15">15 messages</SelectItem>
                    <SelectItem value="20">20 messages</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Number of recent messages to keep unchanged during
                  summarization
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
                    <SelectItem value="structured">
                      Structured (Recommended)
                    </SelectItem>
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
                  <strong className="text-foreground">How it works:</strong>{" "}
                  When your conversation reaches the threshold, older messages
                  are automatically summarized and replaced with a compact
                  summary, preserving context while freeing up tokens for new
                  messages.
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
