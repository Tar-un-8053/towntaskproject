import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { chatApi } from '../services/api';
import { getChatSocket } from '../services/chatSocket';
import { useGetCallerUserProfile } from '../hooks/queries/useCallerContext';
import { buildChatRoute } from '../router/routes';
import { toast } from 'react-toastify';

interface Conversation {
  applicationId: string;
  counterpartId: string;
  counterpart: {
    userId: string;
    name: string;
    profileType: string;
  };
  job: {
    _id: string;
    title: string;
    area: string;
    city?: string;
    state?: string;
  };
  unreadCount: number;
  updatedAt: string;
  lastMessage: {
    _id: string;
    senderId: string;
    message: string;
    createdAt: string;
  } | null;
}

interface ChatMessage {
  _id: string;
  applicationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

interface ChatPageProps {
  applicationId?: string;
}

export default function ChatPage({ applicationId }: ChatPageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const userId = (userProfile as any)?.userId || localStorage.getItem('userId') || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(applicationId || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.applicationId === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const loadConversations = async (preferredId?: string) => {
    setLoadingConversations(true);
    try {
      const res = await chatApi.getConversations();
      const list = res.conversations || [];
      setConversations(list);

      const nextId = preferredId || selectedConversationId || applicationId;
      if (nextId && list.some((conversation: Conversation) => conversation.applicationId === nextId)) {
        setSelectedConversationId(nextId);
      } else if (!selectedConversationId && list.length > 0) {
        setSelectedConversationId(list[0].applicationId);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const res = await chatApi.getMessages(conversationId);
      setMessages(res.messages || []);
      await chatApi.markAsRead(conversationId);
      await loadConversations(conversationId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations(applicationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      window.location.hash = buildChatRoute(selectedConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  useEffect(() => {
    if (!userId) return;

    const socket = getChatSocket(userId);

    const handleIncomingMessage = (message: ChatMessage) => {
      if (message.applicationId === selectedConversationId) {
        setMessages((prev) => [...prev, message]);
        chatApi.markAsRead(message.applicationId).catch(() => null);
      }
      loadConversations(selectedConversationId || message.applicationId);
    };

    const handleUnreadChange = () => {
      loadConversations(selectedConversationId || undefined);
    };

    socket.on('chat_message', handleIncomingMessage);
    socket.on('chat_unread_count', handleUnreadChange);

    return () => {
      socket.off('chat_message', handleIncomingMessage);
      socket.off('chat_unread_count', handleUnreadChange);
    };
  }, [userId, selectedConversationId]);

  useEffect(() => {
    if (!userId || !selectedConversationId) return;
    const socket = getChatSocket(userId);
    socket.emit('join_chat', { applicationId: selectedConversationId });

    return () => {
      socket.emit('leave_chat', { applicationId: selectedConversationId });
    };
  }, [userId, selectedConversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedConversationId || !draft.trim() || !userId || sending) return;

    const messageToSend = draft.trim();
    setDraft('');
    setSending(true);

    try {
      const socket = getChatSocket(userId);
      if (socket.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit('send_message', { applicationId: selectedConversationId, message: messageToSend }, (ack: any) => {
            if (ack?.success) resolve();
            else reject(new Error(ack?.error || 'Failed to send message'));
          });
        });
      } else {
        const res = await chatApi.sendMessage(selectedConversationId, messageToSend);
        setMessages((prev) => [...prev, res.message]);
      }

      await loadConversations(selectedConversationId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setDraft(messageToSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Towntask Messages</h1>
        <p className="text-sm text-muted-foreground">Chat is enabled only after a proposal is accepted.</p>
      </div>

      <div className="grid h-[75vh] grid-cols-1 gap-4 md:grid-cols-3">
        <Card className={`${selectedConversationId ? 'hidden md:block' : 'block'} overflow-hidden md:col-span-1`}>
          <div className="border-b p-3 font-semibold">Conversations</div>
          <div className="h-[calc(75vh-49px)] overflow-y-auto">
            {loadingConversations ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No accepted proposals yet.</div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.applicationId}
                  onClick={() => setSelectedConversationId(conversation.applicationId)}
                  className={`w-full border-b p-3 text-left transition-colors hover:bg-muted/40 ${
                    selectedConversationId === conversation.applicationId ? 'bg-muted/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold">{conversation.counterpart?.name || 'Towntask User'}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{conversation.job.title}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {conversation.lastMessage?.message || 'Start conversation'}
                  </p>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className={`${selectedConversationId ? 'block' : 'hidden md:block'} md:col-span-2 overflow-hidden`}>
          {!selectedConversation ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="mb-3 h-8 w-8" />
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversationId('')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-sm font-semibold">{selectedConversation.counterpart?.name || 'Towntask User'}</p>
                  <p className="text-xs text-muted-foreground">{selectedConversation.job.title}</p>
                </div>
              </div>

              <div className="h-[calc(75vh-118px)] overflow-y-auto p-3">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No messages yet. Say hello.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message) => {
                      const isMine = message.senderId === userId;
                      return (
                        <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                              isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}
                          >
                            <p>{message.message}</p>
                            <p className={`mt-1 text-[10px] ${isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={endRef} />
                  </div>
                )}
              </div>

              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type your message"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button onClick={handleSend} disabled={sending || !draft.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
