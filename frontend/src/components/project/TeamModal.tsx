'use client'

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, X, RefreshCw, Clock, CheckCircle, XCircle, Ban, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inviteUserToProject, fetchProjectInvitations, cancelInvitation, resendInvitation } from "@/services/project.service";
import { mainApi } from "@/services/main-api";
import { searchUsers } from "@/services/auth.service";
import type { ProjectInvitation } from "@/types/project.type";
import type { UserSearchResult } from "@/types/user.type";

interface TeamMember {
  id: string;
  name: string;
  info_id: string;
  role: string;
  team: string;
}

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const TeamModal = ({ open, onOpenChange, projectId }: TeamModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [showAllInvitations, setShowAllInvitations] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch members and invitations when modal opens
  useEffect(() => {
    if (open && projectId) {
      loadData();
    } else {
      // Reset search state when modal closes
      setSearchQuery("");
      setEmail("");
      setUserId("");
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [open, projectId]);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch members
      const membersData = await mainApi.get<TeamMember[]>(`/v1/projects/${projectId}/members`);
      setMembers(membersData);

      // Fetch invitations
      const invitationsData = await fetchProjectInvitations(projectId);
      setInvitations(invitationsData);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setEmail(user.email);
    setUserId(user.id);
    setSearchQuery(user.email);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSearchResults([]);
  };

  const handleInvite = async () => {
    if (!email || !projectId) return;

    setInviting(true);
    try {
      const result = await inviteUserToProject(projectId, userId, email);
    
      setEmail("");
      setUserId("");
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
      toast({
        title: "Invitation sent",
        description: `Invited ${email} to collaborate`,
      });

      // Refresh invitations list
      const invitationsData = await fetchProjectInvitations(projectId);
      setInvitations(invitationsData);
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : "Could not send invitation",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });
      
      // Refresh invitations list
      const invitationsData = await fetchProjectInvitations(projectId);
      setInvitations(invitationsData);
    } catch (error) {
      toast({
        title: "Failed to cancel",
        description: error instanceof Error ? error.message : "Could not cancel invitation",
        variant: "destructive",
      });
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId);
      toast({
        title: "Invitation resent",
        description: "A new invitation email has been sent",
      });
      
      // Refresh invitations list
      const invitationsData = await fetchProjectInvitations(projectId);
      setInvitations(invitationsData);
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: error instanceof Error ? error.message : "Could not resend invitation",
        variant: "destructive",
      });
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20"><Ban className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.info_id.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  // Display invitations based on showAllInvitations state
  const displayedInvitations = showAllInvitations ? invitations : invitations.slice(0, 4);
  const hasMoreInvitations = invitations.length > 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Team</DialogTitle>
          <DialogDescription>
            Invite team members and manage project invitations
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-[calc(85vh-120px)]">
          {/* Left Column - Team Members */}
          <div className="flex flex-col space-y-4 border-r pr-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">Team members ({filteredMembers.length})</p>
              <Input
                type="text"
                placeholder="Search members..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {memberSearchQuery ? "No members found" : "No team members yet"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary/50 transition-smooth"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.team}</p>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Invite & Invitations */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            {/* Invite Section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Invite via email</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setEmail(e.target.value);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowDropdown(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedIndex(prev => Math.max(prev - 1, -1));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                            handleSelectUser(searchResults[selectedIndex]);
                          } else {
                            handleInvite();
                          }
                        } else if (e.key === 'Escape') {
                          setShowDropdown(false);
                          setSelectedIndex(-1);
                        }
                      }}
                      className="flex-1 pr-8"
                      disabled={inviting}
                    />
                    {searching && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                    {!searching && searchQuery.length >= 2 && (
                      <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Autocomplete Dropdown */}
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                      {searchResults.length > 0 ? (
                        <div className="py-1">
                          {searchResults.map((user, index) => {
                            const isAlreadyMember = members.some(m => m.info_id === user.email);
                            const isAlreadyInvited = invitations.some(
                              inv => inv.email === user.email && inv.status === 'pending'
                            );
                            
                            return (
                              <button
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors ${
                                  selectedIndex === index ? 'bg-accent' : ''
                                } ${isAlreadyMember || isAlreadyInvited ? 'opacity-60' : ''}`}
                                disabled={isAlreadyMember || isAlreadyInvited}
                              >
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-sm font-medium truncate">{user.fullName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                {isAlreadyMember && (
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                                    Member
                                  </Badge>
                                )}
                                {isAlreadyInvited && (
                                  <Badge variant="outline" className="text-xs flex-shrink-0 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    Invited
                                  </Badge>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleInvite}
                  disabled={!email || !userId || inviting}
                  className="bg-gradient-primary"
                >
                  {inviting ? "Sending..." : "Invite"}
                </Button>
              </div>
            </div>

            {/* Invitations Section */}
            <div className="flex-1 flex flex-col overflow-hidden border-t pt-4">
              <p className="text-sm font-medium mb-3">Invitations ({invitations.length})</p>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No pending invitations</div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {displayedInvitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">{invitation.email}</p>
                              {getStatusBadge(invitation.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Sent: {formatDate(invitation.created_at)} • Expires: {formatDate(invitation.expires_at)}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 flex-shrink-0">
                            {invitation.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(invitation.id)}
                                className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
                              >
                                Cancel
                              </Button>
                            )}
                            {(invitation.status === 'expired' || invitation.status === 'cancelled') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResend(invitation.id)}
                                className="h-8 text-xs gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Resend
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {hasMoreInvitations && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllInvitations(!showAllInvitations)}
                        className="w-full mt-3 text-xs"
                      >
                        {showAllInvitations ? 'Show less' : `Show ${invitations.length - 4} more`}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamModal;