'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Copy, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeamModal = ({ open, onOpenChange }: TeamModalProps) => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Developer" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "Designer" },
  ]);

  const inviteLink = "https://fromscratch.ai/invite/abc123";

  const handleInvite = () => {
    if (!email) return;
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      role: "Viewer",
    };
    
    setMembers([...members, newMember]);
    setEmail("");
    
    toast({
      title: "Invitation sent",
      description: `Invited ${email} to collaborate`,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Invite link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    toast({
      title: "Member removed",
      description: "Team member has been removed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to collaborate</DialogTitle>
          <DialogDescription>
            Anyone with the link can view and collaborate on this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link Section */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium mb-2">Share link</p>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1 bg-background"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Email Invite */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Or invite via email</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleInvite()}
                className="flex-1"
              />
              <Button 
                onClick={handleInvite}
                disabled={!email}
                className="bg-gradient-primary"
              >
                Invite
              </Button>
            </div>
          </div>

          {/* Team Members List */}
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Team members ({members.length})</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary/50 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(member.id)}
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamModal;